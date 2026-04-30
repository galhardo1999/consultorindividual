import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!usuario || !usuario.ativo) return null;

        const senhaValida = await bcrypt.compare(password, usuario.senhaHash);
        if (!senhaValida) return null;

        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          image: usuario.avatarUrl,
        };
      },
    }),
  ],
  // ─── Callbacks JWT e Session ────────────────────────────────────────────────
  // Ficam aqui (auth.ts) e não em auth.config.ts pois o config.ts roda no
  // Edge Runtime, que não suporta dependências como Prisma ou bcrypt.
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Persiste id e nome do usuário no token JWT no momento do login
      if (user) {
        token.id = user.id;
        token.nome = (user as { nome?: string }).nome;
      }
      return token;
    },
    async session({ session, token }) {
      // Expõe o id tipado para todos os server components e route handlers
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
