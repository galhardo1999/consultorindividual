-- AlterTable
ALTER TABLE "clientes"
ADD COLUMN "cidade" TEXT,
ADD COLUMN "estado" TEXT,
ADD COLUMN "endereco" TEXT,
ADD COLUMN "numero" TEXT,
ADD COLUMN "bairro" TEXT,
ADD COLUMN "cep" TEXT;

-- AlterTable
ALTER TABLE "parceiros"
ADD COLUMN "cidade" TEXT,
ADD COLUMN "estado" TEXT,
ADD COLUMN "endereco" TEXT,
ADD COLUMN "numero" TEXT,
ADD COLUMN "bairro" TEXT,
ADD COLUMN "cep" TEXT;

-- CreateIndex
CREATE INDEX "clientes_usuarioId_documento_idx" ON "clientes"("usuarioId", "documento");

-- CreateIndex
CREATE INDEX "parceiros_usuarioId_documento_idx" ON "parceiros"("usuarioId", "documento");

-- CreateIndex
CREATE INDEX "proprietarios_usuarioId_documento_idx" ON "proprietarios"("usuarioId", "documento");
