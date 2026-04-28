import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { NovoImovelForm } from "../../novo/NovoImovelForm";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function EditarImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const { id } = await params;

  const [proprietarios, imovel] = await Promise.all([
    prisma.proprietario.findMany({
      where: { usuarioId: session.user.id },
      select: { id: true, nomeCompleto: true },
      orderBy: { nomeCompleto: "asc" },
    }),
    prisma.imovel.findUnique({
      where: { id, usuarioId: session.user.id },
    })
  ]);

  if (!imovel) {
    notFound();
  }

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/imoveis/${id}`} className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Editar Imóvel</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            {imovel.titulo}
          </p>
        </div>
      </div>

      <NovoImovelForm proprietarios={proprietarios} imovel={imovel} />
    </div>
  );
}
