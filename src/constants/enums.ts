// ─── Constantes de enums do Prisma ────────────────────────────────────────────
// Fonte única de verdade para listas de opções usadas em selects e filtros

export const TIPOS_IMOVEL = [
  "APARTAMENTO", "CASA", "CASA_CONDOMINIO", "TERRENO", "SALA_COMERCIAL",
  "LOJA", "GALPAO", "CHACARA", "FAZENDA", "COBERTURA", "KITNET", "STUDIO",
  "PREDIO_COMERCIAL", "AREA_RURAL", "OUTRO",
] as const;

export const FINALIDADES_IMOVEL = [
  { valor: "VENDA", rotulo: "Venda" },
  { valor: "LOCACAO", rotulo: "Locação" },
  { valor: "VENDA_LOCACAO", rotulo: "Venda e Locação" },
  { valor: "TEMPORADA", rotulo: "Temporada" },
] as const;

export const STATUS_IMOVEL = [
  "DISPONIVEL", "RESERVADO", "VENDIDO", "LOCADO", "INDISPONIVEL",
] as const;

export const ESTAGIOS_JORNADA = [
  "NOVO_LEAD", "EM_QUALIFICACAO", "BUSCANDO_OPCOES", "VISITANDO_IMOVEIS",
  "NEGOCIANDO", "PROPOSTA_ENVIADA", "FECHADO", "PERDIDO", "PAUSADO",
] as const;

export const NIVEIS_URGENCIA = [
  "ALTA", "MEDIA", "BAIXA", "SEM_URGENCIA",
] as const;

export const ORIGENS_LEAD = [
  "INDICACAO", "PORTAL_IMOBILIARIO", "REDES_SOCIAIS", "WHATSAPP",
  "SITE_PROPRIO", "CAPTACAO_ATIVA", "EVENTO", "OUTRO",
] as const;

export const ESTADOS_CIVIS = [
  "SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL", "OUTRO",
] as const;

export const FORMAS_PAGAMENTO = [
  "FINANCIAMENTO", "PERMUTA", "VISTA", "MISTO", "A_DEFINIR",
] as const;

export const OBJETIVOS_COMPRA = [
  "MORADIA_PROPRIA", "INVESTIMENTO", "LOCACAO", "VERANEIO", "OUTRO",
] as const;

export const PRE_APROVACOES = ["SIM", "NAO", "EM_ANALISE"] as const;

export const TIPOS_INTERACAO = [
  "LIGACAO", "MENSAGEM", "REUNIAO", "VISITA_AGENDADA", "VISITA_REALIZADA",
  "ENVIO_PROPOSTA", "RETORNO_CLIENTE", "ATUALIZACAO_PERFIL",
  "OBSERVACAO_INTERNA", "FOLLOW_UP",
] as const;

export const TIPOS_PESSOA_PROPRIETARIO = [
  "PESSOA_FISICA", "PESSOA_JURIDICA",
] as const;

export const STATUS_PROPRIETARIO = ["ATIVO", "INATIVO", "ARQUIVADO"] as const;

export const ORIGENS_CADASTRO_IMOVEL = [
  "MANUAL", "INDICACAO", "CAPTACAO_ATIVA", "PORTAL", "SITE",
  "REDES_SOCIAIS", "WHATSAPP", "OUTRO",
] as const;

export const TIPOS_PARCEIRO = [
  "INDICADOR", "CORRETOR_PARCEIRO", "IMOBILIARIA", "CAPTADOR", "OUTRO",
] as const;

export const STATUS_PARCEIRO = ["ATIVO", "INATIVO", "ARQUIVADO"] as const;

export const TIPOS_NEGOCIO_INDICACAO = ["VENDA", "LOCACAO", "TEMPORADA"] as const;

export const STATUS_INDICACAO_PARCEIRO = [
  "EM_ANDAMENTO", "CONCLUIDA", "PAGA", "CANCELADA",
] as const;

// ─── Cores de status ──────────────────────────────────────────────────────────

export const CORES_STATUS_IMOVEL: Record<string, string> = {
  DISPONIVEL: "badge-success",
  RESERVADO: "badge-warning",
  VENDIDO: "badge-danger",
  LOCADO: "badge-info",
  INDISPONIVEL: "badge-secondary",
  ARQUIVADO: "badge-secondary",
};

export const CORES_ESTAGIO_JORNADA: Record<string, string> = {
  NOVO_LEAD: "badge-info",
  EM_QUALIFICACAO: "badge-warning",
  BUSCANDO_OPCOES: "badge-primary",
  VISITANDO_IMOVEIS: "badge-primary",
  NEGOCIANDO: "badge-warning",
  PROPOSTA_ENVIADA: "badge-warning",
  FECHADO: "badge-success",
  PERDIDO: "badge-danger",
  PAUSADO: "badge-secondary",
};

export const CORES_STATUS_INDICACAO: Record<string, string> = {
  EM_ANDAMENTO: "badge-warning",
  CONCLUIDA: "badge-info",
  PAGA: "badge-success",
  CANCELADA: "badge-secondary",
};
