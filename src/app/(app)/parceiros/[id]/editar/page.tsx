"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { STATUS_PARCEIRO_OPCOES, TIPOS_PARCEIRO_OPCOES } from "@/constants/options";
import { maskCurrency, maskDocumento, maskTelefone, parseCurrency } from "@/lib/utils";
import { buscarEnderecoPorCep } from "@/lib/viacep";
import { buscarCadastroPorDocumento, normalizarDocumentoFormulario } from "@/lib/preenchimentoDocumento";

interface ParceiroCriado {
  id: string;
}

interface ErroApi {
  error?: string;
}

const formularioInicial = {
  nome: "",
  telefone: "",
  whatsapp: "",
  email: "",
  documento: "",
  cidade: "",
  estado: "",
  endereco: "",
  numero: "",
  bairro: "",
  cep: "",
  tipo: "INDICADOR",
  status: "ATIVO",
  comissaoPadraoPercentual: "",
  comissaoPadraoValorFixo: "",
  observacoes: "",
};

export default function EditarParceiroPage() {
  const roteador = useRouter();
  const parametrosDaUrl = useParams<{ id: string }>();
  const [formulario, setFormulario] = useState(formularioInicial);
  const [carregando, setCarregando] = useState(false);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregarParceiro = async () => {
      try {
        const resposta = await fetch(`/api/parceiros/${parametrosDaUrl.id}`);
        if (!resposta.ok) {
          roteador.push("/parceiros");
          return;
        }
        const dados = await resposta.json();
        setFormulario({
          nome: dados.nome || "",
          telefone: dados.telefone || "",
          whatsapp: dados.whatsapp || "",
          email: dados.email || "",
          documento: dados.documento || "",
          cidade: dados.cidade || "",
          estado: dados.estado || "",
          endereco: dados.endereco || "",
          numero: dados.numero || "",
          bairro: dados.bairro || "",
          cep: dados.cep || "",
          tipo: dados.tipo || "INDICADOR",
          status: dados.status || "ATIVO",
          comissaoPadraoPercentual: dados.comissaoPadraoPercentual !== null ? String(dados.comissaoPadraoPercentual) : "",
          comissaoPadraoValorFixo: dados.comissaoPadraoValorFixo !== null ? String(dados.comissaoPadraoValorFixo) : "",
          observacoes: dados.observacoes || "",
        });
      } catch (erroCarregar) {
        console.error("Erro ao carregar parceiro:", erroCarregar);
        roteador.push("/parceiros");
      } finally {
        setCarregandoInicial(false);
      }
    };

    if (parametrosDaUrl.id) carregarParceiro();
  }, [parametrosDaUrl.id, roteador]);

  const atualizarCampo = (campo: keyof typeof formularioInicial, valor: string) => {
    setFormulario((dadosAtuais) => ({ ...dadosAtuais, [campo]: valor }));
  };

  const preencherPorDocumento = async (documento: string) => {
    const documentoNormalizado = normalizarDocumentoFormulario(documento);
    if (![11, 14].includes(documentoNormalizado.length)) return;

    try {
      const cadastro = await buscarCadastroPorDocumento(documento);
      if (!cadastro) return;

      setFormulario((dadosAtuais) => {
        if (normalizarDocumentoFormulario(dadosAtuais.documento) !== documentoNormalizado) {
          return dadosAtuais;
        }

        return {
          ...dadosAtuais,
          nome: cadastro.nome || dadosAtuais.nome,
          telefone: cadastro.telefone ? maskTelefone(cadastro.telefone) : dadosAtuais.telefone,
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
  };

  const alterarDocumento = async (valor: string) => {
    const documento = maskDocumento(valor);
    atualizarCampo("documento", documento);
    await preencherPorDocumento(documento);
  };

  const alterarCep = async (valor: string) => {
    let cep = valor.replace(/\D/g, "");
    if (cep.length > 8) cep = cep.slice(0, 8);
    if (cep.length > 5) cep = `${cep.slice(0, 5)}-${cep.slice(5)}`;

    atualizarCampo("cep", cep);

    if (cep.replace(/\D/g, "").length === 8) {
      const endereco = await buscarEnderecoPorCep(cep);
      if (endereco) {
        setFormulario((dadosAtuais) => ({
          ...dadosAtuais,
          endereco: endereco.logradouro || dadosAtuais.endereco,
          bairro: endereco.bairro || dadosAtuais.bairro,
          cidade: endereco.localidade || dadosAtuais.cidade,
          estado: endereco.uf || dadosAtuais.estado,
        }));
      }
    }
  };

  const salvarParceiro = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch(`/api/parceiros/${parametrosDaUrl.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formulario.nome,
          telefone: formulario.telefone || null,
          whatsapp: formulario.whatsapp || null,
          email: formulario.email || null,
          documento: formulario.documento || null,
          cidade: formulario.cidade || null,
          estado: formulario.estado || null,
          endereco: formulario.endereco || null,
          numero: formulario.numero || null,
          bairro: formulario.bairro || null,
          cep: formulario.cep || null,
          tipo: formulario.tipo,
          status: formulario.status,
          comissaoPadraoPercentual: formulario.comissaoPadraoPercentual
            ? Number(formulario.comissaoPadraoPercentual)
            : null,
          comissaoPadraoValorFixo: formulario.comissaoPadraoValorFixo
            ? parseCurrency(formulario.comissaoPadraoValorFixo)
            : null,
          observacoes: formulario.observacoes || null,
        }),
      });

      const dados = await resposta.json() as ParceiroCriado & ErroApi;

      if (!resposta.ok) {
        setErro(dados.error || "Erro ao atualizar parceiro.");
        return;
      }

      roteador.push(`/parceiros/${parametrosDaUrl.id}`);
    } catch (erroSalvar) {
      console.error("Erro ao salvar parceiro:", erroSalvar);
      setErro("Não foi possível salvar o parceiro.");
    } finally {
      setCarregando(false);
    }
  };

  if (carregandoInicial) {
    return (
      <div className="page flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[var(--color-brand-500)]" size={32} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/parceiros/${parametrosDaUrl.id}`} className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">Editar Parceiro</h1>
          <p className="text-sm text-[var(--color-surface-400)] mt-1">
            Atualize os dados do parceiro usado em indicações de imóveis
          </p>
        </div>
      </div>

      <form onSubmit={salvarParceiro}>
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Informações Básicas</h2>

          <div className="form-group">
            <label className="label" htmlFor="nome">Nome *</label>
            <input
              id="nome"
              className="input"
              placeholder="Nome do parceiro"
              value={formulario.nome}
              onChange={(evento) => atualizarCampo("nome", evento.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="tipo">Tipo</label>
              <select
                id="tipo"
                className="select"
                value={formulario.tipo}
                onChange={(evento) => atualizarCampo("tipo", evento.target.value)}
              >
                {TIPOS_PARCEIRO_OPCOES.map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="status">Status</label>
              <select
                id="status"
                className="select"
                value={formulario.status}
                onChange={(evento) => atualizarCampo("status", evento.target.value)}
              >
                {STATUS_PARCEIRO_OPCOES.filter((opcao) => opcao.value !== "ARQUIVADO").map((opcao) => (
                  <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="documento">Documento</label>
            <input
              id="documento"
              className="input"
              placeholder="CPF ou CNPJ"
              value={formulario.documento}
              onChange={(evento) => {
                void alterarDocumento(evento.target.value);
              }}
            />
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Contato</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="telefone">Telefone</label>
              <input
                id="telefone"
                type="tel"
                className="input"
                placeholder="(00) 00000-0000"
                value={formulario.telefone}
                onChange={(evento) => atualizarCampo("telefone", maskTelefone(evento.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                type="tel"
                className="input"
                placeholder="(00) 00000-0000"
                value={formulario.whatsapp}
                onChange={(evento) => atualizarCampo("whatsapp", maskTelefone(evento.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="parceiro@email.com"
              value={formulario.email}
              onChange={(evento) => atualizarCampo("email", evento.target.value)}
            />
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Endereço</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="cep">CEP</label>
              <input
                id="cep"
                className="input"
                placeholder="00000-000"
                value={formulario.cep}
                onChange={(evento) => {
                  void alterarCep(evento.target.value);
                }}
                maxLength={9}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="cidade">Cidade</label>
              <input
                id="cidade"
                className="input"
                placeholder="São Paulo"
                value={formulario.cidade}
                onChange={(evento) => atualizarCampo("cidade", evento.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="estado">Estado</label>
              <input
                id="estado"
                className="input"
                placeholder="SP"
                maxLength={2}
                value={formulario.estado}
                onChange={(evento) => atualizarCampo("estado", evento.target.value)}
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group md:col-span-2">
              <label className="label" htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                className="input"
                placeholder="Ex: Rua das Flores"
                value={formulario.endereco}
                onChange={(evento) => atualizarCampo("endereco", evento.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="numero">Número</label>
              <input
                id="numero"
                className="input"
                placeholder="123"
                value={formulario.numero}
                onChange={(evento) => atualizarCampo("numero", evento.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="bairro">Bairro</label>
            <input
              id="bairro"
              className="input"
              placeholder="Centro"
              value={formulario.bairro}
              onChange={(evento) => atualizarCampo("bairro", evento.target.value)}
            />
          </div>
        </div>

        <div className="card mb-5">
          <h2 className="section-titulo mb-4">Comissão e Observações</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="comissaoPadraoPercentual">Comissão padrão (%)</label>
              <input
                id="comissaoPadraoPercentual"
                type="number"
                min={0}
                max={100}
                step="0.1"
                className="input"
                value={formulario.comissaoPadraoPercentual}
                onChange={(evento) => atualizarCampo("comissaoPadraoPercentual", evento.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="comissaoPadraoValorFixo">Comissão fixa padrão</label>
              <input
                id="comissaoPadraoValorFixo"
                className="input"
                placeholder="R$ 0,00"
                value={formulario.comissaoPadraoValorFixo}
                onChange={(evento) => atualizarCampo("comissaoPadraoValorFixo", maskCurrency(evento.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              className="textarea"
              placeholder="Informações adicionais sobre o parceiro..."
              value={formulario.observacoes}
              onChange={(evento) => atualizarCampo("observacoes", evento.target.value)}
            />
          </div>
        </div>

        {erro && (
          <div className="alert alert-error mb-4">
            {erro}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link href={`/parceiros/${parametrosDaUrl.id}`} className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={carregando}>
            {carregando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {carregando ? "Salvando..." : "Salvar Parceiro"}
          </button>
        </div>
      </form>
    </div>
  );
}
