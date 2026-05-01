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
  data: Omit<Prisma.ImovelUncheckedCreateInput, "usuarioId" | "id" | "criadoEm" | "atualizadoEm"> & { fotos?: string[] }
): Promise<ActionResponse<Prisma.ImovelGetPayload<{}>>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const { fotos, ...restoDados } = data;

    const imovel = await prisma.imovel.create({
      data: {
        ...restoDados,
        usuarioId: session.user.id,
        ...(fotos && fotos.length > 0
          ? {
              fotos: {
                create: fotos.map((url) => ({ url })),
              },
            }
          : {}),
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
  data: Omit<Prisma.ImovelUncheckedUpdateInput, "usuarioId" | "id" | "criadoEm" | "atualizadoEm"> & { fotos?: string[] }
): Promise<ActionResponse<Prisma.ImovelGetPayload<{}>>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const { fotos, ...restoDados } = data;

    // Se o endereço for alterado, resetamos a geolocalização para forçar nova busca no mapa
    const hasAddressChange =
      "endereco" in restoDados ||
      "numero" in restoDados ||
      "bairro" in restoDados ||
      "cidade" in restoDados ||
      "estado" in restoDados ||
      "cep" in restoDados;

    const dataToUpdate: Prisma.ImovelUpdateInput = {
      ...restoDados,
      ...(hasAddressChange ? { latitude: null, longitude: null } : {}),
      ...(fotos !== undefined && fotos.length > 0
        ? {
            fotos: {
              create: fotos.map((url, idx) => ({
                url,
                isCapa: idx === 0,
                ordem: idx,
              })),
            },
          }
        : {}),
    };

    const imovel = await prisma.imovel.update({
      where: { id, usuarioId: session.user.id },
      data: dataToUpdate,
    });

    return { success: true, data: imovel };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar imóvel";
    console.error("Erro em atualizarImovel:", error);
    return { success: false, error: message };
  }
};

