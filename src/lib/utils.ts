import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getInitials(nome: string): string {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function journeyStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    NOVO_LEAD: "Novo Lead",
    EM_QUALIFICACAO: "Em Qualificação",
    BUSCANDO_OPCOES: "Buscando Opções",
    VISITANDO_IMOVEIS: "Visitando Imóveis",
    NEGOCIANDO: "Negociando",
    PROPOSTA_ENVIADA: "Proposta Enviada",
    FECHADO: "Fechado",
    PERDIDO: "Perdido",
    PAUSADO: "Pausado",
  };
  return labels[stage] || stage;
}

export function journeyStageColor(stage: string): string {
  const colors: Record<string, string> = {
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
  return colors[stage] || "badge-secondary";
}

export function urgencyLabel(level: string): string {
  const labels: Record<string, string> = {
    ALTA: "Alta",
    MEDIA: "Média",
    BAIXA: "Baixa",
    SEM_URGENCIA: "Sem Urgência",
  };
  return labels[level] || level;
}

export function propertyTypeLabel(tipo: string): string {
  const rotulos: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    CASA_CONDOMINIO: "Casa em Condomínio",
    TERRENO: "Terreno",
    SALA_COMERCIAL: "Sala Comercial",
    LOJA: "Loja",
    GALPAO: "Galpão",
    CHACARA: "Chácara",
    FAZENDA: "Fazenda",
    COBERTURA: "Cobertura",
    KITNET: "Kitnet",
    STUDIO: "Studio",
    PREDIO_COMERCIAL: "Prédio Comercial",
    AREA_RURAL: "Área Rural",
    OUTRO: "Outro",
  };
  return rotulos[tipo] ?? tipo;
}

export function propertyStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DISPONIVEL: "Disponível",
    RESERVADO: "Reservado",
    VENDIDO: "Vendido",
    LOCADO: "Locado",
    INDISPONIVEL: "Indisponível",
    ARQUIVADO: "Arquivado",
  };
  return labels[status] || status;
}

export function interactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    LIGACAO: "Ligação",
    MENSAGEM: "Mensagem",
    REUNIAO: "Reunião",
    VISITA_AGENDADA: "Visita Agendada",
    VISITA_REALIZADA: "Visita Realizada",
    ENVIO_PROPOSTA: "Envio de Proposta",
    RETORNO_CLIENTE: "Retorno do Cliente",
    ATUALIZACAO_PERFIL: "Atualização de Perfil",
    OBSERVACAO_INTERNA: "Observação Interna",
    FOLLOW_UP: "Follow-up",
  };
  return labels[type] || type;
}

export function leadSourceLabel(origemCaptacao: string): string {
  const labels: Record<string, string> = {
    INDICACAO: "Indicação",
    PORTAL_IMOBILIARIO: "Portal Imobiliário",
    REDES_SOCIAIS: "Redes Sociais",
    WHATSAPP: "WhatsApp",
    SITE_PROPRIO: "Site Próprio",
    CAPTACAO_ATIVA: "Captação Ativa",
    EVENTO: "Evento",
    OUTRO: "Outro",
  };
  return labels[origemCaptacao] || origemCaptacao;
}

// ─── Input Masks ───────────────────────────────────────────────────────────────

/** (XX) X XXXX-XXXX */
export function maskTelefone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** XXX.XXX.XXX-XX */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/** XX.XXX.XXX/XXXX-XX */
export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

/** Aplica máscara CPF ou CNPJ baseado no comprimento dos dígitos */
export function maskDocumento(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) return maskCPF(value);
  return maskCNPJ(value);
}


/** XXXXX-XXX */
export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** R$ X.XXX,XX — use parseCurrency() antes de enviar à API */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const cents = parseInt(digits, 10);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Converte "R$ 1.500,00" → 1500 para enviar à API */
export function parseCurrency(masked: string): number {
  const digits = masked.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
}

/**
 * Converte um valor monetário em Reais vindo do banco (ex: 100000)
 * para a string mascarada usada nos <input> (ex: "R$ 100.000,00").
 * maskCurrency() espera centavos como string — por isso multiplicamos por 100.
 */
export function reaisParaInput(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "";
  const num = Number(valor);
  if (!num || isNaN(num)) return "";
  return maskCurrency(String(Math.round(num * 100)));
}

