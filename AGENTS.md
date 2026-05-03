# AGENTS.md — Prime Realty CRM
> Regras obrigatórias para todos os agentes e desenvolvedores que atuam neste projeto.
> Atualizado em: 2026-04-30 após auditoria técnica completa.

---

## 🌐 Idioma

- Todo o código (comentários, variáveis, funções, nomes de constantes, rotas e retornos de API) **DEVE ser em Português do Brasil**.
- Nomes de variáveis em inglês são **proibidos**. Use `busca` (não `search`), `usuarioId` (não `userId`), `resto` (não `rest`).
- Exceções aceitas: nomes de bibliotecas externas, props de componentes de terceiros e termos técnicos sem tradução consolidada (ex: `token`, `payload`, `slug`).

---

## 🔷 TypeScript

- Strict mode obrigatório. **O uso de `any`, `never` como cast e `as unknown` é terminantemente proibido.**
- Nunca use `as never` ou `as any` para suprimir erros do TypeScript em pontos de entrada de dados (Prisma, fetch, req.json()). Corrija o tipo de verdade.
- Tipos globais de domínio ficam em `src/types/`. Sempre derive tipos do Prisma via `Prisma.ModelGetPayload<{...}>` quando possível.
- Augmentations de tipos de bibliotecas ficam em `src/types/<biblioteca>.d.ts` (ex: `next-auth.d.ts`).
- Prefira Arrow Functions: `const exemplo = () => {}`.
- Mantenha funções pequenas e com responsabilidade única.

---

## 🎨 Estilização

- **Apenas Tailwind CSS.** Zero CSS inline, zero `styled-components`, zero módulos CSS.
- Padrão de design: **"Clean & Premium"**. Use variáveis de cores do `globals.css` (CSS variables).
- Ícones: exclusivamente `lucide-react`.
- Design responsivo (mobile-first) é obrigatório em todo componente novo.
- **Alinhamento de Layout:** **NÃO centralize o layout principal das páginas.** Evite usar `items-center` ou `justify-center` nos containers raízes das páginas. O conteúdo deve seguir o fluxo normal padrão (alinhado ao topo/esquerda). Centralização vertical/horizontal deve ser restrita apenas a elementos específicos onde isso faça sentido estruturalmente (ex: empty states, telas de login, modais).

---

## 🗄️ Stack de Dados

- **Prisma + PostgreSQL (Supabase).** Nunca sugira alternativas (Drizzle, Mongoose, Kysely).
- Ao criar ou alterar schemas, sempre pense em **normalização e performance** (adicione índices nos campos usados em `where`, `orderBy` e joins).
- Alterações de schema **obrigatoriamente** via `prisma migrate dev` (nunca `db push` em produção). O histórico de migrations é sagrado.
- O cliente Supabase JS (`supabase.ts`) é **exclusivo para Storage** (upload de imagens). Dados de negócio são acessados apenas via Prisma.
- Constantes de enums do Prisma ficam centralizadas em `src/constants/enums.ts`.

---

## 🏗️ Arquitetura Next.js (App Router)

- **Prioridade total para Server Components.** Use `"use client"` apenas no menor nível possível da árvore.
- Layouts raiz (`layout.tsx`) devem ser Server Components. Extraia apenas o estado necessário para um componente Client Shell separado.
- Componentes reutilizáveis: `src/components/ui/`.
- Lógica de banco: `src/lib/`.
- Server Actions em arquivos `actions.ts` dedicados.
- **Proibido** `include: { caracteristicas: true }` em listagens — inclua subrelações completas apenas nas páginas de detalhe.

---

## 🛡️ Segurança — Regras Críticas

### API Routes

- **Toda Route Handler autenticada DEVE verificar `session?.user?.id` no início do handler.**
- Após a verificação de sessão, use `session.user.id` **sem** fallback `|| ""`. Se chegou nessa linha, o tipo é garantido.
- Sempre adicione `usuarioId` como filtro **duplo** nas queries de update/delete (não confie apenas na verificação prévia via `findFirst`):
  ```ts
  // ✅ Correto — dupla garantia
  prisma.cliente.update({ where: { id, usuarioId: session.user.id }, data: { ... } });

  // ❌ Errado — depende de verificação anterior que pode ser removida por acidente
  prisma.cliente.update({ where: { id }, data: { ... } });
  ```
- O matcher do middleware **inclui `/api`**. Rotas públicas devem ser declaradas explicitamente em `auth.config.ts` na lista `rotasApiPublicas`.

### Validação de Entrada

- **Todo POST/PATCH/PUT de Route Handler deve ter um schema Zod completo.** Proibido fazer `body` direto no Prisma sem validação.
- Retorno padrão de erros de validação:
  ```ts
  return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  ```
- O parâmetro `limit` nas listagens **sempre** deve ter um valor máximo:
  ```ts
  const limite = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  ```

### Rate Limiting

- Endpoints públicos sensíveis (`/api/register`, rotas de recuperação de senha) **devem ter rate limiting**.
- O padrão atual usa in-memory (5 tentativas / 15min por IP). Para produção multi-instância, migrar para Upstash Redis.

