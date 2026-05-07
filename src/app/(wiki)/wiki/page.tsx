import { IndiceWiki } from "@/components/wiki/IndiceWiki";
import Link from "next/link";

export default function WikiPage() {
  return (
    <div className="flex-1 flex overflow-hidden h-full">
      {/* Área central do artigo */}
      <article className="flex-1 overflow-y-auto px-8 py-10 lg:px-16 custom-scrollbar scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-12 pb-20">
          
          <header className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Clientes Beta IXC Soft</h1>
          </header>

          <section id="introducao" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight border-b border-border pb-2 text-foreground">Introdução</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Bem-vindos ao programa de <strong className="font-semibold text-foreground">clientes beta</strong> da IXC Soft! 
              Neste documento, você encontrará todas as informações necessárias sobre o processo de testes e 
              contribuição para o desenvolvimento de uma solução ainda mais completa e eficiente em nosso software.
            </p>
          </section>

          <section id="versionamento" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight border-b border-border pb-2 text-foreground">Versionamento</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              A abordagem de versionamento foi adotada a partir da necessidade de reestruturação de métodos de entrega 
              de ajustes, correções, melhorias e projetos no sistema.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              Anteriormente, as entregas eram lançadas continuamente todos os dias. Neste tipo de abordagem, havia 
              uma vantagem: a agilidade de entrega, mas por outro lado, observou-se que a manutenção de qualidade 
              muitas vezes ficava comprometida, à medida que a empresa crescia e muitos desenvolvedores trabalhavam 
              na mesma base de código, eram gerados conflitos e inconsistências no sistema. Após a identificação do 
              problema, a solução encontrada foi o <strong className="font-semibold text-foreground">versionamento</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              No método de versionamento, são lançadas duas versões distintas, que visam maior tempo e cobertura de 
              testes, tornando as versões cada vez mais estáveis: versões <strong className="font-semibold text-foreground">Beta</strong> e <strong className="font-semibold text-foreground">Estável</strong>.
            </p>
          </section>

          <section id="metodologia" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight border-b border-border pb-2 text-foreground">Metodologia: Beta e Estável</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Na nova abordagem, existe a distinção das versões lançadas, categorizadas em versões do tipo <strong className="font-semibold text-foreground">Beta</strong> e versões do tipo <strong className="font-semibold text-foreground">Estável</strong>.
            </p>
            <ul className="space-y-3 list-disc pl-5 text-muted-foreground leading-relaxed text-base">
              <li>
                <strong className="font-semibold text-foreground">Versões Beta:</strong> Nestas versões, são lançadas 
                novas funcionalidades, melhorias e projetos antecipadamente. Os clientes deste perfil desempenham um 
                papel essencial ao fornecer feedbacks constantes, essenciais para o desenvolvimento e aprimoramento do produto.
              </li>
              <li>
                <strong className="font-semibold text-foreground">Versões Estáveis:</strong> Essas versões são as que 
                oferecem maior estabilidade possível do código, passando por um processo rigoroso de testes e, 
                consequentemente, resultando em menor quantidade de bugs e inconsistências.
              </li>
            </ul>
          </section>

          <section id="correcoes" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight border-b border-border pb-2 text-foreground">Como são feitas as correções?</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              As correções de bugs relatadas pelos clientes da versão <strong className="font-semibold text-foreground">Beta</strong> são tratadas com prioridade pela nossa equipe de desenvolvimento. O objetivo é identificar e solucionar falhas rapidamente antes que a versão seja promovida para a ramificação <strong className="font-semibold text-foreground">Estável</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              Sempre que uma instabilidade é reportada, nossa equipe técnica realiza a triagem e direciona a correção para a próxima atualização do ciclo Beta. Em casos de erros críticos (hotfixes), a correção é aplicada de forma imediata em ambas as versões.
            </p>
          </section>

          <section id="verificar" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight border-b border-border pb-2 text-foreground">Como verificar o que foi lançado?</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Todas as novidades, ajustes e correções são documentadas em nosso <strong className="font-semibold text-foreground">Changelog</strong> oficial. Você pode acompanhar as notas de atualização (Release Notes) diretamente pelo painel do sistema ou acessando a área de comunicados da IXC Soft.
            </p>
            <p className="text-muted-foreground leading-relaxed text-base">
              Recomendamos fortemente que os administradores do sistema leiam as notas de cada versão Beta para compreenderem os novos recursos que estão sendo testados e como instruir suas equipes na utilização das ferramentas recém-adicionadas.
            </p>
          </section>

          <section id="consideracoes" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight border-b border-border pb-2 text-foreground">Considerações Finais</h2>
            <p className="text-muted-foreground leading-relaxed text-base">
              Agradecemos imensamente por participar do nosso programa Beta. Sua colaboração ativa é o que nos permite continuar inovando e entregando um software de altíssima qualidade para todos os provedores e parceiros. 
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-foreground">
                <strong className="font-semibold text-primary">Importante:</strong> Ao utilizar a versão Beta, você concorda em compartilhar relatórios de erro automáticos com nossa equipe de engenharia para fins de diagnóstico.
              </p>
            </div>
          </section>

          <section id="leiatambem" className="space-y-4 scroll-mt-20">
            <h2 className="text-2xl font-semibold tracking-tight border-b border-border pb-2 text-foreground">Leia Também</h2>
            <ul className="flex flex-col space-y-2">
              <li>
                <Link href="#" className="text-primary hover:underline hover:text-primary/80 transition-colors">
                  Boas práticas para reportar bugs e falhas
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary hover:underline hover:text-primary/80 transition-colors">
                  Calendário de atualizações e manutenções programadas
                </Link>
              </li>
              <li>
                <Link href="#" className="text-primary hover:underline hover:text-primary/80 transition-colors">
                  Como realizar o backup do seu banco de dados
                </Link>
              </li>
            </ul>
          </section>
          
        </div>
      </article>

      {/* Sidebar Direita com o Índice */}
      <IndiceWiki />
    </div>
  );
}
