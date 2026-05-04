import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schema replicado aqui para testar isoladamente (sem importar o módulo auth.ts que depende de Prisma)
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  password: z
    .string()
    .min(6)
    .regex(/[a-zA-Z]/, "Senha deve conter pelo menos 1 letra")
    .regex(/[0-9]/, "Senha deve conter pelo menos 1 número"),
  telefone: z.string().optional(),
});

const senhaRecuperacaoSchema = z.object({
  token: z.string().min(1),
  novaSenha: z.string().min(8),
});

describe("loginSchema", () => {
  it("aceita credenciais válidas", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "senha123" });
    expect(result.success).toBe(true);
  });
  it("rejeita email inválido", () => {
    const result = loginSchema.safeParse({ email: "nao-email", password: "senha123" });
    expect(result.success).toBe(false);
  });
  it("rejeita senha curta", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("aceita dados válidos", () => {
    const result = registerSchema.safeParse({
      nome: "João Silva",
      email: "joao@example.com",
      password: "Senha123",
    });
    expect(result.success).toBe(true);
  });
  it("rejeita nome muito curto", () => {
    const result = registerSchema.safeParse({
      nome: "J",
      email: "joao@example.com",
      password: "Senha123",
    });
    expect(result.success).toBe(false);
  });
  it("rejeita senha sem número", () => {
    const result = registerSchema.safeParse({
      nome: "João Silva",
      email: "joao@example.com",
      password: "somentaletras",
    });
    expect(result.success).toBe(false);
  });
  it("rejeita senha sem letra", () => {
    const result = registerSchema.safeParse({
      nome: "João Silva",
      email: "joao@example.com",
      password: "123456789",
    });
    expect(result.success).toBe(false);
  });
  it("aceita telefone opcional", () => {
    const result = registerSchema.safeParse({
      nome: "João Silva",
      email: "joao@example.com",
      password: "Senha123",
      telefone: "(11) 9 8765-4321",
    });
    expect(result.success).toBe(true);
  });
});

describe("senhaRecuperacaoSchema", () => {
  it("aceita token e nova senha válidos", () => {
    const result = senhaRecuperacaoSchema.safeParse({
      token: "abc123def456",
      novaSenha: "NovaSenha123",
    });
    expect(result.success).toBe(true);
  });
  it("rejeita token vazio", () => {
    const result = senhaRecuperacaoSchema.safeParse({ token: "", novaSenha: "NovaSenha123" });
    expect(result.success).toBe(false);
  });
  it("rejeita nova senha com menos de 8 caracteres", () => {
    const result = senhaRecuperacaoSchema.safeParse({ token: "abc123", novaSenha: "abc12" });
    expect(result.success).toBe(false);
  });
});
