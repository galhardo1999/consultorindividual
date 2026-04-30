import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Schema de validação completo ─────────────────────────────────────────────

const imovelSchema = z.object({
  // Identificação
  titulo: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  tipoImovel: z.enum([
    "APARTAMENTO", "CASA", "CASA_CONDOMINIO", "TERRENO", "SALA_COMERCIAL",
    "LOJA", "GALPAO", "CHACARA", "FAZENDA", "COBERTURA", "KITNET", "STUDIO",
    "PREDIO_COMERCIAL", "AREA_RURAL", "OUTRO",
  ]),
  finalidade: z.enum(["VENDA", "LOCACAO", "VENDA_LOCACAO", "TEMPORADA"]),
  status: z.enum(["DISPONIVEL", "RESERVADO", "VENDIDO", "LOCADO", "INDISPONIVEL", "ARQUIVADO"]).optional(),
  descricao: z.string().optional().nullable(),
  observacoesInternas: z.string().optional().nullable(),
  codigoInterno: z.string().optional().nullable(),
  proprietarioId: z.string().optional().nullable(),

  // Localização
  cidade: z.string().min(2, "Cidade é obrigatória"),
  bairro: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  // Valores – venda
  precoVenda: z.number().positive().optional().nullable(),
  aceitaFinanciamento: z.boolean().optional(),
  aceitaPermuta: z.boolean().optional(),
  aceitaProposta: z.boolean().optional(),
  imovelQuitado: z.boolean().optional(),
  saldoDevedor: z.number().optional().nullable(),
  valorMinimoAceito: z.number().optional().nullable(),

  // Valores – locação
  valorAluguel: z.number().positive().optional().nullable(),
  valorCondominio: z.number().optional().nullable(),
  valorIptu: z.number().optional().nullable(),
  valorSeguroIncendio: z.number().optional().nullable(),
  valorSeguroFianca: z.number().optional().nullable(),
  valorCaucao: z.number().optional().nullable(),
  mesesCaucao: z.number().int().optional().nullable(),
  aceitaFiador: z.boolean().optional(),
  aceitaSeguroFianca: z.boolean().optional(),
  aceitaTituloCapitalizacao: z.boolean().optional(),
  aceitaCaucao: z.boolean().optional(),
  contratoMinimoMeses: z.number().int().optional().nullable(),
  disponivelApartirDe: z.string().optional().nullable(),

  // Valores – temporada
  valorTemporadaDiaria: z.number().positive().optional().nullable(),
  valorTemporadaSemanal: z.number().optional().nullable(),
  valorTemporadaMensal: z.number().optional().nullable(),
  taxaLimpeza: z.number().optional().nullable(),
  taxaServico: z.number().optional().nullable(),
  quantidadeMaxHospedes: z.number().int().optional().nullable(),
  quantidadeMinDiarias: z.number().int().optional().nullable(),
  horarioCheckin: z.string().optional().nullable(),
  horarioCheckout: z.string().optional().nullable(),

  // Áreas
  areaUtil: z.number().optional().nullable(),
  areaTotal: z.number().optional().nullable(),
  areaConstruida: z.number().optional().nullable(),
  areaTerreno: z.number().optional().nullable(),
  areaPrivativa: z.number().optional().nullable(),
  areaComum: z.number().optional().nullable(),

  // Características residenciais
  quartos: z.number().int().optional().nullable(),
  suites: z.number().int().optional().nullable(),
  banheiros: z.number().int().optional().nullable(),
  lavabos: z.number().int().optional().nullable(),
  vagasGaragem: z.number().int().optional().nullable(),
  salas: z.number().int().optional().nullable(),
  andar: z.number().int().optional().nullable(),
  totalAndares: z.number().int().optional().nullable(),
  unidadesPorAndar: z.number().int().optional().nullable(),
  numeroApartamento: z.string().optional().nullable(),
  bloco: z.string().optional().nullable(),

  // Comodidades
  mobiliado: z.boolean().optional(),
  semiMobiliado: z.boolean().optional(),
  aceitaPets: z.boolean().optional(),
  varanda: z.boolean().optional(),
  sacada: z.boolean().optional(),
  varandaGourmet: z.boolean().optional(),
  quintal: z.boolean().optional(),
  piscina: z.boolean().optional(),
  churrasqueira: z.boolean().optional(),
  areaGourmet: z.boolean().optional(),
  closet: z.boolean().optional(),
  escritorio: z.boolean().optional(),
  despensa: z.boolean().optional(),
  deposito: z.boolean().optional(),
  areaServico: z.boolean().optional(),

  // Condomínio
  nomeCondominio: z.string().optional().nullable(),
  elevador: z.boolean().optional(),
  quantidadeElevadores: z.number().int().optional().nullable(),
  portaria: z.boolean().optional(),
  portaria24h: z.boolean().optional(),
  seguranca24h: z.boolean().optional(),
  academia: z.boolean().optional(),
  salaoFestas: z.boolean().optional(),
  playground: z.boolean().optional(),
  quadra: z.boolean().optional(),
  sauna: z.boolean().optional(),
  coworking: z.boolean().optional(),

  // Terreno
  frenteTerreno: z.number().optional().nullable(),
  fundoTerreno: z.number().optional().nullable(),
  ladoDireitoTerreno: z.number().optional().nullable(),
  ladoEsquerdoTerreno: z.number().optional().nullable(),
  topografia: z.enum(["PLANO", "ACLIVE", "DECLIVE", "IRREGULAR"]).optional().nullable(),
  tipoSolo: z.string().optional().nullable(),
  murado: z.boolean().optional(),
  cercado: z.boolean().optional(),
  esquina: z.boolean().optional(),
  possuiAgua: z.boolean().optional(),
  possuiEnergia: z.boolean().optional(),
  possuiEsgoto: z.boolean().optional(),
  zoneamento: z.string().optional().nullable(),

  // Comercial / Industrial
  peDireito: z.number().optional().nullable(),
  quantidadeSalas: z.number().int().optional().nullable(),
  recepcao: z.boolean().optional(),
  copa: z.boolean().optional(),
  estoque: z.boolean().optional(),
  vitrine: z.boolean().optional(),
  doca: z.boolean().optional(),
  acessoCaminhao: z.boolean().optional(),
  energiaTrifasica: z.boolean().optional(),
  mezanino: z.boolean().optional(),
  elevadorCarga: z.boolean().optional(),
  tipoPiso: z.string().optional().nullable(),
  fachada: z.string().optional().nullable(),

  // Rural
  areaHectares: z.number().optional().nullable(),
  areaAlqueires: z.number().optional().nullable(),
  casaSede: z.boolean().optional(),
  casaCaseiro: z.boolean().optional(),
  curral: z.boolean().optional(),
  barracao: z.boolean().optional(),
  pocoArtesiano: z.boolean().optional(),
  rio: z.boolean().optional(),
  lago: z.boolean().optional(),
  nascente: z.boolean().optional(),
  pomar: z.boolean().optional(),
  pasto: z.boolean().optional(),
  tipoAcesso: z.string().optional().nullable(),
  distanciaCidadeKm: z.number().optional().nullable(),
  estradaAsfaltada: z.boolean().optional(),

  // Documentação
  documentacaoRegularizada: z.boolean().optional(),
  possuiEscritura: z.boolean().optional(),
  possuiMatricula: z.boolean().optional(),
  possuiHabiteSe: z.boolean().optional(),
  possuiAvcb: z.boolean().optional(),
  possuiPlantaAprovada: z.boolean().optional(),
  possuiCar: z.boolean().optional(),
  possuiCcir: z.boolean().optional(),
  possuiItr: z.boolean().optional(),
  observacoesDocumentacao: z.string().optional().nullable(),

  // Estratégia comercial
  exclusividade: z.boolean().optional(),
  inicioExclusividade: z.string().optional().nullable(),
  fimExclusividade: z.string().optional().nullable(),
  comissaoPercentual: z.number().optional().nullable(),
  comissaoValorFixo: z.number().optional().nullable(),
  motivoVendaLocacao: z.string().optional().nullable(),
  urgenciaProprietario: z.enum(["BAIXA", "MEDIA", "ALTA", "URGENTE"]).optional().nullable(),
  margemNegociacao: z.number().optional().nullable(),
  pontosFortes: z.string().optional().nullable(),
  pontosAtencao: z.string().optional().nullable(),
  perfilClienteIdeal: z.string().optional().nullable(),

  // Divulgação
  destaques: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  autorizadoDivulgacao: z.boolean().optional(),
  autorizadoPlaca: z.boolean().optional(),
  autorizadoPortais: z.boolean().optional(),
  linkTourVirtual: z.string().url().optional().nullable().or(z.literal("")),
  linkVideo: z.string().url().optional().nullable().or(z.literal("")),
  linkAnuncioExterno: z.string().url().optional().nullable().or(z.literal("")),

  // Chaves / Visita
  chaveDisponivel: z.boolean().optional(),
  localChave: z.string().optional().nullable(),
  instrucoesVisita: z.string().optional().nullable(),

  // Controle
  origemCadastro: z.enum(["MANUAL", "INDICACAO", "CAPTACAO_ATIVA", "PORTAL", "SITE", "REDES_SOCIAIS", "WHATSAPP", "OUTRO"]).optional().nullable(),
  dataCaptacao: z.string().optional().nullable(),

  // Fotos (URLs separadas do imovelData)
  fotos: z.array(z.string().url()).optional(),
});

