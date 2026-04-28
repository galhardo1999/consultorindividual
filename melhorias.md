# Prompt — Melhorar Schema Prisma de Imóveis com Campos Condicionais

Preciso melhorar o schema Prisma e a UI/UX do módulo de imóveis (cadastro, edição, listagem, visualização, filtro e etc.)

Atualmente tenho o model `Imovel` com campos básicos como título, descrição, tipo do imóvel, finalidade, preço, condomínio, IPTU, cidade, bairro, endereço, quartos, suítes, banheiros, vagas, área útil, status, proprietário, fotos, características e interesses.

Quero expandir esse schema para permitir um cadastro mais completo e profissional, mas com uma regra importante:

## Objetivo principal

Os campos exibidos no cadastro de imóvel devem mudar dinamicamente conforme:

1. `finalidade`
2. `tipoImovel`

Ou seja, dependendo se o imóvel é para venda, locação, temporada ou venda/locação, os campos de valores devem mudar.

E dependendo se o imóvel é apartamento, casa, terreno, sala comercial, loja, galpão, chácara, fazenda etc., os campos de características também devem mudar.

---

## Finalidades do imóvel

Considerar as seguintes finalidades:

```prisma
enum FinalidadeImovel {
  VENDA
  LOCACAO
  VENDA_LOCACAO
  TEMPORADA
}
```

### Regras por finalidade

#### VENDA

Exibir campos como:

- preço de venda
- aceita financiamento
- aceita permuta
- valor de entrada sugerido
- saldo devedor
- imóvel quitado
- aceita proposta
- documentação regularizada
- escritura
- matrícula
- financiamento ativo

#### LOCACAO

Exibir campos como:

- valor do aluguel
- valor do condomínio
- valor do IPTU
- valor do seguro fiança
- valor do caução
- quantidade de meses de caução
- aceita fiador
- aceita seguro fiança
- aceita título de capitalização
- aceita caução
- contrato mínimo em meses
- imóvel mobiliado
- disponível a partir de determinada data

#### VENDA_LOCACAO

Exibir tanto os campos de venda quanto os campos de locação:

- preço de venda
- valor do aluguel
- condomínio
- IPTU
- aceita financiamento
- aceita permuta
- aceita caução
- aceita fiador
- aceita seguro fiança
- contrato mínimo
- documentação regularizada

#### TEMPORADA

Exibir campos como:

- valor da diária
- valor por fim de semana
- valor semanal
- valor mensal
- taxa de limpeza
- taxa de serviço
- caução para temporada
- quantidade máxima de hóspedes
- quantidade mínima de diárias
- aceita pets
- possui roupa de cama
- possui utensílios
- horário de check-in
- horário de checkout

---

## Tipos de imóvel

Considerar os tipos:

```prisma
enum TipoImovel {
  APARTAMENTO
  CASA
  CASA_CONDOMINIO
  TERRENO
  SALA_COMERCIAL
  LOJA
  GALPAO
  CHACARA
  FAZENDA
  COBERTURA
  KITNET
  STUDIO
  PREDIO_COMERCIAL
  AREA_RURAL
  OUTRO
}
```

---

## Campos comuns para todos os imóveis

Adicionar campos mais completos no `Imovel`:

- código interno
- título
- descrição
- observações internas
- status
- finalidade
- tipo do imóvel
- proprietário
- endereço completo
- cidade
- bairro
- estado
- CEP
- rua
- número
- complemento
- latitude
- longitude
- área útil
- área total
- área construída
- destaque
- tags
- origem do cadastro
- data de captação
- data de disponibilidade
- arquivado em
- criado em
- atualizado em

---

## Campos financeiros sugeridos

Adicionar campos separados para venda, locação e temporada:

```prisma
precoVenda              Float?
valorAluguel           Float?
valorTemporadaDiaria   Float?
valorTemporadaSemanal  Float?
valorTemporadaMensal   Float?

valorCondominio        Float?
valorIptu              Float?
valorSeguroIncendio    Float?
valorSeguroFianca      Float?
valorCaucao            Float?
mesesCaucao            Int?
taxaLimpeza            Float?
taxaServico            Float?

aceitaFinanciamento    Boolean @default(false)
aceitaPermuta          Boolean @default(false)
aceitaProposta         Boolean @default(true)
imovelQuitado          Boolean @default(false)
saldoDevedor           Float?

aceitaFiador           Boolean @default(false)
aceitaSeguroFianca     Boolean @default(false)
aceitaTituloCapitalizacao Boolean @default(false)
aceitaCaucao           Boolean @default(false)
contratoMinimoMeses    Int?
```

