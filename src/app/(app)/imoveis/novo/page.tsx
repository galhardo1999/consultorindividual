import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { NovoImovelForm } from "./NovoImovelForm";

export default async function NovoImovelPage() {
  const proprietarios = await prisma.proprietario.findMany({
    select: { id: true, nomeCompleto: true },
    orderBy: { nomeCompleto: "asc" },
  });

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/imoveis" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Novo Imóvel</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            Preencha os dados do imóvel
          </p>
        </div>
      </div>

      <NovoImovelForm proprietarios={proprietarios} />
    </div>
  );
}