// ─── GET /api/imoveis ─────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usuarioId = session.user.id;
  const { searchParams } = new URL(request.url);
  const busca = searchParams.get("search") || "";
  const tipoImovel = searchParams.get("tipoImovel") || undefined;
  const status = searchParams.get("status") || undefined;
  const cidade = searchParams.get("cidade") || undefined;
  const bairro = searchParams.get("bairro") || undefined;
  const finalidade = searchParams.get("finalidade") || undefined;

  const precoMinimo = searchParams.get("precoMinimo") ? parseFloat(searchParams.get("precoMinimo")!) : undefined;
  const precoMaximo = searchParams.get("precoMaximo") ? parseFloat(searchParams.get("precoMaximo")!) : undefined;
  const minQuartos = searchParams.get("minQuartos") ? parseInt(searchParams.get("minQuartos")!) : undefined;
  const minVagas = searchParams.get("minVagas") ? parseInt(searchParams.get("minVagas")!) : undefined;
  const minArea = searchParams.get("minArea") ? parseFloat(searchParams.get("minArea")!) : undefined;
  const maxArea = searchParams.get("maxArea") ? parseFloat(searchParams.get("maxArea")!) : undefined;
  const mobiliado = searchParams.get("mobiliado") === "true" ? true : undefined;
  const aceitaFinanciamento = searchParams.get("aceitaFinanciamento") === "true" ? true : undefined;
  const aceitaPermuta = searchParams.get("aceitaPermuta") === "true" ? true : undefined;
  const aceitaPets = searchParams.get("aceitaPets") === "true" ? true : undefined;
  const documentacaoRegularizada = searchParams.get("documentacaoRegularizada") === "true" ? true : undefined;

  const pagina = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limite = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const pular = (pagina - 1) * limite;

  // Filtro de preço dinâmico por finalidade
  const filtroPreco: Record<string, unknown> = {};
  if (precoMinimo !== undefined || precoMaximo !== undefined) {
    const condicao: Record<string, number> = {};
    if (precoMinimo !== undefined) condicao.gte = precoMinimo;
    if (precoMaximo !== undefined) condicao.lte = precoMaximo;
    filtroPreco.OR = [
      { precoVenda: condicao },
      { valorAluguel: condicao },
      { valorTemporadaDiaria: condicao },
    ];
  }

  const where = {
    usuarioId,
    arquivadoEm: status === "ARQUIVADO" ? { not: null } : status ? undefined : null,
    ...(busca && {
      OR: [
        { titulo: { contains: busca, mode: "insensitive" as const } },
        { bairro: { contains: busca, mode: "insensitive" as const } },
        { cidade: { contains: busca, mode: "insensitive" as const } },
        { codigoInterno: { contains: busca, mode: "insensitive" as const } },
      ],
    }),
    ...(tipoImovel && { tipoImovel: tipoImovel as never }),
    ...(finalidade && { finalidade: finalidade as never }),
    ...(cidade && { cidade: { contains: cidade, mode: "insensitive" as const } }),
    ...(bairro && { bairro: { contains: bairro, mode: "insensitive" as const } }),
    ...(status && status !== "ARQUIVADO" && { status: status as never }),
    ...(minQuartos && { quartos: { gte: minQuartos } }),
    ...(minVagas && { vagasGaragem: { gte: minVagas } }),
    ...(minArea && { areaUtil: { gte: minArea } }),
    ...(maxArea && { areaUtil: { lte: maxArea } }),
    ...(mobiliado && { mobiliado }),
    ...(aceitaFinanciamento && { aceitaFinanciamento }),
    ...(aceitaPermuta && { aceitaPermuta }),
    ...(aceitaPets && { aceitaPets }),
    ...(documentacaoRegularizada && { documentacaoRegularizada }),
    ...filtroPreco,
  };

  try {
    const [imoveis, total] = await prisma.$transaction([
      prisma.imovel.findMany({
        where,
        include: {
          _count: { select: { interesses: true } },
          proprietario: { select: { id: true, nomeCompleto: true } },
          fotos: { select: { url: true, isCapa: true } },
        },
        orderBy: { atualizadoEm: "desc" },
        skip: pular,
        take: limite,
      }),
      prisma.imovel.count({ where }),
    ]);

    return NextResponse.json({ imoveis, total, page: pagina, limit: limite });
  } catch (erro) {
    console.error("[IMOVEIS GET]", erro);
    return NextResponse.json({ error: "Erro interno", imoveis: [], total: 0 }, { status: 500 });
  }
}