---

## Campos residenciais

Para tipos como:

- APARTAMENTO
- CASA
- CASA_CONDOMINIO
- COBERTURA
- KITNET
- STUDIO
- CHACARA
- FAZENDA

Exibir campos como:

- quartos
- suítes
- banheiros
- lavabos
- vagas de garagem
- salas
- cozinha
- área de serviço
- varanda
- sacada
- quintal
- piscina
- churrasqueira
- closet
- escritório
- despensa
- depósito
- mobiliado
- semi mobiliado
- aceita pets
- posição solar
- andar
- total de andares
- quantidade de apartamentos por andar
- elevador
- portaria
- segurança 24h

---

## Campos para apartamento, cobertura, kitnet e studio

Exibir somente quando `tipoImovel` for:

- APARTAMENTO
- COBERTURA
- KITNET
- STUDIO

Campos:

- andar
- número do apartamento
- bloco / torre
- possui elevador
- quantidade de elevadores
- posição do apartamento
- sol da manhã
- sol da tarde
- vista livre
- varanda gourmet
- cobertura duplex
- cobertura triplex
- taxa extra de condomínio

---

## Campos para casa e casa em condomínio

Exibir somente quando `tipoImovel` for:

- CASA
- CASA_CONDOMINIO

Campos:

- quantidade de pavimentos
- possui quintal
- possui edícula
- possui piscina
- possui churrasqueira
- possui jardim
- possui área gourmet
- possui portão eletrônico
- possui sistema de segurança
- nome do condomínio
- valor do condomínio
- portaria 24h
- área comum do condomínio

---

## Campos para terreno

Exibir somente quando `tipoImovel` for:

- TERRENO
- AREA_RURAL

Campos:

- área total
- frente do terreno
- fundo do terreno
- lado direito
- lado esquerdo
- topografia
- tipo de solo
- murado
- cercado
- esquina
- aclive
- declive
- plano
- possui água
- possui energia
- possui esgoto
- zoneamento
- permite financiamento
- documentação regularizada

---

## Campos para sala comercial, loja, galpão e prédio comercial

Exibir somente quando `tipoImovel` for:

- SALA_COMERCIAL
- LOJA
- GALPAO
- PREDIO_COMERCIAL

Campos:

- área útil
- área total
- pé direito
- quantidade de salas
- quantidade de banheiros
- vagas de estacionamento
- possui recepção
- possui copa
- possui estoque
- possui vitrine
- possui doca
- acesso para caminhão
- energia trifásica
- mezanino
- elevador de carga
- AVCB
- habite-se
- zoneamento comercial
- permite atividade comercial
- tipo de piso
- fachada

---

## Campos para chácara e fazenda

Exibir somente quando `tipoImovel` for:

- CHACARA
- FAZENDA
- AREA_RURAL

Campos:

- área total
- área em hectares
- área em alqueires
- possui casa sede
- possui casa de caseiro
- possui curral
- possui barracão
- possui poço artesiano
- possui rio
- possui lago
- possui nascente
- possui energia
- possui internet
- possui pomar
- possui pasto
- tipo de acesso
- distância da cidade
- estrada asfaltada
- documentação rural
- CAR
- CCIR
- ITR

---

## Campos de documentação

Adicionar campos para controle interno do corretor:

- documentação regularizada
- possui escritura
- possui matrícula
- possui habite-se
- possui AVCB
- possui planta aprovada
- imóvel financiado
- banco do financiamento
- observações sobre documentação

---

## Campos comerciais e estratégicos para o corretor

Adicionar campos para gestão comercial:

- exclusividade
- data de início da exclusividade
- data de fim da exclusividade
- comissão percentual
- comissão valor fixo
- motivo da venda ou locação
- urgência do proprietário
- margem de negociação
- valor mínimo aceito
- observações internas
- pontos fortes do imóvel
- pontos de atenção
- perfil ideal de cliente
- chave disponível
- local da chave
- autorização para divulgar
- autorização para placa
- autorização para portais
- link do tour virtual
- link do vídeo
- link do anúncio externo

---

## Sugestão de model Prisma atualizado

