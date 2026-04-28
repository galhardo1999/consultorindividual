"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const criarImovel = async (
  data: Omit<Prisma.ImovelUncheckedCreateInput, "usuarioId" | "id" | "criadoEm" | "atualizadoEm">
): Promise<ActionResponse<Prisma.ImovelGetPayload<{}>>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const imovel = await prisma.imovel.create({
      data: {
        ...data,
        usuarioId: session.user.id,
      },
    });

    return { success: true, data: imovel };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar imóvel";
    console.error("Erro em criarImovel:", error);
    return { success: false, error: message };
  }
};

export const atualizarImovel = async (
  id: string,
  data: Omit<Prisma.ImovelUncheckedUpdateInput, "usuarioId" | "id" | "criadoEm" | "atualizadoEm">
): Promise<ActionResponse<Prisma.ImovelGetPayload<{}>>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const imovel = await prisma.imovel.update({
      where: { id, usuarioId: session.user.id },
      data,
    });

    return { success: true, data: imovel };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar imóvel";
    console.error("Erro em atualizarImovel:", error);
    return { success: false, error: message };
  }
};

