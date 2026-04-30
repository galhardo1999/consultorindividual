import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protege páginas da aplicação.
  // Rotas /api são protegidas individualmente por cada Route Handler via auth().
  // Excluir /api do matcher evita conflitos com as rotas internas do NextAuth (/api/auth/*).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
