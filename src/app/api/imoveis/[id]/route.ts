import { FinalidadeImovel, Prisma, StatusImovel, TipoImovel } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const atualizacaoSchema = z.object({
  titulo: z.string().min(2).optional(),
  tipoImovel: z.enum(TipoImovel).optional(),
  finalidade: z.enum(FinalidadeImovel).optional(),
  precoVenda: z.number().nonnegative().nullable().optional(),
  cidade: z.string().min(2).optional(),
  bairro: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  codigoInterno: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  quartos: z.number().int().nullable().optional(),
  suites: z.number().int().nullable().optional(),
  banheiros: z.number().int().nullable().optional(),
  vagasGaragem: z.number().int().nullable().optional(),
  areaUtil: z.number().nullable().optional(),
  valorCondominio: z.number().nullable().optional(),
  valorIptu: z.number().nullable().optional(),
  mobiliado: z.boolean().optional(),
  aceitaFinanciamento: z.boolean().optional(),
  aceitaPermuta: z.boolean().optional(),
  status: z.enum(StatusImovel).optional(),
  destaques: z.string().nullable().optional(),
  proprietarioId: z.string().optional().nullable(),
  fotos: z.array(z.string()).optional(),
});

export async function GET(_requisicao: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await auth();
  if (!sessao?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    const imovel = await prisma.imovel.findFirst({
      where: { id, usuarioId: sessao.user.id },
      include: {
        caracteristicas: true,
        proprietario: { select: { id: true, nomeCompleto: true, telefone: true, email: true } },
        indicacaoParceiro: {
          include: {
            parceiro: {
              select: {
                id: true,
                nome: true,
                telefone: true,
                whatsapp: true,
                email: true,
                tipo: true,
              },
            },
          },
        },
        interesses: {
          include: { cliente: true },
          orderBy: { atualizadoEm: "desc" },
        },
        fotos: { orderBy: { ordem: "asc" } },
      },
    });

    if (!imovel) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(imovel);
  } catch (erro) {
    console.error("[IMOVEIS ID GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(requisicao: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await auth();
  if (!sessao?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    const existente = await prisma.imovel.findFirst({ where: { id, usuarioId: sessao.user.id } });
    if (!existente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const corpo = await requisicao.json();
    const validacao = atualizacaoSchema.safeParse(corpo);
    if (!validacao.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validacao.error.flatten() },
        { status: 400 }
      );
    }

    const { fotos, ...dadosValidados } = validacao.data;

    const enderecoAlterado =
      (dadosValidados.cidade !== undefined && dadosValidados.cidade !== existente.cidade) ||
      (dadosValidados.estado !== undefined && dadosValidados.estado !== existente.estado) ||
      (dadosValidados.bairro !== undefined && dadosValidados.bairro !== existente.bairro) ||
      (dadosValidados.cep !== undefined && dadosValidados.cep !== existente.cep) ||
      (dadosValidados.endereco !== undefined && dadosValidados.endereco !== existente.endereco) ||
      (dadosValidados.numero !== undefined && dadosValidados.numero !== existente.numero) ||
      (dadosValidados.complemento !== undefined && dadosValidados.complemento !== existente.complemento);

    const coordenadasEnviadas = dadosValidados.latitude !== undefined || dadosValidados.longitude !== undefined;

    const dadosAtualizacao: Prisma.ImovelUpdateInput = {
      ...dadosValidados,
      ...(enderecoAlterado && !coordenadasEnviadas ? { latitude: null, longitude: null } : {}),
    };

    if (fotos && fotos.length > 0) {
      const quantidadeFotosExistentes = await prisma.fotoImovel.count({ where: { imovelId: id } });
      dadosAtualizacao.fotos = {
        create: fotos.map((url, indice) => ({
          url,
          isCapa: quantidadeFotosExistentes === 0 && indice === 0,
          ordem: quantidadeFotosExistentes + indice,
        })),
      };
    }

    const imovel = await prisma.imovel.update({
      where: { id, usuarioId: sessao.user.id },
      data: dadosAtualizacao,
    });
    return NextResponse.json(imovel);
  } catch (erro) {
    console.error("[IMOVEIS ID PATCH]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_requisicao: Request, { params }: { params: Promise<{ id: string }> }) {
  const sessao = await auth();
  if (!sessao?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  try {
    const existente = await prisma.imovel.findFirst({ where: { id, usuarioId: sessao.user.id } });
    if (!existente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const imovel = await prisma.imovel.update({
      where: { id, usuarioId: sessao.user.id },
      data: { arquivadoEm: new Date(), status: StatusImovel.ARQUIVADO },
    });

    return NextResponse.json(imovel);
  } catch (erro) {
    console.error("[IMOVEIS ID DELETE]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
