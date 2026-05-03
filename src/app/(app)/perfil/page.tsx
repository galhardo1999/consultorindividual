"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, User, Mail, Phone, Lock, Shield, CheckCircle2 } from "lucide-react";
import { maskTelefone } from "@/lib/utils";
import { getPerfil, atualizarPerfil, alterarSenha } from "./actions";

export default function PerfilPage() {
  const { data: session, update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  
  // Feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  
  // Password states
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  useEffect(() => {
    async function loadData() {
      const res = await getPerfil();
      if (res.success && res.usuario) {
        setNome(res.usuario.nome || "");
        setEmail(res.usuario.email || "");
        setTelefone(res.usuario.telefone || "");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      showToast("Nome é obrigatório", "error");
      return;
    }
    
    setSaving(true);
    const res = await atualizarPerfil({ nome, telefone: telefone.replace(/\D/g, "") });
    setSaving(false);
    
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Perfil atualizado com sucesso", "success");
      // Opcional: atualizar a sessão para refletir o novo nome no header imediatamente
      updateSession({ name: nome });
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      showToast("A nova senha e a confirmação não conferem", "error");
      return;
    }
    if (novaSenha.length < 6) {
      showToast("A nova senha deve ter no mínimo 6 caracteres", "error");
      return;
    }

    setSaving(true);
    const res = await alterarSenha({ senhaAtual, novaSenha });
    setSaving(false);

    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Senha alterada com sucesso", "success");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    }
  };

  return (
    <div className="page relative">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">Meu Perfil</h1>
        <p className="text-[var(--color-surface-400)] text-sm mt-1">
          Gerencie suas informações pessoais e de segurança
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-[var(--color-brand-500)]" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="card text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-[var(--color-surface-700)] text-[var(--color-surface-200)] font-bold text-2xl rounded-full flex items-center justify-center mb-4">
                {nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "U"}
              </div>
              <h3 className="font-semibold text-lg text-[var(--color-surface-50)]">{nome}</h3>
              <p className="text-sm text-[var(--color-surface-400)] mb-3">{email}</p>
              <div className="badge badge-success text-xs">Consultor Ativo</div>
            </div>

            <div className="flex flex-col gap-1 bg-[var(--color-surface-800)] p-2 rounded-xl border border-[var(--color-surface-700)]">
              <button
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "info"
                    ? "bg-[var(--color-surface-700)] text-[var(--color-surface-50)]"
                    : "text-[var(--color-surface-400)] hover:bg-[var(--color-surface-700)] hover:text-[var(--color-surface-200)]"
                }`}
                onClick={() => setActiveTab("info")}
              >
                <User size={18} />
                Informações Pessoais
              </button>
              <button
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "security"
                    ? "bg-[var(--color-surface-700)] text-[var(--color-surface-50)]"
                    : "text-[var(--color-surface-400)] hover:bg-[var(--color-surface-700)] hover:text-[var(--color-surface-200)]"
                }`}
                onClick={() => setActiveTab("security")}
              >
                <Shield size={18} />
                Segurança
              </button>
            </div>
            
            <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-xl text-sm text-[var(--color-surface-300)] mt-4">
              <strong className="text-[var(--color-brand-400)] block mb-1">Prime Realty CRM</strong>
              Seus dados são privados e acessíveis apenas por você.
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-9">
            {activeTab === "info" && (
              <div className="card">
                <h2 className="section-titulo mb-5">Informações Pessoais</h2>
                <form onSubmit={handleSaveInfo} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="form-group">
                      <label className="label">Nome Completo</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
                        <input
                          type="text"
                          className="input w-full pl-10"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label">E-mail</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
                        <input
                          type="email"
                          className="input w-full pl-10 opacity-70 cursor-not-allowed"
                          value={email}
                          disabled
                          readOnly
                        />
                      </div>
                      <span className="text-xs text-[var(--color-surface-500)] mt-1 block">
                        O e-mail não pode ser alterado.
                      </span>
                    </div>

                    <div className="form-group">
                      <label className="label">Telefone</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
                        <input
                          type="tel"
                          className="input w-full pl-10"
                          value={telefone}
                          onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end border-t border-[var(--color-surface-800)] mt-6">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div className="card">
                <h2 className="section-titulo mb-5">Segurança da Conta</h2>
                <form onSubmit={handleSaveSecurity} className="space-y-5">
                  
                  <div className="form-group max-w-md">
                    <label className="label">Senha Atual</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
                      <input
                        type="password"
                        className="input w-full pl-10"
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <hr className="divider my-4 max-w-md" />

                  <div className="form-group max-w-md">
                    <label className="label">Nova Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
                      <input
                        type="password"
                        className="input w-full pl-10"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Mínimo de 6 caracteres"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group max-w-md">
                    <label className="label">Confirmar Nova Senha</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
                      <input
                        type="password"
                        className="input w-full pl-10"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="Digite a nova senha novamente"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--color-surface-800)] max-w-md flex justify-end mt-6">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {saving ? "Alterando..." : "Alterar Senha"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === "success" 
            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
            : "bg-red-500/10 text-red-400 border border-red-500/20"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <Shield size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
