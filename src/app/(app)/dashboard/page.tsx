import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  CalendarClock,
  ChevronRight,
  Clock3,
  Home,
  LineChart,
  MessageSquareText,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  EstagioJornada,
  NivelUrgencia,
  StatusCliente,
  StatusImovel,
} from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  interactionTypeLabel,
  journeyStageColor,
  journeyStageLabel,
  propertyStatusLabel,
  propertyTypeLabel,
} from "@/lib/utils";

type CartaoMetricaProps = {
  rotulo: string;
  valor: string | number;
  descricao: string;
  href: string;
  icone: LucideIcon;
  tom: "brand" | "success" | "warning" | "danger";
};

const estilosMetrica: Record<CartaoMetricaProps["tom"], { fundo: string; texto: string; borda: string }> = {
  brand: {
    fundo: "bg-brand-500/10",
    texto: "text-brand-300",
    borda: "border-brand-500/20",
  },
  success: {
    fundo: "bg-success/10",
    texto: "text-green-300",
    borda: "border-success/20",
  },
  warning: {
    fundo: "bg-warning/10",
    texto: "text-amber-300",
    borda: "border-warning/20",
  },
  danger: {
    fundo: "bg-danger/10",
    texto: "text-red-300",
    borda: "border-danger/20",
  },
};

