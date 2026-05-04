import { PrismaClient } from "@prisma/client";

const criarPrisma = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

type PrismaComExtensao = ReturnType<typeof criarPrisma>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaComExtensao | undefined;
};

export const prisma = globalForPrisma.prisma ?? criarPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
