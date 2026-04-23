import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o processo de seed...");

  // 1. Criar um usuário de teste (Consultor)
  const userEmail = "demo@prime.com";
  let user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) {
    const passwordHash = await bcrypt.hash("123456", 10);
    user = await prisma.user.create({
      data: {
        name: "Consultor Demo",
        email: userEmail,
        passwordHash,
      },
    });
    console.log("✅ Usuário criado:", user.email);
  } else {
    console.log("✅ Usuário já existente:", user.email);
  }

  // Limpar dados existentes do usuário (opcional, cuidado em prod)
  // await prisma.client.deleteMany({ where: { userId: user.id } });
  // await prisma.property.deleteMany({ where: { userId: user.id } });

  // 2. Criar Imóveis
  console.log("Criando imóveis...");
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        userId: user.id,
        title: "Apartamento de Alto Padrão no Jardins",
        propertyType: "APARTAMENTO",
        purpose: "VENDA",
        price: 2500000,
        city: "São Paulo",
        neighborhood: "Jardins",
        bedrooms: 4,
        suites: 2,
        bathrooms: 4,
        parkingSpots: 3,
        area: 180,
        condoFee: 2500,
        iptu: 8000,
        status: "DISPONIVEL",
        internalCode: "AP-001",
        description: "Lindo apartamento com varanda gourmet, vista livre e acabamento premium.",
        highlights: "Piscina aquecida, academia equipada, segurança 24h.",
      },
    }),
    prisma.property.create({
      data: {
        userId: user.id,
        title: "Casa em Condomínio Fechado Alphaville",
        propertyType: "CASA_CONDOMINIO",
        purpose: "VENDA",
        price: 4800000,
        city: "Barueri",
        neighborhood: "Alphaville",
        bedrooms: 5,
        suites: 5,
        bathrooms: 7,
        parkingSpots: 6,
        area: 450,
        condoFee: 1800,
        iptu: 4500,
        status: "DISPONIVEL",
        internalCode: "CS-042",
        description: "Casa moderna com pé direito duplo, piscina privativa e churrasqueira.",
      },
    }),
    prisma.property.create({
      data: {
        userId: user.id,
        title: "Cobertura Duplex no Itaim",
        propertyType: "APARTAMENTO",
        purpose: "VENDA",
        price: 3200000,
        city: "São Paulo",
        neighborhood: "Itaim Bibi",
        bedrooms: 3,
        suites: 3,
        bathrooms: 5,
        parkingSpots: 4,
        area: 220,
        status: "RESERVADO",
        internalCode: "AP-102",
      },
    }),
  ]);
  console.log(`✅ ${properties.length} imóveis criados.`);

  // 3. Criar Clientes
  console.log("Criando clientes...");
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        userId: user.id,
        fullName: "Roberto Carlos Almeida",
        email: "roberto.almeida@example.com",
        phone: "(11) 98888-1111",
        currentCity: "São Paulo",
        journeyStage: "VISITANDO_IMOVEIS",
        urgencyLevel: "ALTA",
        leadSource: "PORTAL_IMOBILIARIO",
        preference: {
          create: {
            propertyType: "APARTAMENTO",
            minPrice: 2000000,
            maxPrice: 3500000,
            cityInterest: "São Paulo",
            minBedrooms: 3,
            minArea: 150,
          },
        },
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        fullName: "Marina Silva Sampaio",
        email: "marina.sampaio@example.com",
        phone: "(11) 97777-2222",
        currentCity: "Osasco",
        journeyStage: "EM_QUALIFICACAO",
        urgencyLevel: "MEDIA",
        leadSource: "INDICACAO",
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        fullName: "João Pereira",
        email: "joao.pereira@example.com",
        phone: "(11) 96666-3333",
        currentCity: "Barueri",
        journeyStage: "NEGOCIANDO",
        urgencyLevel: "ALTA",
        leadSource: "WHATSAPP",
      },
    }),
    prisma.client.create({
      data: {
        userId: user.id,
        fullName: "Camila Fernandes",
        phone: "(11) 95555-4444",
        journeyStage: "NOVO_LEAD",
        urgencyLevel: "BAIXA",
        leadSource: "REDES_SOCIAIS",
      },
    }),
  ]);
  console.log(`✅ ${clients.length} clientes criados.`);

  // 4. Criar Relacionamentos (Interesses)
  console.log("Criando interesses e interações...");
  await prisma.clientPropertyInterest.create({
    data: {
      clientId: clients[0].id,
      propertyId: properties[0].id,
      interestStatus: "VISITADO",
      isFavorite: true,
      feedback: "Gostou bastante da varanda, mas achou o condomínio alto.",
    },
  });

  await prisma.clientPropertyInterest.create({
    data: {
      clientId: clients[2].id,
      propertyId: properties[1].id,
      interestStatus: "EM_NEGOCIACAO",
      priorityLevel: "ALTA",
    },
  });

  // 5. Criar Interações (Timeline)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);

  await prisma.interaction.createMany({
    data: [
      {
        userId: user.id,
        clientId: clients[0].id,
        propertyId: properties[0].id,
        interactionType: "VISITA_REALIZADA",
        title: "Visita ao apartamento no Jardins",
        description: "O cliente visitou com a esposa. Estão avaliando a proposta.",
        interactionDate: pastDate,
        nextFollowUpAt: tomorrow,
      },
      {
        userId: user.id,
        clientId: clients[1].id,
        interactionType: "LIGACAO",
        title: "Qualificação inicial",
        description: "Cliente busca imóvel até 1M em SP. Vai enviar os links do que gostou.",
        interactionDate: new Date(),
        nextFollowUpAt: tomorrow,
      },
      {
        userId: user.id,
        clientId: clients[2].id,
        propertyId: properties[1].id,
        interactionType: "ENVIO_PROPOSTA",
        title: "Proposta enviada para a casa em Alphaville",
        description: "Enviamos proposta de 4.5M. Aguardando retorno do proprietário.",
        interactionDate: new Date(),
      },
    ],
  });
  console.log("✅ Interações criadas.");

  console.log("🎉 Seed concluído com sucesso!");
  console.log("-----------------------------------------");
  console.log("Use as seguintes credenciais para testar:");
  console.log("E-mail: demo@prime.com");
  console.log("Senha: 123456");
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
