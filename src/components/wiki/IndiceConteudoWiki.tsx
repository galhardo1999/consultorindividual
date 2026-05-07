import Link from "next/link";

type ItemIndice = {
  titulo: string;
  href: string;
  ativo?: boolean;
};

const dadosIndice: ItemIndice[] = [
  { titulo: "Introdução", href: "#introducao", ativo: true },
  { titulo: "Versionamento", href: "#versionamento" },
  { titulo: "Metodologia: Beta e Estável", href: "#metodologia" },
  { titulo: "Como são feitas as correções?", href: "#correcoes" },
  { titulo: "Como verificar o que foi lançado?", href: "#verificacao" },
  { titulo: "Considerações Finais", href: "#consideracoes" },
  { titulo: "Leia Também", href: "#leia-tambem" },
];

export function IndiceConteudoWiki() {
  return (
    <aside className="sticky top-20 hidden w-64 flex-shrink-0 flex-col pl-8 lg:flex">
      <h4 className="mb-4 text-sm font-semibold text-foreground">
        Nesta página
      </h4>
      <nav className="flex flex-col space-y-2.5">
        {dadosIndice.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`text-sm transition-colors hover:text-foreground ${
              item.ativo ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {item.titulo}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