const CartaoMetrica = ({ rotulo, valor, descricao, href, icone: Icone, tom }: CartaoMetricaProps) => {
  const estilo = estilosMetrica[tom];

  return (
    <Link
      href={href}
      className="group rounded-lg border border-surface-700 bg-surface-800 p-4 transition hover:border-brand-500/60 hover:bg-surface-800/80"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-400">{rotulo}</p>
          <strong className="mt-3 block text-2xl font-bold tracking-normal text-surface-50 md:text-3xl">
            {valor}
          </strong>
          <p className="mt-2 text-sm leading-relaxed text-surface-400">{descricao}</p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${estilo.borda} ${estilo.fundo}`}>
          <Icone size={19} className={estilo.texto} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-300 opacity-0 transition group-hover:opacity-100">
        Abrir visão
        <ArrowUpRight size={13} aria-hidden="true" />
      </div>
    </Link>
  );
};

const CabecalhoSecao = ({
  titulo,
  descricao,
  href,
}: {
  titulo: string;
  descricao?: string;
  href?: string;
}) => (
  <div className="mb-4 flex items-start justify-between gap-4">
    <div>
      <h2 className="text-base font-semibold tracking-normal text-surface-50">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm text-surface-400">{descricao}</p>}
    </div>
    {href && (
      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-surface-300 transition hover:bg-surface-700 hover:text-surface-50"
      >
        Ver todos
        <ChevronRight size={14} aria-hidden="true" />
      </Link>
    )}
  </div>
);

const EstadoVazio = ({ titulo, descricao }: { titulo: string; descricao: string }) => (
  <div className="rounded-lg border border-dashed border-surface-700 bg-surface-900/50 p-6 text-left">
    <Sparkles size={22} className="text-surface-500" aria-hidden="true" />
    <h3 className="mt-3 text-sm font-semibold text-surface-100">{titulo}</h3>
    <p className="mt-1 text-sm leading-relaxed text-surface-400">{descricao}</p>
  </div>
);

const obterValorImovel = (imovel: {
  precoVenda: number | null;
  valorAluguel: number | null;
  valorTemporadaDiaria: number | null;
}) => {
  if (imovel.precoVenda) return formatCurrency(imovel.precoVenda);
  if (imovel.valorAluguel) return `${formatCurrency(imovel.valorAluguel)}/mês`;
  if (imovel.valorTemporadaDiaria) return `${formatCurrency(imovel.valorTemporadaDiaria)}/dia`;
  return "Valor sob consulta";
};

const obterClasseLarguraPercentual = (percentual: number) => {
  if (percentual >= 95) return "w-full";
  if (percentual >= 90) return "w-[90%]";
  if (percentual >= 80) return "w-4/5";
  if (percentual >= 75) return "w-3/4";
  if (percentual >= 66) return "w-2/3";
  if (percentual >= 60) return "w-3/5";
  if (percentual >= 50) return "w-1/2";
  if (percentual >= 40) return "w-2/5";
  if (percentual >= 33) return "w-1/3";
  if (percentual >= 25) return "w-1/4";
  if (percentual >= 20) return "w-1/5";
  if (percentual >= 10) return "w-[10%]";
  if (percentual > 0) return "w-[4%]";
  return "w-0";
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const usuarioId = session.user.id;
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalClientesAtivos,
    totalImoveisAtivos,
    totalLeadsNovos,
    totalFollowUpsPendentes,
    valorCarteira,
    clientesPorEstagio,
    imoveisRecentes,
    atividadesRecentes,
    leadsEmAtencao,
  ] = await Promise.all([
    prisma.cliente.count({
      where: { usuarioId, arquivadoEm: null, status: StatusCliente.ATIVO },
    }),
    prisma.imovel.count({
      where: { usuarioId, arquivadoEm: null, status: { not: StatusImovel.ARQUIVADO } },
    }),
    prisma.cliente.count({
      where: {
        usuarioId,
        arquivadoEm: null,
        criadoEm: { gte: trintaDiasAtras },
      },
    }),
    prisma.interacao.count({
      where: {
        usuarioId,
        proximoFollowUp: { lte: agora, not: null },
      },
    }),
    prisma.imovel.aggregate({
      where: {
        usuarioId,
        arquivadoEm: null,
        status: { in: [StatusImovel.DISPONIVEL, StatusImovel.RESERVADO] },
      },
      _sum: { precoVenda: true },
    }),
    prisma.cliente.groupBy({
      by: ["estagioJornada"],
      where: { usuarioId, arquivadoEm: null },
      _count: { _all: true },
      orderBy: { _count: { estagioJornada: "desc" } },
    }),
    prisma.imovel.findMany({
      where: { usuarioId, arquivadoEm: null },
      orderBy: { criadoEm: "desc" },
      take: 5,
      select: {
        id: true,
        titulo: true,
        tipoImovel: true,
        finalidade: true,
        status: true,
        cidade: true,
        bairro: true,
        precoVenda: true,
        valorAluguel: true,
        valorTemporadaDiaria: true,
        criadoEm: true,
      },
    }),
    prisma.interacao.findMany({
      where: { usuarioId },
      orderBy: { dataInteracao: "desc" },
      take: 6,
      select: {
        id: true,
        tipoInteracao: true,
        titulo: true,
        dataInteracao: true,
        proximoFollowUp: true,
        cliente: { select: { id: true, nomeCompleto: true } },
        imovel: { select: { id: true, titulo: true } },
      },
    }),
    prisma.cliente.findMany({
      where: {
        usuarioId,
        arquivadoEm: null,
        status: StatusCliente.ATIVO,
        OR: [
          { nivelUrgencia: NivelUrgencia.ALTA },
          { estagioJornada: EstagioJornada.NOVO_LEAD, criadoEm: { gte: seteDiasAtras } },
        ],
      },
      orderBy: [{ nivelUrgencia: "asc" }, { atualizadoEm: "desc" }],
      take: 5,
      select: {
        id: true,
        nomeCompleto: true,
        telefone: true,
        estagioJornada: true,
        nivelUrgencia: true,
        atualizadoEm: true,
      },
    }),
  ]);

  const metricas: CartaoMetricaProps[] = [
    {
      rotulo: "Clientes ativos",
      valor: totalClientesAtivos,
      descricao: "Base comercial em acompanhamento",
      href: "/clientes",
      icone: Users,
      tom: "brand",
    },
    {
      rotulo: "Imóveis ativos",
      valor: totalImoveisAtivos,
      descricao: "Carteira disponível ou em negociação",
      href: "/imoveis",
      icone: Building2,
      tom: "success",
    },
    {
      rotulo: "Follow-ups pendentes",
      valor: totalFollowUpsPendentes,
      descricao: "Ações vencidas ou agendadas para agora",
      href: "/interacoes",
      icone: CalendarClock,
      tom: "warning",
    },
    {
      rotulo: "Leads novos",
      valor: totalLeadsNovos,
      descricao: "Entradas registradas nos últimos 30 dias",
      href: "/clientes?estagioJornada=NOVO_LEAD",
      icone: Target,
      tom: "danger",
    },
  ];

  const totalPipeline = clientesPorEstagio.reduce((total, item) => total + item._count._all, 0);

  return (
    <div className="page space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
            <LineChart size={14} aria-hidden="true" />
            Visão geral
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-normal text-surface-50 md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-400">
            Indicadores operacionais, carteira recente e sinais de atenção para priorizar o dia.
          </p>
        </div>

        <div className="rounded-lg border border-surface-700 bg-surface-900 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Carteira em venda</p>
          <strong className="mt-1 block text-xl font-bold text-surface-50">
            {formatCurrency(valorCarteira._sum.precoVenda ?? 0)}
          </strong>
        </div>
      </header>

      <section aria-labelledby="metricas-rapidas">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="metricas-rapidas" className="text-sm font-semibold uppercase tracking-wide text-surface-300">
            Métricas rápidas
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricas.map((metrica) => (
            <CartaoMetrica key={metrica.rotulo} {...metrica} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.75fr)]">
        <section className="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <CabecalhoSecao
            titulo="Últimos imóveis adicionados"
            descricao="Novas oportunidades cadastradas na carteira."
            href="/imoveis"
          />

          {imoveisRecentes.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum imóvel cadastrado"
              descricao="Cadastre imóveis para acompanhar preço, status e origem de oportunidades por aqui."
            />
          ) : (
            <div className="divide-y divide-surface-700 overflow-hidden rounded-lg border border-surface-700">
              {imoveisRecentes.map((imovel) => (
                <Link
                  key={imovel.id}
                  href={`/imoveis/${imovel.id}`}
                  className="group grid gap-3 bg-surface-900 p-4 transition hover:bg-surface-800 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-brand-500/20 bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-300">
                        {propertyTypeLabel(imovel.tipoImovel)}
                      </span>
                      <span className="rounded-md border border-surface-600 bg-surface-800 px-2 py-1 text-xs font-semibold text-surface-300">
                        {propertyStatusLabel(imovel.status)}
                      </span>
                    </div>
                    <h3 className="mt-3 truncate text-sm font-semibold text-surface-50 group-hover:text-brand-300">
                      {imovel.titulo}
                    </h3>
                    <p className="mt-1 text-sm text-surface-400">
                      {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ") || "Localização não informada"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-sm font-bold text-surface-50">{obterValorImovel(imovel)}</p>
                      <p className="mt-1 text-xs text-surface-500">Criado em {formatDate(imovel.criadoEm)}</p>
                    </div>
                    <ChevronRight size={16} className="text-surface-500 group-hover:text-brand-300" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <CabecalhoSecao
            titulo="Atividade recente"
            descricao="Últimos contatos e movimentações comerciais."
            href="/interacoes"
          />

          {atividadesRecentes.length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma atividade registrada"
              descricao="Registre interações para ter uma linha do tempo útil da operação."
            />
          ) : (
            <div className="space-y-3">
              {atividadesRecentes.map((atividade) => (
                <Link
                  key={atividade.id}
                  href={`/clientes/${atividade.cliente.id}`}
                  className="flex gap-3 rounded-lg border border-surface-700 bg-surface-900 p-3 transition hover:border-brand-500/40 hover:bg-surface-800"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                    <MessageSquareText size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-surface-50">{atividade.titulo}</p>
                      <span className="rounded-md bg-surface-800 px-2 py-0.5 text-[11px] font-semibold text-surface-300">
                        {interactionTypeLabel(atividade.tipoInteracao)}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-surface-400">
                      {atividade.cliente.nomeCompleto}
                      {atividade.imovel ? ` · ${atividade.imovel.titulo}` : ""}
                    </p>
                    <p className="mt-2 text-xs text-surface-500">{formatDateTime(atividade.dataInteracao)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(360px,0.75fr)_minmax(0,1.35fr)]">
        <section className="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <CabecalhoSecao
            titulo="Leads em atenção"
            descricao="Clientes urgentes ou leads novos que pedem ação."
            href="/clientes"
          />

          {leadsEmAtencao.length === 0 ? (
            <EstadoVazio
              titulo="Nenhum lead crítico"
              descricao="Quando houver urgência alta ou novo lead recente, ele aparecerá aqui."
            />
          ) : (
            <div className="space-y-3">
              {leadsEmAtencao.map((cliente) => (
                <Link
                  key={cliente.id}
                  href={`/clientes/${cliente.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-surface-700 bg-surface-900 p-3 transition hover:border-brand-500/40 hover:bg-surface-800"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-warning" aria-hidden="true" />
                      <h3 className="truncate text-sm font-semibold text-surface-50">{cliente.nomeCompleto}</h3>
                    </div>
                    <p className="mt-1 text-sm text-surface-400">{cliente.telefone}</p>
                    <p className="mt-2 text-xs text-surface-500">Atualizado em {formatDate(cliente.atualizadoEm)}</p>
                  </div>
                  <span className={`badge ${journeyStageColor(cliente.estagioJornada)} shrink-0`}>
                    {journeyStageLabel(cliente.estagioJornada)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-surface-700 bg-surface-800 p-5">
          <CabecalhoSecao
            titulo="Pipeline por estágio"
            descricao="Distribuição da carteira ativa por fase comercial."
            href="/clientes"
          />

          {clientesPorEstagio.length === 0 ? (
            <EstadoVazio
              titulo="Pipeline vazio"
              descricao="Clientes cadastrados com estágio de jornada preencherão este resumo."
            />
          ) : (
            <div className="space-y-3">
              {clientesPorEstagio.map((estagio) => {
                const percentual = totalPipeline > 0 ? Math.round((estagio._count._all / totalPipeline) * 100) : 0;

                return (
                  <div key={estagio.estagioJornada} className="rounded-lg border border-surface-700 bg-surface-900 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`badge ${journeyStageColor(estagio.estagioJornada)}`}>
                        {journeyStageLabel(estagio.estagioJornada)}
                      </span>
                      <span className="text-sm font-bold text-surface-50">{estagio._count._all}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-700">
                      <div className={`h-full rounded-full bg-brand-500 ${obterClasseLarguraPercentual(percentual)}`} />
                    </div>
                    <p className="mt-2 text-xs text-surface-500">{percentual}% da base monitorada</p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
          <Clock3 size={18} className="text-warning" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-surface-50">Prioridade operacional</p>
          <p className="mt-1 text-sm text-surface-400">
            {totalFollowUpsPendentes > 0
              ? `${totalFollowUpsPendentes} follow-up${totalFollowUpsPendentes > 1 ? "s" : ""} aguardando retorno.`
              : "Nenhum follow-up pendente agora."}
          </p>
        </div>
        <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
          <TrendingUp size={18} className="text-brand-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-surface-50">Captação recente</p>
          <p className="mt-1 text-sm text-surface-400">
            {imoveisRecentes.length > 0
              ? `${imoveisRecentes.length} imóvel${imoveisRecentes.length > 1 ? "is" : ""} nos últimos registros.`
              : "Sem imóveis recentes para exibir."}
          </p>
        </div>
        <div className="rounded-lg border border-surface-700 bg-surface-800 p-4">
          <Home size={18} className="text-green-300" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-surface-50">Carteira disponível</p>
          <p className="mt-1 text-sm text-surface-400">
            {totalImoveisAtivos} imóvel{totalImoveisAtivos === 1 ? "" : "is"} ativo{totalImoveisAtivos === 1 ? "" : "s"} para trabalhar.
          </p>
        </div>
      </section>
    </div>
  );
}
