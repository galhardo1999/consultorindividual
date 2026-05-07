"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Handshake, Plus, Search, X, Phone, Mail, Filter, Eye, Edit2 } from "lucide-react";
import { STATUS_PARCEIRO_OPCOES, TIPOS_PARCEIRO_OPCOES } from "@/constants/options";
import { formatCurrency, tipoParceiroLabel } from "@/lib/utils";

interface Parceiro {
  id: string;
  nome: string;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  documento: string | null;
  tipo: string;
  status: string;
  comissaoPadraoPercentual: number | null;
  comissaoPadraoValorFixo: number | null;
  observacoes: string | null;
  totais: {
    totalIndicacoes: number;
    totalComissao: number;
    totalComissaoPendente: number;
    totalComissaoRecebida: number;
  };
  _count: {
    indicacoes: number;
  };
}

interface ParceirosResposta {
  parceiros: Parceiro[];
  total: number;
}

const filtrosIniciais = {
  status: "ATIVO",
  tipo: "",
  comIndicacoes: false,
  comComissao: false,
  comissaoPercentualMin: "",
  comissaoPercentualMax: "",
  comissaoValorFixoMin: "",
  comissaoValorFixoMax: "",
};

const percentualComissaoLabel = (parceiro: Parceiro) => {
  if (parceiro.comissaoPadraoPercentual !== null) return `${parceiro.comissaoPadraoPercentual}%`;
  return "Não definida";
};

