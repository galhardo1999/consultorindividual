import type { CadastroDocumentoEncontrado } from "@/types/cadastro-documento";

export const normalizarDocumentoFormulario = (documento: string) =>
  documento.replace(/\D/g, "");

export const documentoEstaCompleto = (documento: string) => {
  const digitos = normalizarDocumentoFormulario(documento);
  return digitos.length === 11 || digitos.length === 14;
};

export const buscarCadastroPorDocumento = async (documento: string) => {
  if (!documentoEstaCompleto(documento)) return null;

  const resposta = await fetch(
    `/api/cadastros/documento?documento=${encodeURIComponent(documento)}`
  );

  if (!resposta.ok) return null;

  const dados = await resposta.json() as
    | { encontrado: false }
    | { encontrado: true; cadastro: CadastroDocumentoEncontrado };

  return dados.encontrado ? dados.cadastro : null;
};
