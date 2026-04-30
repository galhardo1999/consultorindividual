/**
 * scripts/limpar-dados.ts
 *
 * Script de gestão de dados do banco de dados.
 * Execução: bun scripts/limpar-dados.ts
 *
 * Menu principal:
 *  [1] Criar  — insere dados de teste (seed)
 *  [2] Deletar — remove registros de forma segura
 *
 * ATENÇÃO: deleções são IRREVERSÍVEIS. Faça backup antes de prosseguir.
 */

import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

// ─── Utilitários de terminal ──────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const perguntar = (msg: string): Promise<string> =>
  new Promise((resolve) => rl.question(msg, resolve));

const linha = () => console.log("─".repeat(52));
const espaco = () => console.log("");

const c = {
  vermelho: (t: string) => `\x1b[31m${t}\x1b[0m`,
  verde: (t: string) => `\x1b[32m${t}\x1b[0m`,
  amarelo: (t: string) => `\x1b[33m${t}\x1b[0m`,
  ciano: (t: string) => `\x1b[36m${t}\x1b[0m`,
  negrito: (t: string) => `\x1b[1m${t}\x1b[0m`,
  cinza: (t: string) => `\x1b[90m${t}\x1b[0m`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const confirmar = async (acao: string, total: number): Promise<boolean> => {
  if (total === 0) {
    console.log(c.ciano(`   Nenhum registro encontrado para "${acao}". Operação ignorada.\n`));
    return false;
  }
  console.log(c.vermelho(`\n⚠  ATENÇÃO: Esta ação irá deletar ${total} registro(s) de "${acao}" PERMANENTEMENTE.`));
  const r = await perguntar(`   Digite ${c.negrito("CONFIRMAR")} para prosseguir: `);
  if (r.trim().toUpperCase() !== "CONFIRMAR") {
    console.log(c.ciano("   Operação cancelada.\n"));
    return false;
  }
  return true;
};

const selecionarUsuario = async (): Promise<string | null> => {
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nome: true, email: true },
    orderBy: { criadoEm: "asc" },
  });

  if (usuarios.length === 0) {
    console.log(c.vermelho("   Nenhum usuário encontrado no banco. Crie um usuário primeiro.\n"));
    return null;
  }

  // Se só houver um usuário, usa direto sem perguntar
  if (usuarios.length === 1) {
    console.log(c.cinza(`   Usuário selecionado automaticamente: ${usuarios[0].nome} (${usuarios[0].email})`));
    return usuarios[0].id;
  }

  // Lista os usuários para escolha
  console.log(c.negrito("\n  👤 Em qual usuário deseja criar os dados?"));
  linha();
  usuarios.forEach((u, idx) => {
    console.log(`  ${c.ciano(`[${idx + 1}]`)} ${u.nome}  ${c.cinza(u.email)}`);
  });
  linha();

  const entrada = (await perguntar("  Escolha o usuário: ")).trim();
  const indice = parseInt(entrada) - 1;

  if (isNaN(indice) || indice < 0 || indice >= usuarios.length) {
    console.log(c.vermelho("   Seleção inválida. Operação cancelada.\n"));
    return null;
  }

  const selecionado = usuarios[indice];
  console.log(c.verde(`   ✓ Usuário selecionado: ${selecionado.nome}\n`));
  return selecionado.id;
};

// ─── Contagem de registros ────────────────────────────────────────────────────

