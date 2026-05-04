import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PublicImovelClient from "./client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const imovel = await prisma.imovel.findUnique({
    where: { id },
    select: { titulo: true, cidade: true, estado: true }
  });
  if (!imovel) return { title: "Imóvel não encontrado" };
  return {
    title: `${imovel.titulo} | ${imovel.cidade}`,
    description: `Conheça este excelente imóvel em ${imovel.cidade}.`,
  };
}

export default async function PublicImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const imovel = await prisma.imovel.findUnique({
    where: { id },
    include: {
      fotos: { orderBy: { ordem: 'asc' } },
      usuario: {
        select: {
          nome: true,
          telefone: true,
          email: true,
          avatarUrl: true
        }
      }
    }
  });

  if (!imovel) {
    notFound();
  }

  return <PublicImovelClient imovel={imovel} corretor={imovel.usuario} />;
}
