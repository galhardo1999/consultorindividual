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

export function propertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    APARTAMENTO: "Apartamento",
    CASA: "Casa",
    CASA_CONDOMINIO: "Casa em Condomínio",
    TERRENO: "Terreno",
    SALA_COMERCIAL: "Sala Comercial",
    LOJA: "Loja",
    GALPAO: "Galpão",
    CHACARA: "Chácara",
    FAZENDA: "Fazenda",
    OUTRO: "Outro",
  };
  return labels[type] || type;
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
