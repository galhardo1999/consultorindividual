import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDocumentoDuplicado } from "@/lib/documentValidation";
import { z } from "zod";

type ContextoRota = { params: Promise<{ id: string }> };

const parceiroSchema = z.object({
  nome: z.string().min(2).optional(),
  telefone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  documento: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  tipo: z.enum(["INDICADOR", "CORRETOR_PARCEIRO", "IMOBILIARIA", "CAPTADOR", "OUTRO"]).optional(),
  status: z.enum(["ATIVO", "INATIVO", "ARQUIVADO"]).optional(),
  comissaoPadraoPercentual: z.number().min(0).max(100).optional().nullable(),
  comissaoPadraoValorFixo: z.number().min(0).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

const naoAutorizado = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const naoEncontrado = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });

const obterSessao = async () => {
  const sessao = await auth();
  if (!sessao?.user?.id) return null;
  return sessao as typeof sessao & { user: { id: string } };
};

export async function GET(_requisicao: Request, { params }: ContextoRota) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  const { id } = await params;

  try {
    const parceiro = await prisma.parceiro.findFirst({
      where: { id, usuarioId: sessao.user.id },
      include: {
        indicacoes: {
          include: {
            imovel: {
              select: {
                id: true,
                titulo: true,
                cidade: true,
                bairro: true,
                status: true,
                precoVenda: true,
                valorAluguel: true,
                valorTemporadaDiaria: true,
                fotos: {
                  select: {
                    url: true,
                    isCapa: true,
                  },
                  orderBy: [
                    { isCapa: "desc" },
                    { ordem: "asc" },
                  ],
                  take: 1,
                },
              },
            },
          },
          orderBy: { atualizadoEm: "desc" },
        },
      },
    });

    return parceiro ? NextResponse.json(parceiro) : naoEncontrado();
  } catch (erro) {
    console.error("[PARCEIROS ID GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(requisicao: Request, { params }: ContextoRota) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  const { id } = await params;

  try {
    const corpo = await requisicao.json();
    const parsed = parceiroSchema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existente = await prisma.parceiro.findFirst({
      where: { id, usuarioId: sessao.user.id },
      select: { id: true },
    });

    if (!existente) return naoEncontrado();

    const { email, ...dadosParceiro } = parsed.data;

    if (dadosParceiro.documento) {
      const duplicado = await isDocumentoDuplicado(dadosParceiro.documento, sessao.user.id, "PARCEIRO", id);
      if (duplicado) {
        return NextResponse.json({ error: "Já existe um cadastro com este CPF/CNPJ." }, { status: 400 });
      }
    }

    const parceiro = await prisma.parceiro.update({
      where: { id, usuarioId: sessao.user.id },
      data: { ...dadosParceiro, ...(email !== undefined ? { email: email || null } : {}) },
    });

    return NextResponse.json(parceiro);
  } catch (erro) {
    console.error("[PARCEIROS ID PATCH]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_requisicao: Request, { params }: ContextoRota) {
  const sessao = await obterSessao();
  if (!sessao) return naoAutorizado();

  const { id } = await params;

  try {
    const resultado = await prisma.parceiro.updateMany({
      where: { id, usuarioId: sessao.user.id },
      data: { status: "ARQUIVADO" },
    });

    if (resultado.count === 0) return naoEncontrado();

    return NextResponse.json({ ok: true });
  } catch (erro) {
    console.error("[PARCEIROS ID DELETE]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
