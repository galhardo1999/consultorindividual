import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PublicImovelClient from "./client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const imovel = await prisma.imovel.findFirst({
    where: { id, autorizadoDivulgacao: true, arquivadoEm: null, status: "DISPONIVEL" },
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

  const imovel = await prisma.imovel.findFirst({
    where: { id, autorizadoDivulgacao: true, arquivadoEm: null, status: "DISPONIVEL" },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      tipoImovel: true,
      finalidade: true,
      precoVenda: true,
      valorAluguel: true,
      valorCondominio: true,
      valorIptu: true,
      cidade: true,
      bairro: true,
      estado: true,
      endereco: true,
      numero: true,
      areaTotal: true,
      quartos: true,
      suites: true,
      vagasGaragem: true,
      mobiliado: true,
      aceitaFinanciamento: true,
      aceitaPermuta: true,
      piscina: true,
      churrasqueira: true,
      varandaGourmet: true,
      elevador: true,
      portaria24h: true,
      academia: true,
      destaques: true,
      fotos: {
        select: { url: true },
        orderBy: { ordem: 'asc' }
      },
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