// ─── POST /api/imoveis ────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usuarioId = session.user.id;

  try {
    const corpo = await request.json();
    const parsed = imovelSchema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fotos, disponivelApartirDe, inicioExclusividade, fimExclusividade, dataCaptacao, linkTourVirtual, linkVideo, linkAnuncioExterno, ...imovelData } = parsed.data;

    // Converte datas string para Date
    const dadosCriacao = {
      ...imovelData,
      usuarioId,
      disponivelApartirDe: disponivelApartirDe ? new Date(disponivelApartirDe) : undefined,
      inicioExclusividade: inicioExclusividade ? new Date(inicioExclusividade) : undefined,
      fimExclusividade: fimExclusividade ? new Date(fimExclusividade) : undefined,
      dataCaptacao: dataCaptacao ? new Date(dataCaptacao) : undefined,
      linkTourVirtual: linkTourVirtual || null,
      linkVideo: linkVideo || null,
      linkAnuncioExterno: linkAnuncioExterno || null,
      fotos:
        fotos && fotos.length > 0
          ? {
              create: fotos.map((url: string, idx: number) => ({
                url,
                isCapa: idx === 0,
                ordem: idx,
              })),
            }
          : undefined,
    };

    const imovel = await prisma.imovel.create({ data: dadosCriacao });

    return NextResponse.json(imovel, { status: 201 });
  } catch (erro) {
    console.error("[IMOVEIS POST]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
