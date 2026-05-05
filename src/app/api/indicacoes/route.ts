import { NextResponse } from "next/server";
import { Prisma, StatusIndicacaoParceiro, TipoNegocioIndicacao } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const indicacaoSchema = z.object({
  parceiroId: z.string().min(1),
  imovelId: z.string().min(1),
  tipoNegocio: z.enum(["VENDA", "LOCACAO", "TEMPORADA"]),
  comissaoPercentual: z.number().min(0).max(100).optional().nullable(),
  comissaoValorFixo: z.number().min(0).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

const naoAutorizado = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const obterSessao = async () => {
  const sessao = await auth();
  if (!sessao?.user?.id) return null;
  return sessao as typeof sessao & { user: { id: string } };
};

const obterPaginacao = (parametros: URLSearchParams) => {
  const pagina = Math.max(1, parseInt(parametros.get("page") ?? "1"));
  const limite = Math.min(100, Math.max(1, parseInt(parametros.get("limit") ?? "20")));
  return { pagina, limite, pular: (pagina - 1) * limite };
};

export async function GET(requisicao: Request) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  try {
    const { searchParams } = new URL(requisicao.url);
    const statusParametro = searchParams.get("status") ?? undefined;
    const tipoParametro = searchParams.get("tipoNegocio") ?? undefined;
    const parceiroId = searchParams.get("parceiroId") ?? undefined;
    const busca = searchParams.get("search") ?? undefined;
    const { pagina, limite, pular } = obterPaginacao(searchParams);

    const status = statusParametro && Object.values(StatusIndicacaoParceiro).includes(statusParametro as StatusIndicacaoParceiro)
      ? statusParametro as StatusIndicacaoParceiro
      : undefined;
    const tipoNegocio = tipoParametro && Object.values(TipoNegocioIndicacao).includes(tipoParametro as TipoNegocioIndicacao)
      ? tipoParametro as TipoNegocioIndicacao
      : undefined;

    const where: Prisma.IndicacaoParceiroWhereInput = {
      usuarioId: sessao.user.id,
      ...(status ? { status } : {}),
      ...(tipoNegocio ? { tipoNegocio } : {}),
      ...(parceiroId ? { parceiroId } : {}),
      ...(busca && {
        OR: [
          { parceiro: { nome: { contains: busca, mode: "insensitive" } } },
          { imovel: { titulo: { contains: busca, mode: "insensitive" } } },
          { imovel: { cidade: { contains: busca, mode: "insensitive" } } },
        ],
      }),
    };

    const [indicacoes, total, resumoPendente] = await prisma.$transaction([
      prisma.indicacaoParceiro.findMany({
        where,
        include: {
          parceiro: { select: { id: true, nome: true, telefone: true, tipo: true } },
          imovel: { select: { id: true, titulo: true, cidade: true, bairro: true, status: true } },
        },
        orderBy: { atualizadoEm: "desc" },
        skip: pular,
        take: limite,
      }),
      prisma.indicacaoParceiro.count({ where }),
      prisma.indicacaoParceiro.aggregate({
        where: { usuarioId: sessao.user.id, status: "CONCLUIDA" },
        _sum: { valorComissaoFinal: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      indicacoes,
      total,
      page: pagina,
      limit: limite,
      resumoPendente: {
        quantidade: resumoPendente._count._all,
        valor: resumoPendente._sum.valorComissaoFinal ?? 0,
      },
    });
  } catch (erro) {
    console.error("[INDICACOES GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(requisicao: Request) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  try {
    const corpo = await requisicao.json();
    const parsed = indicacaoSchema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [parceiro, imovel] = await prisma.$transaction([
      prisma.parceiro.findFirst({
        where: { id: parsed.data.parceiroId, usuarioId: sessao.user.id, status: { not: "ARQUIVADO" } },
        select: { id: true },
      }),
      prisma.imovel.findFirst({
        where: { id: parsed.data.imovelId, usuarioId: sessao.user.id },
        select: { id: true },
      }),
    ]);

    if (!parceiro || !imovel) {
      return NextResponse.json({ error: "Parceiro ou imóvel inválido" }, { status: 404 });
    }

    const indicacao = await prisma.indicacaoParceiro.create({
      data: {
        ...parsed.data,
        usuarioId: sessao.user.id,
      },
    });

    return NextResponse.json(indicacao, { status: 201 });
  } catch (erro) {
    console.error("[INDICACOES POST]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
