import type { DefaultSession } from "next-auth";

// Extensão dos tipos do NextAuth para incluir campos customizados
declare module "next-auth" {
  interface User {
    nome?: string;
  }

  interface Session {
    user: {
      id: string;
      nome?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    nome?: string;
  }
}
