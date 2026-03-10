import NextAuth from "next-auth";
import { cache } from "react";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "~/server/db";
import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(db),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "seu@email.com" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const user = await db.user.findUnique({
                        where: { email: credentials.email as string },
                    });

                    if (!user || !user.passwordHash) {
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(
                        credentials.password as string,
                        user.passwordHash
                    );

                    if (!passwordsMatch) {
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        tenantId: user.tenantId,
                    };
                } catch (error) {
                    console.error("Auth DB Error:", error);
                    return null;
                }
            }
        })
    ]
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
