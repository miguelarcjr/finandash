import { z } from "zod";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { createTRPCRouter, roleProcedure } from "~/server/api/trpc";

export const usuarioRouter = createTRPCRouter({
  list: roleProcedure(["SOCIO"]).query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      where: { tenantId: ctx.session.user.tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
  }),

  create: roleProcedure(["SOCIO"])
    .input(z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      email: z.string().email("E-mail inválido"),
      password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
      role: z.enum(["SOCIO", "FINANCEIRO", "CONTADOR"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Este e-mail já está em uso.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);

      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: input.role,
          tenantId: ctx.session.user.tenantId,
          ativo: true,
        },
      });

      return user;
    }),

  update: roleProcedure(["SOCIO"])
    .input(z.object({
      id: z.string(),
      name: z.string().min(1, "Nome é obrigatório"),
      role: z.enum(["SOCIO", "FINANCEIRO", "CONTADOR"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: input.id, tenantId: ctx.session.user.tenantId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          role: input.role,
        },
      });
    }),

  toggleStatus: roleProcedure(["SOCIO"])
    .input(z.object({ id: z.string(), ativo: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: input.id, tenantId: ctx.session.user.tenantId },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
      }

      if (user.id === ctx.session.user.id && !input.ativo) {
         throw new TRPCError({ code: "FORBIDDEN", message: "Você não pode inativar a si mesmo." });
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: { ativo: input.ativo },
      });
    }),
});
