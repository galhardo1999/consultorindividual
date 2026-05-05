"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Home, Phone, Settings, Edit2, Trash2 } from "lucide-react";
import {
  formatCurrency,
  propertyStatusLabel,
  statusIndicacaoParceiroLabel,
  tipoNegocioIndicacaoLabel,
  tipoParceiroLabel,
} from "@/lib/utils";

interface IndicacaoParceiro {
  id: string;
  tipoNegocio: string;
  status: string;
  comissaoPercentual: number | null;
  comissaoValorFixo: number | null;
  valorNegocioFinal: number | null;
  valorComissaoFinal: number | null;
  imovel: {
    id: string;
    titulo: string;
    cidade: string;
    bairro: string | null;
    status: string;
    precoVenda: number | null;
    valorAluguel: number | null;
    valorTemporadaDiaria: number | null;
    fotos: {
      url: string;
      isCapa: boolean;
    }[];
  };
}

interface ParceiroDetalhe {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  tipo: string;
  comissaoPadraoPercentual: number | null;
  comissaoPadraoValorFixo: number | null;
  observacoes: string | null;
  indicacoes: IndicacaoParceiro[];
}

const CORES_STATUS_INDICACAO: Record<string, string> = {
  EM_ANDAMENTO: "badge-warning",
  CONCLUIDA: "badge-info",
  PAGA: "badge-success",
  CANCELADA: "badge-secondary",
};

const CORES_STATUS_IMOVEL: Record<string, string> = {
  DISPONIVEL: "badge-success",
  RESERVADO: "badge-warning",
  VENDIDO: "badge-danger",
  LOCADO: "badge-info",
  INDISPONIVEL: "badge-secondary",
  ARQUIVADO: "badge-secondary",
};

const obterValorImovel = (indicacao: IndicacaoParceiro) => {
  const { imovel } = indicacao;

  if (indicacao.tipoNegocio === "VENDA" && imovel.precoVenda) return formatCurrency(imovel.precoVenda);
  if (indicacao.tipoNegocio === "LOCACAO" && imovel.valorAluguel) return `${formatCurrency(imovel.valorAluguel)}/mês`;
  if (indicacao.tipoNegocio === "TEMPORADA" && imovel.valorTemporadaDiaria) return `${formatCurrency(imovel.valorTemporadaDiaria)}/dia`;
  if (imovel.precoVenda) return formatCurrency(imovel.precoVenda);
  if (imovel.valorAluguel) return `${formatCurrency(imovel.valorAluguel)}/mês`;
  if (imovel.valorTemporadaDiaria) return `${formatCurrency(imovel.valorTemporadaDiaria)}/dia`;

  return "Sob consulta";
};