const contarRegistros = async () => {
  const [clientes, imoveis, interacoes, proprietarios] = await Promise.all([
    prisma.cliente.count(),
    prisma.imovel.count(),
    prisma.interacao.count(),
    prisma.proprietario.count(),
  ]);
  return { clientes, imoveis, interacoes, proprietarios };
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO: CRIAR DADOS
// ═══════════════════════════════════════════════════════════════════════════════

const criarClientes = async (usuarioId: string, quantidade: number) => {
  console.log(c.amarelo(`\n⚙  Criando ${quantidade} cliente(s) de teste...`));

  const nomes = ["Ana Lima", "Bruno Costa", "Carla Souza", "Diego Alves", "Elisa Torres",
    "Felipe Nunes", "Gabriela Ramos", "Henrique Melo", "Isabela Dias", "João Ferreira"];
  const cidades = ["São Paulo", "Rio de Janeiro", "Curitiba", "Belo Horizonte", "Porto Alegre"];
  const origens = ["INDICACAO", "PORTAL_IMOBILIARIO", "REDES_SOCIAIS", "WHATSAPP", "SITE_PROPRIO"] as const;

  for (let i = 0; i < quantidade; i++) {
    const nome = `${nomes[i % nomes.length]} ${i + 1}`;
    await prisma.cliente.create({
      data: {
        usuarioId,
        nomeCompleto: nome,
        telefone: `(11) 9${String(Math.floor(10000000 + Math.random() * 89999999))}`,
        email: `${nome.toLowerCase().replace(/ /g, ".")}@exemplo.com`,
        cidadeAtual: cidades[i % cidades.length],
        origemLead: origens[i % origens.length],
        budgetMaximo: 200000 + i * 50000,
        nivelUrgencia: i % 3 === 0 ? "ALTA" : i % 3 === 1 ? "MEDIA" : "BAIXA",
        preferencia: {
          create: {
            tipoImovel: "CASA",
            precoMinimo: 100000,
            precoMaximo: 500000,
            cidadeInteresse: cidades[i % cidades.length],
            minQuartos: 2,
          },
        },
      },
    });
  }

  console.log(c.verde(`   ✓ ${quantidade} cliente(s) criado(s) com sucesso!\n`));
};

const criarImoveis = async (usuarioId: string, quantidade: number) => {
  console.log(c.amarelo(`\n⚙  Criando ${quantidade} imóvel/imóveis de teste...`));

  const titulos = ["Casa no Centro", "Apartamento Moderno", "Chácara Tranquila",
    "Sala Comercial", "Terreno Plano", "Cobertura Luxuosa"];
  const tipos = ["CASA", "APARTAMENTO", "CHACARA", "SALA_COMERCIAL", "TERRENO", "COBERTURA"] as const;
  const cidades = ["São Paulo", "Campinas", "Curitiba", "Florianópolis"];
  const bairros = ["Centro", "Jardim América", "Vila Nova", "Santa Cruz"];
  const ruas = ["Rua das Flores", "Av. Brasil", "Rua São João", "Rua Ipiranga"];

  for (let i = 0; i < quantidade; i++) {
    await prisma.imovel.create({
      data: {
        usuarioId,
        titulo: `${titulos[i % titulos.length]} ${i + 1}`,
        tipoImovel: tipos[i % tipos.length],
        finalidade: "VENDA",
        status: "DISPONIVEL",
        cidade: cidades[i % cidades.length],
        bairro: bairros[i % bairros.length],
        endereco: ruas[i % ruas.length],
        numero: String(100 + i * 10),
        cep: "01310-100",
        precoVenda: 250000 + i * 50000,
        quartos: (i % 4) + 1,
        banheiros: (i % 3) + 1,
        vagasGaragem: i % 3,
        areaUtil: 60 + i * 10,
      },
    });
  }

  console.log(c.verde(`   ✓ ${quantidade} imóvel/imóveis criado(s) com sucesso!\n`));
};

const criarProprietarios = async (usuarioId: string, quantidade: number) => {
  console.log(c.amarelo(`\n⚙  Criando ${quantidade} proprietário(s) de teste...`));

  const nomes = ["Roberto Silva", "Marta Oliveira", "Cláudio Santos", "Vera Martins", "Paulo Lima"];
  const cidades = ["São Paulo", "Rio de Janeiro", "Curitiba", "Salvador"];

  for (let i = 0; i < quantidade; i++) {
    const nome = `${nomes[i % nomes.length]} ${i + 1}`;
    await prisma.proprietario.create({
      data: {
        usuarioId,
        nomeCompleto: nome,
        telefone: `(11) 9${String(Math.floor(10000000 + Math.random() * 89999999))}`,
        email: `${nome.toLowerCase().replace(/ /g, ".")}@exemplo.com`,
        cidade: cidades[i % cidades.length],
        tipoPessoa: "PESSOA_FISICA",
      },
    });
  }

  console.log(c.verde(`   ✓ ${quantidade} proprietário(s) criado(s) com sucesso!\n`));
};

// ─── Menu Criar ───────────────────────────────────────────────────────────────

const menuCriar = async () => {
  let voltar = false;

  while (!voltar) {
    linha();
    console.log(c.negrito("  ✨  CRIAR DADOS DE TESTE"));
    console.log(c.cinza("  Insere registros fictícios para desenvolvimento"));
    linha();
    console.log(`  ${c.ciano("[1]")} Criar Clientes`);
    console.log(`  ${c.ciano("[2]")} Criar Imóveis`);
    console.log(`  ${c.ciano("[3]")} Criar Proprietários`);
    console.log(`  ${c.ciano("[4]")} Criar TUDO  ${c.cinza("(clientes + imóveis + proprietários)")}`);
    console.log(`  ${c.ciano("[0]")} ← Voltar`);
    linha();

    const opcao = (await perguntar("  Escolha uma opção: ")).trim();

    if (opcao === "0") { voltar = true; break; }

    // Obtém o usuário uma única vez
    const usuarioId = await selecionarUsuario();
    if (!usuarioId) break;

    let qtd = 5;
    if (["1", "2", "3", "4"].includes(opcao)) {
      const entrada = (await perguntar("  Quantos registros criar? [padrão: 5]: ")).trim();
      qtd = entrada ? parseInt(entrada) || 5 : 5;
      if (qtd < 1 || qtd > 100) { console.log(c.vermelho("  Quantidade inválida (1–100).\n")); continue; }
    }

    switch (opcao) {
      case "1": await criarClientes(usuarioId, qtd); break;
      case "2": await criarImoveis(usuarioId, qtd); break;
      case "3": await criarProprietarios(usuarioId, qtd); break;
      case "4":
        await criarClientes(usuarioId, qtd);
        await criarImoveis(usuarioId, qtd);
        await criarProprietarios(usuarioId, qtd);
        console.log(c.verde("  ✅ Todos os dados de teste foram criados!\n"));
        break;
      default:
        console.log(c.vermelho("  Opção inválida.\n"));
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SEÇÃO: DELETAR DADOS
// ═══════════════════════════════════════════════════════════════════════════════

const deletarClientes = async () => {
  console.log(c.amarelo("\n⚙  Deletando clientes e dependências..."));
  const etiquetas = await prisma.etiquetaCliente.deleteMany();
  console.log(`   ✓ ${etiquetas.count} etiqueta(s) de cliente removida(s)`);
  const interesses = await prisma.interesseClienteImovel.deleteMany();
  console.log(`   ✓ ${interesses.count} interesse(s) removido(s)`);
  const interacoes = await prisma.interacao.deleteMany();
  console.log(`   ✓ ${interacoes.count} interação/interações removida(s)`);
  const prefs = await prisma.preferenciaCliente.deleteMany();
  console.log(`   ✓ ${prefs.count} preferência(s) removida(s)`);
  const clientes = await prisma.cliente.deleteMany();
  console.log(c.verde(`   ✓ ${clientes.count} cliente(s) deletado(s) com sucesso!\n`));
};

const deletarImoveis = async () => {
  console.log(c.amarelo("\n⚙  Deletando imóveis e dependências..."));
  const interesses = await prisma.interesseClienteImovel.deleteMany();
  console.log(`   ✓ ${interesses.count} interesse(s) removido(s)`);
  const interacoes = await prisma.interacao.deleteMany({ where: { imovelId: { not: null } } });
  console.log(`   ✓ ${interacoes.count} interação/interações vinculadas removida(s)`);
  const fotos = await prisma.fotoImovel.deleteMany();
  console.log(`   ✓ ${fotos.count} foto(s) removida(s)`);
  const caracteristicas = await prisma.caracteristicaImovel.deleteMany();
  console.log(`   ✓ ${caracteristicas.count} característica(s) removida(s)`);
  const imoveis = await prisma.imovel.deleteMany();
  console.log(c.verde(`   ✓ ${imoveis.count} imóvel/imóveis deletado(s) com sucesso!\n`));
};

const deletarInteracoes = async () => {
  console.log(c.amarelo("\n⚙  Deletando interações..."));
  const interacoes = await prisma.interacao.deleteMany();
  console.log(c.verde(`   ✓ ${interacoes.count} interação/interações deletada(s) com sucesso!\n`));
};

const deletarProprietarios = async () => {
  console.log(c.amarelo("\n⚙  Deletando proprietários..."));
  // Desvincula imóveis antes de deletar (FK SetNull)
  const desvinculados = await prisma.imovel.updateMany({
    where: { proprietarioId: { not: null } },
    data: { proprietarioId: null },
  });
  console.log(`   ✓ ${desvinculados.count} imóvel/imóveis desvinculado(s)`);
  const proprietarios = await prisma.proprietario.deleteMany();
  console.log(c.verde(`   ✓ ${proprietarios.count} proprietário(s) deletado(s) com sucesso!\n`));
};

// ─── Menu Deletar ─────────────────────────────────────────────────────────────

const menuDeletar = async () => {
  let voltar = false;

  while (!voltar) {
    const ct = await contarRegistros();
    linha();
    console.log(c.negrito("  🗑  DELETAR DADOS"));
    console.log(c.cinza("  Remove registros permanentemente do banco"));
    linha();
    console.log(`  ${c.ciano("[1]")} Deletar Clientes       ${c.amarelo(`(${ct.clientes} registros)`)}`);
    console.log(`  ${c.ciano("[2]")} Deletar Imóveis        ${c.amarelo(`(${ct.imoveis} registros)`)}`);
    console.log(`  ${c.ciano("[3]")} Deletar Interações     ${c.amarelo(`(${ct.interacoes} registros)`)}`);
    console.log(`  ${c.ciano("[4]")} Deletar Proprietários  ${c.amarelo(`(${ct.proprietarios} registros)`)}`);
    console.log(`  ${c.ciano("[5]")} Deletar TUDO           ${c.vermelho("(clientes + imóveis + interações + proprietários)")}`);
    console.log(`  ${c.ciano("[0]")} ← Voltar`);
    linha();

    const opcao = (await perguntar("  Escolha uma opção: ")).trim();

    switch (opcao) {
      case "1": { const ok = await confirmar("Clientes", ct.clientes); if (ok) await deletarClientes(); break; }
      case "2": { const ok = await confirmar("Imóveis", ct.imoveis); if (ok) await deletarImoveis(); break; }
      case "3": { const ok = await confirmar("Interações", ct.interacoes); if (ok) await deletarInteracoes(); break; }
      case "4": { const ok = await confirmar("Proprietários", ct.proprietarios); if (ok) await deletarProprietarios(); break; }
      case "5": {
        const total = ct.clientes + ct.imoveis + ct.interacoes + ct.proprietarios;
        console.log(c.vermelho(`\n⚠  Isso irá deletar TODOS os dados (${total} registros no total).`));
        const r = await perguntar(`   Digite ${c.negrito("DELETAR TUDO")} para confirmar: `);
        if (r.trim().toUpperCase() === "DELETAR TUDO") {
          await deletarInteracoes();
          await deletarImoveis();
          await deletarClientes();
          await deletarProprietarios();
          console.log(c.verde("  ✅ Todos os dados foram deletados com sucesso!\n"));
        } else {
          console.log(c.ciano("   Operação cancelada.\n"));
        }
        break;
      }
      case "0": voltar = true; break;
      default: console.log(c.vermelho("  Opção inválida. Tente novamente.\n"));
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MENU PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

const main = async () => {
  console.log(c.negrito("\n  Conectando ao banco de dados..."));
  espaco();

  let sair = false;

  while (!sair) {
    linha();
    console.log(c.negrito("  🛠  SCRIPT DE GESTÃO DE DADOS"));
    linha();
    console.log(`  ${c.ciano("[1]")} Criar dados`);
    console.log(`  ${c.ciano("[2]")} Deletar dados`);
    console.log(`  ${c.ciano("[0]")} Sair`);
    linha();

    const opcao = (await perguntar("  Escolha uma opção: ")).trim();

    switch (opcao) {
      case "1": await menuCriar(); break;
      case "2": await menuDeletar(); break;
      case "0": sair = true; break;
      default: console.log(c.vermelho("  Opção inválida. Tente novamente.\n"));
    }
  }

  rl.close();
  await prisma.$disconnect();
  console.log(c.verde("\n  Conexão encerrada. Até logo!\n"));
};

main().catch(async (erro) => {
  console.error(c.vermelho("\n  Erro fatal:"), erro);
  await prisma.$disconnect();
  process.exit(1);
});
