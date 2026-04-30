import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Schema de validação ───────────────────────────────────────────────────────

const clienteSchema = z.object({
  // Dados Básicos
  nomeCompleto: z.string().min(2),
  telefone: z.string().min(8),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  documento: z.string().optional(),
  dataNascimento: z.string().optional(),
  estadoCivil: z.string().optional(),
  temFilhos: z.boolean().optional(),
  profissao: z.string().optional(),
  rendaMensal: z.number().optional(),
  cidadeAtual: z.string().optional(),
  origemLead: z.string().optional(),
  // Jornada / Status
  estagioJornada: z.string().optional(),
  objetivoCompra: z.string().optional(),
  formaPagamento: z.string().optional(),
  nivelUrgencia: z.string().optional(),
  prazoCompra: z.string().optional(),
  budgetMaximo: z.number().optional(),
  preAprovacaoCredito: z.string().optional(),
  proximoContato: z.string().optional(),
  observacoes: z.string().optional(),
  preferencia: z.object({
    tipoImovel: z.string().optional().nullable(),
    precoMinimo: z.number().optional().nullable(),
    precoMaximo: z.number().optional().nullable(),
    cidadeInteresse: z.string().optional().nullable(),
    bairrosInteresse: z.string().optional().nullable(),
    minQuartos: z.number().optional().nullable(),
    areaMinima: z.number().optional().nullable(),
    aceitaFinanciamento: z.boolean().optional().nullable(),
    aceitaPermuta: z.boolean().optional().nullable(),
    notasPessoais: z.string().optional().nullable(),
  }).optional(),
});

