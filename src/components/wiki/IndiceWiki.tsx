"use client";

import Link from "next/link";

export function IndiceWiki() {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto pt-10 pb-8 px-6 hidden xl:block">
      <h4 className="font-semibold text-foreground mb-4 text-sm">Nesta página</h4>
      <nav className="flex flex-col space-y-2.5 text-sm text-muted-foreground border-l border-border/50 pl-3">
        <Link href="#introducao" className="hover:text-foreground transition-colors">
          Introdução
        </Link>
        <Link href="#versionamento" className="hover:text-foreground transition-colors">
          Versionamento
        </Link>
        <Link href="#metodologia" className="hover:text-foreground transition-colors">
          Metodologia: Beta e Estável
        </Link>
        <Link href="#correcoes" className="hover:text-foreground transition-colors">
          Como são feitas as correções?
        </Link>
        <Link href="#verificar" className="hover:text-foreground transition-colors truncate" title="Como verificar o que foi lançado?">
          Como verificar o que foi lanç...
        </Link>
        <Link href="#consideracoes" className="hover:text-foreground transition-colors">
          Considerações Finais
        </Link>
        <Link href="#leiatambem" className="hover:text-foreground transition-colors">
          Leia Também
        </Link>
      </nav>
    </aside>
  );
}
