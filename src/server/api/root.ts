import { createCallerFactory, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clienteRouter } from "~/server/api/routers/cliente";
import { boletoRouter } from "~/server/api/routers/boleto";
import { lancamentoRouter } from "~/server/api/routers/lancamento";
import { dashboardReceberRouter } from "~/server/api/routers/dashboardReceber";
import { despesaRouter } from "~/server/api/routers/despesa";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { usuarioRouter } from "~/server/api/routers/usuario";
import { configuracaoBancariaRouter } from "~/server/api/routers/configuracaoBancaria";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dummy: publicProcedure.query(() => "ok"),
  cliente: clienteRouter,
  boleto: boletoRouter,
  lancamento: lancamentoRouter,
  dashboardReceber: dashboardReceberRouter,
  despesa: despesaRouter,
  dashboard: dashboardRouter,
  usuario: usuarioRouter,
  configuracaoBancaria: configuracaoBancariaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
