import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, usuario }) {
      if (usuario) {
        token.id = usuario.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.usuario.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.usuario;
      const isOnAuthPage = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/cadastro");

      if (isOnAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }
      return true;
    },
  },
  providers: [], // Adicionado no auth.ts para não quebrar o Edge Runtime
} satisfies NextAuthConfig;
