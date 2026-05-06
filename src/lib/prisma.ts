import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Cria o client com a extensão do Accelerate (obrigatório para URLs prisma+postgres://)
// O cast para PrismaClient preserva as tipagens dos modelos gerados pelo Prisma.
const criarPrisma = () => {
  const cliente = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends(withAccelerate());
  return cliente as unknown as PrismaClient;
};

type ClientePrisma = ReturnType<typeof criarPrisma>;

const globalForPrisma = globalThis as unknown as {
  prisma: ClientePrisma | undefined;
};

export const prisma = globalForPrisma.prisma ?? criarPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