Criar uma versão melhorada do model `Imovel`, mantendo compatibilidade com os relacionamentos atuais:

- Usuario
- Proprietario
- CaracteristicaImovel
- InteresseClienteImovel
- Interacao
- FotoImovel

Mas adicionar os novos campos opcionais para permitir cadastro flexível.

Importante: como nem todos os campos se aplicam a todos os tipos de imóveis, os campos específicos devem ser opcionais.

---

## Sugestão de model

```prisma
model Imovel {
  id              String    @id @default(cuid())
  usuarioId       String
  proprietarioId  String?

  // Identificação
  codigoInterno   String?
  titulo          String
  descricao       String?
  observacoesInternas String?
  tipoImovel      TipoImovel
  finalidade      FinalidadeImovel
  status          StatusImovel @default(DISPONIVEL)

  // Valores - venda
  precoVenda              Float?
  aceitaFinanciamento     Boolean @default(false)
  aceitaPermuta           Boolean @default(false)
  aceitaProposta          Boolean @default(true)
  imovelQuitado           Boolean @default(false)
  saldoDevedor            Float?
  valorMinimoAceito       Float?

  // Valores - locação
  valorAluguel            Float?
  valorCondominio         Float?
  valorIptu               Float?
  valorSeguroIncendio     Float?
  valorSeguroFianca       Float?
  valorCaucao             Float?
  mesesCaucao             Int?
  aceitaFiador            Boolean @default(false)
  aceitaSeguroFianca      Boolean @default(false)
  aceitaTituloCapitalizacao Boolean @default(false)
  aceitaCaucao            Boolean @default(false)
  contratoMinimoMeses     Int?
  disponivelApartirDe     DateTime?

  // Valores - temporada
  valorTemporadaDiaria    Float?
  valorTemporadaSemanal   Float?
  valorTemporadaMensal    Float?
  taxaLimpeza             Float?
  taxaServico             Float?
  quantidadeMaxHospedes   Int?
  quantidadeMinDiarias    Int?
  horarioCheckin          String?
  horarioCheckout         String?

  // Endereço
  cep             String?
  estado          String?
  cidade          String
  bairro          String?
  endereco        String?
  numero          String?
  complemento     String?
  latitude        Float?
  longitude       Float?

  // Áreas
  areaUtil        Float?
  areaTotal       Float?
  areaConstruida  Float?
  areaTerreno     Float?
  areaPrivativa   Float?
  areaComum       Float?

  // Características residenciais
  quartos         Int?
  suites          Int?
  banheiros       Int?
  lavabos         Int?
  vagasGaragem    Int?
  salas           Int?
  cozinhas        Int?
  andar           Int?
  totalAndares    Int?
  unidadesPorAndar Int?
  numeroApartamento String?
  bloco           String?

  mobiliado       Boolean @default(false)
  semiMobiliado   Boolean @default(false)
  aceitaPets      Boolean @default(false)
  varanda         Boolean @default(false)
  sacada          Boolean @default(false)
  varandaGourmet  Boolean @default(false)
  quintal         Boolean @default(false)
  piscina         Boolean @default(false)
  churrasqueira   Boolean @default(false)
  areaGourmet     Boolean @default(false)
  closet          Boolean @default(false)
  escritorio      Boolean @default(false)
  despensa        Boolean @default(false)
  deposito        Boolean @default(false)
  areaServico     Boolean @default(false)

  // Condomínio / prédio
  nomeCondominio      String?
  elevador            Boolean @default(false)
  quantidadeElevadores Int?
  portaria            Boolean @default(false)
  portaria24h         Boolean @default(false)
  seguranca24h        Boolean @default(false)
  academia            Boolean @default(false)
  salaoFestas         Boolean @default(false)
  playground          Boolean @default(false)
  quadra              Boolean @default(false)
  sauna               Boolean @default(false)
  coworking           Boolean @default(false)

  // Terreno
  frenteTerreno       Float?
  fundoTerreno        Float?
  ladoDireitoTerreno  Float?
  ladoEsquerdoTerreno Float?
  topografia          TopografiaTerreno?
  tipoSolo            String?
  murado              Boolean @default(false)
  cercado             Boolean @default(false)
  esquina             Boolean @default(false)
  possuiAgua          Boolean @default(false)
  possuiEnergia       Boolean @default(false)
  possuiEsgoto        Boolean @default(false)
  zoneamento          String?

  // Comercial / industrial
  peDireito           Float?
  quantidadeSalas     Int?
  recepcao            Boolean @default(false)
  copa                Boolean @default(false)
  estoque             Boolean @default(false)
  vitrine             Boolean @default(false)
  doca                Boolean @default(false)
  acessoCaminhao      Boolean @default(false)
  energiaTrifasica    Boolean @default(false)
  mezanino            Boolean @default(false)
  elevadorCarga       Boolean @default(false)
  tipoPiso            String?
  fachada             String?

  // Rural
  areaHectares        Float?
  areaAlqueires       Float?
  casaSede            Boolean @default(false)
  casaCaseiro         Boolean @default(false)
  curral              Boolean @default(false)
  barracao            Boolean @default(false)
  pocoArtesiano       Boolean @default(false)
  rio                 Boolean @default(false)
  lago                Boolean @default(false)
  nascente            Boolean @default(false)
  pomar               Boolean @default(false)
  pasto               Boolean @default(false)
  tipoAcesso          String?
  distanciaCidadeKm   Float?
  estradaAsfaltada    Boolean @default(false)

  // Documentação
  documentacaoRegularizada Boolean @default(false)
  possuiEscritura          Boolean @default(false)
  possuiMatricula          Boolean @default(false)
  possuiHabiteSe           Boolean @default(false)
  possuiAvcb               Boolean @default(false)
  possuiPlantaAprovada     Boolean @default(false)
  possuiCar                Boolean @default(false)
  possuiCcir               Boolean @default(false)
  possuiItr                Boolean @default(false)
  observacoesDocumentacao  String?

  // Estratégia comercial
  exclusividade            Boolean @default(false)
  inicioExclusividade      DateTime?
  fimExclusividade         DateTime?
  comissaoPercentual       Float?
  comissaoValorFixo        Float?
  motivoVendaLocacao       String?
  urgenciaProprietario     UrgenciaNegociacao?
  margemNegociacao         Float?
  pontosFortes             String?
  pontosAtencao            String?
  perfilClienteIdeal       String?

  // Divulgação
  destaques                String?
  tags                     String?
  autorizadoDivulgacao     Boolean @default(true)
  autorizadoPlaca          Boolean @default(false)
  autorizadoPortais        Boolean @default(true)
  linkTourVirtual          String?
  linkVideo                String?
  linkAnuncioExterno       String?

  // Chaves / visita
  chaveDisponivel          Boolean @default(false)
  localChave               String?
  instrucoesVisita         String?

  // Controle
  origemCadastro           OrigemCadastroImovel?
  dataCaptacao             DateTime?
  arquivadoEm              DateTime?
  criadoEm                 DateTime @default(now())
  atualizadoEm             DateTime @updatedAt

  usuario         Usuario       @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  proprietario    Proprietario? @relation(fields: [proprietarioId], references: [id], onDelete: SetNull)
  caracteristicas CaracteristicaImovel[]
  interesses      InteresseClienteImovel[]
  interacoes      Interacao[]
  fotos           FotoImovel[]

  @@index([usuarioId])
  @@index([proprietarioId])
  @@index([tipoImovel])
  @@index([finalidade])
  @@index([status])
  @@index([cidade])
  @@index([bairro])
  @@map("imoveis")
}
```

