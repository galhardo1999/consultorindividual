"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, User, Mail, Phone, Lock, Shield, CheckCircle2, Camera } from "lucide-react";
import { maskTelefone } from "@/lib/utils";
import { getPerfil, atualizarPerfil, alterarSenha, atualizarAvatarUrl } from "./actions";

export default function ConfiguracoesPage() {
  const { update: updateSession } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isOAuthOnly, setIsOAuthOnly] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        setAvatarUrl(res.usuario.avatarUrl || null);
        setIsOAuthOnly(!!res.isOAuthOnly);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const enviarAvatar = async (arquivo: File) => {
    const formulario = new FormData();
    formulario.append("arquivo", arquivo);
    formulario.append("pasta", "avatars");

    const resposta = await fetch("/api/storage/imagens", {
      method: "POST",
      body: formulario,
    });

    const dados = (await resposta.json()) as { url?: string; error?: string };
    if (!resposta.ok || !dados.url) {
      throw new Error(dados.error || "Erro ao enviar imagem");
    }

    return dados.url;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Por favor, selecione uma imagem", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("A imagem deve ter no máximo 5MB", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const newUrl = await enviarAvatar(file);
      setAvatarUrl(newUrl);
      
      const res = await atualizarAvatarUrl(newUrl);
      if (res.success) {
        showToast("Foto atualizada com sucesso", "success");
        updateSession({ image: newUrl });
      } else {
        throw new Error(res.error || "Erro ao salvar no banco");
      }
    } catch (erro) {
      console.error(erro);
      showToast("Erro ao fazer upload da foto", "error");
    } finally {
      setUploadingAvatar(false);
      // Reset input value to allow uploading the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      showToast("Configurações atualizadas com sucesso", "success");
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
        <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">Configurações</h1>
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
              <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 bg-[var(--color-surface-700)] text-[var(--color-surface-200)] font-bold text-2xl rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface-800)] hover:border-[var(--color-brand-500)] transition-colors">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "U"
                  )}
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingAvatar ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
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
                          className="input w-full !pl-10"
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
                          className="input w-full !pl-10 opacity-70 cursor-not-allowed"
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
                          className="input w-full !pl-10"
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
                {isOAuthOnly ? (
                  <div className="p-6 bg-[var(--color-surface-800)] border border-[var(--color-surface-700)] rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[var(--color-surface-700)] rounded-full flex items-center justify-center mb-4 text-[var(--color-surface-300)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-[var(--color-surface-50)] mb-2">Login com Google</h3>
                    <p className="text-[var(--color-surface-400)] text-sm max-w-md">
                      Você acessa sua conta usando o login do Google. Para alterar sua senha ou gerenciar os métodos de acesso, acesse as configurações de segurança da sua conta Google.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSecurity} className="space-y-5">
                  
                  <div className="form-group max-w-md">
                    <label className="label">Senha Atual</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
                      <input
                        type="password"
                        className="input w-full !pl-10"
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
                        className="input w-full !pl-10"
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
                        className="input w-full !pl-10"
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
                )}
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
