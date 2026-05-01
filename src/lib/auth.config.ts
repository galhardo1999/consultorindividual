import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const estaLogado = !!auth?.user;
      const caminho = nextUrl.pathname;

      // Rotas de auth (públicas): redireciona para dashboard se já logado
      const ehPaginaAuth =
        caminho.startsWith("/login") || caminho.startsWith("/cadastro");

      // Rotas de recuperação de senha — sempre públicas (não redireciona logado)
      const ehPaginaRecuperacao =
        caminho.startsWith("/recuperar-senha") ||
        caminho.startsWith("/redefinir-senha");

      if (ehPaginaRecuperacao) return true;

      if (ehPaginaAuth) {
        if (estaLogado) return Response.redirect(new URL("/dashboard", nextUrl));
        return true;
      }

      // Rotas de API: o middleware não bloqueia — cada handler faz sua própria
      // verificação via auth(). O middleware só protege páginas do App Router.
      if (caminho.startsWith("/api")) return true;

      // Demais páginas: exige autenticação
      return estaLogado;
    },
  },
  providers: [], // Providers são adicionados no auth.ts (não roda no Edge Runtime)
} satisfies NextAuthConfig;
