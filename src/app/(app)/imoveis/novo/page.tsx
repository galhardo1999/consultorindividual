import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NovoImovelForm } from "./NovoImovelForm";

export default async function NovoImovelPage({ searchParams }: { searchParams: Promise<{ cloneId?: string }> }) {
  const sessao = await auth();
  if (!sessao?.user?.id) return null;

  const params = await searchParams;
  let imovelParaClonar: any = undefined;

  const [proprietarios, parceiros] = await Promise.all([
    prisma.proprietario.findMany({
      where: { usuarioId: sessao.user.id },
      select: { id: true, nomeCompleto: true },
      orderBy: { nomeCompleto: "asc" },
    }),
    prisma.parceiro.findMany({
      where: { usuarioId: sessao.user.id, status: "ATIVO" },
      select: {
        id: true,
        nome: true,
        tipo: true,
        comissaoPadraoPercentual: true,
        comissaoPadraoValorFixo: true,
      },
      orderBy: { nome: "asc" },
    }),
    ...(params.cloneId ? [
      prisma.imovel.findUnique({
        where: { id: params.cloneId, usuarioId: sessao.user.id },
        include: { fotos: true, indicacaoParceiro: true },
      }).then(imovel => {
        if (imovel) {
          imovelParaClonar = { ...imovel, codigoInterno: null }; // Evitar duplicar código interno
        }
      })
    ] : [])
  ]);

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/imoveis" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>
            {imovelParaClonar ? "Clonar Imóvel" : "Novo Imóvel"}
          </h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            {imovelParaClonar ? "Revise e edite os dados do imóvel clonado" : "Preencha os dados do imóvel"}
          </p>
        </div>
      </div>

      <NovoImovelForm 
        proprietarios={proprietarios} 
        parceiros={parceiros} 
        imovel={imovelParaClonar} 
        isClone={!!imovelParaClonar} 
      />
    </div>
  );
}
