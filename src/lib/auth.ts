import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const tentativasLogin = new Map<string, { contagem: number; resetEm: number }>();
const LIMITE_TENTATIVAS_LOGIN = 5;
const JANELA_LOGIN_MS = 15 * 60 * 1000;

const limparTentativasExpiradas = () => {
  const agora = Date.now();
  for (const [chave, entrada] of tentativasLogin.entries()) {
    if (agora > entrada.resetEm) tentativasLogin.delete(chave);
  }
};

const obterIp = (requisicao?: Request) =>
  requisicao?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  requisicao?.headers.get("x-real-ip") ??
  "desconhecido";

const obterChaveRateLimit = (email: string, requisicao?: Request) =>
  `${obterIp(requisicao)}:${email.toLowerCase()}`;

const loginPermitido = (chave: string) => {
  limparTentativasExpiradas();
  const agora = Date.now();
  const entrada = tentativasLogin.get(chave);

  if (!entrada || agora > entrada.resetEm) {
    tentativasLogin.set(chave, { contagem: 1, resetEm: agora + JANELA_LOGIN_MS });
    return true;
  }

  if (entrada.contagem >= LIMITE_TENTATIVAS_LOGIN) return false;

  entrada.contagem += 1;
  return true;
};

const limparTentativasLogin = (chave: string) => {
  tentativasLogin.delete(chave);
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, requisicao) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const chaveRateLimit = obterChaveRateLimit(email, requisicao);
        if (!loginPermitido(chaveRateLimit)) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!usuario || !usuario.ativo) return null;

        // Usuários OAuth não têm senhaHash — bloqueiam login por credenciais
        if (!usuario.senhaHash) return null;

        const senhaValida = await bcrypt.compare(password, usuario.senhaHash);
        if (!senhaValida) return null;

        limparTentativasLogin(chaveRateLimit);

        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          image: usuario.avatarUrl,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    // Executado antes de criar a sessão — persiste usuário Google no banco
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Rejeita emails não verificados pelo Google
        if (!profile?.email_verified) return false;

        const email = profile.email as string;
        const nome = (profile.name as string | undefined) ?? "Usuário Google";
        const avatarUrl = (profile.picture as string | undefined) ?? null;

        // Upsert: cria o usuário se não existir, atualiza avatar se já existir.
        // senhaHash é null para contas OAuth — usuário não pode logar por credenciais.
        const usuario = await prisma.usuario.upsert({
          where: { email },
          update: { avatarUrl },
          create: { nome, email, avatarUrl },
          select: { id: true },
        });

        // Registra a conta OAuth para rastrear o vínculo com o provedor
        await prisma.contaOAuth.upsert({
          where: {
            provedor_provedorId: {
              provedor: "google",
              provedorId: account.providerAccountId,
            },
          },
          update: {},
          create: {
            usuarioId: usuario.id,
            provedor: "google",
            provedorId: account.providerAccountId,
          },
        });
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // `user` e `account` só estão presentes no primeiro login (não em refreshes)
      if (user && account) {
        if (account.provider === "credentials") {
          token.id = user.id;
          token.nome = (user as { nome?: string }).nome;
        } else if (account.provider === "google" && token.email) {
          // signIn callback já criou/atualizou o usuário — busca o ID do banco
          const dbUsuario = await prisma.usuario.findUnique({
            where: { email: token.email },
            select: { id: true, nome: true },
          });
          if (dbUsuario) {
            token.id = dbUsuario.id;
            token.nome = dbUsuario.nome;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});