export default function ParceiroDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const roteador = useRouter();
  const [parceiro, setParceiro] = useState<ParceiroDetalhe | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);

  const buscarParceiro = useCallback(async () => {
    setCarregando(true);
    try {
      const resposta = await fetch(`/api/parceiros/${id}`);
      if (!resposta.ok) {
        roteador.push("/parceiros");
        return;
      }
      const dados = await resposta.json() as ParceiroDetalhe;
      setParceiro(dados);
    } catch (erro) {
      console.error("Erro ao buscar parceiro:", erro);
      roteador.push("/parceiros");
    } finally {
      setCarregando(false);
    }
  }, [id, roteador]);

  useEffect(() => {
    buscarParceiro();
  }, [buscarParceiro]);

  const marcarComoPaga = async (indicacaoId: string) => {
    const resposta = await fetch(`/api/indicacoes/${indicacaoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAGA" }),
    });

    if (resposta.ok) await buscarParceiro();
  };

  const excluirParceiro = async () => {
    if (!confirm("Deseja realmente excluir este parceiro?")) return;
    try {
      const resposta = await fetch(`/api/parceiros/${id}`, { method: "DELETE" });
      if (!resposta.ok) throw new Error("Erro ao excluir parceiro");
      roteador.push("/parceiros");
    } catch (erro) {
      console.error("Erro:", erro);
      alert("Não foi possível excluir o parceiro.");
    }
  };

  if (carregando) {
    return (
      <div className="page">
        <div className="skeleton h-8 w-56 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card lg:col-span-1 h-64" />
          <div className="card lg:col-span-2 h-64" />
        </div>
      </div>
    );
  }

  if (!parceiro) return null;

  const totalComissao = parceiro.indicacoes.reduce(
    (totalAtual, indicacao) => totalAtual + (indicacao.valorComissaoFinal ?? 0),
    0
  );
  const totalPendente = parceiro.indicacoes
    .filter((indicacao) => indicacao.status === "CONCLUIDA")
    .reduce((totalAtual, indicacao) => totalAtual + (indicacao.valorComissaoFinal ?? 0), 0);

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/parceiros" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">{parceiro.nome}</h1>
            <p className="text-sm text-[var(--color-surface-400)]">{tipoParceiroLabel(parceiro.tipo)}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] transition-colors shadow-lg shadow-[var(--color-brand-500)]/20"
          >
            <Settings size={16} />
            Opções
          </button>
          
          {menuAberto && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setMenuAberto(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface-800)] border border-[var(--color-surface-700)] rounded-xl shadow-xl z-50 py-2">
                <Link 
                  href={`/parceiros/${id}/editar`} 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-surface-200)] hover:text-white hover:bg-[var(--color-surface-700)] transition-colors"
                >
                  <Edit2 size={16} />
                  Editar Parceiro
                </Link>
                <button 
                  onClick={excluirParceiro} 
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors text-left"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-lg font-bold text-[var(--color-surface-50)] mb-4">Dados do parceiro</h2>
            <div className="space-y-3 text-sm text-[var(--color-surface-300)]">
              {parceiro.telefone && <div className="flex items-center gap-2"><Phone size={16} /> {parceiro.telefone}</div>}
              {parceiro.email && <div>{parceiro.email}</div>}
              <div>
                Regra padrão:{" "}
                <span className="font-semibold text-[var(--color-surface-100)]">
                  {parceiro.comissaoPadraoValorFixo
                    ? formatCurrency(parceiro.comissaoPadraoValorFixo)
                    : parceiro.comissaoPadraoPercentual
                      ? `${parceiro.comissaoPadraoPercentual}%`
                      : "não definida"}
                </span>
              </div>
              {parceiro.observacoes && <p className="text-[var(--color-surface-400)]">{parceiro.observacoes}</p>}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-[var(--color-surface-50)] mb-4">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-surface-400)]">Indicações</span>
                <span className="text-[var(--color-surface-50)] font-semibold">{parceiro.indicacoes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-surface-400)]">Comissão total</span>
                <span className="text-[var(--color-surface-50)] font-semibold">{formatCurrency(totalComissao)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-surface-400)]">Pendente</span>
                <span className="text-[var(--color-surface-50)] font-semibold">{formatCurrency(totalPendente)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[var(--color-surface-50)]">Indicações</h2>
              <span className="badge badge-secondary">{parceiro.indicacoes.length}</span>
            </div>

            {parceiro.indicacoes.length === 0 ? (
              <div className="empty-state">
                <Home size={42} />
                <p>Nenhum imóvel vinculado a este parceiro.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {parceiro.indicacoes.map((indicacao) => (
                  <div key={indicacao.id} className="rounded-lg border border-[var(--color-surface-800)] bg-[var(--color-surface-900)] p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href={`/imoveis/${indicacao.imovel.id}`} className="relative h-36 w-full sm:h-28 sm:w-40 flex-shrink-0 overflow-hidden rounded-md bg-[var(--color-surface-800)]">
                        {indicacao.imovel.fotos.length > 0 ? (
                          <Image
                            src={indicacao.imovel.fotos[0].url}
                            alt={indicacao.imovel.titulo}
                            fill
                            sizes="(max-width: 640px) 100vw, 160px"
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--color-surface-600)]">
                            <Home size={32} />
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link href={`/imoveis/${indicacao.imovel.id}`} className="font-semibold text-[var(--color-surface-50)] hover:text-[var(--color-brand-400)]">
                              {indicacao.imovel.titulo}
                            </Link>
                            <div className="text-sm text-[var(--color-surface-400)] mt-1">
                              {indicacao.imovel.bairro ? `${indicacao.imovel.bairro}, ` : ""}{indicacao.imovel.cidade} · {tipoNegocioIndicacaoLabel(indicacao.tipoNegocio)}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            <span className={`badge ${CORES_STATUS_IMOVEL[indicacao.imovel.status] || "badge-secondary"}`}>
                              {propertyStatusLabel(indicacao.imovel.status)}
                            </span>
                            <span className={`badge ${CORES_STATUS_INDICACAO[indicacao.status] || "badge-secondary"}`}>
                              {statusIndicacaoParceiroLabel(indicacao.status)}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                          <div>
                            <div className="text-[var(--color-surface-500)]">Valor do imóvel</div>
                            <div className="font-semibold text-[var(--color-surface-100)]">
                              {obterValorImovel(indicacao)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[var(--color-surface-500)]">Regra</div>
                            <div className="font-semibold text-[var(--color-surface-100)]">
                              {indicacao.comissaoValorFixo
                                ? formatCurrency(indicacao.comissaoValorFixo)
                                : indicacao.comissaoPercentual
                                  ? `${indicacao.comissaoPercentual}%`
                                  : "Não definida"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[var(--color-surface-500)]">Comissão</div>
                            <div className="font-semibold text-[var(--color-surface-100)]">
                              {indicacao.valorComissaoFinal ? formatCurrency(indicacao.valorComissaoFinal) : "Pendente"}
                            </div>
                          </div>
                        </div>

                        {indicacao.status === "CONCLUIDA" && (
                          <button className="btn btn-primary btn-sm mt-4" onClick={() => marcarComoPaga(indicacao.id)}>
                            <Check size={14} /> Marcar como paga
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