// ─── GET /api/clientes ────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usuarioId = session.user.id;
  const { searchParams } = new URL(request.url);

  // ── Parâmetros básicos ──────────────────────────────────────────────────────
  const busca = searchParams.get("search") || "";
  const pagina = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limite = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const pular = (pagina - 1) * limite;

  // ── Filtros de status / jornada ─────────────────────────────────────────────
  const estagioJornada = searchParams.get("estagioJornada") || undefined;
  const nivelUrgencia = searchParams.get("nivelUrgencia") || undefined;
  const status = searchParams.get("status") || undefined;

  // ── Perfil do cliente ───────────────────────────────────────────────────────
  const estadoCivil = searchParams.get("estadoCivil") || undefined;
  const temFilhosParam = searchParams.get("temFilhos");
  const temFilhos = temFilhosParam === "true" ? true : temFilhosParam === "false" ? false : undefined;
  const profissao = searchParams.get("profissao") || undefined;

  // ── Qualificação financeira ─────────────────────────────────────────────────
  const rendaMensalMin = searchParams.get("rendaMensalMin") ? parseFloat(searchParams.get("rendaMensalMin")!) : undefined;
  const rendaMensalMax = searchParams.get("rendaMensalMax") ? parseFloat(searchParams.get("rendaMensalMax")!) : undefined;
  const budgetMaximoMin = searchParams.get("budgetMaximoMin") ? parseFloat(searchParams.get("budgetMaximoMin")!) : undefined;
  const budgetMaximoMax = searchParams.get("budgetMaximoMax") ? parseFloat(searchParams.get("budgetMaximoMax")!) : undefined;
  const preAprovacaoCredito = searchParams.get("preAprovacaoCredito") || undefined;

  // ── Intenção de compra ──────────────────────────────────────────────────────
  const objetivoCompra = searchParams.get("objetivoCompra") || undefined;
  const formaPagamento = searchParams.get("formaPagamento") || undefined;
  const prazoCompra = searchParams.get("prazoCompra") || undefined;

  // ── Gestão comercial ────────────────────────────────────────────────────────
  const origemLead = searchParams.get("origemLead") || undefined;
  const proximoContatoAtrasado = searchParams.get("proximoContatoAtrasado") === "true";
  const criadoEmInicio = searchParams.get("criadoEmInicio") || undefined;
  const criadoEmFim = searchParams.get("criadoEmFim") || undefined;
  const atualizadoEmInicio = searchParams.get("atualizadoEmInicio") || undefined;
  const atualizadoEmFim = searchParams.get("atualizadoEmFim") || undefined;

  // ── Montagem do where ───────────────────────────────────────────────────────
  const where = {
    usuarioId,
    arquivadoEm: status === "ARQUIVADO" ? { not: null } : null,

    ...(busca && {
      OR: [
        { nomeCompleto: { contains: busca, mode: "insensitive" as const } },
        { email: { contains: busca, mode: "insensitive" as const } },
        { telefone: { contains: busca } },
      ],
    }),

    // Enums de jornada — cast seguro para o tipo literal correto
    ...(estagioJornada && { estagioJornada: estagioJornada as "NOVO_LEAD" | "EM_QUALIFICACAO" | "BUSCANDO_OPCOES" | "VISITANDO_IMOVEIS" | "NEGOCIANDO" | "PROPOSTA_ENVIADA" | "FECHADO" | "PERDIDO" | "PAUSADO" }),
    ...(nivelUrgencia && { nivelUrgencia: nivelUrgencia as "ALTA" | "MEDIA" | "BAIXA" | "SEM_URGENCIA" }),

    // Perfil
    ...(estadoCivil && { estadoCivil: estadoCivil as "SOLTEIRO" | "CASADO" | "DIVORCIADO" | "VIUVO" | "UNIAO_ESTAVEL" | "OUTRO" }),
    ...(temFilhos !== undefined && { temFilhos }),
    ...(profissao && { profissao: { contains: profissao, mode: "insensitive" as const } }),

    // Renda mensal
    ...((rendaMensalMin !== undefined || rendaMensalMax !== undefined) && {
      rendaMensal: {
        ...(rendaMensalMin !== undefined && { gte: rendaMensalMin }),
        ...(rendaMensalMax !== undefined && { lte: rendaMensalMax }),
      },
    }),

    // Budget
    ...((budgetMaximoMin !== undefined || budgetMaximoMax !== undefined) && {
      budgetMaximo: {
        ...(budgetMaximoMin !== undefined && { gte: budgetMaximoMin }),
        ...(budgetMaximoMax !== undefined && { lte: budgetMaximoMax }),
      },
    }),

    // Qualificação financeira
    ...(preAprovacaoCredito && { preAprovacaoCredito: preAprovacaoCredito as "SIM" | "NAO" | "EM_ANALISE" }),

    // Intenção de compra
    ...(objetivoCompra && { objetivoCompra: objetivoCompra as "MORADIA_PROPRIA" | "INVESTIMENTO" | "LOCACAO" | "VERANEIO" | "OUTRO" }),
    ...(formaPagamento && { formaPagamento: formaPagamento as "FINANCIAMENTO" | "PERMUTA" | "VISTA" | "MISTO" | "A_DEFINIR" }),
    ...(prazoCompra && { prazoCompra }),

    // Gestão comercial
    ...(origemLead && { origemLead: origemLead as "INDICACAO" | "PORTAL_IMOBILIARIO" | "REDES_SOCIAIS" | "WHATSAPP" | "SITE_PROPRIO" | "CAPTACAO_ATIVA" | "EVENTO" | "OUTRO" }),
    ...(proximoContatoAtrasado && { proximoContato: { lt: new Date() } }),

    // Ranges de datas
    ...((criadoEmInicio || criadoEmFim) && {
      criadoEm: {
        ...(criadoEmInicio && { gte: new Date(criadoEmInicio) }),
        ...(criadoEmFim && { lte: new Date(`${criadoEmFim}T23:59:59.999Z`) }),
      },
    }),
    ...((atualizadoEmInicio || atualizadoEmFim) && {
      atualizadoEm: {
        ...(atualizadoEmInicio && { gte: new Date(atualizadoEmInicio) }),
        ...(atualizadoEmFim && { lte: new Date(`${atualizadoEmFim}T23:59:59.999Z`) }),
      },
    }),
  };

  try {
    const [clientes, total] = await prisma.$transaction([
      prisma.cliente.findMany({
        where,
        include: {
          preferencia: true,
          _count: { select: { interacoes: true, interesses: true } },
        },
        orderBy: { atualizadoEm: "desc" },
        skip: pular,
        take: limite,
      }),
      prisma.cliente.count({ where }),
    ]);

    // ─── Contagem de oportunidades sem N+1 ────────────────────────────────────
    const idsClientesComPreferencia = clientes
      .filter((c) => c.preferencia)
      .map((c) => c.id);

    const interessesExistentes = await prisma.interesseClienteImovel.findMany({
      where: { clienteId: { in: idsClientesComPreferencia } },
      select: { clienteId: true, imovelId: true },
    });

    const mapaInteresses = new Map<string, string[]>();
    for (const i of interessesExistentes) {
      if (!mapaInteresses.has(i.clienteId)) mapaInteresses.set(i.clienteId, []);
      mapaInteresses.get(i.clienteId)!.push(i.imovelId);
    }

    const clientesComOportunidades = await Promise.all(
      clientes.map(async (cliente) => {
        if (!cliente.preferencia) return { ...cliente, oportunidadesCount: 0 };

        const p = cliente.preferencia;
        const imovelIdsVinculados = mapaInteresses.get(cliente.id) ?? [];

        const filtro: Record<string, unknown> = {
          usuarioId,
          status: "DISPONIVEL",
          id: { notIn: imovelIdsVinculados },
          ...(p.tipoImovel && { tipoImovel: p.tipoImovel }),
          ...(p.cidadeInteresse && {
            cidade: { contains: p.cidadeInteresse, mode: "insensitive" },
          }),
          ...((p.precoMinimo !== null || p.precoMaximo !== null) && {
            precoVenda: {
              ...(p.precoMinimo !== null && { gte: p.precoMinimo }),
              ...(p.precoMaximo !== null && { lte: p.precoMaximo }),
            },
          }),
          ...(p.minQuartos !== null && { quartos: { gte: p.minQuartos } }),
          ...(p.areaMinima !== null && { areaUtil: { gte: p.areaMinima } }),
        };

        const oportunidadesCount = await prisma.imovel.count({ where: filtro as any });
        return { ...cliente, oportunidadesCount };
      })
    );

    return NextResponse.json({ clientes: clientesComOportunidades, total, page: pagina, limit: limite });
  } catch (erro) {
    console.error("[CLIENTES GET]", erro);
    return NextResponse.json({ error: "Erro interno", clientes: [], total: 0 }, { status: 500 });
  }
}

// ─── POST /api/clientes ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usuarioId = session.user.id;

  try {
    const corpo = await request.json();
    const parsed = clienteSchema.safeParse(corpo);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { documento, dataNascimento, proximoContato, preferencia, ...resto } = parsed.data;

    const dadosCriacao: Record<string, unknown> = {
      ...resto,
      documento: documento || null,
      dataNascimento:
        dataNascimento && !isNaN(new Date(`${dataNascimento}T00:00:00.000Z`).getTime())
          ? new Date(`${dataNascimento}T00:00:00.000Z`)
          : null,
      proximoContato:
        proximoContato && !isNaN(new Date(proximoContato).getTime())
          ? new Date(proximoContato)
          : null,
    };

    // Normaliza strings vazias para null
    for (const chave of Object.keys(dadosCriacao)) {
      if (dadosCriacao[chave] === "") dadosCriacao[chave] = null;
    }

    const cliente = await prisma.cliente.create({
      data: {
        ...dadosCriacao,
        usuarioId,
        preferencia: preferencia ? { create: preferencia } : undefined,
      } as never,
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (erro) {
    console.error("[CLIENTES POST]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
