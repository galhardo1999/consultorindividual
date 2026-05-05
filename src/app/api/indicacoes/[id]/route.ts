import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type ContextoRota = { params: Promise<{ id: string }> };

const indicacaoAtualizacaoSchema = z.object({
  parceiroId: z.string().min(1).optional(),
  tipoNegocio: z.enum(["VENDA", "LOCACAO", "TEMPORADA"]).optional(),
  status: z.enum(["EM_ANDAMENTO", "CONCLUIDA", "PAGA", "CANCELADA"]).optional(),
  comissaoPercentual: z.number().min(0).max(100).optional().nullable(),
  comissaoValorFixo: z.number().min(0).optional().nullable(),
  valorNegocioFinal: z.number().min(0).optional().nullable(),
  valorComissaoFinal: z.number().min(0).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

const naoAutorizado = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const naoEncontrado = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });

const obterSessao = async () => {
  const sessao = await auth();
  if (!sessao?.user?.id) return null;
  return sessao as typeof sessao & { user: { id: string } };
};

const calcularComissaoFinal = (dados: {
  valorNegocioFinal?: number | null;
  valorComissaoFinal?: number | null;
  comissaoValorFixo?: number | null;
  comissaoPercentual?: number | null;
}) => {
  if (dados.valorComissaoFinal !== undefined && dados.valorComissaoFinal !== null) {
    return dados.valorComissaoFinal;
  }

  if (dados.comissaoValorFixo !== undefined && dados.comissaoValorFixo !== null) {
    return dados.comissaoValorFixo;
  }

  if (
    dados.valorNegocioFinal !== undefined &&
    dados.valorNegocioFinal !== null &&
    dados.comissaoPercentual !== undefined &&
    dados.comissaoPercentual !== null
  ) {
    return dados.valorNegocioFinal * (dados.comissaoPercentual / 100);
  }

  return null;
};

export async function GET(_requisicao: Request, { params }: ContextoRota) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  const { id } = await params;

  try {
    const indicacao = await prisma.indicacaoParceiro.findFirst({
      where: { id, usuarioId: sessao.user.id },
      include: {
        parceiro: true,
        imovel: { select: { id: true, titulo: true, cidade: true, bairro: true, status: true } },
      },
    });

    return indicacao ? NextResponse.json(indicacao) : naoEncontrado();
  } catch (erro) {
    console.error("[INDICACOES ID GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(requisicao: Request, { params }: ContextoRota) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  const { id } = await params;

  try {
    const corpo = await requisicao.json();
    const parsed = indicacaoAtualizacaoSchema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existente = await prisma.indicacaoParceiro.findFirst({
      where: { id, usuarioId: sessao.user.id },
      select: {
        id: true,
        comissaoPercentual: true,
        comissaoValorFixo: true,
        valorNegocioFinal: true,
        valorComissaoFinal: true,
        concluidaEm: true,
      },
    });

    if (!existente) return naoEncontrado();

    if (parsed.data.parceiroId) {
      const parceiro = await prisma.parceiro.findFirst({
        where: { id: parsed.data.parceiroId, usuarioId: sessao.user.id, status: { not: "ARQUIVADO" } },
        select: { id: true },
      });
      if (!parceiro) return NextResponse.json({ error: "Parceiro inválido" }, { status: 404 });
    }

    const valorNegocioFinal = parsed.data.valorNegocioFinal ?? existente.valorNegocioFinal;
    const comissaoPercentual = parsed.data.comissaoPercentual ?? existente.comissaoPercentual;
    const comissaoValorFixo = parsed.data.comissaoValorFixo ?? existente.comissaoValorFixo;
    const valorComissaoFinal = calcularComissaoFinal({
      valorNegocioFinal,
      valorComissaoFinal: parsed.data.valorComissaoFinal ?? existente.valorComissaoFinal,
      comissaoValorFixo,
      comissaoPercentual,
    });

    const agora = new Date();
    const dadosAtualizacao: Prisma.IndicacaoParceiroUpdateInput = {
      ...(parsed.data.parceiroId ? { parceiro: { connect: { id: parsed.data.parceiroId } } } : {}),
      ...(parsed.data.tipoNegocio ? { tipoNegocio: parsed.data.tipoNegocio } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.comissaoPercentual !== undefined ? { comissaoPercentual: parsed.data.comissaoPercentual } : {}),
      ...(parsed.data.comissaoValorFixo !== undefined ? { comissaoValorFixo: parsed.data.comissaoValorFixo } : {}),
      ...(parsed.data.valorNegocioFinal !== undefined ? { valorNegocioFinal: parsed.data.valorNegocioFinal } : {}),
      ...(valorComissaoFinal !== null ? { valorComissaoFinal } : {}),
      ...(parsed.data.observacoes !== undefined ? { observacoes: parsed.data.observacoes } : {}),
      ...(parsed.data.status === "CONCLUIDA" ? { concluidaEm: agora } : {}),
      ...(parsed.data.status === "PAGA" ? { concluidaEm: existente.concluidaEm ?? agora, pagaEm: agora } : {}),
    };

    const indicacao = await prisma.indicacaoParceiro.update({
      where: { id, usuarioId: sessao.user.id },
      data: dadosAtualizacao,
      include: {
        parceiro: true,
        imovel: { select: { id: true, titulo: true, cidade: true, bairro: true, status: true } },
      },
    });

    return NextResponse.json(indicacao);
  } catch (erro) {
    console.error("[INDICACOES ID PATCH]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_requisicao: Request, { params }: ContextoRota) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  const { id } = await params;

  try {
    const resultado = await prisma.indicacaoParceiro.updateMany({
      where: { id, usuarioId: sessao.user.id },
      data: { status: "CANCELADA" },
    });

    if (resultado.count === 0) return naoEncontrado();

    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[INDICACOES ID DELETE]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