### Autenticação

- Sessões JWT com expiração de **7 dias** (não alterar para mais sem justificativa documentada).
- bcrypt com salt rounds **12** (não reduzir).
- `auth.config.ts` mantém o `authorized()` callback e roda no **Edge Runtime** — nunca adicione imports de Prisma, bcrypt ou outros módulos Node.js aqui.
- Os callbacks `jwt` e `session` devem ficar em `auth.ts` (Node.js runtime), **não** em `auth.config.ts`.
- O matcher do middleware **DEVE excluir `/api`**:
  ```ts
  // ✅ CORRETO — exclui /api para não quebrar /api/auth/* do NextAuth
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]

  // ❌ ERRADO — captura /api/auth/callback/credentials e quebra o login
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
  ```
  Rotas de API são protegidas individualmente via `auth()` em cada Route Handler.

---

## ⚡ Performance

### Proibido: N+1 Queries

Nunca faça queries dentro de um loop `for` ou `map` sobre resultados de outra query:

```ts
// ❌ PROIBIDO — N+1
for (const cliente of clientes) {
  const count = await prisma.imovel.count({ where: { clienteId: cliente.id } });
}

// ✅ CORRETO — batch primeiro, depois mapa em memória
const interesses = await prisma.interesseClienteImovel.findMany({
  where: { clienteId: { in: clienteIds } },
  select: { clienteId: true, imovelId: true },
});
const mapa = new Map<string, string[]>();
for (const i of interesses) {
  if (!mapa.has(i.clienteId)) mapa.set(i.clienteId, []);
  mapa.get(i.clienteId)!.push(i.imovelId);
}
```

Quando precisar de counts por entidade, use `_count` do Prisma ou `groupBy`, não loops.

### Queries em Paralelo

Use `prisma.$transaction([...])` ou `Promise.all([...])` para múltiplas queries independentes:

```ts
const [clientes, total] = await prisma.$transaction([
  prisma.cliente.findMany({ where, skip, take }),
  prisma.cliente.count({ where }),
]);
```

---

## 🧹 Organização e Limpeza

- **Arquivos de manutenção temporária** (scripts de refactor, logs de erro, `.md` de backlog pessoal) **não pertencem ao repositório**. Use `.gitignore` ou uma pasta `.dev/` local não rastreada.
- Interfaces TypeScript de domínio não devem ser redefinidas inline em cada página — centralize em `src/types/`.
- Constantes estruturais (enums puros do Prisma) ficam em `src/constants/enums.ts`.
- **Opções de formulários e selects (arrays com label/value) NÃO devem ser redefinidas ou duplicadas inline em páginas de cadastro/edição.** Importe sempre as constantes centralizadas de `src/constants/options.ts` (ex: `PROPERTY_TYPES`, `PURPOSES`, `STATUSES`).
- Ao deletar uma rota de API, **sempre limpe o cache `.next/`** para evitar erros de type-validator que referenciam arquivos deletados.

---

## 🚨 Tratamento de Erros

- Route Handlers: `try/catch` em toda operação de banco. Retorno padrão em caso de erro interno:
  ```ts
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  ```
- Client Components (fetch): **sempre** `try/catch/finally`. O `finally` garante o reset do estado de loading mesmo em falha:
  ```ts
  try {
    const res = await fetch("/api/...");
    if (!res.ok) throw new Error("Falha na requisição");
    const data = await res.json();
    setDados(data);
  } catch (erro) {
    console.error(erro);
    setDados([]);
  } finally {
    setLoading(false);
  }
  ```
- Server Actions: retorne sempre `{ success: boolean, data?: T, error?: string }`.

---

## 🖼️ UI/UX Premium

- Implemente estados de `loading` com **Skeleton screens** (não spinners isolados em listagens).
- Feedback de ações com **Toasts** de sucesso e erro.
- Imagens preferencialmente SVG inline ou componentes React que renderizam SVG.
- **Formulários Longos / Multi-step (Wizard):** O comportamento entre fluxos de criação e edição da mesma entidade DEVE ser mantido idêntico. Validações, navegação entre abas, botões (Voltar, Continuar) e a restrição de salvar apenas na última etapa devem refletir o mesmo fluxo.

---

## 🤖 Comportamento do Agente

- **Não remova comentários existentes.**
- Seja direto: **código primeiro**, explicação técnica breve depois. Sem prosa desnecessária.
- Se encontrar um erro de lógica no prompt do usuário, corrija-o gentilmente no código gerado.
- Ao criar uma nova Route Handler, siga obrigatoriamente esta checklist:
  - [ ] Verifica `session?.user?.id` no início
  - [ ] Usa `session.user.id` (sem `|| ""`) após verificação
  - [ ] Tem schema Zod para todos os inputs
  - [ ] Tem `try/catch`
  - [ ] Tem `limit` com `Math.min` se aceita paginação
  - [ ] Não tem N+1 queries
  - [ ] Usa `usuarioId` no filtro do update/delete