import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protege paginas da aplicacao.
  // Rotas /api sao protegidas individualmente por cada Route Handler via auth().
  // Excluir /api do matcher evita conflitos com as rotas internas do NextAuth (/api/auth/*).
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:ico|png|svg|webp|jpg|jpeg|gif|css|js|woff|woff2|ttf|eot|xml|txt|json|map)$).*)",
  ],
};
