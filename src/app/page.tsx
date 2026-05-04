import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  Users,
  LineChart,
  LayoutDashboard,
  Smartphone,
  Zap,
  UserPlus,
  Key,
  Star,
  Quote,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  MessageSquare
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function PaginaInicial() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-950)] text-[var(--color-surface-50)] font-sans selection:bg-[var(--color-brand-500)]/30 selection:text-white overflow-hidden">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 0.5; transform: scale(1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
        }
      `}</style>

      <Cabecalho />

      <main>
        <SecaoHero />
        <SecaoProblema />
        <SecaoFuncionalidades />
        <SecaoComparacao />
        <SecaoProvaSocial />
        <SecaoChamadaParaAcao />
      </main>

      <Rodape />
    </div>
  );
}

function Cabecalho() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[var(--color-surface-950)]/70 backdrop-blur-xl border-b border-[var(--color-surface-800)]/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-300)] via-[var(--color-brand-500)] to-[var(--color-brand-400)] flex items-center justify-center shadow-lg shadow-[var(--color-brand-500)]/20">
            <Home className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[var(--color-surface-50)]">Prime Realty</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-surface-300)]">
          <a href="#problema" className="hover:text-[var(--color-surface-50)] transition-colors">O Desafio</a>
          <a href="#funcionalidades" className="hover:text-[var(--color-surface-50)] transition-colors">Funcionalidades</a>
          <a href="#comparacao" className="hover:text-[var(--color-surface-50)] transition-colors">Por que Nós?</a>
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium text-[var(--color-surface-300)] hover:text-[var(--color-surface-50)] transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-sm font-bold bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-200)] text-[var(--color-surface-950)] px-5 py-2.5 rounded-lg transition-all flex items-center gap-2"
          >
            Testar Grátis
          </Link>
        </div>
      </div>
    </header>
  );
}

function SecaoHero() {
  return (
    <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Spotlight / Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[var(--color-brand-500)]/20 to-transparent blur-[100px] pointer-events-none rounded-full opacity-70 animate-pulse-glow" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-900)] border border-[var(--color-surface-800)] text-[var(--color-surface-300)] text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-[var(--color-success)]"></span>
          <span>Feito para corretores autônomos que precisam de controle total</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-5xl mx-auto leading-[1.1] text-[var(--color-surface-50)]">
          Pare de perder vendas por <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-300)] via-[var(--color-brand-500)] to-[var(--color-brand-400)]">desorganização.</span>
        </h1>

        <p className="text-lg md:text-2xl text-[var(--color-surface-300)] max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          Gerencie seus imóveis, clientes e negociações em um só lugar. Sem depender de planilhas confusas ou CRMs genéricos e difíceis de usar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto text-lg font-bold bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-8 py-4 rounded-xl transition-all shadow-[0_0_40px_rgba(100,112,243,0.4)] hover:shadow-[0_0_60px_rgba(100,112,243,0.6)] flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
              Começar teste grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <span className="text-xs text-[var(--color-surface-400)] font-medium">Sem cartão de crédito • Cancele quando quiser</span>
          </div>
          <a
            href="#funcionalidades"
            className="w-full sm:w-auto text-lg font-bold bg-[var(--color-surface-900)] hover:bg-[var(--color-surface-800)] border border-[var(--color-surface-700)] text-[var(--color-surface-50)] px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-6 sm:mb-0"
          >
            Ver como funciona
          </a>
        </div>

        {/* Mockup do Produto Realista */}
        <div className="relative mx-auto max-w-6xl rounded-2xl border border-[var(--color-surface-700)] bg-[var(--color-surface-950)] shadow-2xl overflow-hidden ring-1 ring-white/5 animate-float group">
          {/* Mockup Header */}
          <div className="h-10 bg-[var(--color-surface-900)] border-b border-[var(--color-surface-800)] flex items-center px-4 gap-4 justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-danger)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--color-warning)]" />
              <div className="w-3 h-3 rounded-full bg-[var(--color-success)]" />
            </div>
            <div className="h-4 w-64 bg-[var(--color-surface-800)] rounded flex items-center justify-center px-2">
              <div className="w-40 h-2 bg-[var(--color-surface-700)] rounded-full"></div>
            </div>
            <div className="w-16"></div>
          </div>

          <div className="flex h-[500px]">
            {/* Sidebar Mockup */}
            <div className="w-48 bg-[var(--color-surface-900)] border-r border-[var(--color-surface-800)] p-4 flex flex-col gap-4 hidden md:flex">
              <div className="h-6 w-24 bg-[var(--color-brand-500)]/20 rounded mb-4" />
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 rounded flex items-center gap-3 px-2">
                  <div className="w-4 h-4 rounded-full bg-[var(--color-surface-700)]" />
                  <div className="h-2 w-16 bg-[var(--color-surface-800)] rounded" />
                </div>
              ))}
            </div>

            {/* Main Content Mockup */}
            <div className="flex-1 bg-[var(--color-surface-950)] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-6 w-48 bg-[var(--color-surface-100)] rounded mb-2" />
                  <div className="h-3 w-32 bg-[var(--color-surface-400)] rounded" />
                </div>
                <div className="h-10 w-32 bg-[var(--color-brand-500)] rounded-lg shadow-lg shadow-[var(--color-brand-500)]/30" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { color: 'var(--color-brand-500)' },
                  { color: 'var(--color-success)' },
                  { color: 'var(--color-warning)' },
                  { color: 'var(--color-info)' }
                ].map((item, i) => (
                  <div key={i} className="h-24 bg-[var(--color-surface-900)] border border-[var(--color-surface-800)] rounded-xl p-4 flex flex-col justify-between">
                    <div className="h-8 w-8 rounded-full bg-[var(--color-surface-800)] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    </div>
                    <div className="h-3 w-16 bg-[var(--color-surface-700)] rounded" />
                  </div>
                ))}
              </div>

              {/* Pipeline/List */}
              <div className="flex-1 bg-[var(--color-surface-900)] border border-[var(--color-surface-800)] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex gap-4 border-b border-[var(--color-surface-800)] pb-3">
                  <div className="h-3 w-20 bg-[var(--color-surface-700)] rounded" />
                  <div className="h-3 w-32 bg-[var(--color-surface-700)] rounded" />
                  <div className="h-3 w-24 bg-[var(--color-surface-700)] rounded" />
                </div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-[var(--color-surface-950)] border border-[var(--color-surface-800)] rounded-lg flex items-center px-4 gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-800)]" />
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-3 w-40 bg-[var(--color-surface-100)] rounded" />
                      <div className="h-2 w-24 bg-[var(--color-surface-400)] rounded" />
                    </div>
                    <div className="h-6 w-20 bg-[var(--color-success)]/20 rounded-full" />
                  </div>
                ))}
              </div>

              {/* Blur Overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-surface-950)] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function SecaoProblema() {
  const problemas = [
    {
      icone: <AlertCircle className="w-6 h-6 text-[var(--color-danger)]" />,
      titulo: "Perder cliente por falta de follow-up"
    },
    {
      icone: <MessageSquare className="w-6 h-6 text-[var(--color-warning)]" />,
      titulo: "Informações perdidas e espalhadas no WhatsApp"
    },
    {
      icone: <Home className="w-6 h-6 text-[var(--color-info)]" />,
      titulo: "Esquecer quais imóveis já foram apresentados"
    },
    {
      icone: <LineChart className="w-6 h-6 text-[var(--color-surface-400)]" />,
      titulo: "Falta de controle real do seu funil de vendas"
    }
  ];

  return (
    <section id="problema" className="py-24 bg-[var(--color-surface-900)] border-y border-[var(--color-surface-800)] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[var(--color-surface-50)]">
            Se você é corretor autônomo, provavelmente já passou por isso:
          </h2>
          <p className="text-[var(--color-surface-300)] text-lg">
            A rotina é intensa e a sua memória não é um banco de dados. Tentar gerenciar dezenas de clientes de alto padrão em cadernos ou planilhas custa muito caro.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemas.map((prob, i) => (
            <div key={i} className="bg-[var(--color-surface-950)] border border-[var(--color-surface-800)] rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-[var(--color-danger)]/50 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-800)] flex items-center justify-center">
                {prob.icone}
              </div>
              <h3 className="font-semibold text-[var(--color-surface-100)]">{prob.titulo}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecaoFuncionalidades() {
  return (
    <section id="funcionalidades" className="py-32 bg-[var(--color-surface-950)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-surface-50)]">Tudo que você precisa. Zero enrolação.</h2>
          <p className="text-[var(--color-surface-300)] text-lg max-w-2xl mx-auto">
            Design focado na produtividade. Sem cliques desnecessários.
          </p>
        </div>

        {/* Feature Principal Destaque */}
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-[var(--color-surface-900)] to-[var(--color-surface-950)] border border-[var(--color-brand-500)]/30 p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--color-brand-500)]/5 blur-[120px] pointer-events-none" />
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-500)]/20 text-[var(--color-brand-300)] text-sm font-bold mb-6">
                <Zap className="w-4 h-4" /> Feature Exclusiva
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--color-surface-50)]">Match inteligente entre cliente e imóvel</h3>
              <p className="text-lg text-[var(--color-surface-300)] mb-8 leading-relaxed">
                Nós cruzamos automaticamente o perfil e o budget do seu cliente com o seu catálogo de imóveis. Saiba exatamente o que oferecer antes mesmo de pegar o telefone.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-[var(--color-surface-100)] font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)]" /> Histórico do que já foi visitado
                </li>
                <li className="flex items-center gap-3 text-[var(--color-surface-100)] font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)]" /> Registro de motivos de rejeição
                </li>
                <li className="flex items-center gap-3 text-[var(--color-surface-100)] font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)]" /> Filtros por prioridade e urgência
                </li>
              </ul>
            </div>

            {/* Visual Representation of Match */}
            <div className="relative">
              <div className="bg-[var(--color-surface-950)] border border-[var(--color-surface-800)] rounded-xl p-6 shadow-2xl relative z-20">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-surface-800)] flex items-center justify-center">
                      <Users className="w-6 h-6 text-[var(--color-surface-300)]" />
                    </div>
                    <div>
                      <div className="font-bold">Perfil: Investidor</div>
                      <div className="text-sm text-[var(--color-surface-400)]">Budget: R$ 1.5M</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center py-4">
                  <div className="h-12 w-0 border-l-2 border-dashed border-[var(--color-brand-500)]"></div>
                </div>
                <div className="bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30 rounded-lg p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-[var(--color-surface-800)] rounded-md flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-[var(--color-brand-500)]" />
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-brand-300)]">Match 95%</div>
                    <div className="text-sm font-medium">Apartamento Alto Padrão - Centro</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outras Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-[var(--color-surface-900)] border border-[var(--color-surface-800)] hover:bg-[var(--color-surface-800)] transition-colors">
            <LayoutDashboard className="w-10 h-10 text-[var(--color-surface-50)] mb-6" />
            <h3 className="text-xl font-bold mb-3 text-[var(--color-surface-50)]">Funil de Vendas Visual</h3>
            <p className="text-[var(--color-surface-300)]">Controle total da jornada. Saiba exatamente em qual etapa de negociação cada lead se encontra no momento.</p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--color-surface-900)] border border-[var(--color-surface-800)] hover:bg-[var(--color-surface-800)] transition-colors">
            <Key className="w-10 h-10 text-[var(--color-surface-50)] mb-6" />
            <h3 className="text-xl font-bold mb-3 text-[var(--color-surface-50)]">Gestão de Proprietários</h3>
            <p className="text-[var(--color-surface-300)]">Separe vendedores de compradores. Facilite o contato para renovação de captações e renegociação de preços.</p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--color-surface-900)] border border-[var(--color-surface-800)] hover:bg-[var(--color-surface-800)] transition-colors">
            <Calendar className="w-10 h-10 text-[var(--color-surface-50)] mb-6" />
            <h3 className="text-xl font-bold mb-3 text-[var(--color-surface-50)]">Histórico Impecável</h3>
            <p className="text-[var(--color-surface-300)]">Log completo de interações: ligações, mensagens e visitas. Nunca mais pergunte duas vezes a mesma coisa.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecaoComparacao() {
  return (
    <section id="comparacao" className="py-32 bg-[var(--color-surface-900)] border-y border-[var(--color-surface-800)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-surface-50)]">Não é só mais um CRM genérico</h2>
          <p className="text-[var(--color-surface-300)] text-lg max-w-2xl mx-auto">
            Sistemas tradicionais são feitos para grandes imobiliárias gerenciarem corretores. Nós fizemos o Prime Realty para o **corretor** gerenciar seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Planilhas */}
          <div className="bg-[var(--color-surface-950)] border border-[var(--color-surface-800)] rounded-3xl p-8 flex flex-col opacity-60">
            <h3 className="text-xl font-bold mb-6 text-[var(--color-surface-300)] flex justify-between items-center">
              Planilhas
              <XCircle className="w-6 h-6 text-[var(--color-danger)]" />
            </h3>
            <ul className="space-y-4 text-[var(--color-surface-400)] font-medium">
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Difícil de usar no celular</li>
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Sem alertas de follow-up</li>
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Anexar fotos é impossível</li>
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Zero inteligência de dados</li>
            </ul>
          </div>

          {/* CRMs Genéricos */}
          <div className="bg-[var(--color-surface-950)] border border-[var(--color-surface-800)] rounded-3xl p-8 flex flex-col opacity-60">
            <h3 className="text-xl font-bold mb-6 text-[var(--color-surface-300)] flex justify-between items-center">
              CRMs Tradicionais
              <XCircle className="w-6 h-6 text-[var(--color-danger)]" />
            </h3>
            <ul className="space-y-4 text-[var(--color-surface-400)] font-medium">
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Feito para times, não autônomos</li>
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Interface confusa e lenta</li>
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Muito caro (cobra por módulo)</li>
              <li className="flex items-center gap-3"><XCircle className="w-5 h-5 text-[var(--color-danger)]/50" /> Curva de aprendizado enorme</li>
            </ul>
          </div>

          {/* Prime Realty */}
          <div className="bg-[var(--color-surface-950)] border-2 border-[var(--color-brand-500)] rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(100,112,243,0.15)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-brand-500)] text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full">
              A Escolha Certa
            </div>
            <h3 className="text-xl font-bold mb-6 text-[var(--color-surface-50)] flex justify-between items-center">
              Prime Realty CRM
              <CheckCircle2 className="w-6 h-6 text-[var(--color-success)]" />
            </h3>
            <ul className="space-y-4 text-[var(--color-surface-100)] font-medium">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)]" /> Desenhado 100% para autônomos</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)]" /> Mobile-first: perfeito no celular</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)]" /> Matchmaker inteligente embutido</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)]" /> Interface limpa, premium e veloz</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecaoProvaSocial() {
  const depoimentos = [
    {
      texto: "Desde que comecei a usar o Prime Realty, não deixo mais dinheiro na mesa. A facilidade de puxar o celular na frente do cliente e fazer um 'match' com os meus imóveis me ajudou a fechar 2 vendas só no último mês que eu teria perdido por falta de organização.",
      autor: "Roberto Almeida",
      cidade: "São Paulo, SP",
      foto: "https://i.pravatar.cc/150?img=11",
      estrelas: 5
    },
    {
      texto: "Finalmente um CRM que não parece um painel de avião dos anos 90. A interface é linda, o sistema é ultra-rápido e resolve exatamente a minha dor: ter tudo centralizado num lugar só. Mudou o nível do meu negócio.",
      autor: "Mariana Costa",
      cidade: "Balneário Camboriú, SC",
      foto: "https://i.pravatar.cc/150?img=5",
      estrelas: 5
    }
  ];

  return (
    <section className="py-32 bg-[var(--color-surface-950)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[var(--color-surface-50)]">Eles já estão no próximo nível</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {depoimentos.map((depoimento, idx) => (
            <div key={idx} className="p-8 md:p-10 rounded-3xl bg-[var(--color-surface-900)] border border-[var(--color-surface-800)] relative hover:border-[var(--color-surface-700)] transition-colors">
              <Quote className="w-12 h-12 text-[var(--color-brand-500)]/20 absolute top-8 right-8" />
              <div className="flex gap-1 mb-8">
                {[...Array(depoimento.estrelas)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[var(--color-warning)] text-[var(--color-warning)]" />
                ))}
              </div>
              <p className="text-xl text-[var(--color-surface-50)] mb-10 leading-relaxed font-medium">
                "{depoimento.texto}"
              </p>
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={depoimento.foto}
                  alt={depoimento.autor}
                  className="w-14 h-14 rounded-full border-2 border-[var(--color-surface-800)]"
                />
                <div>
                  <h4 className="font-bold text-lg text-[var(--color-surface-50)]">{depoimento.autor}</h4>
                  <p className="text-sm text-[var(--color-surface-400)] font-medium">Corretor Autônomo • {depoimento.cidade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecaoChamadaParaAcao() {
  return (
    <section className="py-32 relative overflow-hidden bg-[var(--color-surface-950)] border-t border-[var(--color-surface-800)]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--color-brand-500)]/20 rounded-[100%] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-8 text-[var(--color-surface-50)] leading-tight">
          Quanto negócio você já perdeu por falta de organização?
        </h2>
        <p className="text-xl text-[var(--color-surface-300)] mb-12 max-w-2xl mx-auto font-medium">
          Profissionais de alto ticket não confiam a memória a cadernos. O mercado mudou. Você vem junto?
        </p>
        <div className="flex flex-col items-center justify-center gap-4">
          <Link
            href="/cadastro"
            className="inline-flex font-bold text-xl bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-12 py-6 rounded-2xl transition-all shadow-[0_0_40px_rgba(100,112,243,0.3)] hover:shadow-[0_0_60px_rgba(100,112,243,0.5)] items-center gap-3 transform hover:-translate-y-1"
          >
            Começar grátis agora <ArrowRight className="w-6 h-6" />
          </Link>
          <span className="text-[var(--color-surface-400)] font-medium mt-2">Leva menos de 2 minutos. Sem cartão de crédito.</span>
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="bg-[var(--color-surface-950)] border-t border-[var(--color-surface-800)] pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-300)] via-[var(--color-brand-500)] to-[var(--color-brand-400)] flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-[var(--color-surface-50)] tracking-tight">Prime Realty</span>
            </div>
            <p className="text-[var(--color-surface-400)] leading-relaxed max-w-sm font-medium">
              A plataforma definitiva, premium e indispensável para consultores imobiliários de alta performance gerenciarem seus negócios.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[var(--color-surface-50)] mb-6 uppercase tracking-wider text-sm">Produto</h4>
            <ul className="space-y-4 font-medium">
              <li><a href="#funcionalidades" className="text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)] transition-colors">Funcionalidades</a></li>
              <li><a href="#comparacao" className="text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)] transition-colors">Comparação</a></li>
              <li><Link href="/cadastro" className="text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)] transition-colors">Criar Conta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[var(--color-surface-50)] mb-6 uppercase tracking-wider text-sm">Legal & Suporte</h4>
            <ul className="space-y-4 font-medium">
              <li><Link href="/contato" className="text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)] transition-colors">Fale Conosco</Link></li>
              <li><Link href="/termos" className="text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)] transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="text-[var(--color-surface-400)] hover:text-[var(--color-brand-500)] transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--color-surface-800)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-surface-400)] font-medium">
          <p>© {new Date().getFullYear()} Prime Realty CRM. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">Feito com foco no <Star className="w-4 h-4 fill-[var(--color-brand-500)] text-[var(--color-brand-500)]" /> corretor autônomo.</p>
        </div>
      </div>
    </footer>
  );
}
