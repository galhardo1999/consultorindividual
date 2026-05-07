import { NextResponse } from "next/server";
import { Prisma, StatusIndicacaoParceiro, StatusParceiro, TipoParceiro } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDocumentoDuplicado } from "@/lib/documentValidation";
import { z } from "zod";

const parceiroSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  documento: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  tipo: z.enum(["INDICADOR", "CORRETOR_PARCEIRO", "IMOBILIARIA", "CAPTADOR", "OUTRO"]).optional(),
  status: z.enum(["ATIVO", "INATIVO", "ARQUIVADO"]).optional(),
  comissaoPadraoPercentual: z.number().min(0).max(100).optional().nullable(),
  comissaoPadraoValorFixo: z.number().min(0).optional().nullable(),
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

const obterNumero = (valor: string | null) => {
  if (!valor) return undefined;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
};

export async function GET(requisicao: Request) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  try {
    const { searchParams } = new URL(requisicao.url);
    const busca = searchParams.get("search") ?? undefined;
    const statusParametro = searchParams.get("status") ?? undefined;
    const tipoParametro = searchParams.get("tipo") ?? undefined;
    const comIndicacoes = searchParams.get("comIndicacoes") === "true";
    const comComissao = searchParams.get("comComissao") === "true";
    const comissaoPercentualMin = obterNumero(searchParams.get("comissaoPercentualMin"));
    const comissaoPercentualMax = obterNumero(searchParams.get("comissaoPercentualMax"));
    const comissaoValorFixoMin = obterNumero(searchParams.get("comissaoValorFixoMin"));
    const comissaoValorFixoMax = obterNumero(searchParams.get("comissaoValorFixoMax"));
    const criadoEmInicio = searchParams.get("criadoEmInicio") ?? undefined;
    const criadoEmFim = searchParams.get("criadoEmFim") ?? undefined;
    const atualizadoEmInicio = searchParams.get("atualizadoEmInicio") ?? undefined;
    const atualizadoEmFim = searchParams.get("atualizadoEmFim") ?? undefined;
    const { pagina, limite, pular } = obterPaginacao(searchParams);
    const status = Object.values(StatusParceiro).includes(statusParametro as StatusParceiro)
      ? statusParametro as StatusParceiro
      : undefined;
    const tipo = tipoParametro && Object.values(TipoParceiro).includes(tipoParametro as TipoParceiro)
      ? tipoParametro as TipoParceiro
      : undefined;
    const filtrosIndicacoes: Prisma.ParceiroWhereInput[] = [];

    if (comIndicacoes) {
      filtrosIndicacoes.push({ indicacoes: { some: {} } });
    }

    if (comComissao) {
      filtrosIndicacoes.push({ indicacoes: { some: { valorComissaoFinal: { gt: 0 } } } });
    }

    const where: Prisma.ParceiroWhereInput = {
      usuarioId: sessao.user.id,
      ...(status ? { status } : {}),
      ...(tipo ? { tipo } : {}),
      ...(filtrosIndicacoes.length > 0 ? { AND: filtrosIndicacoes } : {}),
      ...((comissaoPercentualMin !== undefined || comissaoPercentualMax !== undefined) && {
        comissaoPadraoPercentual: {
          ...(comissaoPercentualMin !== undefined ? { gte: comissaoPercentualMin } : {}),
          ...(comissaoPercentualMax !== undefined ? { lte: comissaoPercentualMax } : {}),
        },
      }),
      ...((comissaoValorFixoMin !== undefined || comissaoValorFixoMax !== undefined) && {
        comissaoPadraoValorFixo: {
          ...(comissaoValorFixoMin !== undefined ? { gte: comissaoValorFixoMin } : {}),
          ...(comissaoValorFixoMax !== undefined ? { lte: comissaoValorFixoMax } : {}),
        },
      }),
      ...((criadoEmInicio || criadoEmFim) && {
        criadoEm: {
          ...(criadoEmInicio ? { gte: new Date(criadoEmInicio) } : {}),
          ...(criadoEmFim ? { lte: new Date(`${criadoEmFim}T23:59:59.999Z`) } : {}),
        },
      }),
      ...((atualizadoEmInicio || atualizadoEmFim) && {
        atualizadoEm: {
          ...(atualizadoEmInicio ? { gte: new Date(atualizadoEmInicio) } : {}),
          ...(atualizadoEmFim ? { lte: new Date(`${atualizadoEmFim}T23:59:59.999Z`) } : {}),
        },
      }),
      ...(busca && {
        OR: [
          { nome: { contains: busca, mode: "insensitive" } },
          { email: { contains: busca, mode: "insensitive" } },
          { telefone: { contains: busca, mode: "insensitive" } },
          { documento: { contains: busca, mode: "insensitive" } },
        ],
      }),
    };

    const [parceiros, total, totaisIndicacoes] = await prisma.$transaction([
      prisma.parceiro.findMany({
        where,
        include: {
          _count: { select: { indicacoes: true } },
        },
        orderBy: { atualizadoEm: "desc" },
        skip: pular,
        take: limite,
      }),
      prisma.parceiro.count({ where }),
      prisma.indicacaoParceiro.groupBy({
        by: ["parceiroId", "status"],
        where: { usuarioId: sessao.user.id },
        orderBy: [{ parceiroId: "asc" }, { status: "asc" }],
        _count: { id: true },
        _sum: { valorComissaoFinal: true },
      }),
    ]);

    const mapaTotais = new Map<string, {
      totalIndicacoes: number;
      totalComissao: number;
      totalComissaoPendente: number;
      totalComissaoRecebida: number;
    }>();

    for (const totalIndicacao of totaisIndicacoes) {
      const totaisAtuais = mapaTotais.get(totalIndicacao.parceiroId) ?? {
        totalIndicacoes: 0,
        totalComissao: 0,
        totalComissaoPendente: 0,
        totalComissaoRecebida: 0,
      };

      const quantidadeIndicacoes =
        typeof totalIndicacao._count === "object" ? totalIndicacao._count.id ?? 0 : 0;
      const totalComissao =
        typeof totalIndicacao._sum === "object" ? totalIndicacao._sum.valorComissaoFinal ?? 0 : 0;

      totaisAtuais.totalIndicacoes += quantidadeIndicacoes;
      totaisAtuais.totalComissao += totalComissao;

      if (totalIndicacao.status === StatusIndicacaoParceiro.CONCLUIDA) {
        totaisAtuais.totalComissaoPendente += totalComissao;
      }

      if (totalIndicacao.status === StatusIndicacaoParceiro.PAGA) {
        totaisAtuais.totalComissaoRecebida += totalComissao;
      }

      mapaTotais.set(totalIndicacao.parceiroId, totaisAtuais);
    }

    const totaisVazios = {
      totalIndicacoes: 0,
      totalComissao: 0,
      totalComissaoPendente: 0,
      totalComissaoRecebida: 0,
    };

    const parceirosComTotais = parceiros.map((parceiro) => ({
      ...parceiro,
      totais: mapaTotais.get(parceiro.id) ?? totaisVazios,
    }));

    return NextResponse.json({ parceiros: parceirosComTotais, total, page: pagina, limit: limite });
  } catch (erro) {
    console.error("[PARCEIROS GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(requisicao: Request) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  try {
    const corpo = await requisicao.json();
    const parsed = parceiroSchema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, ...dadosParceiro } = parsed.data;

    if (dadosParceiro.documento) {
      const duplicado = await isDocumentoDuplicado(dadosParceiro.documento, sessao.user.id, "PARCEIRO");
      if (duplicado) {
        return NextResponse.json({ error: "Já existe um cadastro com este CPF/CNPJ." }, { status: 400 });
      }
    }

    const parceiro = await prisma.parceiro.create({
      data: {
        ...dadosParceiro,
        email: email || null,
        usuarioId: sessao.user.id,
      },
    });

    return NextResponse.json(parceiro, { status: 201 });
  } catch (erro) {
    console.error("[PARCEIROS POST]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
