# 🚀 Stack Tecnológica - Prime Realty CRM

Este documento consolida as principais tecnologias e bibliotecas adotadas no desenvolvimento do **Prime Realty CRM**, com base nas configurações do projeto e diretrizes de arquitetura.

## 🏗️ Core & Framework
- **[Next.js](https://nextjs.org/) (v16.2.4)**: Framework React principal utilizando o moderno **App Router**. Todo o sistema é otimizado com preferência a *Server Components*.
- **[React](https://react.dev/) (v19.2.4)**: Biblioteca base para construção da interface.
- **[TypeScript](https://www.typescriptlang.org/) (v5)**: Linguagem principal da aplicação, garantindo tipagem estática rigorosa (Strict Mode) e inteligência de código.

## 🎨 Estilização & UI
- **[Tailwind CSS](https://tailwindcss.com/) (v4)**: Framework utilitário de CSS usado exclusivamente para toda a estilização, configurado com variáveis CSS nativas para o tema Light/Dark.
- **[Lucide-React](https://lucide.dev/) (v1.8.0)**: Biblioteca exclusiva e padronizada de ícones do projeto.
- **clsx & tailwind-merge**: Utilitários para composição e mesclagem dinâmica de classes CSS.

## 🗄️ Banco de Dados & Backend
- **[PostgreSQL](https://www.postgresql.org/)**: Banco de dados relacional principal hospedado no Supabase.
- **[Prisma ORM](https://www.prisma.io/) (v6)**: Ferramenta de mapeamento objeto-relacional (ORM) exclusiva utilizada para todas as transações, migrações (`prisma migrate`) e consultas ao banco.
- **[Supabase Storage](https://supabase.com/)**: O cliente `@supabase/supabase-js` é utilizado *estritamente* para manipulação e upload de imagens/arquivos.

## 🔐 Autenticação & Segurança
- **[NextAuth.js / Auth.js](https://authjs.dev/) (v5.0.0-beta.28)**: Gerenciamento completo de sessão e autenticação via JWT.
- **Bcryptjs (v3.0.3)**: Usado para hash e validação segura das senhas (salt rounds configurados em 12).
- **[Zod](https://zod.dev/) (v4.3.6)**: Validador de schema estrito, obrigatório na validação de inputs em Route Handlers e Server Actions.

## 📋 Formulários & Estado
- **[React Hook Form](https://react-hook-form.com/) (v7.73.1)**: Gerenciamento eficiente e com alta performance do estado de formulários.
- **@hookform/resolvers (v5.2.2)**: Usado para integrar perfeitamente as regras de validação do Zod dentro do React Hook Form.

## 🗺️ Mapas & Localização
- **[Leaflet](https://leafletjs.com/) (v1.9.4) & React-Leaflet (v5.0.0)**: Responsáveis pela renderização de mapas interativos (usado na visualização geográfica dos imóveis).

## 📧 Utilitários Adicionais
- **[Resend](https://resend.com/) (v4.8.0)**: API para envio de emails transacionais (ex: fluxo de recuperação de senha).
- **Date-fns (v4.1.0)**: Manipulação moderna e simplificada de datas.
- **Faker-js (@faker-js/faker v10.4)**: Utilizado em ambiente de desenvolvimento junto com o script `tsx` (em `prisma/seed.ts`) para popular o banco de dados com dados falsos.
