import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o processo de seed...");

  // 1. Criar um usuário de teste (Consultor)
  const userEmail = "demo@prime.com";
  let usuario = await prisma.usuario.findUnique({ where: { email: userEmail } });

  if (!usuario) {
    const senhaHash = await bcrypt.hash("123456", 10);
    usuario = await prisma.usuario.create({
      data: {
        nome: "Consultor Demo",
        email: userEmail,
        senhaHash,
      },
    });
    console.log("✅ Usuário criado:", usuario.email);
  } else {
    console.log("✅ Usuário já existente:", usuario.email);
  }

  // Limpar dados existentes do usuário (opcional, cuidado em prod)
  // await prisma.cliente.deleteMany({ where: { usuarioId: usuario.id } });
  // await prisma.imovel.deleteMany({ where: { usuarioId: usuario.id } });

  // 2. Criar Imóveis
  console.log("Criando imóveis...");
  const imoveis = await Promise.all([
    prisma.imovel.create({
      data: {
        usuarioId: usuario.id,
        titulo: "Apartamento de Alto Padrão no Jardins",
        tipoImovel: "APARTAMENTO",
        finalidade: "VENDA",
        precoVenda: 2500000,
        cidade: "São Paulo",
        bairro: "Jardins",
        quartos: 4,
        suites: 2,
        banheiros: 4,
        vagasGaragem: 3,
        areaUtil: 180,
        valorCondominio: 2500,
        valorIptu: 8000,
        status: "DISPONIVEL",
        codigoInterno: "AP-001",
        descricao: "Lindo apartamento com varanda gourmet, vista livre e acabamento premium.",
        destaques: "Piscina aquecida, academia equipada, segurança 24h.",
      },
    }),
    prisma.imovel.create({
      data: {
        usuarioId: usuario.id,
        titulo: "Casa em Condomínio Fechado Alphaville",
        tipoImovel: "CASA_CONDOMINIO",
        finalidade: "VENDA",
        precoVenda: 4800000,
        cidade: "Barueri",
        bairro: "Alphaville",
        quartos: 5,
        suites: 5,
        banheiros: 7,
        vagasGaragem: 6,
        areaUtil: 450,
        valorCondominio: 1800,
        valorIptu: 4500,
        status: "DISPONIVEL",
        codigoInterno: "CS-042",
        descricao: "Casa moderna com pé direito duplo, piscina privativa e churrasqueira.",
      },
    }),
    prisma.imovel.create({
      data: {
        usuarioId: usuario.id,
        titulo: "Cobertura Duplex no Itaim",
        tipoImovel: "APARTAMENTO",
        finalidade: "VENDA",
        precoVenda: 3200000,
        cidade: "São Paulo",
        bairro: "Itaim Bibi",
        quartos: 3,
        suites: 3,
        banheiros: 5,
        vagasGaragem: 4,
        areaUtil: 220,
        status: "RESERVADO",
        codigoInterno: "AP-102",
      },
    }),
  ]);
  console.log(`✅ ${imoveis.length} imóveis criados.`);

  // 3. Criar Clientes
  console.log("Criando clientes...");
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        usuarioId: usuario.id,
        nomeCompleto: "Roberto Carlos Almeida",
        email: "roberto.almeida@example.com",
        telefone: "(11) 98888-1111",
        cidadeAtual: "São Paulo",
        estagioJornada: "VISITANDO_IMOVEIS",
        nivelUrgencia: "ALTA",
        origemLead: "PORTAL_IMOBILIARIO",
        preferencia: {
          create: {
            tipoImovel: "APARTAMENTO",
            precoMinimo: 2000000,
            precoMaximo: 3500000,
            cidadeInteresse: "São Paulo",
            minQuartos: 3,
            areaMinima: 150,
          },
        },
      },
    }),
    prisma.cliente.create({
      data: {
        usuarioId: usuario.id,
        nomeCompleto: "Marina Silva Sampaio",
        email: "marina.sampaio@example.com",
        telefone: "(11) 97777-2222",
        cidadeAtual: "Osasco",
        estagioJornada: "EM_QUALIFICACAO",
        nivelUrgencia: "MEDIA",
        origemLead: "INDICACAO",
      },
    }),
    prisma.cliente.create({
      data: {
        usuarioId: usuario.id,
        nomeCompleto: "João Pereira",
        email: "joao.pereira@example.com",
        telefone: "(11) 96666-3333",
        cidadeAtual: "Barueri",
        estagioJornada: "NEGOCIANDO",
        nivelUrgencia: "ALTA",
        origemLead: "WHATSAPP",
      },
    }),
    prisma.cliente.create({
      data: {
        usuarioId: usuario.id,
        nomeCompleto: "Camila Fernandes",
        telefone: "(11) 95555-4444",
        estagioJornada: "NOVO_LEAD",
        nivelUrgencia: "BAIXA",
        origemLead: "REDES_SOCIAIS",
      },
    }),
  ]);
  console.log(`✅ ${clientes.length} clientes criados.`);

  // 4. Criar Relacionamentos (Interesses)
  console.log("Criando interesses e interações...");
  await prisma.interesseClienteImovel.create({
    data: {
      clienteId: clientes[0].id,
      imovelId: imoveis[0].id,
      statusInteresse: "VISITADO",
      ehFavorito: true,
      feedback: "Gostou bastante da varanda, mas achou o condomínio alto.",
    },
  });

  await prisma.interesseClienteImovel.create({
    data: {
      clienteId: clientes[2].id,
      imovelId: imoveis[1].id,
      statusInteresse: "EM_NEGOCIACAO",
      nivelPrioridade: "ALTA",
    },
  });

  // 5. Criar Interações (Timeline)
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);

  const anteontem = new Date();
  anteontem.setDate(anteontem.getDate() - 2);

  await prisma.interacao.createMany({
    data: [
      {
        usuarioId: usuario.id,
        clienteId: clientes[0].id,
        imovelId: imoveis[0].id,
        tipoInteracao: "VISITA_REALIZADA",
        titulo: "Visita ao apartamento no Jardins",
        descricao: "O cliente visitou com a esposa. Estão avaliando a proposta.",
        dataInteracao: anteontem,
        proximoFollowUp: amanha,
      },
      {
        usuarioId: usuario.id,
        clienteId: clientes[1].id,
        tipoInteracao: "LIGACAO",
        titulo: "Qualificação inicial",
        descricao: "Cliente busca imóvel até 1M em SP. Vai enviar os links do que gostou.",
        dataInteracao: new Date(),
        proximoFollowUp: amanha,
      },
      {
        usuarioId: usuario.id,
        clienteId: clientes[2].id,
        imovelId: imoveis[1].id,
        tipoInteracao: "ENVIO_PROPOSTA",
        titulo: "Proposta enviada para a casa em Alphaville",
        descricao: "Enviamos proposta de 4.5M. Aguardando retorno do proprietário.",
        dataInteracao: new Date(),
      },
    ],
  });
  console.log("✅ Interações criadas.");

  console.log("🎉 Seed concluído com sucesso!");
  console.log("-----------------------------------------");
  console.log("Use as seguintes credenciais para testar:");
  console.log("E-mail: demo@prime.com");
  console.log("Senha:  123456");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
