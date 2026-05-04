import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  getInitials,
  maskTelefone,
  maskCPF,
  maskCNPJ,
  maskDocumento,
  maskCEP,
  maskCurrency,
  parseCurrency,
  reaisParaInput,
  journeyStageLabel,
  propertyTypeLabel,
  propertyStatusLabel,
  interactionTypeLabel,
  leadSourceLabel,
  urgencyLabel,
} from "./utils";

describe("formatCurrency", () => {
  it("formata valor em reais", () => {
    expect(formatCurrency(1500)).toBe("R$ 1.500,00");
  });
  it("formata zero", () => {
    expect(formatCurrency(0)).toBe("R$ 0,00");
  });
});

describe("getInitials", () => {
  it("retorna iniciais de nome completo", () => {
    expect(getInitials("João Silva")).toBe("JS");
  });
  it("retorna inicial de nome único", () => {
    expect(getInitials("Maria")).toBe("M");
  });
  it("limita a 2 iniciais", () => {
    expect(getInitials("José Carlos Souza")).toBe("JC");
  });
});

describe("maskTelefone", () => {
  it("formata celular completo", () => {
    expect(maskTelefone("11987654321")).toBe("(11) 9 8765-4321");
  });
  it("formata parcialmente durante digitação", () => {
    // com 2 dígitos ainda não fecha o parêntese
    expect(maskTelefone("11")).toBe("(11");
    expect(maskTelefone("119")).toBe("(11) 9");
  });
  it("ignora caracteres não-numéricos", () => {
    expect(maskTelefone("(11) 9 8765-4321")).toBe("(11) 9 8765-4321");
  });
});

describe("maskCPF", () => {
  it("formata CPF completo", () => {
    expect(maskCPF("12345678901")).toBe("123.456.789-01");
  });
  it("formata parcialmente", () => {
    expect(maskCPF("123")).toBe("123");
    expect(maskCPF("1234")).toBe("123.4");
  });
});

describe("maskCNPJ", () => {
  it("formata CNPJ completo", () => {
    expect(maskCNPJ("12345678000195")).toBe("12.345.678/0001-95");
  });
});

describe("maskDocumento", () => {
  it("usa máscara CPF para 11 dígitos", () => {
    expect(maskDocumento("12345678901")).toBe("123.456.789-01");
  });
  it("usa máscara CNPJ para 14 dígitos", () => {
    expect(maskDocumento("12345678000195")).toBe("12.345.678/0001-95");
  });
});

describe("maskCEP", () => {
  it("formata CEP completo", () => {
    expect(maskCEP("12345678")).toBe("12345-678");
  });
  it("formata parcialmente", () => {
    expect(maskCEP("12345")).toBe("12345");
    expect(maskCEP("123456")).toBe("12345-6");
  });
});

describe("maskCurrency / parseCurrency", () => {
  it("mascara valor monetário", () => {
    expect(maskCurrency("150000")).toBe("R$ 1.500,00");
  });
  it("retorna string vazia para entrada vazia", () => {
    expect(maskCurrency("")).toBe("");
  });
  it("parseCurrency converte string mascarada para número", () => {
    expect(parseCurrency("R$ 1.500,00")).toBe(1500);
  });
  it("parseCurrency retorna 0 para entrada vazia", () => {
    expect(parseCurrency("")).toBe(0);
  });
  it("round-trip: maskCurrency -> parseCurrency", () => {
    expect(parseCurrency(maskCurrency("150000"))).toBe(1500);
  });
});

describe("reaisParaInput", () => {
  it("converte valor do banco para input mascarado", () => {
    expect(reaisParaInput(1500)).toBe("R$ 1.500,00");
  });
  it("retorna string vazia para null", () => {
    expect(reaisParaInput(null)).toBe("");
  });
  it("retorna string vazia para 0", () => {
    expect(reaisParaInput(0)).toBe("");
  });
});

describe("label helpers", () => {
  it("journeyStageLabel retorna label correto", () => {
    expect(journeyStageLabel("NOVO_LEAD")).toBe("Novo Lead");
    expect(journeyStageLabel("FECHADO")).toBe("Fechado");
    expect(journeyStageLabel("DESCONHECIDO")).toBe("DESCONHECIDO");
  });
  it("propertyTypeLabel retorna label correto", () => {
    expect(propertyTypeLabel("APARTAMENTO")).toBe("Apartamento");
    expect(propertyTypeLabel("GALPAO")).toBe("Galpão");
  });
  it("propertyStatusLabel retorna label correto", () => {
    expect(propertyStatusLabel("DISPONIVEL")).toBe("Disponível");
    expect(propertyStatusLabel("ARQUIVADO")).toBe("Arquivado");
  });
  it("interactionTypeLabel retorna label correto", () => {
    expect(interactionTypeLabel("LIGACAO")).toBe("Ligação");
    expect(interactionTypeLabel("FOLLOW_UP")).toBe("Follow-up");
  });
  it("leadSourceLabel retorna label correto", () => {
    expect(leadSourceLabel("INDICACAO")).toBe("Indicação");
    expect(leadSourceLabel("WHATSAPP")).toBe("WhatsApp");
  });
  it("urgencyLabel retorna label correto", () => {
    expect(urgencyLabel("ALTA")).toBe("Alta");
    expect(urgencyLabel("SEM_URGENCIA")).toBe("Sem Urgência");
  });
});

describe("formatDate", () => {
  it("formata data no padrão pt-BR", () => {
    const result = formatDate(new Date("2024-01-15T12:00:00Z"));
    expect(result).toMatch(/15\/01\/2024/);
  });
});
