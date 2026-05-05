-- CreateEnum
CREATE TYPE "TipoParceiro" AS ENUM ('INDICADOR', 'CORRETOR_PARCEIRO', 'IMOBILIARIA', 'CAPTADOR', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusParceiro" AS ENUM ('ATIVO', 'INATIVO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "TipoNegocioIndicacao" AS ENUM ('VENDA', 'LOCACAO', 'TEMPORADA');

-- CreateEnum
CREATE TYPE "StatusIndicacaoParceiro" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDA', 'PAGA', 'CANCELADA');

-- CreateTable
CREATE TABLE "parceiros" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "documento" TEXT,
    "tipo" "TipoParceiro" NOT NULL DEFAULT 'INDICADOR',
    "status" "StatusParceiro" NOT NULL DEFAULT 'ATIVO',
    "comissaoPadraoPercentual" DOUBLE PRECISION,
    "comissaoPadraoValorFixo" DOUBLE PRECISION,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parceiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicacoes_parceiro" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "parceiroId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "tipoNegocio" "TipoNegocioIndicacao" NOT NULL,
    "status" "StatusIndicacaoParceiro" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "comissaoPercentual" DOUBLE PRECISION,
    "comissaoValorFixo" DOUBLE PRECISION,
    "valorNegocioFinal" DOUBLE PRECISION,
    "valorComissaoFinal" DOUBLE PRECISION,
    "observacoes" TEXT,
    "concluidaEm" TIMESTAMP(3),
    "pagaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indicacoes_parceiro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parceiros_usuarioId_idx" ON "parceiros"("usuarioId");

-- CreateIndex
CREATE INDEX "parceiros_usuarioId_status_idx" ON "parceiros"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "parceiros_usuarioId_tipo_idx" ON "parceiros"("usuarioId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "indicacoes_parceiro_imovelId_key" ON "indicacoes_parceiro"("imovelId");

-- CreateIndex
CREATE INDEX "indicacoes_parceiro_usuarioId_idx" ON "indicacoes_parceiro"("usuarioId");

-- CreateIndex
CREATE INDEX "indicacoes_parceiro_usuarioId_parceiroId_idx" ON "indicacoes_parceiro"("usuarioId", "parceiroId");

-- CreateIndex
CREATE INDEX "indicacoes_parceiro_usuarioId_status_idx" ON "indicacoes_parceiro"("usuarioId", "status");

-- CreateIndex
CREATE INDEX "indicacoes_parceiro_usuarioId_tipoNegocio_idx" ON "indicacoes_parceiro"("usuarioId", "tipoNegocio");

-- AddForeignKey
ALTER TABLE "parceiros" ADD CONSTRAINT "parceiros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes_parceiro" ADD CONSTRAINT "indicacoes_parceiro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes_parceiro" ADD CONSTRAINT "indicacoes_parceiro_parceiroId_fkey" FOREIGN KEY ("parceiroId") REFERENCES "parceiros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes_parceiro" ADD CONSTRAINT "indicacoes_parceiro_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
