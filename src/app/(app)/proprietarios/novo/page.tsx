"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { maskTelefone, maskDocumento } from "@/lib/utils";
import { buscarEnderecoPorCep } from "@/lib/viacep";
import { buscarCadastroPorDocumento, normalizarDocumentoFormulario } from "@/lib/preenchimentoDocumento";

type ProprietarioCriado = {
  id: string;
};

type ErroApi = {
  error?: string;
};

type ProprietarioParaClonar = {
  nomeCompleto?: string | null;
  email?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  tipoPessoa?: string | null;
  cidade?: string | null;
  estado?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cep?: string | null;
  observacoes?: string | null;
  status?: string | null;
};

const formularioInicial = {
  nomeCompleto: "",
  email: "",
  telefone: "",
  whatsapp: "",
  documento: "",
  tipoPessoa: "PESSOA_FISICA",
  cidade: "",
  estado: "",
  endereco: "",
  numero: "",
  bairro: "",
  cep: "",
  observacoes: "",
  status: "ATIVO",
};

type CampoFormularioProprietario = keyof typeof formularioInicial;

function NovoProprietarioConteudo() {
  const roteador = useRouter();
  const parametrosBusca = useSearchParams();
  const cloneId = parametrosBusca.get("cloneId");
  const [salvando, setSalvando] = useState(false);
  const [carregandoClone, setCarregandoClone] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(formularioInicial);

  useEffect(() => {
    if (!cloneId) return;

    const carregarProprietarioParaClonar = async () => {
      setErro("");
      setCarregandoClone(true);

      try {
        const resposta = await fetch(`/api/proprietarios/${cloneId}`);
        if (!resposta.ok) throw new Error("Erro ao carregar proprietário");

        const dados = await resposta.json() as ProprietarioParaClonar & ErroApi;
        if (dados.error) throw new Error(dados.error);

        setForm({
          nomeCompleto: `${dados.nomeCompleto || ""} (Cópia)`,
          email: dados.email || "",
          telefone: dados.telefone || "",
          whatsapp: dados.whatsapp || "",
          documento: "",
          tipoPessoa: dados.tipoPessoa || "PESSOA_FISICA",
          cidade: dados.cidade || "",
          estado: dados.estado || "",
          endereco: dados.endereco || "",
          numero: dados.numero || "",
          bairro: dados.bairro || "",
          cep: dados.cep || "",
          observacoes: dados.observacoes || "",
          status: dados.status === "INATIVO" ? "INATIVO" : "ATIVO",
        });
      } catch (erroCarregar) {
        console.error("Erro ao carregar proprietário para clonagem:", erroCarregar);
        setErro("Não foi possível carregar os dados para clonagem.");
      } finally {
        setCarregandoClone(false);
      }
    };

    void carregarProprietarioParaClonar();
  }, [cloneId]);

  function update(field: CampoFormularioProprietario, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function preencherPorDocumento(documento: string) {
    const documentoNormalizado = normalizarDocumentoFormulario(documento);
    if (![11, 14].includes(documentoNormalizado.length)) return;

    try {
      const cadastro = await buscarCadastroPorDocumento(documento);
      if (!cadastro) return;

      setForm((dadosAtuais) => {
        if (normalizarDocumentoFormulario(dadosAtuais.documento) !== documentoNormalizado) {
          return dadosAtuais;
        }

        return {
          ...dadosAtuais,
          nomeCompleto: cadastro.nome || dadosAtuais.nomeCompleto,
          telefone: cadastro.telefone ? maskTelefone(cadastro.telefone) : dadosAtuais.telefone,
          tipoPessoa: documentoNormalizado.length === 14 ? "PESSOA_JURIDICA" : dadosAtuais.tipoPessoa,
          cidade: cadastro.endereco.cidade || dadosAtuais.cidade,
          estado: cadastro.endereco.estado || dadosAtuais.estado,
          endereco: cadastro.endereco.endereco || dadosAtuais.endereco,
          numero: cadastro.endereco.numero || dadosAtuais.numero,
          bairro: cadastro.endereco.bairro || dadosAtuais.bairro,
          cep: cadastro.endereco.cep || dadosAtuais.cep,
        };
      });
    } catch (erroBuscar) {
      console.error("Erro ao buscar cadastro por documento:", erroBuscar);
    }
  }

  async function handleDocumentoChange(evento: React.ChangeEvent<HTMLInputElement>) {
    const documento = maskDocumento(evento.target.value);
    const documentoNormalizado = normalizarDocumentoFormulario(documento);

    setForm((dadosAtuais) => ({
      ...dadosAtuais,
      documento,
      tipoPessoa: documentoNormalizado.length > 11 ? "PESSOA_JURIDICA" : "PESSOA_FISICA",
    }));

    await preencherPorDocumento(documento);
  }

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
    
    update("cep", v);
    
    if (v.replace(/\D/g, "").length === 8) {
      const data = await buscarEnderecoPorCep(v);
      if (data) {
        setForm((f) => ({
          ...f,
          endereco: data.logradouro || f.endereco,
          bairro: data.bairro || f.bairro,
          cidade: data.localidade || f.cidade,
          estado: data.uf || f.estado,
        }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      const res = await fetch("/api/proprietarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json() as ProprietarioCriado & ErroApi;

      if (!res.ok) {
        setErro(data.error || "Erro ao cadastrar proprietário.");
        return;
      }

      roteador.push(`/proprietarios/${data.id}`);
    } catch (erroSalvar) {
      console.error("Erro ao salvar proprietário:", erroSalvar);
      setErro("Não foi possível salvar o proprietário.");
    } finally {
      setSalvando(false);
    }
  }

  const carregandoFormulario = salvando || carregandoClone;

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/proprietarios" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">
            {cloneId ? "Clonar Proprietário" : "Novo Proprietário"}
          </h1>
          <p className="text-sm text-[var(--color-surface-400)] mt-1">
            {cloneId ? "Revise e edite as informações do proprietário clonado" : "Preencha os dados do proprietário"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Informações Básicas</h2>

          <div className="form-group">
            <label className="label" htmlFor="nomeCompleto">
              {form.tipoPessoa === "PESSOA_JURIDICA" ? "Razão Social *" : "Nome Completo *"}
            </label>
            <input
              id="nomeCompleto"
              type="text"
              className="input"
              placeholder={form.tipoPessoa === "PESSOA_JURIDICA" ? "Ex: Imobiliária Silva Ltda." : "Ex: João da Silva"}
              value={form.nomeCompleto}
              onChange={(e) => update("nomeCompleto", e.target.value)}
              required
            />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="tipoPessoa">Tipo</label>
              <select id="tipoPessoa" className="select" value={form.tipoPessoa} onChange={(e) => update("tipoPessoa", e.target.value)}>
                <option value="PESSOA_FISICA">Pessoa Física</option>
                <option value="PESSOA_JURIDICA">Pessoa Jurídica</option>
              </select>
            </div>
            <div className="form-group md:col-span-2">
              <label className="label" htmlFor="documento">
                {form.tipoPessoa === "PESSOA_JURIDICA" ? "CNPJ" : "CPF"}
              </label>
              <input
                id="documento"
                type="text"
                className="input"
                placeholder={form.tipoPessoa === "PESSOA_JURIDICA" ? "00.000.000/0000-00" : "000.000.000-00"}
                maxLength={18}
                value={form.documento}
                onChange={handleDocumentoChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input" placeholder="joao@email.com"
                value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="telefone">Telefone / WhatsApp</label>
              <input id="telefone" type="text" className="input" placeholder="(00) 00000-0000"
                value={form.telefone} onChange={(e) => update("telefone", maskTelefone(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Endereço</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="cep">CEP</label>
              <input id="cep" type="text" className="input" placeholder="00000-000"
                value={form.cep} onChange={handleCepChange} maxLength={9} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="cidade">Cidade</label>
              <input id="cidade" type="text" className="input" placeholder="São Paulo"
                value={form.cidade} onChange={(e) => update("cidade", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="estado">Estado</label>
              <input id="estado" type="text" className="input" placeholder="SP" maxLength={2}
                value={form.estado} onChange={(e) => update("estado", e.target.value)} />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group md:col-span-2">
              <label className="label" htmlFor="endereco">Endereço</label>
              <input id="endereco" type="text" className="input" placeholder="Ex: Rua das Flores"
                value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="numero">Número</label>
              <input id="numero" type="text" className="input" placeholder="123"
                value={form.numero} onChange={(e) => update("numero", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="bairro">Bairro</label>
            <input id="bairro" type="text" className="input" placeholder="Centro"
              value={form.bairro} onChange={(e) => update("bairro", e.target.value)} />
          </div>
        </div>

        <div className="card mb-5">
          <h2 className="section-titulo mb-4">Informações Adicionais</h2>
          <div className="form-group">
            <label className="label" htmlFor="observacoes">Observações</label>
            <textarea id="observacoes" className="textarea" placeholder="Informações adicionais sobre o proprietário..."
              value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
        </div>

        {erro && (
          <div className="alert alert-error mb-4">
            <span>{erro}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/proprietarios" className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={carregandoFormulario}>
            {carregandoFormulario ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {carregandoClone ? "Carregando..." : salvando ? "Salvando..." : "Salvar Proprietário"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NovoProprietarioPage() {
  return (
    <Suspense fallback={<div className="page"><div className="skeleton h-24 w-full" /></div>}>
      <NovoProprietarioConteudo />
    </Suspense>
  );
}