export default function ParceirosPage() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosIniciais);
  const [filtrosTemporarios, setFiltrosTemporarios] = useState(filtrosIniciais);

  const buscarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const parametros = new URLSearchParams();
      parametros.set("page", String(pagina));
      parametros.set("limit", "20");
      if (busca) parametros.set("search", busca);
      Object.entries(filtrosAplicados).forEach(([chave, valor]) => {
        if (valor !== "" && valor !== false) parametros.set(chave, String(valor));
      });

      const respostaParceiros = await fetch(`/api/parceiros?${parametros}`);

      if (!respostaParceiros.ok) throw new Error("Falha ao buscar parceiros");

      const dadosParceiros = await respostaParceiros.json() as ParceirosResposta;

      setParceiros(dadosParceiros.parceiros ?? []);
      setTotal(dadosParceiros.total ?? 0);
    } catch (erroBusca) {
      console.error("Erro ao buscar parceiros:", erroBusca);
      setParceiros([]);
      setTotal(0);
    } finally {
      setCarregando(false);
    }
  }, [busca, filtrosAplicados, pagina]);

  useEffect(() => {
    const temporizador = setTimeout(buscarDados, 300);
    return () => clearTimeout(temporizador);
  }, [buscarDados]);

  const totalFiltrosAtivos = Object.entries(filtrosAplicados).filter(([campo, valor]) => {
    const campoFiltro = campo as keyof typeof filtrosIniciais;
    return valor !== filtrosIniciais[campoFiltro];
  }).length;
  const possuiFiltros = busca !== "" || totalFiltrosAtivos > 0;

  const abrirFiltros = () => {
    setFiltrosTemporarios(filtrosAplicados);
    setMostrarFiltros(true);
  };

  const aplicarFiltros = () => {
    setFiltrosAplicados(filtrosTemporarios);
    setPagina(1);
    setMostrarFiltros(false);
  };

  const limparTodosFiltros = () => {
    setBusca("");
    setPagina(1);
    setFiltrosAplicados(filtrosIniciais);
    setFiltrosTemporarios(filtrosIniciais);
    setMostrarFiltros(false);
  };

  const atualizarFiltroTemporario = (campo: keyof typeof filtrosIniciais, valor: string | boolean) => {
    setFiltrosTemporarios((dadosAtuais) => ({ ...dadosAtuais, [campo]: valor }));
  };

  const arquivarParceiro = async (parceiroId: string) => {
    if (!confirm("Deseja arquivar este parceiro?")) return;

    try {
      const resposta = await fetch(`/api/parceiros/${parceiroId}`, { method: "DELETE" });
      if (!resposta.ok) throw new Error("Falha ao arquivar parceiro");
      await buscarDados();
    } catch (erroArquivar) {
      console.error("Erro ao arquivar parceiro:", erroArquivar);
    }
  };

  return (
    <div className="page relative">
      <div className="section-header mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">Parceiros</h1>
          <p className="text-sm text-[var(--color-surface-400)] mt-1">
            {total} parceiro{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/parceiros/novo" className="btn btn-primary" id="new-parceiro-btn">
          <Plus size={16} /> <span>Novo Parceiro</span>
        </Link>
      </div>

      <div className="card card-sm mb-5">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
            <input
              type="text"
              className="input w-full !pl-10"
              placeholder="Buscar por nome, telefone, email ou documento..."
              value={busca}
              onChange={(evento) => {
                setBusca(evento.target.value);
                setPagina(1);
              }}
              id="parceiro-search"
            />
          </div>
          <button
            className={`btn ${totalFiltrosAtivos > 0 ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={abrirFiltros}
            id="filter-toggle"
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filtros Avançados</span>
            <span className="sm:hidden">Filtros</span>
            {totalFiltrosAtivos > 0 && (
              <span className="badge bg-white text-black text-[0.7rem] px-1.5 py-0.5 ml-1">
                {totalFiltrosAtivos}
              </span>
            )}
          </button>
          {possuiFiltros && (
            <button className="btn btn-ghost btn-sm text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={limparTodosFiltros}>
              <X size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {carregando ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="card card-sm animate-pulse">
              <div className="h-5 bg-[var(--color-surface-700)] rounded w-2/5 mb-3" />
              <div className="h-3 bg-[var(--color-surface-800)] rounded w-3/5" />
            </div>
          ))}
        </div>
      ) : parceiros.length === 0 ? (
        <div className="card p-10 flex flex-col items-center justify-center text-center border border-dashed border-[var(--color-surface-700)] bg-[var(--color-surface-800)]/50">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-800)] flex items-center justify-center mb-4 text-[var(--color-surface-400)]">
            <Handshake size={32} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-surface-100)] mb-2">
            {possuiFiltros ? "Nenhum parceiro encontrado" : "Nenhum parceiro ainda"}
          </h3>
          <p className="text-[var(--color-surface-400)] mb-6 max-w-md">
            {possuiFiltros
              ? "Sua busca ou filtros não retornaram resultados. Tente remover alguns filtros ou buscar por outros termos."
              : "Cadastre seu primeiro parceiro para acompanhar indicações, regras de comissão e pagamentos."}
          </p>
          {possuiFiltros ? (
            <button className="btn btn-secondary" onClick={limparTodosFiltros}>
              Limpar filtros
            </button>
          ) : (
            <Link href="/parceiros/novo" className="btn btn-primary">
              <Plus size={16} /> Cadastrar primeiro parceiro
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden border border-[var(--color-surface-700)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse hidden md:table">
                <thead>
                  <tr className="border-b border-[var(--color-surface-700)] bg-[var(--color-surface-800)]/80 text-[var(--color-surface-400)] text-sm">
                    <th className="p-4 font-medium">Nome do Parceiro</th>
                    <th className="p-4 font-medium">Contato</th>
                    <th className="p-4 font-medium">Tipo</th>
                    <th className="p-4 font-medium text-center">Indicações</th>
                    <th className="p-4 font-medium">% de Comissão</th>
                    <th className="p-4 font-medium text-right">Comissões Pendentes</th>
                    <th className="p-4 font-medium text-right">Comissões Pagas</th>
                    <th className="p-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-700)]">
                  {parceiros.map((parceiro) => (
                    <tr key={parceiro.id} className="hover:bg-[var(--color-surface-800)] transition-colors group">
                      <td className="p-4">
                        <Link href={`/parceiros/${parceiro.id}`} className="font-medium text-[var(--color-surface-50)] group-hover:text-[var(--color-brand-400)] transition-colors">
                          {parceiro.nome}
                        </Link>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-surface-300)]">
                        <div className="flex flex-col gap-1.5">
                          {parceiro.telefone || parceiro.whatsapp ? (
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-[var(--color-surface-500)]" />
                              {parceiro.whatsapp ?? parceiro.telefone}
                            </div>
                          ) : (
                            <span className="text-[var(--color-surface-600)]">Sem telefone</span>
                          )}
                          {parceiro.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-[var(--color-surface-500)]" />
                              <span className="truncate max-w-[150px] lg:max-w-[200px]" title={parceiro.email}>
                                {parceiro.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="badge bg-[var(--color-surface-700)] text-[var(--color-surface-300)] text-[0.65rem] px-1.5 py-0.5">
                          {tipoParceiroLabel(parceiro.tipo)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface-800)] text-[var(--color-brand-400)] font-medium text-sm border border-[var(--color-surface-700)]" title="Indicações registradas">
                          {parceiro.totais.totalIndicacoes}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-surface-300)]">
                        {percentualComissaoLabel(parceiro)}
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-yellow-400">
                        {formatCurrency(parceiro.totais.totalComissaoPendente)}
                      </td>
                      <td className="p-4 text-right text-sm font-semibold text-green-400">
                        {formatCurrency(parceiro.totais.totalComissaoRecebida)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <Link href={`/parceiros/${parceiro.id}`} className="p-2 text-[var(--color-surface-400)] hover:text-[var(--color-surface-50)] hover:bg-[var(--color-surface-700)] rounded-md transition-colors" title="Ver detalhes">
                            <Eye size={16} />
                          </Link>
                          <Link href={`/parceiros/${parceiro.id}/editar`} className="p-2 text-[var(--color-surface-400)] hover:text-[var(--color-brand-400)] hover:bg-[var(--color-surface-700)] rounded-md transition-colors" title="Editar parceiro">
                            <Edit2 size={16} />
                          </Link>
                          <button
                            className="p-2 text-[var(--color-surface-400)] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                            onClick={() => arquivarParceiro(parceiro.id)}
                            title="Arquivar parceiro"
                            aria-label={`Arquivar ${parceiro.nome}`}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="md:hidden flex flex-col divide-y divide-[var(--color-surface-700)]">
                {parceiros.map((parceiro) => (
                  <Link key={parceiro.id} href={`/parceiros/${parceiro.id}`} className="p-4 hover:bg-[var(--color-surface-800)] transition-colors block group">
                    <div className="mb-4">
                      <h3 className="font-medium text-[var(--color-surface-50)] truncate group-hover:text-[var(--color-brand-400)] transition-colors">
                        {parceiro.nome}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="badge bg-[var(--color-surface-700)] text-[var(--color-surface-300)] text-[0.65rem] px-1.5 py-0.5">
                          {tipoParceiroLabel(parceiro.tipo)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-[var(--color-surface-300)] mb-5">
                      {(parceiro.telefone || parceiro.whatsapp) && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-[var(--color-surface-500)]" />
                          {parceiro.whatsapp ?? parceiro.telefone}
                        </div>
                      )}
                      {parceiro.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-[var(--color-surface-500)]" />
                          <span className="truncate">{parceiro.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[var(--color-surface-900)] p-3 rounded-md border border-[var(--color-surface-700)] flex flex-col items-center justify-center text-center">
                        <div className="text-[0.65rem] text-[var(--color-surface-400)] uppercase tracking-wider mb-1 font-medium">Indicações</div>
                        <div className="font-semibold text-lg text-[var(--color-brand-400)]">{parceiro.totais.totalIndicacoes}</div>
                      </div>
                      <div className="bg-[var(--color-surface-900)] p-3 rounded-md border border-[var(--color-surface-700)] flex flex-col items-center justify-center text-center">
                        <div className="text-[0.65rem] text-[var(--color-surface-400)] uppercase tracking-wider mb-1 font-medium">% Comissão</div>
                        <div className="font-semibold text-lg text-[var(--color-surface-200)]">{percentualComissaoLabel(parceiro)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-[var(--color-surface-900)] p-3 rounded-md border border-[var(--color-surface-700)] flex flex-col items-center justify-center text-center">
                        <div className="text-[0.65rem] text-[var(--color-surface-400)] uppercase tracking-wider mb-1 font-medium">Pendentes</div>
                        <div className="font-semibold text-sm text-yellow-400">{formatCurrency(parceiro.totais.totalComissaoPendente)}</div>
                      </div>
                      <div className="bg-[var(--color-surface-900)] p-3 rounded-md border border-[var(--color-surface-700)] flex flex-col items-center justify-center text-center">
                        <div className="text-[0.65rem] text-[var(--color-surface-400)] uppercase tracking-wider mb-1 font-medium">Recebidas</div>
                        <div className="font-semibold text-sm text-green-400">{formatCurrency(parceiro.totais.totalComissaoRecebida)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {total > 20 && (
            <div className="flex items-center justify-between mt-5 bg-[var(--color-surface-800)] border border-[var(--color-surface-700)] rounded-lg p-3">
              <span className="text-[var(--color-surface-400)] text-sm hidden sm:block">
                Mostrando página {pagina} de {Math.ceil(total / 20)}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagina === 1}
                  onClick={() => setPagina((paginaAtual) => paginaAtual - 1)}
                >
                  Anterior
                </button>
                <span className="text-[var(--color-surface-400)] text-sm sm:hidden">
                  {pagina} / {Math.ceil(total / 20)}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagina >= Math.ceil(total / 20)}
                  onClick={() => setPagina((paginaAtual) => paginaAtual + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mostrarFiltros && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMostrarFiltros(false)} />
          <div className="relative w-full max-w-md h-full bg-[var(--color-surface-900)] border-l border-[var(--color-surface-700)] shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[var(--color-surface-700)] flex items-center justify-between bg-[var(--color-surface-800)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-surface-50)]">Filtros Avançados</h2>
                <p className="text-xs text-[var(--color-surface-400)]">Refine sua busca de parceiros</p>
              </div>
              <button
                onClick={() => setMostrarFiltros(false)}
                className="p-2 hover:bg-[var(--color-surface-700)] rounded-md text-[var(--color-surface-400)] hover:text-[var(--color-surface-50)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider">Status e Tipo</h3>
                <div className="form-row">
                  <div>
                    <label className="label">Status</label>
                    <select
                      className="select w-full"
                      value={filtrosTemporarios.status}
                      onChange={(evento) => atualizarFiltroTemporario("status", evento.target.value)}
                    >
                      <option value="">Todos</option>
                      {STATUS_PARCEIRO_OPCOES.map((opcao) => (
                        <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tipo</label>
                    <select
                      className="select w-full"
                      value={filtrosTemporarios.tipo}
                      onChange={(evento) => atualizarFiltroTemporario("tipo", evento.target.value)}
                    >
                      <option value="">Qualquer</option>
                      {TIPOS_PARCEIRO_OPCOES.map((opcao) => (
                        <option key={opcao.value} value={opcao.value}>{opcao.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Indicações</h3>
                <label className="flex items-center gap-3 p-3 bg-[var(--color-surface-800)] rounded-md cursor-pointer border border-[var(--color-surface-700)] hover:border-[var(--color-surface-600)] transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={filtrosTemporarios.comIndicacoes}
                    onChange={(evento) => atualizarFiltroTemporario("comIndicacoes", evento.target.checked)}
                  />
                  <span className="text-sm font-medium text-[var(--color-surface-100)]">Apenas com indicações registradas</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-[var(--color-surface-800)] rounded-md cursor-pointer border border-[var(--color-surface-700)] hover:border-[var(--color-surface-600)] transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={filtrosTemporarios.comComissao}
                    onChange={(evento) => atualizarFiltroTemporario("comComissao", evento.target.checked)}
                  />
                  <span className="text-sm font-medium text-[var(--color-surface-100)]">Apenas com comissão registrada</span>
                </label>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Comissão Padrão</h3>
                <div>
                  <label className="label">Percentual (%)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      className="input w-full"
                      placeholder="Mínimo"
                      value={filtrosTemporarios.comissaoPercentualMin}
                      onChange={(evento) => atualizarFiltroTemporario("comissaoPercentualMin", evento.target.value)}
                    />
                    <span className="text-[var(--color-surface-500)]">-</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      className="input w-full"
                      placeholder="Máximo"
                      value={filtrosTemporarios.comissaoPercentualMax}
                      onChange={(evento) => atualizarFiltroTemporario("comissaoPercentualMax", evento.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Valor fixo (R$)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      className="input w-full"
                      placeholder="Mínimo"
                      value={filtrosTemporarios.comissaoValorFixoMin}
                      onChange={(evento) => atualizarFiltroTemporario("comissaoValorFixoMin", evento.target.value)}
                    />
                    <span className="text-[var(--color-surface-500)]">-</span>
                    <input
                      type="number"
                      min={0}
                      className="input w-full"
                      placeholder="Máximo"
                      value={filtrosTemporarios.comissaoValorFixoMax}
                      onChange={(evento) => atualizarFiltroTemporario("comissaoValorFixoMax", evento.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="h-6" />
            </div>

            <div className="p-4 border-t border-[var(--color-surface-700)] flex gap-3 bg-[var(--color-surface-800)]">
              <button className="btn btn-ghost flex-1 justify-center text-[var(--color-surface-300)] hover:text-white" onClick={() => setFiltrosTemporarios(filtrosIniciais)}>
                Limpar
              </button>
              <button className="btn btn-primary flex-1 justify-center" onClick={aplicarFiltros}>
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