---

## Novos enums sugeridos

```prisma
enum FinalidadeImovel {
  VENDA
  LOCACAO
  VENDA_LOCACAO
  TEMPORADA
}

enum TipoImovel {
  APARTAMENTO
  CASA
  CASA_CONDOMINIO
  TERRENO
  SALA_COMERCIAL
  LOJA
  GALPAO
  CHACARA
  FAZENDA
  COBERTURA
  KITNET
  STUDIO
  PREDIO_COMERCIAL
  AREA_RURAL
  OUTRO
}

enum TopografiaTerreno {
  PLANO
  ACLIVE
  DECLIVE
  IRREGULAR
}

enum UrgenciaNegociacao {
  BAIXA
  MEDIA
  ALTA
  URGENTE
}

enum OrigemCadastroImovel {
  MANUAL
  INDICACAO
  CAPTACAO_ATIVA
  PORTAL
  SITE
  REDES_SOCIAIS
  WHATSAPP
  OUTRO
}
```

---

## Regras de interface

Na tela de cadastro/edição de imóvel, implementar lógica condicional:

### Ao selecionar `finalidade`

Se `VENDA`, mostrar seção:

- Valores de venda
- Financiamento
- Permuta
- Documentação
- Negociação

Se `LOCACAO`, mostrar seção:

