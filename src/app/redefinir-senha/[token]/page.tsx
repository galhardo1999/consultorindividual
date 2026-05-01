"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, CheckCircle2, XCircle } from "lucide-react";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function RedefinirSenhaPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Erro ao redefinir senha.");
        return;
      }

      setSucesso(true);
      // Redireciona para login após 3 segundos
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setErro("Falha na requisição. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <AuthLayout>
        <AuthCard
          title="Senha redefinida!"
          subtitle="Sua senha foi alterada com sucesso."
          footer={
            <Link
              href="/login"
              className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
            >
              Ir para o login agora
            </Link>
          }
        >
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <p className="text-center text-sm text-[var(--color-surface-300)] leading-relaxed">
              Você será redirecionado para o login em alguns segundos...
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // Token claramente inválido (link muito curto) — exibe erro imediato
  if (!token || token.length < 10) {
    return (
      <AuthLayout>
        <AuthCard
          title="Link inválido"
          subtitle="Este link de recuperação é inválido ou expirou."
          footer={
            <Link
              href="/recuperar-senha"
              className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
            >
              Solicitar novo link
            </Link>
          }
        >
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle size={32} className="text-red-400" />
            </div>
            <p className="text-center text-sm text-[var(--color-surface-400)]">
              Solicite um novo link de recuperação a partir da tela de login.
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Nova senha"
        subtitle="Escolha uma senha segura com pelo menos 8 caracteres."
        footer={
          <Link
            href="/login"
            className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
          >
            Cancelar e voltar ao login
          </Link>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordInput
            id="nova-senha"
            label="Nova senha"
            placeholder="Mínimo 8 caracteres"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            autoComplete="new-password"
          />

          <PasswordInput
            id="confirmacao-senha"
            label="Confirmar nova senha"
            placeholder="Repita a senha"
            value={confirmacaoSenha}
            onChange={(e) => setConfirmacaoSenha(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Indicador de força de senha */}
          {novaSenha.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                {[...Array(4)].map((_, i) => {
                  const forca =
                    novaSenha.length >= 12 && /[A-Z]/.test(novaSenha) && /[0-9]/.test(novaSenha) && /[^A-Za-z0-9]/.test(novaSenha)
                      ? 4
                      : novaSenha.length >= 10 && (/[A-Z]/.test(novaSenha) || /[0-9]/.test(novaSenha))
                      ? 3
                      : novaSenha.length >= 8
                      ? 2
                      : 1;
                  const ativo = i < forca;
                  const cor =
                    forca === 1 ? "bg-red-500" :
                    forca === 2 ? "bg-yellow-500" :
                    forca === 3 ? "bg-blue-500" : "bg-green-500";
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${ativo ? cor : "bg-[var(--color-surface-700)]"}`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-[var(--color-surface-400)]">
                {novaSenha.length < 8
                  ? "Muito curta"
                  : novaSenha.length < 10
                  ? "Fraca"
                  : novaSenha.length < 12
                  ? "Média"
                  : "Forte"}
              </p>
            </div>
          )}

          {erro && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <KeyRound size={14} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-500 font-medium">{erro}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={loading}
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
