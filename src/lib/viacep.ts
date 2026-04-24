export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export async function buscarEnderecoPorCep(cepStr: string): Promise<ViaCepResponse | null> {
  const cleanCep = cepStr.replace(/\D/g, "");
  
  if (cleanCep.length !== 8) {
    return null;
  }
  
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!res.ok) {
      return null;
    }
    
    const data = (await res.json()) as ViaCepResponse;
    
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (err) {
    console.error("Erro ao buscar CEP no ViaCEP:", err);
    return null;
  }
}
