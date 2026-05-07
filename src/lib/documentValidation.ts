import { prisma } from "./prisma";

/**
 * Normaliza um documento (CPF/CNPJ) removendo todos os caracteres não numéricos.
 * Retorna null se a string estiver vazia ou inválida.
 */
export function normalizeDocument(documento: string | null | undefined): string | null {
  return normalizarDocumento(documento);
}

export function normalizarDocumento(documento: string | null | undefined): string | null {
  if (!documento) return null;
  const digitos = documento.replace(/\D/g, "");
  return digitos.length > 0 ? digitos : null;
}

const formatarCpf = (documentoNormalizado: string) => {
  if (documentoNormalizado.length !== 11) return null;
  return documentoNormalizado.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const formatarCnpj = (documentoNormalizado: string) => {
  if (documentoNormalizado.length !== 14) return null;
  return documentoNormalizado.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

export function obterDocumentosEquivalentes(documento: string | null | undefined): string[] {
  const documentoNormalizado = normalizarDocumento(documento);
  if (!documentoNormalizado) return [];

  const documentos = [
    documentoNormalizado,
    formatarCpf(documentoNormalizado),
    formatarCnpj(documentoNormalizado),
  ].filter((valor): valor is string => Boolean(valor));

  return Array.from(new Set(documentos));
}

export function obterCondicoesDocumento(documento: string | null | undefined) {
  return obterDocumentosEquivalentes(documento).map((documentoEquivalente) => ({
    documento: documentoEquivalente,
  }));
}

/**
 * Verifica se um documento (CPF/CNPJ) já está cadastrado no sistema (para o usuário atual),
 * buscando apenas na tabela especificada.
 * A comparação é feita apenas com os dígitos.
 * 
 * @param documento Documento com ou sem máscara
 * @param usuarioId ID do usuário autenticado
 * @param entityType Tipo da entidade a ser verificada
 * @param excludeEntityId ID da entidade sendo atualizada (para ignorar o próprio registro)
 * @returns true se já existe, false caso contrário
 */
export async function isDocumentoDuplicado(
  documento: string | null | undefined,
  usuarioId: string,
  entityType: "CLIENTE" | "PARCEIRO" | "PROPRIETARIO",
  excludeEntityId?: string
): Promise<boolean> {
  const docNorm = normalizarDocumento(documento);
  if (!docNorm) return false;

  const condicoesDocumento = obterCondicoesDocumento(documento);

  const where = {
    usuarioId,
    OR: condicoesDocumento,
    ...(excludeEntityId ? { id: { not: excludeEntityId } } : {})
  };

  let found = false;

  if (entityType === "CLIENTE") {
    const cliente = await prisma.cliente.findFirst({ where, select: { id: true } });
    found = !!cliente;
  } else if (entityType === "PARCEIRO") {
    const parceiro = await prisma.parceiro.findFirst({ where, select: { id: true } });
    found = !!parceiro;
  } else if (entityType === "PROPRIETARIO") {
    const proprietario = await prisma.proprietario.findFirst({ where, select: { id: true } });
    found = !!proprietario;
  }

  return found;
}
