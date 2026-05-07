export type OrigemCadastroDocumento = "CLIENTE" | "PROPRIETARIO" | "PARCEIRO";

export type EnderecoCadastroDocumento = {
  cidade: string | null;
  estado: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  cep: string | null;
};

export type CadastroDocumentoEncontrado = {
  id: string;
  origem: OrigemCadastroDocumento;
  nome: string;
  telefone: string | null;
  documento: string | null;
  endereco: EnderecoCadastroDocumento;
};

export type RespostaBuscaCadastroDocumento =
  | { encontrado: false }
  | { encontrado: true; cadastro: CadastroDocumentoEncontrado };
