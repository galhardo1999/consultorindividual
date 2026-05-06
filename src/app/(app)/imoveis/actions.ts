"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Imovel, Prisma } from "@prisma/client";

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

type TipoNegocioIndicacao = "VENDA" | "LOCACAO" | "TEMPORADA";

interface DadosIndicacaoParceiro {
  parceiroId: string;
  tipoNegocio: TipoNegocioIndicacao;
  comissaoPercentual?: number | null;
  comissaoValorFixo?: number | null;
  observacoes?: string | null;
}

type DadosCriacaoImovel = Omit<
  Prisma.ImovelUncheckedCreateInput,
  "usuarioId" | "id" | "criadoEm" | "atualizadoEm" | "indicacaoParceiro"
> & {
  fotos?: string[];
  indicacaoParceiro?: DadosIndicacaoParceiro | null;
};

type DadosAtualizacaoImovel = Omit<
  Prisma.ImovelUncheckedUpdateInput,
  "usuarioId" | "id" | "criadoEm" | "atualizadoEm" | "indicacaoParceiro"
> & {
  fotos?: string[];
  indicacaoParceiro?: DadosIndicacaoParceiro | null;
};

const verificarParceiro = async (
  transacao: Prisma.TransactionClient,
  parceiroId: string,
  usuarioId: string
) => {
  const parceiro = await transacao.parceiro.findFirst({
    where: { id: parceiroId, usuarioId, status: { not: "ARQUIVADO" } },
    select: { id: true },
  });

  if (!parceiro) {
    throw new Error("Parceiro indicador inválido");
  }
};

const salvarIndicacaoParceiro = async (
  transacao: Prisma.TransactionClient,
  usuarioId: string,
  imovelId: string,
  dados: DadosIndicacaoParceiro
) => {
  await verificarParceiro(transacao, dados.parceiroId, usuarioId);

  await transacao.indicacaoParceiro.upsert({
    where: { imovelId },
    update: {
      parceiroId: dados.parceiroId,
      tipoNegocio: dados.tipoNegocio,
      comissaoPercentual: dados.comissaoPercentual ?? null,
      comissaoValorFixo: dados.comissaoValorFixo ?? null,
      observacoes: dados.observacoes ?? null,
      status: "EM_ANDAMENTO",
    },
    create: {
      usuarioId,
      imovelId,
      parceiroId: dados.parceiroId,
      tipoNegocio: dados.tipoNegocio,
      comissaoPercentual: dados.comissaoPercentual ?? null,
      comissaoValorFixo: dados.comissaoValorFixo ?? null,
      observacoes: dados.observacoes ?? null,
    },
  });
};

export const criarImovel = async (
  data: DadosCriacaoImovel
): Promise<ActionResponse<Imovel>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const { fotos, indicacaoParceiro, ...restoDados } = data;

    const imovel = await prisma.$transaction(async (transacao) => {
      const imovelCriado = await transacao.imovel.create({
        data: {
          ...restoDados,
          usuarioId: session.user.id,
          origemCadastro: indicacaoParceiro?.parceiroId ? "INDICACAO" : restoDados.origemCadastro,
          ...(fotos && fotos.length > 0
            ? {
                fotos: {
                  create: fotos.map((url) => ({ url })),
                },
              }
            : {}),
        },
      });

      if (indicacaoParceiro?.parceiroId) {
        await salvarIndicacaoParceiro(transacao, session.user.id, imovelCriado.id, indicacaoParceiro);
      }

      return imovelCriado;
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
  data: DadosAtualizacaoImovel
): Promise<ActionResponse<Imovel>> => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Não autorizado" };
    }

    const { fotos, indicacaoParceiro, ...restoDados } = data;

    // Se o endereço for alterado, resetamos a geolocalização para forçar nova busca no mapa
    const enderecoAlterado =
      "endereco" in restoDados ||
      "numero" in restoDados ||
      "bairro" in restoDados ||
      "cidade" in restoDados ||
      "estado" in restoDados ||
      "cep" in restoDados ||
      "complemento" in restoDados;

    const coordenadasEnviadas = "latitude" in restoDados || "longitude" in restoDados;

    const dadosAtualizacao: Prisma.ImovelUpdateInput = {
      ...restoDados,
      ...(enderecoAlterado && !coordenadasEnviadas ? { latitude: null, longitude: null } : {}),
      ...(fotos !== undefined
        ? {
            fotos: {
              deleteMany: {},
              create: fotos.map((url, idx) => ({
                url,
                isCapa: idx === 0,
                ordem: idx,
              })),
            },
          }
        : {}),
    };

    const imovel = await prisma.$transaction(async (transacao) => {
      const imovelAtualizado = await transacao.imovel.update({
        where: { id, usuarioId: session.user.id },
        data: {
          ...dadosAtualizacao,
          ...(indicacaoParceiro?.parceiroId ? { origemCadastro: "INDICACAO" } : {}),
        },
      });

      if (indicacaoParceiro?.parceiroId) {
        await salvarIndicacaoParceiro(transacao, session.user.id, id, indicacaoParceiro);
      } else if (indicacaoParceiro === null) {
        const indicacaoExistente = await transacao.indicacaoParceiro.findUnique({
          where: { imovelId: id },
          select: { id: true, status: true, usuarioId: true },
        });

        if (
          indicacaoExistente &&
          indicacaoExistente.usuarioId === session.user.id &&
          indicacaoExistente.status === "EM_ANDAMENTO"
        ) {
          await transacao.indicacaoParceiro.delete({ where: { id: indicacaoExistente.id } });
        }
      }

      return imovelAtualizado;
    });

    return { success: true, data: imovel };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar imóvel";
    console.error("Erro em atualizarImovel:", error);
    return { success: false, error: message };
  }
};
