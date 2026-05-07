import { prisma } from "./prisma";

/**
 * Normaliza um documento (CPF/CNPJ) removendo todos os caracteres não numéricos.
 * Retorna null se a string estiver vazia ou inválida.
 */
export function normalizeDocument(document: string | null | undefined): string | null {
  if (!document) return null;
  const digits = document.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
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
  const docNorm = normalizeDocument(documento);
  if (!docNorm) return false;

  const docMascaradoCpf = docNorm.length <= 11 
    ? docNorm.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") 
    : docNorm;
    
  const docMascaradoCnpj = docNorm.length > 11 
    ? docNorm.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") 
    : docNorm;

  const conditions = [
    { documento: docNorm },
    { documento: docMascaradoCpf },
    { documento: docMascaradoCnpj }
  ];

  // Remove duplicatas nas condições
  const uniqueConditions = Array.from(new Set(conditions.map(c => c.documento))).map(doc => ({ documento: doc }));

  const where = {
    usuarioId,
    OR: uniqueConditions,
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

