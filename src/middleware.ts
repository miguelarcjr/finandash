import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
    // Ignorar /api, /_next, /login e favicon, mas aplicar a middleware em todo o resto
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
