import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;
const BUCKET_IMAGENS = "imoveis";

const obterClienteStorage = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !chaveServico) {
    throw new Error("Supabase Storage server-side nao configurado");
  }

  return createClient(supabaseUrl, chaveServico, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const sanitizarSegmento = (valor: string) => valor.replace(/[^a-zA-Z0-9_-]/g, "");

const obterExtensao = (arquivo: File) => {
  const extensaoOriginal = arquivo.name.split(".").pop()?.toLowerCase();
  if (extensaoOriginal && ["jpg", "jpeg", "png", "webp", "gif"].includes(extensaoOriginal)) {
    return extensaoOriginal;
  }

  if (arquivo.type === "image/png") return "png";
  if (arquivo.type === "image/webp") return "webp";
  if (arquivo.type === "image/gif") return "gif";
  return "jpg";
};

export async function POST(requisicao: NextRequest) {
  const sessao = await auth();
  if (!sessao?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const formulario = await requisicao.formData();
    const arquivo = formulario.get("arquivo");
    const pasta = formulario.get("pasta");

    if (!(arquivo instanceof File)) {
      return NextResponse.json({ error: "Arquivo obrigatorio" }, { status: 400 });
    }

    if (!TIPOS_PERMITIDOS.has(arquivo.type)) {
      return NextResponse.json({ error: "Formato de imagem invalido" }, { status: 400 });
    }

    if (arquivo.size > TAMANHO_MAX_BYTES) {
      return NextResponse.json({ error: "Imagem acima do limite de 5MB" }, { status: 400 });
    }

    const pastaInformada = typeof pasta === "string" ? sanitizarSegmento(pasta) : "";
    const pastaUsuario = sanitizarSegmento(sessao.user.id);
    const extensao = obterExtensao(arquivo);
    const nomeArquivo = `${crypto.randomUUID()}.${extensao}`;
    const caminho = [pastaUsuario, pastaInformada, nomeArquivo].filter(Boolean).join("/");

    const clienteStorage = obterClienteStorage();
    const { error } = await clienteStorage.storage
      .from(BUCKET_IMAGENS)
      .upload(caminho, arquivo, {
        contentType: arquivo.type,
        upsert: false,
      });

    if (error) {
      console.error("[STORAGE IMAGENS POST]", error);
      return NextResponse.json({ error: "Erro ao enviar imagem" }, { status: 500 });
    }

    const { data } = clienteStorage.storage.from(BUCKET_IMAGENS).getPublicUrl(caminho);
    return NextResponse.json({ url: data.publicUrl });
  } catch (erro) {
    console.error("[STORAGE IMAGENS POST]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