- Valores de locação
- Garantias locatícias
- Contrato
- Disponibilidade

Se `VENDA_LOCACAO`, mostrar ambas as seções:

- Venda
- Locação

Se `TEMPORADA`, mostrar seção:

- Valores por diária, semana e mês
- Taxas
- Hóspedes
- Regras de check-in/checkout

---

### Ao selecionar `tipoImovel`

Se `APARTAMENTO`, `COBERTURA`, `KITNET` ou `STUDIO`, mostrar:

- andar
- bloco
- apartamento
- elevador
- condomínio
- varanda
- vaga
- portaria
- lazer do condomínio

Se `CASA` ou `CASA_CONDOMINIO`, mostrar:

- quintal
- piscina
- churrasqueira
- edícula
- pavimentos
- área gourmet
- portão eletrônico
- segurança

Se `TERRENO`, mostrar:

- frente
- fundo
- laterais
- topografia
- solo
- zoneamento
- água
- energia
- esgoto

Se `SALA_COMERCIAL`, `LOJA`, `GALPAO` ou `PREDIO_COMERCIAL`, mostrar:

- salas
- banheiros
- recepção
- copa
- estoque
- vitrine
- doca
- pé direito
- energia trifásica
- AVCB
- habite-se

Se `CHACARA`, `FAZENDA` ou `AREA_RURAL`, mostrar:

- hectares
- alqueires
- casa sede
- casa caseiro
- poço
- rio
- lago
- curral
- barracão
- CAR
- CCIR
- ITR

---

## Ajustar API

Atualizar as rotas:

- `POST /api/imoveis`
- `PUT /api/imoveis/[id]`
- `GET /api/imoveis`
- `GET /api/imoveis/[id]`

A API deve aceitar os novos campos, validar os campos obrigatórios conforme finalidade e tipo do imóvel, e salvar somente os campos enviados.

---

## Ajustar listagem de imóveis

Na listagem `/imoveis`, atualizar a interface `Imovel` para incluir os novos campos principais.

A listagem deve continuar exibindo:

- foto de capa
- código interno
- status
- tipo
- finalidade
- valor principal
- proprietário
- condomínio
- IPTU
- área
- quartos
- banheiros
- vagas
- bairro
- cidade
- endereço

Mas o valor principal deve ser calculado assim:

- Se finalidade for `VENDA`, mostrar `precoVenda`
- Se finalidade for `LOCACAO`, mostrar `valorAluguel`
- Se finalidade for `VENDA_LOCACAO`, mostrar os dois valores
- Se finalidade for `TEMPORADA`, mostrar `valorTemporadaDiaria`

---

## Ajustar filtros

Adicionar filtros na página `/imoveis`:

- finalidade
- tipo de imóvel
- status
- cidade
- bairro
- faixa de preço
- quartos
- vagas
- área mínima
- área máxima
- mobiliado
- aceita financiamento
- aceita permuta
- aceita pets
- documentação regularizada

---

## Validações importantes

Implementar validações:

- Se finalidade for `VENDA`, exigir `precoVenda`
- Se finalidade for `LOCACAO`, exigir `valorAluguel`
- Se finalidade for `TEMPORADA`, exigir `valorTemporadaDiaria`
- Se tipo for `TERRENO`, exigir `areaTotal`
- Se tipo for `APARTAMENTO`, permitir `valorCondominio`
- Se tipo for `GALPAO`, permitir `peDireito`, `doca`, `energiaTrifasica`
- Se tipo for `FAZENDA`, permitir `areaHectares`, `possuiCar`, `possuiCcir`, `possuiItr`

---

## Resultado esperado

Quero que o sistema fique mais profissional para corretores individuais, permitindo um cadastro completo, mas sem poluir a tela.

A tela de cadastro deve mostrar apenas os campos relevantes conforme o usuário seleciona `finalidade` e `tipoImovel`.

Também quero que o schema Prisma fique bem organizado, escalável e preparado para futuras melhorias.

---

## Observação importante

Recomendo trocar o campo atual `preco` por campos separados como:

- `precoVenda`
- `valorAluguel`
- `valorTemporadaDiaria`

Isso evita confusão quando o imóvel pode ser venda, locação ou temporada.
