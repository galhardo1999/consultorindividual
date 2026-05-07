import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { obterCondicoesDocumento, normalizarDocumento } from "@/lib/documentValidation";
import { prisma } from "@/lib/prisma";
import type {
  CadastroDocumentoEncontrado,
  EnderecoCadastroDocumento,
  RespostaBuscaCadastroDocumento,
} from "@/types/cadastro-documento";

const buscaDocumentoSchema = z.object({
  documento: z.string().min(1),
});

const naoAutorizado = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const montarEndereco = (endereco: EnderecoCadastroDocumento): EnderecoCadastroDocumento => ({
  cidade: endereco.cidade || null,
  estado: endereco.estado || null,
  endereco: endereco.endereco || null,
  numero: endereco.numero || null,
  bairro: endereco.bairro || null,
  cep: endereco.cep || null,
});

const temEndereco = (cadastro: CadastroDocumentoEncontrado) =>
  Boolean(
    cadastro.endereco.cidade ||
    cadastro.endereco.estado ||
    cadastro.endereco.endereco ||
    cadastro.endereco.numero ||
    cadastro.endereco.bairro ||
    cadastro.endereco.cep
  );

export async function GET(requisicao: Request) {
  const sessao = await auth();
  if (!sessao?.user?.id) return naoAutorizado();

  const { searchParams } = new URL(requisicao.url);
  const parsed = buscaDocumentoSchema.safeParse({
    documento: searchParams.get("documento") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const documentoNormalizado = normalizarDocumento(parsed.data.documento);
  if (!documentoNormalizado || ![11, 14].includes(documentoNormalizado.length)) {
    return NextResponse.json({ encontrado: false } satisfies RespostaBuscaCadastroDocumento);
  }

  const condicoesDocumento = obterCondicoesDocumento(parsed.data.documento);
  const usuarioId = sessao.user.id;

  try {
    const [cliente, proprietario, parceiro] = await prisma.$transaction([
      prisma.cliente.findFirst({
        where: { usuarioId, OR: condicoesDocumento },
        select: {
          id: true,
          nomeCompleto: true,
          telefone: true,
          documento: true,
          cidadeAtual: true,
          cidade: true,
          estado: true,
          endereco: true,
          numero: true,
          bairro: true,
          cep: true,
        },
        orderBy: { atualizadoEm: "desc" },
      }),
      prisma.proprietario.findFirst({
        where: { usuarioId, OR: condicoesDocumento },
        select: {
          id: true,
          nomeCompleto: true,
          telefone: true,
          documento: true,
          cidade: true,
          estado: true,
          endereco: true,
          numero: true,
          bairro: true,
          cep: true,
        },
        orderBy: { atualizadoEm: "desc" },
      }),
      prisma.parceiro.findFirst({
        where: { usuarioId, OR: condicoesDocumento },
        select: {
          id: true,
          nome: true,
          telefone: true,
          documento: true,
          cidade: true,
          estado: true,
          endereco: true,
          numero: true,
          bairro: true,
          cep: true,
        },
        orderBy: { atualizadoEm: "desc" },
      }),
    ]);

    const cadastros: CadastroDocumentoEncontrado[] = [
      ...(cliente ? [{
        id: cliente.id,
        origem: "CLIENTE" as const,
        nome: cliente.nomeCompleto,
        telefone: cliente.telefone,
        documento: cliente.documento,
        endereco: montarEndereco({
          cidade: cliente.cidade || cliente.cidadeAtual || null,
          estado: cliente.estado,
          endereco: cliente.endereco,
          numero: cliente.numero,
          bairro: cliente.bairro,
          cep: cliente.cep,
        }),
      }] : []),
      ...(proprietario ? [{
        id: proprietario.id,
        origem: "PROPRIETARIO" as const,
        nome: proprietario.nomeCompleto,
        telefone: proprietario.telefone,
        documento: proprietario.documento,
        endereco: montarEndereco({
          cidade: proprietario.cidade,
          estado: proprietario.estado,
          endereco: proprietario.endereco,
          numero: proprietario.numero,
          bairro: proprietario.bairro,
          cep: proprietario.cep,
        }),
      }] : []),
      ...(parceiro ? [{
        id: parceiro.id,
        origem: "PARCEIRO" as const,
        nome: parceiro.nome,
        telefone: parceiro.telefone,
        documento: parceiro.documento,
        endereco: montarEndereco({
          cidade: parceiro.cidade,
          estado: parceiro.estado,
          endereco: parceiro.endereco,
          numero: parceiro.numero,
          bairro: parceiro.bairro,
          cep: parceiro.cep,
        }),
      }] : []),
    ];

    const cadastro = cadastros.find(temEndereco) ?? cadastros[0];

    if (!cadastro) {
      return NextResponse.json({ encontrado: false } satisfies RespostaBuscaCadastroDocumento);
    }

    return NextResponse.json({
      encontrado: true,
      cadastro,
    } satisfies RespostaBuscaCadastroDocumento);
  } catch (erro) {
    console.error("[CADASTROS DOCUMENTO GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
