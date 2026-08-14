# Etapas do Desenvolvimento

---

## [Etapa 0] Conceituação e Documentação Base

**Status:** Concluído

### O que foi feito:

* Definição do produto no estilo hub multi-eventos, unindo cinema, shows, teatro, workshops e outros tipos de eventos.
* Mapeamento das permissões por perfil:

  * Organizador;
  * Cliente;
  * Portaria.
* Especificação da arquitetura técnica:

  * Node.js + Express;
  * React + Vite + Tailwind CSS;
  * Prisma ORM;
  * SQLite.
* Desenho inicial do Modelo de Dados Relacional.
* Definição inicial da possibilidade de integração com APIs externas, especialmente TMDb e Ticketmaster.

### Uso de IA nesta Etapa:

* **Geração de Conteúdo:** auxílio na estruturação do documento de PRD e definição técnica inicial.
* **Decisões Humanas:** definição do modelo de produto no estilo hub multi-eventos, escolha da stack e decisão de trabalhar futuramente com TMDb e Ticketmaster.

---

## [Etapa 1] Setup do Monorepo/Projeto, Banco de Dados & Seeds

**Status:** Concluído

### O que foi feito:

* Estruturação do repositório em formato monorepo (`backend/` e `frontend/`).
* Inicialização e configuração do ambiente Node.js.
* Instalação das principais dependências do backend:

  * `express`;
  * `@prisma/client`;
  * `bcryptjs`;
  * `cors`;
  * `dotenv`.
* Configuração do Prisma ORM utilizando SQLite.
* Criação e ajuste inicial do modelo de dados em `prisma/schema.prisma`.
* Utilização de tipos nativos de texto compatíveis com SQLite para papéis e status.
* Configuração do arquivo `.env` com a variável `DATABASE_URL`.
* Execução das primeiras migrations do banco de dados local.
* Criação do script inicial de seeds em `prisma/seed.js`.
* População inicial da base com:

  * 1 Organizador (`organizador@teste.com`);
  * 2 Clientes (`cliente1@teste.com` e `cliente2@teste.com`);
  * 1 Usuário de Portaria (`portaria@teste.com`);
  * 1 evento inicial baseado em *Filhos do Éden: Paraíso Perdido*.

### Uso de IA nesta Etapa:

* **Geração de Código:** estruturação inicial do schema Prisma e do script de seeds.
* **Resolução de Problemas:** diagnóstico e correção de incompatibilidade de `enum` do Prisma com SQLite e auxílio na configuração do comando de seed.
* **Decisões Humanas / Manuais:** escolha e personalização do evento inicial, execução das migrations via CLI do Prisma e criação manual do arquivo `.env`.

---

## [Etapa 2] Back-End: Autenticação JWT & RBAC (3 Perfis)

**Status:** Concluído

### O que foi feito:

* Instalação e configuração da biblioteca `jsonwebtoken`.
* Configuração das variáveis de ambiente:

  * `JWT_SECRET`;
  * `JWT_EXPIRES_IN`;
  * `PORT`.
* Manutenção dos valores sensíveis apenas no `.env` local.
* Criação do `.env.example` para documentação das variáveis necessárias.
* Configuração do servidor Express com:

  * CORS;
  * leitura de JSON;
  * carregamento das variáveis de ambiente.
* Criação de uma instância reutilizável do Prisma Client em `src/lib/prisma.js`.
* Implementação do endpoint:

```text
POST /auth/register
```

* Restrição do cadastro público ao perfil `CLIENT`.
* Proteção contra autoatribuição dos perfis `ORGANIZER` e `CHECKIN`.
* Implementação de política de senha forte para novos cadastros:

  * mínimo de 8 caracteres;
  * pelo menos uma letra maiúscula;
  * pelo menos uma letra minúscula;
  * pelo menos um número;
  * pelo menos um caractere especial.
* Armazenamento das senhas utilizando hash com `bcryptjs`.
* Normalização dos e-mails antes de consulta e persistência.
* Validação de e-mail duplicado.
* Validação de campos obrigatórios.
* Implementação do endpoint:

```text
POST /auth/login
```

* Validação das credenciais com `bcrypt.compare`.
* Geração de JWT assinado contendo somente:

  * `id`;
  * `role`.
* Configuração de expiração do token.
* Criação do middleware de autenticação com `jwt.verify()`.
* Implementação da rota protegida:

```text
GET /auth/me
```

* Criação de middleware RBAC para os três perfis:

  * `ORGANIZER`;
  * `CLIENT`;
  * `CHECKIN`.
* Criação de rotas temporárias de teste para validação das permissões de cada perfil.
* Tratamento dos principais cenários HTTP:

  * `400 Bad Request`;
  * `401 Unauthorized`;
  * `403 Forbidden`;
  * `409 Conflict`.
* Testes manuais dos endpoints utilizando requisições REST via PowerShell.
* Validação de que senha e `passwordHash` não são expostos nas respostas da API nem armazenados no payload JWT.

### Observação sobre as senhas de teste:

Novos usuários cadastrados pelo endpoint `/auth/register` seguem a política de senha forte definida nesta etapa.

Os usuários de demonstração criados pelos seeds utilizam:

```text
123456
```

Essas credenciais são mantidas para facilitar os testes dos três perfis.

A política de senha forte é aplicada ao fluxo de novos cadastros e não altera retroativamente usuários previamente criados pelo seed.

### Testes realizados:

* Cadastro válido de Cliente.
* Rejeição de senha fora da política.
* Rejeição de e-mail duplicado.
* Rejeição de campos obrigatórios ausentes.
* Tentativa de cadastro enviando `role: "ORGANIZER"`, confirmando criação como `CLIENT`.
* Login válido.
* Login com senha incorreta.
* Login com usuário inexistente.
* Login com campos obrigatórios ausentes.
* Login dos perfis `ORGANIZER`, `CLIENT` e `CHECKIN`.
* Inspeção do payload JWT.
* Confirmação dos campos:

  * `id`;
  * `role`;
  * `iat`;
  * `exp`.
* Acesso com JWT válido.
* Rejeição de acesso sem token.
* Rejeição de token inválido.
* Rejeição de header fora do padrão `Bearer`.
* Testes de acesso autorizado e negado conforme o papel do usuário.

### Uso de IA nesta Etapa:

* **Geração de Código:** auxílio na estruturação dos controllers, rotas, JWT e middlewares.
* **Resolução de Problemas:** diagnóstico de incompatibilidade entre CommonJS e ES Modules, conflito da porta `3000`, importação do login e testes REST.
* **Revisão e Segurança:** auxílio na política de senhas, RBAC, respostas HTTP e proteção contra autoatribuição de privilégios.
* **Decisões Humanas / Manuais:** definição da política de senha forte, execução manual dos testes, validação das respostas e decisão de manter as credenciais simplificadas dos usuários seed.

---

## [Etapa 3] Modelagem Avançada de Eventos, Ingressos, Setores, Modalidades e Lotes

**Status:** Concluído

### Ajuste de Escopo:

O escopo inicial previa que esta etapa já incluísse CRUD completo de eventos e integrações com Ticketmaster e TMDb.

Durante o desenvolvimento, foi identificada a necessidade de ampliar e refinar primeiro a modelagem de eventos e ingressos para evitar uma estrutura rígida e retrabalho nas etapas seguintes.

Por isso, a Etapa 3 foi concentrada na criação de uma arquitetura de dados flexível e preparada para múltiplos formatos de evento.

As integrações externas e funcionalidades de gerenciamento que dependem dessa estrutura permanecem previstas para as etapas posteriores do desenvolvimento.

### O que foi feito:

* Remodelagem completa da estrutura de eventos e ingressos.
* Criação de templates globais reutilizáveis para:

  * categorias de eventos;
  * setores;
  * modalidades;
  * categorias de preço;
  * grupos de cota.
* Separação entre o conceito global de uma opção e sua configuração específica dentro de cada evento.

Por exemplo:

```text
Template global:
PISTA

Evento A:
PISTA
Capacidade: 800

Evento B:
PISTA
Capacidade: 1500
```

* Preparação da arquitetura para permitir que diferentes Organizadores utilizem as mesmas opções globais sem duplicá-las.
* Preparação para permitir criação de novas opções personalizadas posteriormente.
* Definição de unicidade global dos nomes por tipo de catálogo.
* Definição de normalização obrigatória dos nomes:

  * remoção de acentos;
  * conversão para letras maiúsculas;
  * remoção de espaços excedentes;
  * padronização antes da comparação e persistência.
* Preparação para evitar duplicidades como:

```text
CAMAROTE
camarote
Cámarote
 CAMAROTE
```

Todos devem representar:

```text
CAMAROTE
```

### Categorias globais de eventos:

Foram preparadas categorias como:

* `SHOWS E FESTAS`;
* `CINEMA`;
* `TEATRO E ESPETACULOS`;
* `LITERATURA | LANCAMENTOS`;
* `CURSOS | PALESTRAS | WORKSHOPS`;
* `COMEDIA | STAND UP`;
* `ESPORTES`.

Novas categorias poderão ser adicionadas futuramente sem necessidade de mudança estrutural no banco.

### Setores:

A modelagem permite setores como:

* `PISTA`;
* `CAMAROTE`;
* `CADEIRA SUPERIOR`;
* `CADEIRA INFERIOR`;
* `PLATEIA`;
* `SALA DE CINEMA`;
* `ENTRADA GERAL`.

Os setores não são enums rígidos.

Novos setores, como:

```text
LOUNGE VIP
AREA PREMIUM
ARQUIBANCADA
```

poderão ser criados e reutilizados globalmente.

### Modalidades:

Setores podem possuir modalidades próprias.

Exemplo:

```text
CAMAROTE
├── NORMAL
├── OPEN BAR
├── OPEN FOOD
└── OPEN BAR + FOOD
```

As modalidades são independentes e opcionais.

Também foram incluídas modalidades específicas para eventos especiais, como:

```text
AUTOGRAFO + LIVRO
AUTOGRAFO + FOTO + LIVRO
```

### Formas de ocupação:

Foram definidos dois comportamentos principais:

#### `QUANTITY`

Controle baseado somente na quantidade disponível.

Exemplos:

* Pista;
* Entrada Geral;
* Workshops;
* pacotes especiais;
* sessões de autógrafos.

#### `SEAT`

Controle utilizando assentos individuais.

Exemplos:

* cinema;
* teatro;
* cadeiras numeradas;
* determinadas modalidades de camarote.

Os assentos passaram a pertencer à modalidade do setor (`EventSectorModality`), evitando que modalidades diferentes dentro do mesmo setor compartilhem acidentalmente o mesmo assento.

### Capacidade:

A estrutura possui controle hierárquico de capacidade:

```text
Evento
↓
Setor
↓
Modalidade
↓
Lote
```

A capacidade total do evento representa seu limite físico máximo.

As configurações internas deverão respeitar esse limite.

Exemplo:

```text
EPICA
Capacidade total: 2000

PISTA:             800
CAMAROTE:          200
CADEIRA SUPERIOR:  500
CADEIRA INFERIOR:  500
                    ---
                   2000
```

A validação final dessas capacidades durante reservas e vendas será realizada transacionalmente nas etapas correspondentes.

### Categorias de preço:

Foram configuradas inicialmente:

* `INTEIRA`;
* `MEIA`;
* `MEIA SOCIAL`;
* `VALOR UNICO`.

As categorias de preço **não possuem estoque próprio**.

O estoque pertence à modalidade e aos lotes.

Isso evita reservar previamente uma quantidade fixa para cada categoria.

### Regra de meia-entrada:

Foi criado o grupo global:

```text
MEIA ENTRADA
```

com:

```text
maxPercentage = 50
```

Pertencem a ele:

```text
MEIA
MEIA SOCIAL
```

A regra definida é:

```text
MEIA + MEIA SOCIAL <= 50%
```

A soma das duas categorias poderá ocupar no máximo 50% da capacidade aplicável.

`INTEIRA` não possui cota previamente reservada.

Exemplo com capacidade 800:

```text
300 MEIA
100 MEIA SOCIAL
400 INTEIRA

Total = 800
Meia Entrada = 400
```

Configuração válida.

Já:

```text
300 MEIA
150 MEIA SOCIAL
350 INTEIRA
```

não será válida para uma capacidade de 800 porque:

```text
MEIA + MEIA SOCIAL = 450
```

e ultrapassa o limite de 50%.

Essa regra vale para todos os tipos de evento.

### Lotes:

Os lotes possuem estoque compartilhado entre as categorias de preço.

Exemplo:

```text
PISTA
Capacidade: 800

LOTE 1
Quantidade: 400
├── INTEIRA
├── MEIA
└── MEIA SOCIAL

LOTE 2
Quantidade: 400
├── INTEIRA
├── MEIA
└── MEIA SOCIAL
```

Cada categoria pode possuir um preço diferente dentro do mesmo lote.

Exemplo:

```text
LOTE 1 — 400 ingressos

INTEIRA      R$ 220,00
MEIA         R$ 110,00
MEIA SOCIAL  R$ 140,00
```

As três categorias compartilham os mesmos 400 ingressos.

### Progressão proporcional dos lotes:

Foi definida uma regra para permitir progressão independente de lotes conforme grupos sujeitos a limites proporcionais.

Exemplo:

```text
LOTE 1
Quantidade: 400

MEIA ENTRADA:
limite máximo = 200
```

Se forem vendidos:

```text
MEIA:        120
MEIA SOCIAL:  80
```

o grupo `MEIA ENTRADA` atinge 200 ingressos.

A partir desse momento:

```text
MEIA
MEIA SOCIAL
```

poderão utilizar os preços do `LOTE 2`, mesmo que ainda existam ingressos do `LOTE 1` disponíveis para `INTEIRA`.

Assim, será possível existir simultaneamente:

```text
INTEIRA      → LOTE 1
MEIA         → LOTE 2
MEIA SOCIAL  → LOTE 2
```

A implementação transacional dessa regra será realizada na etapa responsável por reservas e checkout.

### Valores monetários:

Valores financeiros passaram a ser armazenados em centavos.

Exemplos:

```text
R$ 220,00 → 22000
R$ 89,90  → 8990
```

Essa estratégia evita problemas de precisão com números decimais.

### Taxa de serviço:

Foi definida uma taxa de serviço padrão de:

```text
12%
```

sobre o valor dos ingressos vendidos online.

Ela será aplicada no checkout.

O preço-base cadastrado pelo Organizador não será alterado.

O pedido deverá registrar futuramente:

```text
subtotal
taxa de serviço
total
```

para preservar o histórico financeiro da compra.

### Eventos de demonstração:

O seed foi ampliado para criar quatro eventos.

#### 1. Filhos do Éden: Paraíso Perdido

Categoria:

```text
TEATRO E ESPETACULOS
```

Utilizado para demonstrar evento teatral com controle por assento e lotes.

#### 2. Epica - Live in Brazil

Categoria:

```text
SHOWS E FESTAS
```

Capacidade total:

```text
2000
```

Setores:

```text
PISTA             800
CAMAROTE          200
CADEIRA SUPERIOR  500
CADEIRA INFERIOR  500
```

A Pista utiliza controle por quantidade.

O Camarote demonstra modalidades como:

```text
NORMAL
OPEN BAR
OPEN FOOD
OPEN BAR + FOOD
```

Cadeira Superior e Cadeira Inferior utilizam controle por assento.

O evento também demonstra múltiplos lotes e preços diferentes.

#### 3. Lançamento e Autógrafos — Enciclopédia Serial Killers: A Maldade de A a Z

Categoria:

```text
LITERATURA | LANCAMENTOS
```

Evento demonstrativo inspirado em sessão com Harold Schechter.

Modalidades:

```text
AUTOGRAFO + LIVRO
AUTOGRAFO + FOTO + LIVRO
```

Controle por quantidade.

#### 4. Amanhecer - Parte 1 | Relançamento

Categoria:

```text
CINEMA
```

Capacidade:

```text
120
```

Controle por assento.

Categorias comerciais disponíveis incluem:

```text
INTEIRA
MEIA
MEIA SOCIAL
```

### Seeds reutilizáveis:

Os quatro eventos de demonstração utilizam identificadores controlados.

Ao executar novamente o seed:

* os eventos de demonstração são recriados;
* não são duplicados;
* eventos futuramente cadastrados manualmente por Organizadores não deverão ser apagados.

### Migrations:

Foram criadas e aplicadas migrations correspondentes à remodelagem do banco.

Também foi regenerado o Prisma Client após as alterações.

### Testes realizados:

* `npx prisma format`.
* `npx prisma validate`.
* Geração do Prisma Client.
* Criação e aplicação das migrations.
* Execução do novo seed.
* Reexecução do seed.
* Confirmação de que o banco continua com quatro eventos de demonstração após nova execução.
* Validação dos setores do evento Epica.
* Validação da capacidade da Pista em 800.
* Validação de dois lotes de 400 na Pista.
* Validação dos preços de:

  * Inteira;
  * Meia;
  * Meia Social.
* Confirmação de que as categorias compartilham o estoque do lote.
* Validação do grupo `MEIA ENTRADA`.
* Confirmação de `maxPercentage = 50`.
* Confirmação de que:

  * `MEIA` pertence ao grupo;
  * `MEIA SOCIAL` pertence ao grupo;
  * `INTEIRA` não pertence ao grupo.
* Inspeção visual dos dados utilizando Prisma Studio.

### Recursos preparados para etapas futuras:

A modelagem ficou preparada para:

* CRUD completo de eventos pelo Organizador;
* criação de novas categorias;
* criação de novos setores;
* criação de novas modalidades;
* criação de categorias de preço adicionais;
* configuração personalizada de capacidades;
* configuração de assentos;
* lotes configuráveis;
* integração futura com Ticketmaster;
* integração futura com TMDb;
* descoberta de eventos por localização;
* filtros por categoria;
* checkout;
* taxa de serviço;
* reservas;
* QR Code;
* cancelamento e devolução ao estoque.

### Uso de IA nesta Etapa:

* **Modelagem de Dados:** apoio na análise e remodelagem das entidades necessárias para suportar eventos flexíveis.
* **Geração e Refatoração de Código:** auxílio na construção e revisão do `schema.prisma`, migrations e `seed.js`.
* **Resolução de Problemas:** diagnóstico de erros de sintaxe do Prisma, incompatibilidades de relações e ajustes das migrations.
* **Testes:** auxílio na criação de consultas para inspeção e validação dos dados persistidos.
- **Decisões Humanas / Manuais:** definição das regras de negócio para capacidade, setores, modalidades, categorias de preço, meia-entrada, meia social, lotes, progressão proporcional, taxa de serviço e escolha dos eventos de demonstração; execução e validação manual dos testes do schema, migrations, seeds, reexecução sem duplicidade, capacidades, lotes, preços compartilhados e grupo de cota `MEIA ENTRADA`.

---

# [Etapa 4] Reservas, Checkout, Pagamento Simulado e QR Code

**Status:** Concluído

## Objetivo da Etapa

Implementar o fluxo completo entre a seleção de ingressos e a utilização do ingresso no evento, contemplando:

- início de checkout;
- controle de quantidade máxima por compra;
- tratamento diferente para ingressos por quantidade e por assento;
- reserva temporária de assentos;
- expiração de reservas;
- concorrência entre compradores;
- validação de estoque;
- capacidades hierárquicas;
- controle de lotes;
- controle conjunto de cotas;
- pagamento simulado;
- taxa de serviço;
- criação de pedidos;
- criação de ingressos;
- QR Code individual;
- compartilhamento público seguro;
- validação do ingresso pela Portaria;
- proteção contra reutilização do QR Code;
- autorização por perfil.

A implementação foi construída sobre a modelagem flexível desenvolvida na Etapa 3.

---

# 1. Regras de negócio definidas para o checkout

Antes da implementação foram definidas regras diferentes de acordo com o modo de ocupação da modalidade.

Foram utilizados dois modos:

```text
QUANTITY
SEAT
```

Esses modos possuem comportamentos diferentes durante o checkout.

---

# 2. Modalidade `QUANTITY`

`QUANTITY` representa modalidades nas quais o comprador escolhe uma quantidade de ingressos, mas não escolhe lugares específicos.

Exemplos utilizados nos eventos de demonstração:

- Pista;
- Entrada Geral;
- modalidades sem assento numerado.

## Regra de reserva

Foi decidido que iniciar um checkout `QUANTITY` **não reserva nem bloqueia estoque**.

Isso significa que vários clientes podem iniciar simultaneamente checkouts para os mesmos ingressos.

Exemplo:

```text
Restam 10 ingressos.

Cliente A inicia checkout de 10.
Cliente B inicia checkout de 10.

Os dois checkouts podem ser criados.
```

A disponibilidade definitiva é verificada somente quando cada usuário tenta finalizar a compra.

O primeiro que concluir com estoque disponível consegue comprar.

O segundo recebe erro de indisponibilidade caso o estoque já tenha acabado.

Portanto:

```text
QUANTITY
→ intenção de compra no checkout
→ não bloqueia estoque
→ disponibilidade real verificada na conclusão
```

Essa decisão evita a retenção artificial de grandes quantidades de ingressos por usuários que iniciam checkout e abandonam a compra.

## Expiração

Como `QUANTITY` não bloqueia estoque, a expiração de 10 minutos não é necessária como mecanismo de liberação de inventário.

---

# 3. Modalidade `SEAT`

`SEAT` representa modalidades com lugares individualmente identificados.

Exemplos:

- cinema;
- teatro;
- cadeiras numeradas;
- camarotes configurados com lugares.

Nesse caso, permitir que dois clientes selecionem simultaneamente o mesmo lugar causaria conflito.

Por isso, foi implementado bloqueio temporário.

Fluxo:

```text
Cliente seleciona assento
        ↓
checkout criado
        ↓
assento fica indisponível
        ↓
prazo máximo de 10 minutos
        ↓
pagamento aprovado
        OU
expiração/cancelamento
```

---

# 4. Reserva temporária de assentos

Quando um checkout `SEAT` é iniciado:

- o assento precisa existir;
- precisa pertencer à modalidade correspondente ao preço selecionado;
- precisa estar disponível;
- é associado ao `CheckoutItem`;
- `Seat.isAvailable` passa para `false`;
- a sessão recebe `expiresAt`.

O bloqueio é temporário enquanto a compra não é concluída.

---

# 5. Prazo de 10 minutos

Foi definido:

```text
10 minutos
```

como tempo máximo da reserva de assentos.

Todos os assentos pertencentes à mesma sessão compartilham o mesmo prazo.

Exemplo:

```text
Checkout criado às 14:18

expiresAt:
14:28
```

O prazo pertence à sessão de checkout e não individualmente a cada assento.

---

# 6. Comportamento após expiração

Quando uma sessão com assentos ultrapassa `expiresAt`:

```text
ACTIVE
→ EXPIRED
```

Os assentos temporariamente associados àquela sessão são liberados novamente, desde que não exista ingresso definitivo válido ou utilizado associado a eles.

Assim:

```text
isAvailable = true
```

e outro cliente pode selecionar os lugares.

---

# 7. Estado interno da reserva não exposto ao usuário

Foi decidido que o Front-End não precisa diferenciar:

```text
assento vendido
```

de:

```text
assento temporariamente reservado por outro usuário
```

Para o comprador, ambos aparecem simplesmente como:

```text
indisponível
```

Essa distinção permanece como regra interna do backend.

Quando uma reserva expira, o assento volta a aparecer como disponível.

---

# 8. Estrutura de `Seat`

A entidade `Seat` utilizada na Etapa 4 possui:

```text
id
eventSectorModalityId
label
normalizedLabel
isAvailable
createdAt
updatedAt
```

Relacionamentos:

```text
EventSectorModality
Ticket[]
CheckoutItem[]
```

Foi mantida a restrição:

```text
@@unique([eventSectorModalityId, normalizedLabel])
```

impedindo duplicidade do mesmo identificador de assento dentro da mesma modalidade.

Também foi mantido índice por:

```text
eventSectorModalityId
```

---

# 9. Significado de `Seat.isAvailable`

Foi mantida a propriedade:

```text
isAvailable
```

como representação operacional da disponibilidade do assento.

Durante a Etapa 4 ela passou a atender tanto:

- indisponibilidade temporária durante checkout;
- indisponibilidade definitiva após venda.

A liberação após expiração verifica a existência de Ticket antes de tornar o assento disponível novamente.

---

# 10. Criação de `CheckoutSession`

Foi adicionada a entidade:

```text
CheckoutSession
```

com os campos:

```text
id
clientId
status
expiresAt
createdAt
updatedAt
```

Relacionamentos:

```text
client → User
items → CheckoutItem[]
```

Índices:

```text
clientId
status
expiresAt
```

---

# 11. Estados de `CheckoutSession`

Foram previstos:

```text
ACTIVE
COMPLETED
EXPIRED
CANCELLED
```

## `ACTIVE`

Checkout iniciado e ainda utilizável.

## `COMPLETED`

Compra concluída com sucesso.

## `EXPIRED`

Reserva com assentos ultrapassou o tempo permitido.

## `CANCELLED`

Checkout cancelado, incluindo cenário de pagamento recusado.

---

# 12. Campo `expiresAt`

`expiresAt` é opcional:

```text
DateTime?
```

A razão é a diferença entre `SEAT` e `QUANTITY`.

Para sessões contendo assentos:

```text
expiresAt != null
```

Para `QUANTITY`, não é necessário utilizar expiração como mecanismo de bloqueio de estoque.

---

# 13. Criação de `CheckoutItem`

Foi adicionada a entidade:

```text
CheckoutItem
```

com:

```text
id
checkoutSessionId
ticketBatchPriceId
seatId
quantity
createdAt
updatedAt
```

Relacionamentos:

```text
checkoutSession
ticketBatchPrice
seat
```

Índices:

```text
checkoutSessionId
ticketBatchPriceId
seatId
```

---

# 14. Representação de `QUANTITY` no `CheckoutItem`

Para ingressos por quantidade:

```text
seatId = null
quantity >= 1
```

O registro representa intenção de compra.

Não representa reserva definitiva de estoque.

---

# 15. Representação de `SEAT` no `CheckoutItem`

Para ingressos com assento:

```text
seatId = ID do assento
quantity = 1
```

Cada assento selecionado é representado individualmente.

Isso permite:

- selecionar vários lugares;
- validar cada assento;
- bloquear lugares individualmente;
- relacionar posteriormente cada Ticket ao assento correspondente.

---

# 16. Limite máximo de ingressos por checkout

Foi definida a regra:

```text
máximo de 10 ingressos por checkout
```

Esse limite considera o checkout inteiro.

Não é:

```text
10 por categoria
```

nem:

```text
10 por lote
```

nem:

```text
10 por setor
```

É:

```text
10 ingressos no total da compra
```

---

# 17. Limite entre categorias

O limite foi testado utilizando categorias diferentes.

Exemplo conceitual:

```text
5 INTEIRA
+
5 MEIA
=
10
```

Permitido.

Adicionar mais um ingresso:

```text
11
```

é rejeitado.

---

# 18. Limite entre lotes

O limite também foi validado entre preços pertencentes a lotes diferentes.

Portanto, não é possível contornar o limite selecionando ingressos de vários lotes.

---

# 19. Limite em `SEAT`

Para assentos:

```text
10 assentos
→ permitido

11 assentos
→ bloqueado
```

Cada `CheckoutItem` de assento equivale a um ingresso.

---

# 20. Mensagem para limite excedido

Foi validada a resposta:

```text
É permitido comprar no máximo 10 ingressos por vez.
```

---

# 21. Responsabilidade futura do Front-End

Além da validação obrigatória no backend, ficou definido que o Front-End deverá:

- informar visualmente o limite máximo;
- acompanhar quantos ingressos já foram selecionados;
- impedir a seleção do 11º ingresso;
- não depender apenas do erro retornado pela API.

A validação do backend permanece obrigatória por segurança.

---

# 22. Geração automática de assentos no seed

Os seeds foram ampliados para criar assentos para modalidades `SEAT`.

A quantidade criada acompanha:

```text
EventSectorModality.capacity
```

Modalidades `QUANTITY` não recebem registros de `Seat`.

---

# 23. Assentos gerados nos eventos de demonstração

Foram validados:

### Teatro — Filhos do Éden: Paraíso Perdido

```text
PLATEIA
NORMAL
SEAT
capacidade = 300
assentos = 300
```

### Epica - Live in Brazil

```text
PISTA
NORMAL
QUANTITY
capacidade = 800
assentos = 0
```

```text
CAMAROTE
NORMAL
SEAT
capacidade = 50
assentos = 50
```

```text
CAMAROTE
OPEN BAR
SEAT
capacidade = 50
assentos = 50
```

```text
CAMAROTE
OPEN FOOD
SEAT
capacidade = 50
assentos = 50
```

```text
CAMAROTE
OPEN BAR + FOOD
SEAT
capacidade = 50
assentos = 50
```

```text
CADEIRA SUPERIOR
NORMAL
SEAT
capacidade = 500
assentos = 500
```

```text
CADEIRA INFERIOR
NORMAL
SEAT
capacidade = 500
assentos = 500
```

### Evento literário

```text
ENTRADA GERAL
AUTOGRAFO + LIVRO
QUANTITY
capacidade = 150
assentos = 0
```

```text
ENTRADA GERAL
AUTOGRAFO + FOTO + LIVRO
QUANTITY
capacidade = 100
assentos = 0
```

### Cinema — Amanhecer - Parte 1 | Relançamento

```text
SALA DE CINEMA
NORMAL
SEAT
capacidade = 120
assentos = 120
```

---

# 24. Total de assentos gerados

Foi confirmada a criação de:

```text
1620 assentos
```

distribuídos pelas modalidades `SEAT`.

---

# 25. Identificação dos assentos

No seed atual foram utilizados identificadores como:

```text
A1
A2
A3
...
```

O teste no cinema confirmou a existência dos 120 lugares.

A ordenação textual por `normalizedLabel` pode produzir sequência lexical como:

```text
A1
A10
A100
A101
...
```

Essa ordenação observada durante a inspeção não altera a quantidade ou unicidade dos assentos.

---

# 26. Capacidade em eventos criados pelo Organizador

Foi estabelecida uma regra importante para eventos futuros:

**a capacidade não será fixa pelo sistema.**

Quando o `ORGANIZER` criar um novo evento, ele deverá definir a capacidade.

A partir dessa capacidade, o sistema deverá ajustar e validar as configurações inferiores.

Hierarquia:

```text
EVENTO
↓
SETORES
↓
MODALIDADES
↓
LOTES / ASSENTOS
```

---

# 27. Regra de capacidade do evento

`Event.capacity` representa a capacidade física máxima absoluta do evento.

As vendas totais não podem ultrapassar esse valor.

---

# 28. Regra de capacidade dos setores

Cada `EventSector` possui capacidade específica.

A configuração dos setores deve respeitar a capacidade total do evento.

O backend também verifica a quantidade vendida no setor durante a finalização.

---

# 29. Regra de capacidade das modalidades

Cada `EventSectorModality` possui sua própria capacidade.

A venda total daquela modalidade não pode ultrapassar:

```text
EventSectorModality.capacity
```

---

# 30. Regra de capacidade dos lotes

Cada `TicketBatch` possui:

```text
quantity
```

A venda de ingressos daquele lote não pode ultrapassar essa quantidade.

---

# 31. Relação entre capacidade e assentos

Para modalidade:

```text
occupancyMode = SEAT
```

o número de assentos deve acompanhar a capacidade configurada.

Para:

```text
occupancyMode = QUANTITY
```

não são criados assentos.

---

# 32. Ajuste do seed para preservar eventos futuros

Durante a Etapa 4 ocorreu erro ao executar:

```text
npx prisma db seed
```

com:

```text
P2003
Foreign key constraint violated
prisma.event.deleteMany()
```

O problema estava relacionado à tentativa de exclusão de eventos que já possuíam registros dependentes.

O seed foi ajustado.

Também foi preservada a decisão tomada na Etapa 3:

- eventos de demonstração podem ser recriados;
- eventos cadastrados futuramente por Organizadores não devem ser apagados indiscriminadamente pelo seed.

Durante um dos testes, o erro voltou a aparecer porque o arquivo alterado ainda não havia sido salvo antes da execução.

Após salvar corretamente o arquivo, o seed executou normalmente.

---

# 33. Usuários de teste

O seed possui usuários para os três perfis utilizados no fluxo:

```text
ORGANIZER
CLIENT
CHECKIN
```

Foram utilizados:

```text
organizador@teste.com
cliente1@teste.com
cliente2@teste.com
portaria@teste.com
```

O usuário da Portaria possui:

```text
role = CHECKIN
```

---

# 34. Rota para iniciar checkout

Foi implementada:

```text
POST /checkout
```

Protegida por:

```text
authenticate
authorize("CLIENT")
```

Somente clientes autenticados podem iniciar checkout.

---

# 35. Estrutura de entrada do checkout

O checkout recebe itens contendo informações como:

```text
ticketBatchPriceId
quantity
```

e, para assentos, a identificação correspondente do lugar selecionado.

Exemplo de teste `QUANTITY`:

```json
{
  "items": [
    {
      "ticketBatchPriceId": "...",
      "quantity": 10
    }
  ]
}
```

---

# 36. Teste do limite com 10 ingressos

Foi enviado checkout com:

```text
quantity = 10
```

Resultado:

```text
Checkout iniciado com sucesso.
```

A sessão retornou:

```text
status = ACTIVE
totalTickets = 10
maxTickets = 10
```

---

# 37. Teste do limite com 11 ingressos

Foi enviado:

```text
quantity = 11
```

Resultado:

```text
É permitido comprar no máximo 10 ingressos por vez.
```

confirmando o bloqueio no backend.

---

# 38. Testes com preços reais dos lotes

Foram consultados diretamente no Prisma os preços do evento Epica.

Para PISTA / LOTE 1 / MEIA foi confirmado:

```text
priceInCents = 11000
```

Para PISTA / LOTE 2 / INTEIRA:

```text
priceInCents = 26000
```

Essas consultas também confirmaram os vínculos entre:

```text
TicketBatchPrice
TicketBatch
EventTicketCategory
PriceCategoryTemplate
```

---

# 39. Preços validados da Pista do Epica

Foram confirmados:

```text
LOTE 1
INTEIRA      = 22000
MEIA         = 11000
MEIA SOCIAL  = 14000
```

```text
LOTE 2
INTEIRA      = 26000
MEIA         = 13000
MEIA SOCIAL  = 16000
```

Os valores estão armazenados em centavos.

---

# 40. Testes com clientes diferentes

Foram autenticados:

```text
cliente1@teste.com
cliente2@teste.com
```

e armazenados tokens JWT separados:

```text
$token1
$token2
```

Esses dois usuários foram utilizados nos testes de:

- concorrência;
- disputa por assentos;
- tentativa de acesso a QR alheio;
- autorização.

---

# 41. Checkout com múltiplos assentos

Foi validada a criação de uma única sessão contendo múltiplos assentos.

Em um dos testes foram utilizados:

```text
A20
A21
A22
A23
A24
A25
A26
A27
A28
A29
```

Total:

```text
10 assentos
```

Todos ficaram:

```text
isAvailable = false
```

durante a sessão.

---

# 42. Sessão de 10 assentos

A sessão de teste retornou:

```text
status = ACTIVE
```

com:

```text
10 CheckoutItems
```

e cada item:

```text
quantity = 1
seatId != null
```

confirmando a representação individual de lugares.

---

# 43. Teste de assento bloqueado para outro cliente

Enquanto um assento estava associado a checkout ativo de um cliente, o segundo cliente tentou selecioná-lo.

O segundo checkout foi impedido de adquirir o mesmo lugar.

Outro assento ainda disponível pôde ser selecionado normalmente.

---

# 44. Concorrência de assentos

Foi testada disputa entre dois clientes pelo mesmo assento.

A implementação utiliza operação atômica sobre a disponibilidade.

A regra pretendida e validada foi:

```text
2 clientes tentam o mesmo assento
↓
somente 1 consegue bloqueá-lo
```

Isso evita dupla reserva.

---

# 45. Expiração testada manualmente

Para evitar esperar 10 minutos durante os testes, `expiresAt` de uma sessão foi alterado manualmente para um horário anterior ao momento atual.

Exemplo:

```text
status = ACTIVE
expiresAt = passado
```

Depois foi realizada nova operação envolvendo o assento.

---

# 46. Liberação de sessão expirada

O backend detectou a sessão expirada e:

```text
ACTIVE
→ EXPIRED
```

liberou os assentos que não possuíam venda definitiva.

Depois disso, outro cliente conseguiu iniciar nova sessão utilizando o mesmo lugar.

---

# 47. Função `releaseSessionSeats`

Foi criada lógica de serviço para liberar os assentos de uma sessão.

Ela:

1. obtém os `seatId` dos itens;
2. verifica se existe Ticket vendido para cada assento;
3. considera como venda definitiva os estados:

```text
VALID
USED
```

4. somente libera o assento quando não existe Ticket definitivo.

Isso impede que uma limpeza de sessão torne disponível um assento já vendido.

---

# 48. Função `expireCheckoutIfNecessary`

Foi implementada lógica para verificar:

```text
session.expiresAt
```

Quando a sessão expirou:

- chama a liberação dos assentos;
- atualiza a sessão para `EXPIRED`;
- impede sua utilização como checkout ativo.

---

# 49. Finalização do checkout

Foi criada a rota:

```text
POST /checkout/:checkoutId/complete
```

Protegida por:

```text
authenticate
authorize("CLIENT")
```

A finalização é responsável por transformar intenção de compra em:

```text
Order
+
Ticket(s)
```

quando todas as validações forem aprovadas.

---

# 50. Validação novamente na finalização

Foi decidido que não basta validar disponibilidade quando o checkout começa.

A disponibilidade precisa ser validada novamente no momento crítico:

```text
completeCheckout
```

Isso é especialmente importante para `QUANTITY`, que não bloqueia estoque.

---

# 51. Serviço de validação de estoque

Foi criada a lógica:

```text
validateCheckoutStock
```

Ela agrupa as quantidades solicitadas por:

```text
lote
modalidade
setor
evento
grupo de cota
```

antes de concluir a compra.

---

# 52. Estados de Ticket considerados vendidos

Para cálculo de estoque foram definidos:

```text
VALID
USED
```

como estados que continuam consumindo capacidade.

Um ingresso utilizado continua representando uma vaga vendida e não devolve estoque.

---

# 53. Validação da capacidade do lote

Para cada lote:

```text
vendidos + solicitados <= TicketBatch.quantity
```

O lote também precisa existir e estar:

```text
isActive = true
```

Erros internos previstos:

```text
BATCH_UNAVAILABLE
BATCH_SOLD_OUT
```

---

# 54. Validação da capacidade da modalidade

Para cada modalidade:

```text
vendidos + solicitados <= EventSectorModality.capacity
```

A contagem considera Tickets `VALID` e `USED` pertencentes à modalidade.

---

# 55. Validação da capacidade do setor

Para cada setor:

```text
vendidos + solicitados <= EventSector.capacity
```

Isso impede que a soma das modalidades ultrapasse a capacidade física do setor.

---

# 56. Validação da capacidade total do evento

Também é calculada a quantidade total de Tickets vendidos no evento.

Regra:

```text
vendidos + solicitados <= Event.capacity
```

Isso cria quatro níveis de proteção:

```text
EVENTO
SETOR
MODALIDADE
LOTE
```

---

# 57. Grupo de cota `MEIA ENTRADA`

A modelagem da Etapa 3 já havia definido o grupo:

```text
MEIA ENTRADA
```

com:

```text
maxPercentage = 50
```

Na Etapa 4 essa estrutura passou a ser efetivamente utilizada durante a venda.

---

# 58. Categorias pertencentes à cota

Foram confirmadas:

```text
MEIA
MEIA SOCIAL
```

dentro do mesmo grupo.

`INTEIRA` possui:

```text
quotaGroupId = null
```

---

# 59. Regra conjunta da cota

A regra aplicada é:

```text
MEIA + MEIA SOCIAL <= 50% do lote
```

e não:

```text
MEIA <= 50%
MEIA SOCIAL <= 50%
```

separadamente.

Isso impede que as duas categorias juntas ultrapassem o limite legal/comercial configurado.

---

# 60. Cálculo da cota

Para cada lote e grupo:

```text
maxAllowed =
floor(
    batch.quantity *
    maxPercentage /
    100
)
```

Depois:

```text
vendidos no grupo
+
solicitados no checkout
<=
maxAllowed
```

Caso contrário:

```text
QUOTA_LIMIT_REACHED
```

---

# 61. Cota vinculada ao lote

A cota é calculada por:

```text
batchId + quotaGroupId
```

Isso significa que cada lote possui seu próprio controle.

---

# 62. Progressão independente entre lotes

Foi definida e testada uma regra importante:

as categorias não precisam avançar de lote simultaneamente.

Exemplo:

```text
LOTE 1

MEIA + MEIA SOCIAL
→ cota esgotada

INTEIRA
→ ainda disponível
```

Nesse momento:

```text
MEIA
```

pode estar disponível no:

```text
LOTE 2
```

enquanto:

```text
INTEIRA
```

continua sendo vendida no:

```text
LOTE 1
```

---

# 63. Resultado da progressão independente

O sistema suporta simultaneamente:

```text
INTEIRA → LOTE 1
MEIA → LOTE 2
```

sem exigir que o lote inteiro seja encerrado para todas as categorias.

---

# 64. Teste de estoque do Epica

Durante os testes foi consultado o estado dos lotes.

Foi observado, em determinado momento:

```text
LOTE 1
quantidade = 400
vendidos = 12
meiaGrupoVendidos = 0
```

```text
LOTE 2
quantidade = 400
vendidos = 0
meiaGrupoVendidos = 0
```

Esses valores refletiam o estado do banco naquele momento dos testes.

---

# 65. Concorrência em `QUANTITY`

Foi criado cenário controlado em que dois checkouts solicitavam quantidade que, somada, ultrapassaria o estoque restante.

Os dois conseguiram iniciar porque `QUANTITY` não reserva estoque.

Na finalização:

```text
primeiro
→ compra aprovada

segundo
→ indisponibilidade
```

confirmando a estratégia:

```text
first-to-complete wins
```

---

# 66. Restauração após teste controlado

Quando valores de capacidade/estoque foram temporariamente ajustados para criar cenários de concorrência, os valores originais foram restaurados após o teste.

Isso evitou deixar o banco de desenvolvimento com configuração artificial.

---

# 67. Pagamento simulado

Foi implementado pagamento simulado para permitir testar o fluxo completo sem integrar ainda um gateway real.

Resultados utilizados:

```text
APPROVED
REFUSED
```

---

# 68. Pagamento `APPROVED`

Quando o pagamento é aprovado:

- estoque é validado;
- `Order` é criado;
- Tickets individuais são criados;
- valores são registrados;
- sessão passa para `COMPLETED`;
- assentos vendidos permanecem indisponíveis.

---

# 69. Pagamento `REFUSED`

Quando o pagamento é recusado:

- a compra não é efetivada;
- não é criado pedido aprovado;
- não são criados Tickets;
- sessão é cancelada;
- assentos temporariamente bloqueados são liberados.

Estado:

```text
CANCELLED
```

---

# 70. Teste de pagamento recusado em `SEAT`

Foi confirmado:

```text
CheckoutSession.status = CANCELLED
```

e:

```text
Order criado = 0
Ticket criado = 0
```

O assento voltou a ficar disponível.

---

# 71. Teste de pagamento aprovado em `SEAT`

Foi confirmado:

```text
CheckoutSession.status = COMPLETED
```

com:

```text
Order
Ticket
```

criados.

O assento permaneceu:

```text
isAvailable = false
```

porque agora estava vendido definitivamente.

---

# 72. Tentativa de comprar assento já vendido

Depois da compra aprovada, outro cliente tentou utilizar o mesmo assento.

A operação foi bloqueada.

Isso confirmou que a indisponibilidade não era mais apenas temporária de checkout.

---

# 73. Teste de pagamento aprovado em `QUANTITY`

Também foi concluída compra para modalidade sem assentos.

A criação dos Tickets ocorreu sem `seatId`.

Isso confirmou que a finalização atende os dois modos de ocupação.

---

# 74. Taxa de serviço

Foi utilizada taxa padrão de:

```text
12%
```

---

# 75. Representação da taxa

O pedido registra separadamente:

```text
subtotalInCents
serviceFeeRateBps
serviceFeeInCents
totalInCents
```

Isso evita perder a composição financeira do pedido.

---

# 76. Exemplo validado da taxa

Para:

```text
R$ 40,00
```

foi validado:

```text
subtotal = R$ 40,00
taxa 12% = R$ 4,80
total = R$ 44,80
```

---

# 77. Criação dos Tickets

Cada ingresso adquirido é transformado em um registro individual de:

```text
Ticket
```

Mesmo quando o checkout utiliza:

```text
quantity > 1
```

a compra resulta em Tickets individuais.

Isso permite que cada ingresso tenha:

- identificador próprio;
- QR próprio;
- status próprio;
- compartilhamento próprio;
- assento próprio quando aplicável.

---

# 78. Estrutura de `Ticket`

A entidade possui:

```text
id
orderId
ticketBatchPriceId
seatId
unitPriceInCents
qrCodeHash
status
sharedToken
createdAt
updatedAt
```

---

# 79. Valor efetivamente pago

Cada Ticket registra:

```text
unitPriceInCents
```

representando o valor efetivamente pago pelo ingresso.

Isso preserva o preço histórico mesmo que configurações comerciais sejam alteradas futuramente.

---

# 80. Estados do Ticket

Foram utilizados:

```text
VALID
USED
CANCELLED
```

## `VALID`

Ingresso válido e ainda não utilizado.

## `USED`

Ingresso já validado na entrada.

## `CANCELLED`

Ingresso cancelado e não utilizável.

---

# 81. Instalação da biblioteca de QR Code

Foi adicionada a dependência:

```text
qrcode
```

através de:

```text
npm install qrcode
```

Isso alterou:

```text
backend/package.json
backend/package-lock.json
```

---

# 82. Aviso `allow-scripts`

Durante a instalação foram exibidos avisos relacionados a scripts de instalação de:

```text
@prisma/client
@prisma/engines
prisma
```

O `npm` confirmou:

```text
found 0 vulnerabilities
```

O aviso não impediu a instalação da dependência `qrcode`.

---

# 83. Segredo específico do QR Code

Foi adicionada variável:

```text
QR_SECRET
```

ao ambiente.

Também foi atualizada:

```text
backend/.env.example
```

---

# 84. Separação entre `JWT_SECRET` e `QR_SECRET`

Foi decidido não reutilizar o segredo de autenticação para os ingressos.

Assim:

```text
JWT_SECRET
```

é utilizado para autenticação de usuários.

E:

```text
QR_SECRET
```

é utilizado para assinatura dos ingressos.

Essa separação reduz o impacto caso uma das chaves precise ser substituída ou comprometida.

---

# 85. Serviço `qrCodeService.js`

Foi criado:

```text
backend/src/services/qrCodeService.js
```

responsável pela lógica criptográfica e geração do QR.

O serviço centraliza funções relacionadas a:

- criação do token;
- assinatura;
- hash;
- comparação do hash;
- validação do token;
- geração da imagem QR.

---

# 86. Token assinado do ingresso

O QR utiliza token assinado.

Algoritmo utilizado:

```text
HS256
```

---

# 87. Payload do QR

O payload foi mantido mínimo.

Contém apenas dados necessários à validação, incluindo:

```text
tipo do token
ticketId
orderId
```

Não foram colocados dados pessoais do comprador no QR.

---

# 88. QR determinístico

A geração foi construída para permitir regenerar o mesmo token utilizando:

```text
ticketId
+
orderId
+
QR_SECRET
```

Isso permite não armazenar o token original no banco.

---

# 89. `qrCodeHash`

O token original do QR não é persistido.

É calculado:

```text
SHA-256
```

e somente o resultado é armazenado em:

```text
Ticket.qrCodeHash
```

---

# 90. Benefício de não armazenar o token original

Caso o banco seja consultado diretamente, `qrCodeHash` não fornece imediatamente a credencial completa que será apresentada na entrada.

A validação exige regeneração/verificação com o segredo da aplicação.

---

# 91. Teste criptográfico

Foi testada a regeneração do token utilizando um Ticket existente.

Foram confirmados:

- token regenerado;
- assinatura válida;
- hash calculado;
- correspondência com `qrCodeHash` armazenado.

Também foi confirmado que o token original não estava persistido como campo do Ticket.

---

# 92. QR em formato de imagem

O serviço gera:

```text
data:image/png;base64,...
```

permitindo que o Front-End apresente a imagem diretamente.

---

# 93. Controller de Tickets

Foi criado:

```text
backend/src/controllers/ticketController.js
```

para operações relacionadas à visualização dos ingressos.

---

# 94. Rotas de Tickets

Foi criado:

```text
backend/src/routes/ticketRoutes.js
```

e registrado no servidor:

```text
app.use("/tickets", ticketRoutes)
```

---

# 95. Rota privada do QR

Foi criada:

```text
GET /tickets/:ticketId/qr
```

---

# 96. Autorização da rota privada

A rota utiliza:

```text
authenticate
authorize("CLIENT")
```

O usuário precisa estar autenticado como Cliente.

---

# 97. Verificação de propriedade

A consulta exige:

```text
Ticket.id = ticketId
```

e:

```text
Order.clientId = req.user.id
```

Portanto, conhecer o ID de um ingresso não é suficiente para obter seu QR.

---

# 98. Proteção contra enumeração de ingressos

Quando outro Cliente tenta acessar um Ticket que não pertence a ele, a resposta utilizada é:

```text
404
Ingresso não encontrado.
```

em vez de revelar que o ingresso existe, mas pertence a outra pessoa.

---

# 99. Dados retornados ao proprietário

A resposta privada inclui informações necessárias para exibição do ingresso, como:

- ID;
- status;
- `sharedToken`;
- evento;
- data;
- local;
- cidade;
- estado;
- setor;
- modalidade;
- categoria de preço;
- assento, quando existir;
- valor unitário;
- imagem do QR.

---

# 100. Teste do QR pelo proprietário

Foi utilizado um Ticket pertencente ao Cliente 1.

Resultado:

- acesso autorizado;
- dados do Ticket retornados;
- QR gerado.

Foi confirmado que:

```text
qrCode
```

começava com:

```text
data:image/png;base64,
```

---

# 101. Teste de acesso por outro Cliente

O Cliente 2 tentou acessar exatamente o mesmo:

```text
/tickets/:ticketId/qr
```

Resultado:

```text
404
```

confirmando o isolamento entre usuários.

---

# 102. `sharedToken`

Cada Ticket possui:

```text
sharedToken
```

único.

Ele tem finalidade diferente do token criptográfico utilizado no QR de entrada.

---

# 103. Separação entre compartilhamento e entrada

Foi decidido que compartilhar um ingresso **não deve compartilhar a credencial utilizada na Portaria**.

Assim existem dois conceitos:

```text
QR privado
→ credencial de entrada
```

e:

```text
sharedToken
→ visualização pública
```

---

# 104. Rota pública de compartilhamento

Foi criada:

```text
GET /tickets/shared/:sharedToken
```

Ela não exige autenticação.

---

# 105. Informações públicas do ingresso

A rota compartilhada pode retornar informações como:

- ID do ingresso;
- status;
- título do evento;
- descrição;
- imagem;
- data;
- categoria do evento;
- local;
- endereço;
- cidade;
- estado;
- país;
- setor;
- modalidade;
- categoria de preço;
- identificação do assento quando aplicável;
- valor unitário.

---

# 106. Dados que NÃO são retornados publicamente

Foi deliberadamente impedida a exposição de:

```text
qrCode
qrCodeHash
token assinado
orderId
clientId
email do comprador
dados pessoais do comprador
```

O próprio `sharedToken` também não precisa ser repetido no corpo da resposta.

---

# 107. Teste automático de vazamento de dados

A resposta pública foi convertida para JSON e verificada automaticamente para procurar:

```text
"qrCode"
"qrCodeHash"
"orderId"
"clientId"
"email"
"sharedToken"
```

Todos deveriam resultar:

```text
False
```

e o teste passou.

---

# 108. `sharedToken` inexistente

Foi testada uma URL contendo token inexistente.

Resultado:

```text
404
Ingresso não encontrado.
```

---

# 109. Perfil de Portaria

O schema de `User` possui:

```text
role
```

com os perfis:

```text
ORGANIZER
CLIENT
CHECKIN
```

O perfil utilizado pela Portaria é:

```text
CHECKIN
```

---

# 110. Usuário de teste da Portaria

Foi utilizado:

```text
portaria@teste.com
```

com:

```text
role = CHECKIN
```

O login foi realizado normalmente e seu JWT utilizado nos testes seguintes.

---

# 111. Controller de check-in

Foi criado:

```text
backend/src/controllers/checkinController.js
```

---

# 112. Rotas de check-in

Foi criado:

```text
backend/src/routes/checkinRoutes.js
```

e registrado no servidor:

```text
app.use("/checkin", checkinRoutes)
```

---

# 113. Endpoint da Portaria

Foi implementado:

```text
POST /checkin/validate
```

---

# 114. RBAC da Portaria

A rota utiliza:

```text
authenticate
authorize("CHECKIN")
```

Portanto, possuir um JWT válido não é suficiente.

É necessário ter o perfil:

```text
CHECKIN
```

---

# 115. Entrada da validação

A Portaria envia:

```json
{
  "token": "TOKEN_LIDO_DO_QR"
}
```

---

# 116. Validação inicial do token

O backend verifica:

- se `token` foi informado;
- se é uma string;
- se a assinatura é válida.

Token ausente ou inválido é rejeitado.

---

# 117. Fluxo completo da Portaria

A validação segue:

```text
QR lido
↓
token recebido
↓
assinatura verificada
↓
payload obtido
↓
Ticket localizado
↓
orderId conferido
↓
hash do token comparado com qrCodeHash
↓
status do Ticket conferido
↓
VALID → USED
↓
entrada autorizada
```

---

# 118. Conferência do `orderId`

Além do `ticketId`, o backend compara:

```text
ticket.orderId
```

com:

```text
payload.orderId
```

Uma inconsistência invalida o QR.

---

# 119. Conferência do `qrCodeHash`

Mesmo após validar a assinatura, o token é comparado com:

```text
Ticket.qrCodeHash
```

Isso vincula a credencial ao valor registrado para aquele Ticket.

---

# 120. Ticket `CANCELLED`

Se:

```text
status = CANCELLED
```

a entrada é recusada.

---

# 121. Ticket `USED`

Se:

```text
status = USED
```

uma nova tentativa é recusada.

Mensagem utilizada:

```text
Este ingresso já foi utilizado.
```

---

# 122. Ticket `VALID`

Somente:

```text
VALID
```

pode passar para:

```text
USED
```

e autorizar a entrada.

---

# 123. Atualização atômica no check-in

A alteração não utiliza simplesmente uma atualização sem condição.

Foi utilizada operação equivalente a:

```text
WHERE
id = ticket.id
AND
status = VALID
```

com atualização:

```text
status = USED
```

A operação precisa afetar exatamente:

```text
1 registro
```

---

# 124. Proteção contra duas catracas simultâneas

A atualização atômica resolve o cenário:

```text
Catraca A lê QR
Catraca B lê QR quase simultaneamente
```

Somente uma consegue executar:

```text
VALID → USED
```

A outra encontra o ingresso já consumido e não deve autorizar nova entrada.

---

# 125. Primeira leitura válida

Foi gerado token para um Ticket com:

```text
status = VALID
```

A Portaria realizou:

```text
POST /checkin/validate
```

Resultado:

```text
200
Ingresso validado. Entrada autorizada.
```

e:

```text
status = USED
```

---

# 126. Segunda leitura do mesmo QR

O mesmo token foi enviado novamente.

Resultado:

```text
409
Este ingresso já foi utilizado.
```

confirmando proteção contra reutilização.

---

# 127. QR adulterado

Foi criada uma cópia do token alterando seu conteúdo final.

O QR adulterado foi enviado pela Portaria.

Resultado:

```text
400
QR Code inválido.
```

confirmando a validação criptográfica.

---

# 128. Cliente tentando utilizar endpoint da Portaria

Foi utilizado:

```text
$token1
```

de um usuário:

```text
CLIENT
```

contra:

```text
POST /checkin/validate
```

Resultado:

```text
403
```

confirmando o RBAC.

---

# 129. CHECKIN autorizado

O token do usuário:

```text
CHECKIN
```

foi aceito pela mesma rota.

Assim ficou validada a separação de responsabilidades entre:

```text
CLIENT
CHECKIN
```

---

# 130. Arquivos de serviços criados

Durante a Etapa 4 foi criada a pasta:

```text
backend/src/services/
```

incluindo lógica de negócio que não deveria permanecer diretamente nos controllers.

Entre os serviços implementados ficaram as responsabilidades de:

- checkout/estoque;
- liberação e expiração de reservas;
- QR Code.

---

# 131. `checkoutService.js`

O serviço passou a centralizar lógica como:

```text
releaseSessionSeats
expireCheckoutIfNecessary
validateCheckoutStock
```

reduzindo responsabilidade do controller.

---

# 132. `qrCodeService.js`

O serviço passou a centralizar:

- assinatura;
- regeneração;
- validação;
- hashing;
- comparação;
- geração da imagem QR.

---

# 133. Alterações no `checkoutController.js`

O controller de checkout foi ampliado para atender:

- início de checkout;
- validação dos itens;
- limite de 10;
- comportamento `QUANTITY`;
- comportamento `SEAT`;
- reserva de assentos;
- expiração;
- conclusão;
- pagamento simulado;
- criação de Order;
- criação de Tickets;
- geração e persistência do hash dos QRs;
- liberação em cenários de falha/recusa.

---

# 134. Alterações no `checkoutRoutes.js`

As rotas de checkout passaram a contemplar:

```text
POST /checkout
POST /checkout/:checkoutId/complete
```

ambas restritas ao perfil:

```text
CLIENT
```

---

# 135. Alterações no `server.js`

O servidor passou a registrar:

```text
/auth
/checkout
/tickets
/checkin
```

---

# 136. Problema de porta durante os testes

Durante a Etapa 4 ocorreu:

```text
EADDRINUSE
address already in use :::3000
```

ao executar:

```text
npm run dev
```

Isso indicava outro processo Node utilizando a porta.

---

# 137. Diagnóstico do processo da porta 3000

Foram utilizados comandos PowerShell para localizar o processo.

Em uma consulta foi identificado:

```text
OwningProcess = 3620
```

Também houve processo Node anterior com outro PID durante o diagnóstico.

---

# 138. `Ctrl+C` não encerrou corretamente uma execução

Em determinado momento, utilizar `Ctrl+C` no PowerShell não resolveu completamente o conflito.

Foi necessário identificar explicitamente o processo que mantinha:

```text
port 3000
```

ocupada e encerrá-lo.

Depois disso o servidor pôde iniciar normalmente.

---

# 139. Teste de disponibilidade do servidor

Após corrigir o processo da porta, foi utilizado:

```text
GET http://localhost:3000/
```

para confirmar que a API estava novamente acessível.

---

# 140. Erro de conexão após encerrar o processo

Depois de matar o processo que ocupava a porta, uma tentativa de login retornou:

```text
Impossível conectar-se ao servidor remoto
```

porque naquele momento nenhum servidor estava ativo.

Após iniciar novamente o backend, os testes continuaram normalmente.

---

# 141. Erro de PowerShell durante teste

Durante um teste foi digitado:

```text
$responseExpired.checkout$responseExpired.checkout
```

causando:

```text
ParserError
UnexpectedToken
```

O comando correto:

```text
$responseExpired.checkout
```

funcionou normalmente.

Esse problema era apenas de sintaxe no terminal e não do backend.

---

# 142. Teste de expiração e reutilização do assento

Após forçar uma sessão a expirar, foi criado novo checkout.

A nova sessão ficou:

```text
ACTIVE
```

com novo:

```text
expiresAt
```

e conseguiu reutilizar o assento anteriormente bloqueado.

Isso confirmou o ciclo:

```text
reserva
→ expiração
→ liberação
→ nova reserva
```

---

# 143. Uso de transações

Operações críticas de finalização e validação foram estruturadas utilizando transações do Prisma.

Objetivos:

- evitar criação parcial de pedidos;
- evitar criação parcial de Tickets;
- preservar consistência de estoque;
- preservar consistência de assentos;
- garantir alteração coerente dos estados.

---

# 144. Integridade entre checkout e venda definitiva

Foi mantida separação conceitual:

```text
CheckoutSession / CheckoutItem
```

representam a tentativa/intenção de compra.

Enquanto:

```text
Order / Ticket
```

representam a compra efetivada.

Essa separação permite:

- abandono;
- expiração;
- pagamento recusado;
- concorrência;
- finalização segura.

---

# 145. Segurança do QR

As decisões de segurança da Etapa 4 incluem:

- token assinado;
- `QR_SECRET` próprio;
- payload mínimo;
- ausência de dados pessoais;
- armazenamento apenas do hash;
- validação da assinatura;
- comparação do hash;
- vínculo com `ticketId`;
- vínculo com `orderId`;
- controle de status;
- atualização atômica para uso;
- QR privado disponível apenas ao proprietário.

---

# 146. Segurança do compartilhamento

O compartilhamento público foi separado do QR.

O link público:

```text
sharedToken
```

não concede acesso à credencial utilizada na entrada.

Assim, publicar ou enviar o link compartilhado não equivale a entregar o QR válido da Portaria.

---

# 147. Segurança de autorização

Foram aplicadas regras:

```text
CLIENT
→ checkout
→ visualizar QR próprio
```

```text
CHECKIN
→ validar entrada
```

O middleware de autenticação identifica o usuário e o middleware de autorização restringe o perfil.

---

# 148. Testes de autenticação e autorização

Foram utilizados múltiplos usuários reais do seed para evitar validar o sistema apenas com um único JWT.

Foram testados:

- Cliente 1;
- Cliente 2;
- Portaria.

Isso permitiu confirmar tanto autenticação quanto isolamento e RBAC.

---

# 149. Testes de `SEAT`

Foram realizados e validados:

- geração automática de assentos;
- quantidade de assentos igual à capacidade;
- ausência de assentos em `QUANTITY`;
- seleção de um assento;
- seleção de múltiplos assentos;
- seleção de 10 assentos;
- bloqueio de 11;
- indisponibilidade para outro Cliente;
- escolha de outro lugar pelo segundo Cliente;
- expiração;
- liberação;
- nova seleção após expiração;
- concorrência pelo mesmo lugar;
- pagamento recusado;
- liberação após recusa;
- pagamento aprovado;
- indisponibilidade definitiva após venda;
- tentativa de recompra de lugar vendido.

---

# 150. Testes de `QUANTITY`

Foram realizados e validados:

- checkout com quantidade pequena;
- checkout com 10;
- bloqueio de 11;
- combinação de categorias;
- combinação de lotes;
- ausência de bloqueio antecipado de estoque;
- múltiplos checkouts concorrentes;
- validação definitiva na conclusão;
- primeiro a concluir vencendo a disputa;
- segundo checkout sendo rejeitado quando o estoque acaba;
- criação de Tickets sem assento.

---

# 151. Testes de capacidades

Foram validados controles de:

```text
TicketBatch.quantity
EventSectorModality.capacity
EventSector.capacity
Event.capacity
```

A finalização não depende apenas do estoque nominal do preço.

---

# 152. Testes de cota

Foram realizados:

- identificação do grupo `MEIA ENTRADA`;
- confirmação de `maxPercentage = 50`;
- confirmação de `MEIA` no grupo;
- confirmação de `MEIA SOCIAL` no grupo;
- confirmação de `INTEIRA` fora do grupo;
- vendas combinadas de `MEIA + MEIA SOCIAL`;
- tentativa de ultrapassar 50%;
- rejeição do excedente;
- confirmação de que `INTEIRA` permanece disponível;
- confirmação de categoria da cota em lote seguinte.

---

# 153. Testes de lotes

Foram confirmados os dois lotes da Pista do Epica:

```text
LOTE 1
quantity = 400
```

```text
LOTE 2
quantity = 400
```

Também foram confirmados os preços individuais de cada categoria nos dois lotes.

---

# 154. Testes de pagamento

Foram validados:

```text
APPROVED
REFUSED
```

incluindo efeitos sobre:

- sessão;
- pedido;
- Tickets;
- assentos;
- estoque;
- valores.

---

# 155. Testes da taxa

Foi validado o cálculo de:

```text
12%
```

e o armazenamento separado de subtotal, taxa e total.

---

# 156. Testes do QR

Foram validados:

- criação do token;
- assinatura;
- regeneração;
- determinismo;
- SHA-256;
- correspondência com `qrCodeHash`;
- ausência do token original no banco;
- geração da imagem;
- acesso pelo proprietário;
- bloqueio de outro Cliente.

---

# 157. Testes do compartilhamento

Foram validados:

- acesso sem autenticação;
- `sharedToken` válido;
- retorno de informações públicas;
- ausência de QR;
- ausência de hash;
- ausência de `orderId`;
- ausência de `clientId`;
- ausência de e-mail;
- ausência de dados pessoais;
- ausência do próprio `sharedToken` no corpo;
- `sharedToken` inexistente retornando `404`.

---

# 158. Testes da Portaria

Foram validados:

- login do perfil `CHECKIN`;
- QR legítimo;
- primeira entrada autorizada;
- mudança `VALID → USED`;
- segunda leitura bloqueada;
- QR adulterado bloqueado;
- Cliente impedido de validar ingresso;
- CHECKIN autorizado.

---

# 159. Testes de concorrência

A Etapa 4 incluiu dois tipos distintos de concorrência.

## Concorrência `SEAT`

```text
mesmo assento
→ somente um checkout consegue bloquear
```

## Concorrência `QUANTITY`

```text
mesmo estoque
→ múltiplos checkouts podem começar
→ somente quem concluir enquanto houver estoque compra
```

## Concorrência no check-in

```text
mesmo Ticket VALID
→ apenas uma operação consegue alterar para USED
```

---

# 160. Testes de expiração

Foi validado:

```text
ACTIVE
→ tempo excedido
→ EXPIRED
```

com:

```text
liberação dos assentos
```

e possibilidade de nova reserva.

---

# 161. Arquivos envolvidos na implementação

Entre os arquivos alterados/criados durante a Etapa 4 estão:

```text
backend/.env.example
backend/package.json
backend/package-lock.json
backend/prisma/schema.prisma
backend/prisma/seed.js
backend/src/server.js
backend/src/controllers/checkoutController.js
backend/src/controllers/ticketController.js
backend/src/controllers/checkinController.js
backend/src/routes/checkoutRoutes.js
backend/src/routes/ticketRoutes.js
backend/src/routes/checkinRoutes.js
backend/src/services/checkoutService.js
backend/src/services/qrCodeService.js
```

Além das migrations correspondentes às alterações de banco realizadas durante a etapa.

---

# 162. Validações do Prisma

Durante as alterações de modelagem foram utilizados:

```text
npx prisma format
npx prisma validate
```

Também foi regenerado o Prisma Client após alterações necessárias.

---

# 163. Migrations

As alterações estruturais do banco foram aplicadas através do fluxo de migrations do Prisma.

Também foi verificado o estado do banco com:

```text
npx prisma migrate status
```

para confirmar que a estrutura utilizada pelos testes estava atualizada.

---

# 164. Seeds

Foi executado:

```text
npx prisma db seed
```

após as alterações necessárias.

O seed passou a contemplar:

- usuários de teste;
- eventos;
- setores;
- modalidades;
- lotes;
- preços;
- categorias;
- cotas;
- assentos.

---

# 165. Inspeções diretas com Prisma

Além das rotas HTTP, foram utilizadas consultas diretas com:

```text
node -e
```

e Prisma para verificar estados internos que não deveriam depender apenas da resposta da API.

Foram inspecionados:

- preços;
- lotes;
- categorias;
- modalidades;
- capacidades;
- assentos;
- sessões;
- Tickets;
- estoque vendido;
- grupos de cota;
- hashes.

---

# 166. Estratégia de testes

Os testes foram realizados incrementalmente.

Após cada alteração importante:

1. servidor era reiniciado ou atualizado pelo `node --watch`;
2. endpoint era testado;
3. estado interno era consultado quando necessário;
4. somente após confirmação o desenvolvimento avançava.

Essa estratégia evitou acumular várias alterações sem validação intermediária.

---

# 167. Microcommits

A Etapa 4 foi desenvolvida utilizando commits intermediários em vez de concentrar toda a implementação em um único commit.

Antes dos commits foram utilizados:

```text
git status --short
git diff --cached --name-only
```

para conferir exatamente quais arquivos seriam incluídos.

---

# 168. Separação da documentação dos commits funcionais

O arquivo:

```text
documents/etapas_desenvolvimento.md
```

foi mantido fora de determinados microcommits funcionais para permitir documentar a etapa somente após validar o comportamento implementado.

---

# 169. Bloco de QR + compartilhamento + check-in

No fechamento desse bloco funcional estavam envolvidos:

```text
backend/.env.example
backend/package-lock.json
backend/package.json
backend/src/controllers/checkoutController.js
backend/src/server.js
backend/src/controllers/checkinController.js
backend/src/controllers/ticketController.js
backend/src/routes/checkinRoutes.js
backend/src/routes/ticketRoutes.js
backend/src/services/qrCodeService.js
```

enquanto:

```text
documents/etapas_desenvolvimento.md
```

permaneceu separado para o fechamento documental da Etapa 4.

---

# 170. Decisões que pertencem ao Front-End futuro

Embora esta etapa seja focada no backend, ficaram definidas regras que deverão ser refletidas na interface:

- exibir no máximo 10 ingressos por compra;
- impedir seleção do 11º;
- mostrar assento bloqueado/vendido simplesmente como indisponível;
- atualizar disponibilidade quando reservas expirarem;
- apresentar QR apenas ao proprietário autenticado;
- permitir página pública pelo `sharedToken` sem QR;
- criar interface específica para Portaria;
- enviar o token lido ao endpoint de check-in;
- diferenciar visualmente entrada autorizada e rejeitada.

---

# 171. Regras preparadas para criação dinâmica de eventos

Os dados dos seeds não representam limites fixos da plataforma.

Quando o CRUD do Organizador for implementado, o fluxo deverá permitir que ele configure:

- capacidade total;
- setores;
- capacidade de cada setor;
- modalidades;
- modo `SEAT` ou `QUANTITY`;
- capacidade de cada modalidade;
- lotes;
- quantidade dos lotes;
- preços;
- categorias comerciais;
- assentos quando aplicável.

O backend deverá derivar e validar as opções a partir da capacidade informada pelo Organizador.

---

# 172. Integridade hierárquica futura

A configuração dinâmica deverá impedir inconsistências como:

```text
setor maior que evento
```

```text
modalidades incompatíveis com capacidade do setor
```

```text
vendas superiores à capacidade física
```

```text
quantidade de assentos diferente da capacidade configurada
```

```text
lotes permitindo vendas acima dos limites definidos
```

A Etapa 4 já implementou as validações de venda necessárias para respeitar os níveis de capacidade existentes.

---

# 173. Funcionalidades concluídas nesta Etapa

Ao final da Etapa 4, o backend possui:

```text
autenticação de Cliente
        ↓
seleção de ingresso
        ↓
checkout
        ↓
limite de 10
        ↓
SEAT ou QUANTITY
        ↓
reserva quando necessária
        ↓
expiração quando necessária
        ↓
validação de estoque
        ↓
validação de capacidades
        ↓
validação de cotas
        ↓
pagamento simulado
        ↓
taxa de serviço
        ↓
Order
        ↓
Ticket individual
        ↓
QR assinado
        ↓
visualização privada
        ↓
compartilhamento público seguro
        ↓
leitura pela Portaria
        ↓
VALID → USED
```

---

# 174. Endpoints consolidados da Etapa 4

```text
POST /checkout
```

Inicia checkout do Cliente.

```text
POST /checkout/:checkoutId/complete
```

Finaliza o checkout e executa o pagamento simulado.

```text
GET /tickets/:ticketId/qr
```

Retorna o QR privado para o proprietário.

```text
GET /tickets/shared/:sharedToken
```

Retorna a visualização pública segura.

```text
POST /checkin/validate
```

Valida o ingresso na Portaria.

---

# 175. Segurança consolidada

Ao final da Etapa 4 foram aplicadas proteções para:

- autenticação;
- autorização por perfil;
- propriedade do ingresso;
- limite de compra;
- estoque;
- capacidade;
- cotas;
- concorrência;
- reservas;
- expiração;
- pagamentos recusados;
- QR adulterado;
- acesso indevido ao QR;
- exposição de dados no compartilhamento;
- reutilização do ingresso;
- leituras simultâneas na Portaria.

---

# 176. O que NÃO foi implementado nesta Etapa

Permanecem para etapas futuras:

- gateway de pagamento real;
- integração com adquirente;
- PIX real;
- cartão real;
- estorno financeiro real;
- reembolso;
- cancelamento completo com devolução automática de estoque;
- transferência de titularidade;
- histórico detalhado de check-in;
- registro do operador que realizou cada leitura;
- registro dedicado de data/hora do check-in além do estado atual;
- envio de ingresso por e-mail;
- carteira digital;
- interface visual de seleção de assentos;
- scanner visual da Portaria;
- Front-End do checkout;
- CRUD completo do Organizador para configuração dinâmica dessas capacidades;
- integrações externas previstas em outras etapas.

---

# 177. Testes realizados — checklist consolidado

### Banco e modelagem

- [x] `npx prisma format`.
- [x] `npx prisma validate`.
- [x] Prisma Client regenerado.
- [x] Migrations aplicadas.
- [x] `npx prisma migrate status`.
- [x] Seed executado.
- [x] Seed corrigido após conflito de FK.
- [x] Reexecução do seed validada.

### Capacidades e assentos

- [x] Capacidade das modalidades consultada.
- [x] Assentos gerados somente para `SEAT`.
- [x] Zero assentos em `QUANTITY`.
- [x] 300 assentos do Teatro.
- [x] 200 assentos dos quatro Camarotes do Epica.
- [x] 500 assentos da Cadeira Superior.
- [x] 500 assentos da Cadeira Inferior.
- [x] 120 assentos do Cinema.
- [x] Total de 1620 assentos confirmado.

### Limite de compra

- [x] Checkout abaixo de 10.
- [x] Checkout com exatamente 10.
- [x] Checkout com 11 rejeitado.
- [x] Limite entre categorias.
- [x] Limite entre lotes.
- [x] Limite entre assentos.

### `SEAT`

- [x] Reserva de um assento.
- [x] Reserva de vários assentos.
- [x] Assento indisponível para segundo Cliente.
- [x] Outro assento disponível para segundo Cliente.
- [x] Concorrência pelo mesmo assento.
- [x] Apenas um Cliente consegue reservar.
- [x] Expiração forçada.
- [x] Sessão alterada para `EXPIRED`.
- [x] Assento liberado.
- [x] Assento reutilizado em novo checkout.
- [x] Pagamento recusado libera assento.
- [x] Pagamento aprovado mantém assento indisponível.
- [x] Assento vendido não pode ser comprado novamente.

### `QUANTITY`

- [x] Checkout sem bloqueio de estoque.
- [x] Dois checkouts concorrentes.
- [x] Ambos conseguem iniciar.
- [x] Primeiro consegue concluir.
- [x] Segundo é rejeitado após estoque acabar.
- [x] Estoque validado somente na conclusão.
- [x] Ticket sem `seatId`.

### Estoque e capacidade

- [x] Validação por lote.
- [x] Validação por modalidade.
- [x] Validação por setor.
- [x] Validação por evento.
- [x] Tickets `VALID` contabilizados.
- [x] Tickets `USED` continuam contabilizados.

### Cotas

- [x] Grupo `MEIA ENTRADA` identificado.
- [x] Limite de 50% confirmado.
- [x] `MEIA` pertencente ao grupo.
- [x] `MEIA SOCIAL` pertencente ao grupo.
- [x] `INTEIRA` fora do grupo.
- [x] Soma `MEIA + MEIA SOCIAL` validada.
- [x] Excesso bloqueado.
- [x] `INTEIRA` permanece disponível.
- [x] Progressão independente para outro lote confirmada.

### Pagamento

- [x] `APPROVED`.
- [x] `REFUSED`.
- [x] `Order` criado somente quando aplicável.
- [x] Tickets criados somente quando aplicável.
- [x] Sessão `COMPLETED` no sucesso.
- [x] Sessão `CANCELLED` na recusa.
- [x] Liberação de assentos na recusa.
- [x] Taxa de 12%.
- [x] Subtotal registrado.
- [x] Taxa registrada.
- [x] Total registrado.

### QR

- [x] Biblioteca `qrcode` instalada.
- [x] `QR_SECRET` separado.
- [x] Token assinado.
- [x] HS256.
- [x] Payload mínimo.
- [x] Token determinístico.
- [x] SHA-256.
- [x] `qrCodeHash` persistido.
- [x] Token original não persistido.
- [x] Token regenerado.
- [x] Hash comparado.
- [x] Assinatura validada.
- [x] Imagem Base64 gerada.

### QR privado

- [x] Proprietário consegue acessar.
- [x] Outro Cliente recebe `404`.
- [x] Propriedade verificada por `Order.clientId`.
- [x] Ticket cancelado tratado.
- [x] Integridade do hash verificada.

### Compartilhamento

- [x] Rota sem login.
- [x] `sharedToken` válido.
- [x] Informações públicas retornadas.
- [x] Sem QR.
- [x] Sem `qrCodeHash`.
- [x] Sem token assinado.
- [x] Sem `orderId`.
- [x] Sem `clientId`.
- [x] Sem e-mail.
- [x] Sem dados pessoais.
- [x] Sem `sharedToken` no corpo.
- [x] Token inexistente retorna `404`.

### Portaria

- [x] Usuário `CHECKIN` autenticado.
- [x] `CLIENT` bloqueado.
- [x] QR válido aceito.
- [x] Ticket `VALID → USED`.
- [x] Segunda leitura rejeitada.
- [x] QR adulterado rejeitado.
- [x] Atualização atômica utilizada.
- [x] `CANCELLED` previsto como inválido.
- [x] `USED` previsto como inválido.

### Infraestrutura de desenvolvimento

- [x] Conflito `EADDRINUSE` diagnosticado.
- [x] Processo da porta 3000 identificado.
- [x] Processo antigo encerrado.
- [x] Servidor reiniciado.
- [x] Endpoint raiz utilizado para validar funcionamento.
- [x] Erro de sintaxe PowerShell identificado como externo à aplicação.

---

# 178. Uso de IA nesta Etapa

### Modelagem e arquitetura

Uso de IA para apoio na análise da estrutura necessária para:

- `CheckoutSession`;
- `CheckoutItem`;
- reservas;
- expiração;
- estoque;
- Tickets;
- QR;
- check-in.

### Implementação

Uso de IA como apoio na geração e revisão de:

- controllers;
- routes;
- services;
- consultas Prisma;
- transações;
- validações;
- lógica de concorrência;
- QR Code;
- RBAC.

### Testes

Uso de IA para criação dos comandos de teste em:

```text
PowerShell
Node.js
Prisma
```

e construção incremental dos cenários de:

- estoque;
- assentos;
- concorrência;
- expiração;
- pagamento;
- cotas;
- lotes;
- QR;
- compartilhamento;
- Portaria.

### Diagnóstico

Uso de IA para auxiliar na identificação de:

- erros do Prisma;
- FK no seed;
- conflito de porta;
- processos Node;
- erros de PowerShell;
- comportamento de concorrência;
- estados inconsistentes durante testes.

---

# 179. Decisões Humanas / Manuais

As principais decisões de produto e regras de negócio foram definidas manualmente durante o desenvolvimento.

Entre elas:

- máximo de 10 ingressos por compra;
- Front-End deverá impedir visualmente o 11º ingresso;
- `QUANTITY` não reserva estoque;
- `QUANTITY` utiliza regra de quem finaliza primeiro;
- `SEAT` reserva assento;
- reserva de `SEAT` dura no máximo 10 minutos;
- estado de reserva temporária não deve ser exposto ao usuário;
- assento temporariamente reservado aparece apenas como indisponível;
- capacidade de novos eventos será definida pelo Organizador;
- sistema deverá ajustar/validar configurações a partir dessa capacidade;
- setores devem respeitar capacidade do evento;
- modalidades devem respeitar capacidade dos setores;
- assentos devem acompanhar a capacidade de modalidades `SEAT`;
- taxa de serviço definida em 12%;
- `MEIA` e `MEIA SOCIAL` compartilham cota;
- limite conjunto definido em 50%;
- `INTEIRA` não pertence à cota;
- categorias podem avançar de lote independentemente;
- QR de entrada deve ser privado;
- compartilhamento público não deve revelar QR;
- `sharedToken` não deve funcionar como credencial de entrada;
- QR deve utilizar segredo separado do JWT;
- token original não deve ser armazenado no banco;
- Portaria utiliza perfil `CHECKIN`;
- Ticket só pode ser utilizado uma vez;
- reutilização deve ser bloqueada;
- validação deve suportar concorrência entre leitores;
- testes foram executados e conferidos manualmente antes do avanço para o próximo bloco.


terça-feira 9:47

Desafio-Elite-Dev-2026.pdf
PDF
preciso fazer esse projeto, vou enviar o repositorio para vc ver oq ja foi feito VanessaLizz/EventsProjectt veja oq ja foi feito e essas são as etapas: [Etapa 1] Setup do Projeto, Banco de Dados & Seeds

O que será feito: Configuração do projeto (Front/Back), ORM e script de seed inicial.
Critério de Aceite: DB rodando e seeds inseridos (1 Org, 2 Clientes, 1 Portaria, 1 Evento).
[Etapa 2] Back-End: Autenticação (JWT) & RBAC (3 Perfis)

O que será feito: Login, registro e middleware de permissão para Organizador, Cliente e Portaria.
Critério de Aceite: Endpoints /auth testados via REST/Postman e commitados.
[Etapa 3] Back-End: Integração com API Externa & Gestão de Eventos

O que será feito: Integração básica com TMDb/Ticketmaster e CRUD de eventos do Organizador no DB.
Critério de Aceite: Endpoint de importação externa e listagem de eventos funcionando.
[Etapa 4] Back-End: Núcleo de Reservas & QR Code Assinado

O que será feito: Lógica de reservas anti-duplicidade, simulação de pagamento, geração de token de QR Code imutável e link de compartilhamento.
Critério de Aceite: Trava de assento/pista duplo testada e QR Code gerado de forma segura e assinada.
[Etapa 5] Front-End: Autenticação, Layout Base & Catálogo de Eventos

O que será feito: Setup do Vite/React, rotas protegidas por papel e navegação do catálogo de eventos.
Critério de Aceite: Telas de login e navegação pública/catálogo operacionais.
[Etapa 6] Front-End: Módulo de Organização & Criação de Eventos

O que será feito: Painel de criação e edição de eventos importando do TMDb/Ticketmaster.
Critério de Aceite: Organizador cria evento completo com preço, cota e tipo de ingresso (assento/pista).
[Etapa 7] Front-End: Seleção de Ingressos & Checkout Simulado

O que será feito: Seleção de assentos/pista, tela de checkout e fluxo de pagamento simulado (sucesso/recusa).
Critério de Aceite: Cliente conclui compra com assento reservado com sucesso ou tratamento de erro.
[Etapa 8] Front-End: "Meus Ingressos" & Visualização de QR Code

O que será feito: Painel "Meus Ingressos" exibindo QR Code e visualização pública por link compartilhado.
Critério de Aceite: QR Code renderizado corretamente e página de compartilhamento acessível sem login.
[Etapa 9] Front-End & Back-End: Portal da Portaria (Scanner via Câmera/Manual)

O que será feito: Leitor de QR Code via câmera / digitação manual + validação com feedback visual.
Critério de Aceite: Validação retorna se é Válido, Inválido, Já Utilizado ou Evento Errado.
FASE 2: Refinamentos & Recursos Adicionais (Opcionais) [Etapa 10] Opcionais: Busca Avançada, Filtros & Painel de Métricas

O que será feito: Filtros por categoria/data no catálogo e painel do organizador com relatório de vendas.
Critério de Aceite: Busca por filtros ativa e métricas de vendas visíveis no painel do organizador.
[Etapa 11] Opcionais: Cancelamento & Devolução ao Estoque

O que será feito: Fluxo de cancelamento de ingresso pelo cliente com liberação do assento/cota.
Critério de Aceite: Ingresso cancelado invalida o QR Code e reabre a vaga no estoque.
[Etapa 12] Infraestrutura & Testes: Docker Compose & Testes Automatizados

O que será feito: Dockerfile / Docker Compose para subir aplicação completa + testes unitários/integração.
Critério de Aceite: docker-compose up executa toda a aplicação e suite de testes roda sem falhas.
[Etapa 13] Publicação, Polimento & Entrega Final

O que será feito: Deploy completo na Vercel/Render, preenchimento detalhado do README.md (instruções + uso de IA) e submissão.
Critério de Aceite: Link de producao rodando, instruções no README validadas e formulário enviado. iremos iniciar a etapa 2. diga o passo a passo de cada uma e antes de finalizar documente para fazer o commit e só então seguiremos para a proxima

Analisei o repositório atual e o PDF do desafio. Vamos trabalhar uma etapa por vez, sem avançar automaticamente. Em cada etapa, faremos: implementação → teste → documentação → git status → commit → push. Só depois seguimos para a próxima.

O desafio exige autenticação com exatamente três papéis: Organizador, Cliente e Portaria. 

 Também pede que o projeto deixe dados de teste prontos e que o histórico do Git tenha commits descritivos ao longo do desenvolvimento. 


O que já está pronto
A Etapa 1 está essencialmente concluída.

Seu backend já está configurado com:

Node.js + Express;

Prisma;

SQLite;

bcryptjs;

estrutura inicial de banco;

migration;

seed.

O package.json já possui Express, Prisma, bcryptjs, dotenv e scripts para iniciar o servidor. 

O banco possui os modelos:

User
Event
Seat
Order
Ticket
e o usuário já possui o campo:

role
com os valores planejados:

ORGANIZER
CLIENT
CHECKIN

Seu seed também já cria exatamente:

1 Organizador
2 Clientes
1 Portaria
1 Evento
com senha 123456 criptografada usando bcrypt. 

Além disso, você já documentou decisões arquiteturais como Node/Express/Prisma, React/Vite, SQLite/PostgreSQL e JWT/HMAC. 

Há, porém, duas coisas importantes que corrigiremos mais adiante ou antes do commit final:

backend/node_modules está versionado no GitHub. Isso não deveria estar no repositório.

backend/.env também aparece versionado. Isso é ainda mais importante: arquivos .env não devem ser commitados, principalmente porque vamos adicionar JWT_SECRET.

Não vamos misturar tudo agora. Primeiro faremos a autenticação corretamente.

ETAPA 2 — Autenticação JWT + RBAC
O objetivo desta etapa será chegar nesta estrutura:

backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   ├── seed.js
│   └── dev.db
│
├── src/
│   ├── controllers/
│   │   └── authController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │
│   ├── lib/
│   │   └── prisma.js
│   │
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
└── package.json
Não vamos criar tudo de uma vez.

Ordem da Etapa 2
Vamos executar nesta sequência:

preparar dependências e variáveis de ambiente;

criar conexão reutilizável com Prisma;

implementar registro;

implementar login;

gerar JWT;

criar middleware de autenticação;

criar middleware RBAC;

criar rotas protegidas de teste;

testar Organizador;

testar Cliente;

testar Portaria;

testar acessos negados;

documentar;

fazer commit;

push.

O critério de aceite será:

POST /auth/register
POST /auth/login

+ JWT funcionando
+ middleware de autenticação
+ restrição por papel
+ testes feitos no Postman/REST Client
Passo 1 — Preparar JWT
Seu package.json ainda não possui jsonwebtoken. 

Abra o terminal dentro da pasta backend.

Confirme que aparece algo equivalente a:

...\EventsProject\backend>
Então execute:

npm install jsonwebtoken
O que estamos fazendo
jsonwebtoken será responsável por criar e validar o token entregue ao usuário depois que ele fizer login.

O fluxo será:

email + senha
      ↓
backend verifica usuário
      ↓
backend compara senha com bcrypt
      ↓
dados corretos
      ↓
JWT criado
      ↓
token enviado ao cliente
Depois o cliente enviará:

Authorization: Bearer TOKEN
e o backend saberá:

quem é o usuário
qual é o ID
qual é o papel
Passo 1.1 — Criar o segredo JWT
Agora abra:

backend/.env
Você provavelmente já tem algo como:

DATABASE_URL="file:./dev.db"
Edite esse mesmo arquivo .env existente. Não crie outra query, arquivo ou .env separado.

Acrescente:

JWT_SECRET="events_project_dev_secret_change_in_production"
JWT_EXPIRES_IN="1d"
PORT=3000
Ficará semelhante a:

DATABASE_URL="file:./dev.db"

JWT_SECRET="events_project_dev_secret_change_in_production"
JWT_EXPIRES_IN="1d"

PORT=3000
Por enquanto esse segredo serve para desenvolvimento local. Antes do deploy colocaremos uma chave forte diretamente nas variáveis de ambiente da hospedagem.

Passo 1.2 — Criar .gitignore
Isso precisa ser feito agora, porque seu repositório atualmente mostra tanto .env quanto node_modules no GitHub. 

Na raiz do projeto:

EventsProject/
crie o arquivo:

.gitignore
Coloque:

# Dependencies
node_modules/
backend/node_modules/

# Environment variables
.env
*.env
!.env.example

# Local database
*.db
*.db-journal

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
dist/
build/

# IDE / OS
.vscode/
.idea/
.DS_Store
Thumbs.db
Importante
Adicionar algo ao .gitignore não remove automaticamente arquivos que já foram enviados ao GitHub.

Então não execute nenhum comando adicional de Git ainda. Quando chegarmos à parte de versionamento da Etapa 2, vou orientar como tirar:

backend/node_modules
backend/.env
do rastreamento sem apagar os arquivos do seu computador.

Passo 1.3 — Criar .env.example
Dentro de:

backend/
crie:

.env.example
Coloque:

DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="1d"
PORT=3000
Esse arquivo pode ir para o GitHub porque não possui segredo real.

Ele também será útil no README, já que o desafio exige instruções claras para configurar e executar o banco e a aplicação. 


Antes de continuarmos
Neste primeiro passo, faça somente estas três coisas:

1. npm install jsonwebtoken

2. editar backend/.env
   adicionando JWT_SECRET, JWT_EXPIRES_IN e PORT

3. criar:
   /.gitignore
   /backend/.env.example
Ainda não faça commit.

Também não altere server.js ainda. Ele está atualmente vazio no seu repositório, então vamos montá-lo de forma organizada quando chegarmos à inicialização da API. 

Quando terminar, me envie o resultado do terminal do:

npm install jsonwebtoken
e, se quiser, uma imagem da estrutura de arquivos. Aí fazemos o Passo 2: conexão reutilizável do Prisma + estrutura inicial da API.



Texto colado.txt
Documento


Texto colado(1).txt
Documento


Código colado.js
JavaScript
fiz algumas alterações, faça os ajuste necessarios


Texto colado(2).txt
Documento


Markdown.md colado
Arquivo


Texto colado(3).txt
Documento
confere se ta certo


Texto colado(4).txt
Documento


Texto colado(5).txt
Documento


PS C:\Users\Pedro\Documents\Nova pasta\EventosProject\backend> node -e "import('./src/lib/prisma.js').then(async ({default: prisma}) => { const events = await prisma.event.findMany({ where: { status: 'PUBLISHED' }, select: { title: true, city: true, state: true, country: true, dateTime: true, categoryTemplate: { select: { name: true } } } }); console.dir(events, { depth: null }); await prisma.$disconnect(); }).catch(console.error)"
[
  {
    title: 'Filhos do Éden: Paraíso Perdido',
    city: 'Fortaleza',
    state: 'CE',
    country: 'BR',
    dateTime: 2026-10-10T23:00:00.000Z,
    categoryTemplate: { name: 'TEATRO E ESPETACULOS' }
  },
  {
    title: 'Epica - Live in Brazil',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    dateTime: 2026-11-16T00:00:00.000Z,
    categoryTemplate: { name: 'SHOWS E FESTAS' }
  },
  {
    title: 'Lançamento e Autógrafos - Enciclopédia Serial Killers: A Maldade de A a Z',
    city: 'Brasília',
    state: 'DF',
    country: 'BR',
    dateTime: 2026-10-25T20:00:00.000Z,
    categoryTemplate: { name: 'LITERATURA | LANCAMENTOS' }
  },
  {
    title: 'Amanhecer - Parte 1 | Relançamento',
    city: 'Fortaleza',
    state: 'CE',
    country: 'BR',
    dateTime: 2026-11-20T22:30:00.000Z,
    categoryTemplate: { name: 'CINEMA' }
  }
]
PS C:\Users\Pedro\Documents\Nova pasta\EventosProject\backend>



Texto colado(6).txt
Documento


Texto colado(7).txt
Documento

25230aa6-177e-400a-8fbf-a72bf9fe715d.png
65a488fb-a377-4f44-9aba-40c66f97764d.png
na primeira imagem os nomes ficaram sublinhados e isso ñ era pra acontecer, deve ficar como estava antes. na segunda mostra qe ñ tem espaço entre oq ta escrito

troquei a paleta de cores porem o nome selecionadodeve ser branco pois a cor dele ficou escondida no fundo

Imagem gerada: Interface vibrante de eventos Boraí


Editar



Texto colado(9).txt
Documento


Texto colado(10).txt
Documento


Markdown(1).md colado
Arquivo

Markdown (2).md colado
Arquivo

---

# [Etapa 5] Front-End: Autenticação, Catálogo Público e Estrutura dos Perfis

**Status:** Concluído

## Objetivo da Etapa

Construir a primeira versão funcional do Front-End do Boraí, conectando a interface React ao Back-End desenvolvido nas etapas anteriores.

A etapa teve como objetivos principais:

- criar a aplicação Front-End;
- estabelecer a identidade visual do Boraí;
- implementar navegação pública;
- criar Home e catálogo de eventos;
- consumir eventos reais da API;
- permitir busca e filtragem;
- criar página detalhada dos eventos;
- integrar autenticação ao Back-End;
- persistir a sessão no navegador;
- proteger rotas conforme o perfil;
- criar as áreas iniciais de Cliente, Organizador e Portaria;
- implementar logout;
- tratar rotas inexistentes;
- tornar a interface responsiva;
- validar o código com ESLint;
- validar o build de produção com Vite.

A Etapa 5 concentrou-se na estrutura pública e de autenticação do Front-End.

As funcionalidades específicas de gerenciamento de eventos, compra, checkout, QR Code e scanner permaneceram reservadas para suas respectivas etapas posteriores.

---

## 1. Criação do Front-End

Foi criada uma aplicação independente dentro de:

```text
frontend/
utilizando:

React
Vite
React Router
JavaScript
CSS
O Front-End foi mantido separado do Back-End:

EventosProject/
├── backend/
└── frontend/
Essa organização permite que as duas aplicações tenham:

dependências próprias;

scripts próprios;

variáveis de ambiente próprias;

processos de desenvolvimento independentes.

2. Organização da aplicação React
A estrutura do Front-End foi dividida por responsabilidades.

Entre os principais diretórios criados:

frontend/src/
├── components/
├── contexts/
├── layouts/
├── pages/
├── routes/
└── services/
A divisão foi utilizada para separar:

componentes reutilizáveis;

autenticação;

layouts;

páginas;

proteção de rotas;

comunicação com a API.

3. Estrutura inicial de páginas
Foram criadas páginas para os principais fluxos da aplicação:

HomePage.jsx
EventsPage.jsx
EventDetailsPage.jsx
LoginPage.jsx
ClientPage.jsx
OrganizerPage.jsx
CheckinPage.jsx
NotFoundPage.jsx
As rotas foram centralizadas em:

App.jsx
4. Rotas públicas
Foram configuradas inicialmente as seguintes rotas públicas:

/
Home.

/eventos
Catálogo de eventos.

/eventos/:eventId
Detalhes de um evento.

/login
Autenticação.

Também foi criada uma rota coringa:

*
para páginas inexistentes.

5. Layout público compartilhado
Foi criado:

src/layouts/PublicLayout.jsx
para concentrar a navegação compartilhada entre as páginas públicas.

O layout utiliza:

Outlet
do React Router para renderizar as páginas internas.

O header passou a disponibilizar navegação para:

Boraí
Eventos
Entrar
Quando existe um usuário autenticado, o menu muda dinamicamente.

6. Navegação conforme autenticação
O header passou a consultar o contexto de autenticação.

Quando não existe usuário autenticado:

Entrar
é exibido.

Quando existe usuário autenticado, são apresentados:

nome do usuário;

acesso à sua respectiva área;

opção de logout.

7. Navegação conforme perfil
Foi criado um mapeamento entre perfil e área da aplicação.

CLIENT
→ /cliente
ORGANIZER
→ /organizador
CHECKIN
→ /portaria
O texto apresentado no header também muda conforme o papel do usuário.

Exemplos:

Minha área
Painel do Organizador
Portaria
8. Identidade visual do Boraí
Durante a Etapa 5 foi desenvolvida a identidade visual principal da aplicação.

Foram definidos e refinados:

cores;

tipografia;

espaçamentos;

botões;

cards;

formulários;

estados de hover;

navegação;

hierarquia dos títulos;

elementos de destaque;

comportamento responsivo.

A identidade visual passou por várias revisões durante a implementação.

9. Revisão da paleta de cores
Uma das decisões manuais da etapa foi substituir a paleta utilizada inicialmente.

Após revisão visual, foi decidido que o verde utilizado anteriormente não deveria permanecer na identidade final.

A paleta do Front-End foi então atualizada para utilizar somente as cores escolhidas para a identidade atual do Boraí.

Também foi identificado um problema de contraste nos elementos selecionados.

Quando determinado item recebia a cor de fundo ativa, seu texto ficava pouco visível.

A solução foi utilizar texto branco nos estados selecionados necessários.

10. Header e navegação responsiva
O header recebeu tratamento específico para diferentes larguras.

Foram ajustados:

logo;

links principais;

área da conta;

espaçamento;

usuário autenticado;

botão de login;

botão de logout;

indicador de página ativa.

Em telas menores, os elementos são reorganizados para evitar sobreposição.

11. Home
A Home foi construída como porta de entrada pública do Boraí.

Ela recebeu:

hero principal;

identidade da plataforma;

chamadas para ação;

navegação para eventos;

eventos em destaque;

cards;

tratamento para ausência de eventos.

Também foram criados atalhos para facilitar a descoberta do catálogo.

12. Integração da Home com eventos reais
Os eventos exibidos deixaram de depender apenas de conteúdo estático.

A Home passou a utilizar a camada de serviços para consumir os eventos disponibilizados pelo Back-End.

Foram tratados:

carregamento
sucesso
erro
lista vazia
13. Componente EventCard
Foi criado:

src/components/EventCard.jsx
como componente reutilizável para apresentação resumida dos eventos.

O componente passou a exibir informações relevantes como:

imagem;

categoria;

título;

data;

horário;

cidade/local;

ação para visualizar o evento.

Também foi criado um fallback visual para eventos sem imagem.

14. Card inteiro clicável
Inicialmente a navegação para os detalhes dependia da ação:

Ver evento
Durante o teste manual foi decidido que isso não proporcionava a melhor experiência.

O comportamento foi alterado para que:

todo o card seja clicável
Assim, clicar em qualquer região do card leva aos detalhes do evento.

15. Correção visual causada pelo card clicável
Ao transformar o card inteiro em um link, o navegador passou a aplicar estilos típicos de links em partes do conteúdo.

Foi identificado principalmente que os nomes/títulos dos eventos apareciam sublinhados.

Esse comportamento não fazia parte da identidade visual desejada.

O CSS foi ajustado para que:

o card inteiro continue clicável;

título e textos mantenham aparência normal;

o conteúdo não fique sublinhado;

a ação visual continue indicando navegação;

os estados de hover permaneçam consistentes.

16. Catálogo público
Foi criada a página:

/eventos
para funcionar como catálogo público.

Ela utiliza os eventos retornados pela API e apresenta os resultados em uma grade de cards.

A página possui:

cabeçalho;

texto introdutório;

filtros;

quantidade de resultados;

indicação de filtros ativos;

listagem dos eventos;

tratamento de estado vazio;

tratamento de erro.

17. Busca textual
Foi implementado campo de busca no catálogo.

A busca considera informações como:

nome do evento;

cidade;

estado;

local.

Foi criada uma função de normalização textual.

O objetivo foi permitir buscas mais naturais.

Por exemplo, diferenças de acentuação não devem impedir uma correspondência adequada.

18. Normalização de texto
Foi criada uma função baseada em:

normalize("NFD")
e remoção dos caracteres de acentuação.

Também são aplicados:

conversão para minúsculas;

tratamento para português;

remoção de espaços extras.

Isso melhora o comportamento da pesquisa textual.

19. Filtro por categoria
O catálogo permite filtrar eventos por categoria.

As categorias disponíveis são derivadas dos próprios eventos retornados pela API.

Valores duplicados são removidos antes de preencher o filtro.

20. Categoria recebida pela URL
Foi implementado suporte para URLs como:

/eventos?categoria=...
Isso permite que outras áreas da aplicação encaminhem o usuário diretamente para um catálogo filtrado.

O recurso foi utilizado na navegação da Home para o catálogo.

21. Filtro por cidade
Também foi criado filtro por cidade.

As cidades são obtidas dos próprios eventos disponíveis e organizadas alfabeticamente.

22. Filtro por mês
Foi criado filtro específico por mês.

Os doze meses são apresentados ao usuário:

Janeiro
Fevereiro
Março
Abril
Maio
Junho
Julho
Agosto
Setembro
Outubro
Novembro
Dezembro
A comparação é realizada utilizando a data real do evento.

23. Filtro por ano
Os anos existentes são derivados das datas dos eventos.

Isso evita manter uma lista fixa de anos no Front-End.

24. Combinação de filtros
Os filtros podem atuar simultaneamente.

O catálogo considera:

busca
+
categoria
+
cidade
+
mês
+
ano
Um evento somente permanece na lista quando atende aos filtros ativos aplicáveis.

25. Resumo do catálogo
Foi criada uma área para informar quantos eventos foram encontrados.

Exemplo:

1 evento encontrado
ou:

3 eventos encontrados
Quando existe algum filtro aplicado, a interface também informa:

Filtros ativos
26. Limpeza dos filtros
Foi criada uma ação:

Limpar filtros
Quando utilizada, os estados são restaurados.

São limpos:

search
category
city
month
year
Também existe opção de limpeza quando nenhum evento corresponde à pesquisa.

27. Estado sem resultados
Quando os filtros não encontram eventos, o usuário recebe uma interface específica informando:

Nenhum evento encontrado
e pode remover todos os filtros.

28. Detalhes do evento
Foi criada:

src/pages/EventDetailsPage.jsx
associada à rota:

/eventos/:eventId
A página utiliza o identificador presente na URL para consultar o evento correspondente.

29. Informações apresentadas nos detalhes
A tela foi estruturada para apresentar informações como:

imagem;

título;

categoria;

data;

horário;

local;

cidade;

estado;

descrição;

setores;

modalidades;

lotes;

categorias comerciais;

preços.

Isso aproveita a modelagem já construída no Back-End.

30. Estrutura comercial dos ingressos
A página de detalhes já consegue apresentar a estrutura comercial cadastrada para o evento.

A hierarquia visual considera:

Evento
    ↓
Setor
    ↓
Modalidade
    ↓
Lote
    ↓
Categoria de preço
Essa estrutura prepara a aplicação para o fluxo de seleção e compra da Etapa 7.

31. Eventos sem imagem
Quando um evento não possui imagem disponível, é utilizado um placeholder visual coerente com a identidade da aplicação.

Isso evita áreas quebradas ou vazias na interface.

32. Ajustes de espaçamento nos detalhes
Durante os testes visuais foi identificado que determinadas informações estavam excessivamente próximas.

Foram realizados ajustes específicos em:

localização;

descrição;

seção de ingressos;

título dos setores;

modalidades;

lotes;

linhas de preço.

O objetivo foi melhorar a separação visual e legibilidade.

33. Investigação do CSS
Durante esses ajustes, alterações inicialmente realizadas não produziram o efeito esperado.

Foi necessário investigar o arquivo:

src/index.css
Foram localizadas:

regras repetidas;

múltiplas definições de .event-details-hero;

media queries;

regras adicionadas posteriormente;

blocos específicos dos detalhes;

regras específicas dos cards.

34. Conferência estrutural das chaves do CSS
Como o arquivo CSS havia crescido consideravelmente, também foi verificada a profundidade das chaves.

A análise confirmou que o arquivo terminava com:

DEPTH FINAL = 0
indicando que os blocos estavam estruturalmente fechados.

35. Responsividade dos detalhes
Foram criados comportamentos específicos para telas menores.

A estrutura de duas colunas dos detalhes passa para uma coluna conforme a largura disponível.

Também foram ajustados:

imagem;

setores;

lotes;

listas de preços;

espaçamentos.

36. Serviço de autenticação
Foi utilizada uma camada própria para comunicação com o endpoint de autenticação:

src/services/authService.js
O Front-End envia:

email
password
e recebe os dados necessários para a sessão.

37. Página de Login
Foi criada:

src/pages/LoginPage.jsx
com os campos:

E-mail
Senha
A página utiliza o contexto de autenticação para executar


vc continua sem fazer oq eu mandei. tudo da etapa deve ta dentro da porra do markdown pra copiar e colar ñ é pra ter texto escrito fora disso

---

# [Etapa 5] Front-End: Autenticação, Catálogo Público e Estrutura dos Perfis

**Status:** Concluído

## Objetivo da Etapa

Construir a primeira versão funcional do Front-End do Boraí, conectando a interface React ao Back-End desenvolvido nas etapas anteriores.

A etapa teve como objetivos principais:

- criar a aplicação Front-End;
- estabelecer a identidade visual do Boraí;
- implementar navegação pública;
- criar Home e catálogo de eventos;
- consumir eventos reais da API;
- permitir busca e filtragem;
- criar página detalhada dos eventos;
- integrar autenticação ao Back-End;
- persistir a sessão no navegador;
- proteger rotas conforme o perfil;
- criar as áreas iniciais de Cliente, Organizador e Portaria;
- implementar logout;
- tratar rotas inexistentes;
- tornar a interface responsiva;
- validar o código com ESLint;
- validar o build de produção com Vite.

A Etapa 5 concentrou-se na estrutura pública e de autenticação do Front-End.

As funcionalidades específicas de gerenciamento de eventos, compra, checkout, QR Code e scanner permaneceram reservadas para suas respectivas etapas posteriores.

---

## 1. Criação do Front-End

Foi criada uma aplicação independente dentro de:

```text
frontend/
utilizando:

React
Vite
React Router
JavaScript
CSS
O Front-End foi mantido separado do Back-End:

EventosProject/
├── backend/
└── frontend/
Essa organização permite que as duas aplicações tenham:

dependências próprias;

scripts próprios;

variáveis de ambiente próprias;

processos de desenvolvimento independentes.

2. Organização da aplicação React
A estrutura do Front-End foi dividida por responsabilidades.

Entre os principais diretórios criados:

frontend/src/
├── components/
├── contexts/
├── layouts/
├── pages/
├── routes/
└── services/
A divisão foi utilizada para separar:

componentes reutilizáveis;

autenticação;

layouts;

páginas;

proteção de rotas;

comunicação com a API.

3. Estrutura inicial de páginas
Foram criadas páginas para os principais fluxos da aplicação:

HomePage.jsx
EventsPage.jsx
EventDetailsPage.jsx
LoginPage.jsx
ClientPage.jsx
OrganizerPage.jsx
CheckinPage.jsx
NotFoundPage.jsx
As rotas foram centralizadas em:

App.jsx
4. Rotas públicas
Foram configuradas as seguintes rotas públicas:

/
Home.

/eventos
Catálogo de eventos.

/eventos/:eventId
Detalhes de um evento.

/login
Autenticação.

Também foi criada uma rota coringa:

*
para páginas inexistentes.

5. Layout público compartilhado
Foi criado:

src/layouts/PublicLayout.jsx
para concentrar a navegação compartilhada entre as páginas públicas.

O layout utiliza:

Outlet
do React Router para renderizar as páginas internas.

O header passou a disponibilizar navegação para:

Boraí
Eventos
Entrar
Quando existe um usuário autenticado, o menu muda dinamicamente.

6. Navegação conforme autenticação
O header passou a consultar o contexto de autenticação.

Quando não existe usuário autenticado:

Entrar
é exibido.

Quando existe usuário autenticado, são apresentados:

nome do usuário;

acesso à sua respectiva área;

opção de logout.

7. Navegação conforme perfil
Foi criado um mapeamento entre perfil e área da aplicação.

CLIENT
→ /cliente
ORGANIZER
→ /organizador
CHECKIN
→ /portaria
O texto apresentado no header também muda conforme o papel do usuário.

Exemplos:

Minha área
Painel do Organizador
Portaria
8. Identidade visual do Boraí
Durante a Etapa 5 foi desenvolvida a identidade visual principal da aplicação.

Foram definidos e refinados:

cores;

tipografia;

espaçamentos;

botões;

cards;

formulários;

estados de hover;

navegação;

hierarquia dos títulos;

elementos de destaque;

comportamento responsivo.

A identidade visual passou por várias revisões durante a implementação.

9. Referência visual da interface
A estrutura visual foi inspirada em plataformas de eventos, buscando uma navegação semelhante a catálogos profissionais de venda de ingressos, porém mantendo identidade própria do Boraí.

Foram priorizados:

header fixo;

catálogo visual;

cards de eventos;

filtros;

áreas bem separadas;

destaque para chamadas de ação;

leitura simples das informações de data e local.

10. Tipografia
Foram analisadas diferentes opções de fontes.

Entre as fontes avaliadas estavam:

Open Sans
Roboto Mono
Merriweather
Sekuya
A estrutura final passou a utilizar variáveis CSS para separar:

--font-brand
--font-heading
--font-body
--font-mono
Permitindo diferentes usos para:

marca;

títulos;

textos comuns;

informações técnicas.

11. Revisão da paleta de cores
A identidade visual passou por alteração de paleta durante a implementação.

Inicialmente foram utilizadas cores em tons de verde, azul, coral e rosa.

Após avaliação visual, foi decidido remover o verde como cor predominante.

A paleta foi atualizada para trabalhar principalmente com:

vinho;

ameixa;

rosa;

roxo;

azul acinzentado;

fundos claros.

Mesmo algumas variáveis CSS mantendo nomes antigos por compatibilidade com o código já existente, os valores foram substituídos pela nova paleta.

12. Correção de contraste
Durante a mudança de paleta foi identificado que determinados itens selecionados ficavam com texto pouco visível sobre o fundo colorido.

Foi decidido que elementos selecionados deveriam utilizar:

texto branco
quando necessário para garantir contraste.

Foram ajustados principalmente:

itens ativos;

categorias;

elementos de navegação;

estados selecionados.

13. Header e navegação responsiva
O header recebeu tratamento específico para diferentes larguras.

Foram ajustados:

logo;

links principais;

área da conta;

espaçamento;

usuário autenticado;

botão de login;

botão de logout;

indicador de página ativa.

Em telas menores, os elementos são reorganizados para evitar sobreposição.

14. Home
A Home foi construída como porta de entrada pública do Boraí.

Ela recebeu:

hero principal;

identidade da plataforma;

chamadas para ação;

navegação para eventos;

eventos em destaque;

cards;

tratamento para ausência de eventos.

Também foram criados atalhos para facilitar a descoberta do catálogo.

15. Integração da Home com eventos reais
Os eventos exibidos deixaram de depender apenas de conteúdo estático.

A Home passou a utilizar a camada de serviços para consumir os eventos disponibilizados pelo Back-End.

Foram tratados:

carregamento
sucesso
erro
lista vazia
16. Componente EventCard
Foi criado:

src/components/EventCard.jsx
como componente reutilizável para apresentação resumida dos eventos.

O componente passou a exibir informações relevantes como:

imagem;

categoria;

título;

data;

horário;

cidade;

local;

ação para visualizar o evento.

Também foi criado um fallback visual para eventos sem imagem.

17. Card inteiro clicável
Inicialmente a navegação para os detalhes dependia da ação:

Ver evento
Durante o teste manual foi decidido que isso não proporcionava a melhor experiência.

O comportamento foi alterado para que:

todo o card seja clicável
Assim, clicar em:

imagem;

título;

data;

local;

espaço interno do card;

ação "Ver evento";

leva para os detalhes do evento.

18. Correção visual causada pelo card clicável
Ao transformar o card inteiro em um link, o navegador passou a aplicar estilos típicos de links em partes do conteúdo.

Foi identificado principalmente que os nomes/títulos dos eventos apareciam sublinhados.

Esse comportamento não fazia parte da identidade visual desejada.

O CSS foi ajustado para que:

o card inteiro continue clicável;

título e textos mantenham aparência normal;

o conteúdo não fique sublinhado;

a ação visual continue indicando navegação;

os estados de hover permaneçam consistentes.

19. Catálogo público
Foi criada a página:

/eventos
para funcionar como catálogo público.

Ela utiliza os eventos retornados pela API e apresenta os resultados em uma grade de cards.

A página possui:

cabeçalho;

texto introdutório;

filtros;

quantidade de resultados;

indicação de filtros ativos;

listagem dos eventos;

tratamento de estado vazio;

tratamento de erro.

20. Endpoint público de eventos
Durante a Etapa 5 também foi criada a estrutura necessária no Back-End para disponibilizar os eventos publicados ao Front-End.

Foram adicionados:

backend/src/controllers/eventController.js
backend/src/routes/eventRoutes.js
e a rota foi registrada no servidor.

Foram disponibilizados endpoints públicos para:

GET /events
GET /events/:eventId
permitindo que visitantes consultem eventos sem autenticação.

21. Regra de acesso público
Foi definido que:

não é necessário login para visualizar eventos
O visitante pode:

acessar a Home;

abrir o catálogo;

pesquisar eventos;

filtrar;

abrir os detalhes;

consultar opções de ingressos.

A autenticação não deve ser exigida antes da etapa de checkout.

Essa decisão ficou reservada para ser aplicada no fluxo de compra da Etapa 7.

22. Listagem pública de eventos
A rota pública retorna somente eventos com:

status = PUBLISHED
Os eventos são ordenados por:

dateTime
em ordem crescente.

O Front-End passou a utilizar esses dados diretamente.

23. Informações retornadas no catálogo
A listagem pública disponibiliza informações como:

id
title
description
imageUrl
dateTime
venueName
city
state
country
source
categoryTemplate
A propriedade técnica source permanece interna à


qual é o teu problema? faz logo o caralho da etapa 5 em um único arquivo

Baixar o arquivo único da Etapa 5 — Etapa_5_Frontend.md 


Etapa_5_Frontend.md
Documento


Biblioteca
/
Etapa_5_Frontend.md


[Etapa 5] Front-End: Autenticação, Catálogo Público e Estrutura dos Perfis
Status: Concluído

Objetivo da Etapa
Construir a primeira versão funcional do Front-End do Boraí, conectando
a aplicação React ao Back-End desenvolvido nas etapas anteriores e
estabelecendo a base visual e funcional necessária para os próximos
módulos.

Principais entregas:

aplicação Front-End em React + Vite;

identidade visual e responsividade;

Home;

catálogo público;

busca e filtros;

cards de eventos;

detalhes completos do evento;

integração de autenticação;

persistência de sessão;

proteção de rotas e RBAC;

áreas iniciais de Cliente, Organizador e Portaria;

logout;

página 404;

correções de lint, imports, contexto e codificação;

validação por ESLint e build de produção.

As funcionalidades de gerenciamento completo de eventos, compra,
checkout, QR Code e scanner ficaram reservadas para as etapas seguintes.

1. Estrutura do Front-End
Foi criada uma aplicação independente em frontend/, utilizando React,
Vite, React Router, JavaScript e CSS.

EventosProject/
├── backend/
└── frontend/
A aplicação foi organizada por responsabilidade:

frontend/src/
├── components/
├── contexts/
├── layouts/
├── pages/
├── routes/
└── services/
Principais páginas:

HomePage.jsx
EventsPage.jsx
EventDetailsPage.jsx
LoginPage.jsx
ClientPage.jsx
OrganizerPage.jsx
CheckinPage.jsx
NotFoundPage.jsx
As rotas foram centralizadas em App.jsx.

2. Rotas públicas e layout
Foram configuradas:

/                   → Home
/eventos            → Catálogo
/eventos/:eventId   → Detalhes do evento
/login              → Login
*                   → Página não encontrada
Foi criado PublicLayout.jsx, utilizando Outlet do React Router para
compartilhar a navegação entre as páginas públicas.

O visitante pode navegar pela Home, catálogo e detalhes sem
autenticação.

3. Identidade visual
Durante a etapa foi construída e refinada a identidade visual do Boraí.

Foram trabalhados:

paleta;

tipografia;

títulos;

espaçamentos;

botões;

formulários;

cards;

navegação;

hover;

elementos ativos;

responsividade.

A paleta passou por revisão. O verde utilizado inicialmente foi retirado
da identidade visual final, mantendo apenas a nova combinação de cores
escolhida.

Também foi corrigido o contraste de elementos selecionados: quando o
texto ficava pouco visível sobre o fundo ativo, passou a ser exibido em
branco.

4. Header e navegação
O header passou a disponibilizar:

identidade Boraí;

acesso à Home;

acesso aos eventos;

login;

indicação da página ativa;

informações da conta autenticada.

Quando existe sessão ativa, a navegação muda conforme o perfil:

CLIENT     → /cliente
ORGANIZER  → /organizador
CHECKIN    → /portaria
O header também recebeu ajustes responsivos.

5. Home
A Home foi construída como porta de entrada pública da plataforma.

Foram implementados:

hero;

chamadas para ação;

acesso ao catálogo;

eventos em destaque;

cards;

atalhos de descoberta;

carregamento;

erro;

estado sem eventos.

Os eventos apresentados passaram a utilizar dados reais fornecidos pelo
Back-End.

A Home também foi integrada ao catálogo por meio de navegação e
parâmetros de categoria.

6. EventCard
Foi criado src/components/EventCard.jsx.

O componente apresenta:

imagem;

categoria;

título;

data;

horário;

cidade/local;

ação "Ver evento".

Quando não existe imagem, é utilizado um fallback visual.

Card inteiro clicável
Inicialmente somente "Ver evento" levava aos detalhes. O comportamento
foi alterado para que todo o card seja clicável e direcione para
/eventos/:eventId.

Correção do sublinhado
Ao transformar o card em link, títulos e textos internos passaram a
receber decoração de link. O CSS foi corrigido para manter o card
inteiro clicável sem sublinhar o conteúdo, preservando o destaque
apropriado da ação e do hover.

7. Catálogo público
Foi criada a página /eventos.

Ela apresenta:

cabeçalho;

introdução;

busca;

filtros;

quantidade de resultados;

indicação de filtros ativos;

cards;

carregamento;

erro;

estado sem resultados.

O catálogo utiliza os eventos disponibilizados pela API.

8. Busca e normalização
Foi implementada busca textual considerando informações relevantes do
evento.

Para tornar a pesquisa mais tolerante a acentos e capitalização, foi
utilizada normalização baseada em:

normalize("NFD")
Também são tratados minúsculas e espaços.

9. Filtros
Foram implementados filtros por:

categoria;

cidade;

mês;

ano.

Os filtros podem atuar simultaneamente:

busca + categoria + cidade + mês + ano
Também foi criada a ação "Limpar filtros".

Quando nenhum evento corresponde à pesquisa, a interface apresenta
estado específico e permite remover os filtros.

10. Categoria recebida pela URL
Foi implementado suporte para:

/eventos?categoria=...
permitindo que a Home encaminhe o usuário ao catálogo já considerando
uma categoria.

Na validação final, a inicialização desse estado foi revisada por causa
da regra react-hooks/set-state-in-effect.

A solução foi inicializar category diretamente com
searchParams.get("categoria"), removendo o useEffect que apenas
copiava esse valor para o estado.

11. Detalhes do evento
Foi criada src/pages/EventDetailsPage.jsx, associada a:

/eventos/:eventId
A página apresenta:

imagem;

título;

categoria;

data;

horário;

local;

cidade;

estado;

descrição;

setores;

modalidades;

lotes;

categorias comerciais;

preços.

A estrutura visual já representa a hierarquia comercial:

Evento
  ↓
Setor
  ↓
Modalidade
  ↓
Lote
  ↓
Categoria de preço
Isso prepara o projeto para a seleção e compra da Etapa 7.

12. Refinamentos dos detalhes
Durante a validação visual foi percebido que várias informações estavam
excessivamente próximas.

Foram ajustados:

localização;

descrição;

seção de ingressos;

cabeçalhos dos setores;

modalidades;

lotes;

linhas de preço;

comportamento responsivo.

A estrutura de duas colunas passa para uma coluna em telas menores.

13. Investigação do CSS
Alguns ajustes inicialmente não produziram o resultado esperado,
exigindo investigação de frontend/src/index.css.

Foram encontradas regras repetidas, múltiplas definições relacionadas a
.event-details-hero, media queries e regras adicionadas em momentos
diferentes.

A estrutura das chaves foi conferida por PowerShell, com resultado:

DEPTH FINAL = 0
confirmando que os blocos estavam estruturalmente fechados.

14. Login
Foi criada src/pages/LoginPage.jsx.

O formulário possui:

e-mail;

senha;

envio das credenciais;

estado de carregamento;

tratamento de erro.

Durante o processamento, isLoggingIn é utilizado e o botão pode
apresentar "Entrando...".

A comunicação utiliza a camada authService.js.

15. Contexto e persistência de autenticação
Foi implementado contexto global contendo:

token;

user;

isAuthenticated;

isLoggingIn;

login;

logout.

A sessão é persistida no localStorage usando:

borai_auth
Após login válido são armazenados token e usuário.

Ao recarregar a aplicação, esses dados são recuperados. Dados ausentes
ou inválidos resultam em sessão não autenticada.

16. Logout
O logout:

remove borai_auth;

remove o token;

remove o usuário;

encerra a sessão visualmente.

Durante os testes foi percebido que as áreas privadas não possuíam
logout próprio.

Foi criado src/components/AccountLogout.jsx, reutilizado nas áreas
autenticadas.

17. ProtectedRoute e RBAC
Foi criado src/routes/ProtectedRoute.jsx.

Sem autenticação:

→ /login
Com autenticação, mas perfil incorreto:

→ /
As rotas foram protegidas por allowedRoles:

CLIENT     → /cliente
ORGANIZER  → /organizador
CHECKIN    → /portaria
18. Área do Cliente
Foi criada /cliente, restrita a CLIENT.

A página apresenta:

identificação da área;

saudação com nome;

painel;

card "Meus ingressos";

card para encontrar eventos;

acesso ao catálogo;

funcionalidades futuras;

logout.

"Meus Ingressos" completo permanece para a Etapa 8.

19. Área do Organizador
Foi criada /organizador, restrita a ORGANIZER.

A página estabelece a base visual do painel e inclui logout.

O CRUD completo de eventos permanece para a Etapa 6.

20. Área da Portaria
Foi criada /portaria, restrita a CHECKIN.

A página estabelece a base inicial da área e inclui logout.

Scanner e validação permanecem para a Etapa 9.

21. Página 404
Foi criada NotFoundPage.jsx para rotas inexistentes, com mensagem
apropriada e retorno ao início, mantendo o padrão visual da aplicação.

22. Problema com execução do npm
Os comandos de validação foram inicialmente executados na raiz
EventosProject/, resultando em:

ENOENT
Could not read package.json
O package.json está em EventosProject/frontend/.

A execução correta passou a ser:

cd frontend
npm run lint
npm run build
23. Erro Fast Refresh
O ESLint identificou:

react-refresh/only-export-components
em src/contexts/AuthContext.jsx.

Para separar responsabilidades, foi criado:

src/contexts/authContext.js
Esse arquivo passou a concentrar o contexto e useAuth, enquanto
AuthContext.jsx permaneceu responsável pelo AuthProvider e lógica de
sessão.

24. Atualização dos imports
Após a separação, consumidores de useAuth foram revisados, incluindo:

PublicLayout.jsx;

ProtectedRoute.jsx;

LoginPage.jsx;

ClientPage.jsx;

OrganizerPage.jsx;

CheckinPage.jsx;

AccountLogout.jsx.

O main.jsx continuou utilizando AuthProvider.

25. Erro setState no useEffect
O ESLint identificou:

react-hooks/set-state-in-effect
em EventsPage.jsx.

A categoria da URL era aplicada com setCategory(...) dentro de
useEffect.

O efeito foi removido e o estado passou a ser inicializado diretamente a
partir de searchParams.get("categoria").

Durante uma tentativa intermediária também surgiu:

'initialCategory' is assigned a value but never used
A variável intermediária foi removida.

26. Erro MISSING_EXPORT
Durante a separação do contexto, o build apresentou:

[MISSING_EXPORT] "useAuth" is not exported by "src/contexts/AuthContext.jsx"
Alguns componentes ainda importavam o hook do arquivo antigo.

Os imports foram corrigidos para authContext.js.

27. Problema de codificação no PowerShell
Uma substituição em massa usando Set-Content alterou arquivos que não
deveriam possuir mudanças funcionais.

A investigação utilizou:

git diff --stat
git diff --ignore-space-at-eol --stat
git diff -- frontend/src/main.jsx
Foi identificado um caractere invisível antes de import, indicando
BOM, além de alterações de final de linha e avisos:

LF will be replaced by CRLF
Para evitar registrar alterações artificiais, os arquivos foram
restaurados para o último estado seguro e apenas as mudanças necessárias
foram reaplicadas de forma controlada.

Também foram observadas representações incorretas de caracteres
acentuados no terminal, como Ã, Ã£ e Ã§, reforçando a necessidade
de cuidado com codificação no PowerShell.

28. Validação final
ESLint
Foi executado:

npm run lint
Resultado:

> frontend@0.0.0 lint
> eslint .
Nenhum erro foi retornado.

ESLint: APROVADO

Build
Foi executado:

npm run build
Resultado final:

vite v8.2.1 building client environment for production...
✓ 91 modules transformed.
dist/index.html                   0.86 kB
dist/assets/index-B3bqnl9L.css   21.65 kB
dist/assets/index-QGPq9P3e.js   250.55 kB
✓ built in 209ms
Build de produção: APROVADO

29. Testes funcionais
Home
Home carrega.

Navegação funciona.

Eventos são apresentados.

Cards funcionam.

Navegação para catálogo funciona.

Catálogo
Eventos carregam.

Busca funciona.

Normalização funciona.

Categoria funciona.

Cidade funciona.

Mês funciona.

Ano funciona.

Filtros podem ser combinados.

Quantidade de resultados é atualizada.

Filtros podem ser limpos.

Estado vazio é tratado.

Categoria pode ser recebida pela URL.

Cards
Card inteiro clicável.

Navegação para detalhes funciona.

Sublinhado indevido removido.

Fallback visual disponível.

Detalhes
Evento correto é carregado.

Dados principais exibidos.

Localização exibida.

Descrição exibida.

Setores exibidos.

Modalidades exibidas.

Lotes exibidos.

Preços exibidos.

Espaçamentos revisados.

Responsividade revisada.

Login e sessão
Formulário funciona.

Integração com Back-End funciona.

Carregamento funciona.

Erros são tratados.

Sessão é persistida.

Logout funciona.

RBAC
CLIENT acessa /cliente.

ORGANIZER acessa /organizador.

CHECKIN acessa /portaria.

Usuário sem autenticação é redirecionado.

Perfil incorreto não acessa área de outro perfil.

Qualidade
ESLint sem erros.

Build concluído.

Fast Refresh corrigido.

setState no efeito corrigido.

Imports corrigidos.

Alterações artificiais de codificação removidas.

30. Versionamento
A Etapa 5 foi versionada em microblocos:

implementar
    ↓
testar
    ↓
git add
    ↓
git commit
    ↓
git push
Entre os commits finais esteve:

5a9d407
fix: corrige contexto de autenticacao e lint do frontend
O commit criou:

frontend/src/contexts/authContext.js
Na primeira tentativa de push, o GitHub retornou Internal Server Error
e rejeitou temporariamente main -> main.

O commit local permaneceu válido e o push foi repetido posteriormente
com sucesso.

31. Critérios de aceite
A Etapa 5 foi considerada concluída porque:

Front-End React funcional.

Integração com Back-End.

Home implementada.

Catálogo público implementado.

Busca implementada.

Filtros implementados.

Cards clicáveis.

Detalhes implementados.

Estrutura comercial apresentada.

Login integrado.

Sessão persistida.

Rotas privadas protegidas.

RBAC implementado.

Área do Cliente criada.

Área do Organizador criada.

Área da Portaria criada.

Logout implementado.

404 implementado.

Interface revisada.

Responsividade revisada.

ESLint aprovado.

Build aprovado.

32. Funcionalidades reservadas para as próximas etapas
Etapa 6 --- Organização e criação de eventos
CRUD do Organizador;

criação;

edição;

gerenciamento;

setores;

modalidades;

lotes;

preços;

cotas;

tipos de ingresso;

assento/pista;

importação externa prevista no projeto.

Etapa 7 --- Seleção e checkout
seleção de ingressos;

pista;

assentos;

reserva;

checkout;

pagamento simulado;

sucesso;

recusa.

Etapa 8 --- Meus Ingressos
painel de ingressos;

QR Code;

visualização;

compartilhamento público.

Etapa 9 --- Portaria
câmera;

scanner;

digitação manual;

validação;

Válido;

Inválido;

Já Utilizado;

Evento Errado.

Etapas posteriores
métricas;

cancelamento;

devolução ao estoque;

Docker;

Docker Compose;

testes automatizados;

deploy;

README final;

entrega.

33. Uso de IA
A IA foi utilizada como ferramenta de apoio para:

planejamento dos microblocos;

estruturação dos componentes;

React Router;

autenticação;

contexto;

proteção de rotas;

CSS;

responsividade;

investigação de conflitos;

interpretação de erros;

Git;

lint;

build.

Entre os erros investigados:

ENOENT
react-refresh/only-export-components
react-hooks/set-state-in-effect
no-unused-vars
MISSING_EXPORT
LF / CRLF
BOM
A IA não substituiu a execução dos comandos, testes funcionais ou
validação visual.

34. Decisões humanas
As principais decisões manuais incluíram:

escolha e revisão da identidade visual;

retirada do verde;

contraste branco em elementos ativos;

card inteiro clicável;

remoção do sublinhado dos títulos;

revisão dos espaçamentos;

organização das áreas autenticadas;

inclusão de logout nos painéis;

validação dos filtros;

validação dos perfis;

decisão de não commitar alterações artificiais de codificação;

restauração dos arquivos após identificação do BOM;

execução manual dos testes;

encerramento da etapa somente após lint e build aprovados.

35. Resultado final
Ao término da Etapa 5, o Boraí possui:

Front-End React funcional
+
integração com Back-End
+
Home
+
catálogo
+
busca e filtros
+
detalhes de eventos
+
autenticação
+
persistência
+
RBAC
+
áreas por perfil
+
logout
+
responsividade
+
lint aprovado
+
build aprovado
A área /organizador está preparada para receber o módulo completo de
criação e gerenciamento de eventos da Etapa 6.

---

# [Etapa 6] Front-End: Módulo de Organização & Criação de Eventos

**Status:** Concluído

## Objetivo da Etapa

Implementar o módulo de gerenciamento de eventos do perfil `ORGANIZER`, permitindo que o Organizador crie, edite, configure e publique seus próprios eventos através do Front-End.

A etapa também integrou a interface às estruturas flexíveis de eventos e ingressos desenvolvidas anteriormente no Back-End.

O fluxo passou a permitir:

- visualizar os eventos pertencentes ao Organizador;
- criar novos eventos;
- editar eventos em rascunho;
- configurar setores;
- configurar modalidades;
- definir o modo de ocupação;
- configurar categorias de preço;
- criar múltiplos lotes;
- definir preços por categoria em cada lote;
- gerar assentos para modalidades `SEAT`;
- acompanhar a utilização das capacidades configuradas;
- remover configurações criadas;
- validar a configuração antes da publicação;
- publicar o evento;
- visualizar as pendências que impedem sua publicação.

A Etapa 6 concentrou-se no gerenciamento do evento pelo Organizador.

As funcionalidades de seleção de ingressos e checkout através da interface permanecem destinadas à etapa seguinte.

---

# 1. Painel do Organizador

A área:

```text
/organizador
```

foi ampliada para funcionar como painel de gerenciamento dos eventos pertencentes ao usuário autenticado com perfil:

```text
ORGANIZER
```

A página passou a carregar os eventos do próprio Organizador através do Back-End.

Cada evento é apresentado individualmente no painel.

---

# 2. Listagem dos eventos do Organizador

Foi utilizada a rota protegida:

```text
GET /events/organizer/mine
```

A requisição exige:

```text
authenticate
authorize("ORGANIZER")
```

Dessa forma, o Organizador visualiza apenas os eventos associados à própria conta.

---

# 3. Informações apresentadas no painel

Os cards dos eventos apresentam informações como:

```text
título
categoria
data e horário
local
cidade
estado
capacidade
status
```

Os status são apresentados ao usuário em português.

Exemplo:

```text
DRAFT
→ Rascunho

PUBLISHED
→ Publicado

CANCELLED
→ Cancelado
```

---

# 4. Estado vazio do painel

Quando o Organizador ainda não possui eventos, a interface apresenta uma mensagem específica orientando a criação do primeiro evento.

Também é disponibilizada a ação:

```text
+ Criar evento
```

---

# 5. Criação de eventos

Foi implementada a página de formulário utilizada para criação de novos eventos.

A rota de criação utiliza:

```text
POST /events/organizer
```

protegida por:

```text
authenticate
authorize("ORGANIZER")
```

O evento criado pertence automaticamente ao Organizador autenticado.

---

# 6. Formulário do evento

O Organizador pode informar os dados principais necessários ao evento.

Entre eles:

```text
título
descrição
categoria
data e horário
local
endereço
cidade
estado
capacidade
imagem
```

A capacidade informada representa o limite físico máximo do evento e é utilizada posteriormente nas validações das configurações internas.

---

# 7. Eventos criados inicialmente como rascunho

Novos eventos são mantidos inicialmente no estado:

```text
DRAFT
```

Isso permite que o Organizador configure toda a estrutura comercial antes de disponibilizar o evento publicamente.

O evento não precisa estar completamente configurado no momento da criação.

---

# 8. Edição dos dados do evento

Foi implementada a edição dos eventos pertencentes ao Organizador.

A rota utilizada é:

```text
PUT /events/organizer/:eventId
```

A operação exige autenticação e perfil `ORGANIZER`.

O Back-End também verifica a propriedade do evento antes de permitir alterações.

---

# 9. Página específica de configuração

Foi criada uma página exclusiva para configuração da estrutura de ingressos.

O acesso ocorre através de rota no formato:

```text
/organizador/eventos/:eventId/configurar
```

Essa separação evita concentrar os dados básicos do evento e toda a configuração comercial no mesmo formulário.

O fluxo ficou dividido conceitualmente em:

```text
DADOS DO EVENTO
        ↓
CONFIGURAÇÃO DOS INGRESSOS
        ↓
PUBLICAÇÃO
```

---

# 10. Consulta da configuração completa

Foi implementada uma rota específica para recuperar a estrutura configurada pelo Organizador:

```text
GET /events/organizer/:eventId/configuration
```

Ela retorna os dados necessários para montar a interface de configuração.

A resposta contempla a hierarquia:

```text
EVENTO
   ↓
SETORES
   ↓
MODALIDADES
   ↓
CATEGORIAS
   ↓
LOTES / PREÇOS
   ↓
ASSENTOS
```

---

# 11. Configuração por etapas visuais

A página de configuração foi organizada visualmente para reduzir a complexidade da estrutura de ingressos.

A configuração segue a hierarquia do modelo de dados, evitando apresentar setores, modalidades, categorias, lotes e assentos como elementos independentes.

Cada configuração fica visualmente associada ao nível imediatamente superior.

---

# 12. Criação de setores

O Organizador pode adicionar setores ao evento.

Foi implementada a rota:

```text
POST /events/organizer/:eventId/sectors
```

Cada setor possui sua própria capacidade.

Exemplos possíveis:

```text
PISTA
CAMAROTE
PLATEIA
CADEIRA SUPERIOR
CADEIRA INFERIOR
ENTRADA GERAL
```

A estrutura utiliza os templates globais definidos anteriormente, mantendo a possibilidade de reutilização dos tipos de setor.

---

# 13. Capacidade dos setores

Cada setor possui:

```text
capacity
```

A soma das capacidades configuradas não pode ultrapassar:

```text
Event.capacity
```

A interface também passou a apresentar informações de capacidade utilizada, facilitando a visualização do quanto do limite do evento já foi distribuído.

Conceitualmente:

```text
Capacidade máxima: 1000
Em uso: 700
Disponível: 300
```

---

# 14. Exclusão de setores

Foi implementada:

```text
DELETE /events/organizer/:eventId/sectors/:sectorId
```

permitindo remover uma configuração criada enquanto o evento ainda está sendo preparado.

A exclusão respeita as relações internas da configuração.

---

# 15. Configuração de modalidades

Cada setor pode possuir uma ou mais modalidades.

Foi implementada:

```text
POST /events/organizer/:eventId/sectors/:sectorId/modalities
```

Exemplo:

```text
CAMAROTE
├── NORMAL
├── OPEN BAR
├── OPEN FOOD
└── OPEN BAR + FOOD
```

A modalidade possui capacidade própria dentro do setor.

---

# 16. Modo de ocupação

Durante a configuração da modalidade, o Organizador define o comportamento dos ingressos.

Os dois modos suportados são:

```text
QUANTITY
SEAT
```

---

# 17. Modalidade `QUANTITY`

`QUANTITY` é utilizada quando a compra depende apenas da quantidade disponível.

Exemplos:

```text
PISTA
ENTRADA GERAL
WORKSHOP
```

Nesse modo não existe seleção de lugares individuais.

A disponibilidade é controlada pelas capacidades e pelos lotes.

---

# 18. Modalidade `SEAT`

`SEAT` é utilizada quando existem lugares individualmente identificados.

Exemplos:

```text
CINEMA
TEATRO
CADEIRAS NUMERADAS
```

Nesse modo a configuração pode gerar assentos correspondentes à capacidade definida.

---

# 19. Exclusão de modalidades

Foi implementada:

```text
DELETE /events/organizer/:eventId/modalities/:modalityId
```

permitindo remover modalidades criadas durante a configuração do evento.

---

# 20. Categorias de preço

As modalidades podem receber categorias comerciais de ingresso.

Foi implementada:

```text
POST /events/organizer/:eventId/modalities/:modalityId/categories
```

Entre as categorias utilizadas estão:

```text
INTEIRA
MEIA
MEIA SOCIAL
VALOR UNICO
```

As categorias não representam estoques independentes.

Elas definem as possibilidades de preço dentro dos lotes da modalidade.

---

# 21. Exclusão de categorias

Foi implementada:

```text
DELETE /events/organizer/:eventId/modalities/:modalityId/categories/:categoryId
```

permitindo remover categorias adicionadas durante a configuração.

---

# 22. Configuração dos lotes

Cada modalidade pode possuir múltiplos lotes.

Foi implementada:

```text
POST /events/organizer/:eventId/modalities/:modalityId/batches
```

O Organizador informa os dados do lote e os preços correspondentes às categorias configuradas.

Exemplo:

```text
LOTE 1
Quantidade: 400

INTEIRA      R$ 220,00
MEIA         R$ 110,00
MEIA SOCIAL  R$ 140,00
```

---

# 23. Múltiplos lotes

Foi validada a criação de mais de um lote para a mesma modalidade.

Exemplo:

```text
PISTA
Capacidade: 800

LOTE 1
Quantidade: 400

LOTE 2
Quantidade: 400
```

A soma das quantidades dos lotes deve respeitar a capacidade disponível da modalidade.

---

# 24. Correção na criação de múltiplos lotes

Durante os testes foi identificado erro ao tentar criar lotes posteriores ao primeiro.

A criação do primeiro lote funcionava, mas uma nova criação apresentava erro no Back-End.

O fluxo foi revisado e corrigido para permitir múltiplos lotes na mesma modalidade.

A correção envolveu o tratamento adequado da normalização utilizada na identificação dos lotes, incluindo:

```text
normalizedName
```

Após o ajuste, a criação dos lotes seguintes passou a funcionar corretamente.

---

# 25. Preços por categoria

Cada lote pode possuir valores diferentes para cada categoria configurada.

Exemplo:

```text
LOTE 1

INTEIRA      R$ 100,00
MEIA         R$ 50,00

LOTE 2

INTEIRA      R$ 120,00
MEIA         R$ 60,00
```

Os valores continuam seguindo a regra definida anteriormente de armazenamento monetário em centavos no Back-End.

---

# 26. Exclusão de lotes

Foi implementada:

```text
DELETE /events/organizer/:eventId/modalities/:modalityId/batches/:batchId
```

permitindo excluir lotes criados durante a configuração.

---

# 27. Criação de assentos

Para modalidades:

```text
SEAT
```

foi implementada a criação dos assentos associados à modalidade.

A rota utilizada é:

```text
POST /events/organizer/:eventId/modalities/:modalityId/seats
```

Os assentos ficam vinculados à modalidade correspondente e respeitam sua capacidade.

---

# 28. Exclusão de assentos

Foi implementada:

```text
DELETE /events/organizer/:eventId/modalities/:modalityId/seats/:seatId
```

permitindo remover assentos durante a configuração do evento.

---

# 29. Controle hierárquico de capacidade

A interface passou a refletir a hierarquia definida no Back-End:

```text
EVENTO
   ↓
SETOR
   ↓
MODALIDADE
   ↓
LOTE / ASSENTO
```

Cada nível deve respeitar o limite disponível no nível superior.

Isso evita configurações como:

```text
Evento: capacidade 500

Setores:
Setor A: 400
Setor B: 300
```

pois:

```text
400 + 300 = 700
```

ultrapassaria a capacidade máxima do evento.

---

# 30. Visualização da capacidade utilizada

A página de configuração foi ajustada para apresentar não apenas a capacidade máxima, mas também quanto dela já está comprometido pelas configurações existentes.

Essa informação foi utilizada principalmente para facilitar o entendimento da distribuição entre setores, modalidades e lotes.

A intenção visual é permitir que o Organizador identifique rapidamente:

```text
capacidade máxima
capacidade utilizada
capacidade restante
```

sem precisar calcular manualmente os valores.

---

# 31. Reorganização visual da configuração

Durante os testes, a primeira versão da página apresentou excesso de informações simultâneas e dificuldade de identificar a relação entre os elementos.

A interface foi reorganizada para tornar mais clara a sequência:

```text
SETOR
   ↓
MODALIDADE
   ↓
CATEGORIAS
   ↓
LOTES
```

Foram utilizados:

- blocos separados;
- hierarquia visual;
- informações resumidas de capacidade;
- agrupamento das ações relacionadas;
- separação das configurações por modalidade.

---

# 32. Responsividade da página de configuração

A página foi ajustada para diferentes larguras de tela.

Foram tratados principalmente:

- cards;
- formulários;
- resumos;
- grids;
- cabeçalhos;
- botões;
- blocos de configuração.

Em telas menores, os elementos passam a utilizar disposição vertical para evitar cortes e sobreposição de conteúdo.

---

# 33. Correção de carregamento da página

Durante o desenvolvimento ocorreu situação em que a página de configuração permanecia carregando e não era aberta corretamente.

O fluxo de carregamento dos dados e das rotas foi revisado até que a página pudesse recuperar normalmente a configuração do evento.

---

# 34. Correção de arquivo CSS

Durante uma alteração foi identificado erro do Vite/PostCSS:

```text
Unknown word
```

O problema ocorreu porque conteúdo que não era CSS havia sido inserido acidentalmente no início de:

```text
frontend/src/index.css
```

O conteúdo inválido foi removido e o arquivo restaurado.

Após a correção, o Front-End voltou a ser compilado normalmente.

---

# 35. Serviço de eventos no Front-End

O serviço responsável pelas chamadas relacionadas aos eventos foi ampliado para atender o módulo do Organizador.

As funções passaram a contemplar operações como:

```text
listar eventos do Organizador
consultar evento
criar evento
editar evento
consultar configuração
criar setor
criar modalidade
criar categoria
criar lote
criar assentos
excluir configurações
publicar evento
```

O token JWT é enviado nas operações protegidas.

---

# 36. Proteção das operações do Organizador

Todas as rotas de gerenciamento permanecem protegidas no Back-End através de:

```text
authenticate
authorize("ORGANIZER")
```

A interface também utiliza o contexto de autenticação para obter:

```text
user
token
```

e realizar as operações correspondentes.

---

# 37. Publicação dentro da página do evento

A publicação foi integrada à própria página de configuração.

Dessa forma, o Organizador não precisa retornar ao panorama geral para descobrir se o evento pode ou não ser publicado.

O fluxo passou a ser:

```text
Configurar evento
        ↓
Verificar pendências
        ↓
Corrigir configuração
        ↓
Publicar
```

---

# 38. Validação antes da publicação

Antes de disponibilizar o evento publicamente, a configuração é validada.

Caso existam informações obrigatórias ou configurações incompletas, a página informa as pendências ao Organizador.

O botão de publicação somente deve ser utilizado quando a configuração necessária estiver válida.

---

# 39. Pendências exibidas na própria página

As mensagens relacionadas ao que ainda falta configurar foram colocadas na própria página do evento.

Isso evita obrigar o Organizador a alternar entre:

```text
painel geral
↔
configuração do evento
```

para descobrir por que a publicação não está disponível.

---

# 40. Publicação do evento

Quando todas as condições necessárias são atendidas, o Organizador pode utilizar:

```text
Publicar evento
```

O evento deixa o estado:

```text
DRAFT
```

e passa para:

```text
PUBLISHED
```

---

# 41. Visualização após publicação

Depois da publicação, a página passa a indicar que o evento está publicado.

Também é disponibilizado acesso para visualizar o evento no catálogo público.

O evento publicado passa a integrar normalmente a experiência pública já construída na Etapa 5.

---

# 42. Proteção da configuração após publicação

Após a publicação, as operações estruturais de configuração deixam de ficar disponíveis no fluxo normal de edição.

Isso reduz o risco de alterar inadvertidamente a estrutura comercial de um evento que já foi disponibilizado ao público.

---

# 43. Preservação do catálogo público

Durante a implementação do módulo do Organizador, o catálogo público desenvolvido anteriormente foi preservado.

Os ajustes da Etapa 6 foram concentrados nas páginas e funcionalidades específicas do Organizador.

A apresentação geral dos eventos e o tratamento visual das imagens permaneceram funcionando após a integração.

---

# 44. Arquivos principais envolvidos

Entre os arquivos criados ou ampliados nesta etapa estão:

```text
backend/src/controllers/eventController.js
backend/src/controllers/eventConfigurationController.js
backend/src/routes/eventRoutes.js

frontend/src/App.jsx
frontend/src/index.css
frontend/src/pages/OrganizerPage.jsx
frontend/src/pages/OrganizerEventFormPage.jsx
frontend/src/pages/OrganizerEventConfigurationPage.jsx
frontend/src/pages/OrganizerEventConfigurationPage.css
frontend/src/services/eventService.js
```

---

# 45. Controller específico de configuração

Foi criado:

```text
backend/src/controllers/eventConfigurationController.js
```

para separar as operações de configuração estrutural das operações gerais do evento.

O controller passou a concentrar funcionalidades relacionadas a:

```text
configuração
setores
modalidades
categorias
lotes
assentos
exclusões
```

Essa separação evita concentrar toda a lógica no controller principal de eventos.

---

# 46. Rotas específicas da configuração

As rotas de configuração foram integradas ao conjunto de rotas de eventos.

Entre elas:

```text
GET    /events/organizer/:eventId/configuration

POST   /events/organizer/:eventId/sectors
DELETE /events/organizer/:eventId/sectors/:sectorId

POST   /events/organizer/:eventId/sectors/:sectorId/modalities
DELETE /events/organizer/:eventId/modalities/:modalityId

POST   /events/organizer/:eventId/modalities/:modalityId/categories
DELETE /events/organizer/:eventId/modalities/:modalityId/categories/:categoryId

POST   /events/organizer/:eventId/modalities/:modalityId/batches
DELETE /events/organizer/:eventId/modalities/:modalityId/batches/:batchId

POST   /events/organizer/:eventId/modalities/:modalityId/seats
DELETE /events/organizer/:eventId/modalities/:modalityId/seats/:seatId
```

As rotas específicas permanecem declaradas antes da rota pública dinâmica:

```text
/:eventId
```

evitando que caminhos do Organizador sejam interpretados incorretamente como identificadores de eventos públicos.

---

# 47. Testes realizados

Foram realizados testes manuais do fluxo do Organizador.

Foram validados:

- login com perfil `ORGANIZER`;
- acesso ao painel;
- listagem dos eventos do Organizador;
- abertura de evento existente;
- criação de novo evento;
- edição dos dados do evento;
- abertura da página de configuração;
- carregamento da configuração;
- criação de setor;
- criação de modalidade;
- escolha entre `QUANTITY` e `SEAT`;
- criação de categoria;
- criação do primeiro lote;
- criação de múltiplos lotes após correção;
- definição de preços;
- criação de assentos;
- exclusão das configurações suportadas;
- controle de capacidade;
- apresentação da capacidade utilizada;
- responsividade da página;
- exibição das pendências de publicação;
- publicação de evento;
- alteração do status para `PUBLISHED`;
- visualização do evento publicado;
- preservação do catálogo público e das imagens.

---

# 48. Problemas encontrados durante os testes

Durante a implementação foram identificados e corrigidos problemas relacionados a:

```text
carregamento da página de configuração
responsividade
organização visual
CSS inválido
criação de múltiplos lotes
exibição das ações do Organizador
rotas de configuração
```

Os testes manuais foram utilizados para revisar cada problema antes de continuar o desenvolvimento.

---

# 49. Melhoria identificada para edição estrutural

A criação e exclusão das estruturas necessárias foram implementadas.

Entretanto, a edição direta de algumas configurações já criadas, como setor, não foi priorizada antes do encerramento da etapa.

Essa possibilidade permanece como melhoria posterior.

A ausência dessa ação não impede o fluxo principal validado de:

```text
criar
configurar
excluir/refazer quando necessário
validar
publicar
```

---

# 50. Critério de aceite da Etapa 6

O critério previsto para a Etapa 6 era permitir que o Organizador criasse um evento completo com configuração de preço, cota e tipo de ingresso.

Ao final da etapa foi validado o fluxo:

```text
ORGANIZER
   ↓
cria evento
   ↓
define capacidade
   ↓
configura setores
   ↓
configura modalidades
   ↓
define QUANTITY ou SEAT
   ↓
configura categorias
   ↓
configura lotes
   ↓
define preços
   ↓
configura assentos quando necessário
   ↓
acompanha capacidades
   ↓
corrige pendências
   ↓
publica evento
   ↓
evento aparece publicamente
```

Portanto, o critério principal da Etapa 6 foi atendido.

---

# 51. Uso de IA nesta Etapa

### Geração e Refatoração de Código

A IA foi utilizada como apoio na implementação e revisão de:

- controllers;
- rotas;
- serviços;
- páginas React;
- formulários;
- componentes de configuração;
- CSS responsivo;
- integração entre Front-End e Back-End.

### Resolução de Problemas

A IA auxiliou no diagnóstico de problemas encontrados durante o desenvolvimento, incluindo:

- página permanecendo em carregamento;
- rotas incorretas ou ausentes;
- organização da configuração de ingressos;
- erro de CSS processado pelo PostCSS;
- criação do segundo lote e lotes posteriores;
- responsividade;
- visualização das capacidades;
- fluxo de publicação.

### Organização da Interface

A IA foi utilizada para propor e implementar formas de apresentar a configuração hierárquica de eventos de maneira mais compreensível.

### Decisões Humanas / Manuais

Foram realizadas manualmente:

- definição de como o Organizador deveria configurar o evento;
- decisão de separar dados gerais e configuração de ingressos;
- decisão de apresentar capacidade máxima e capacidade utilizada;
- avaliação visual da página;
- decisão sobre quais versões da interface seriam mantidas;
- testes de criação e edição;
- testes de setores e modalidades;
- testes de categorias;
- testes de múltiplos lotes;
- testes de assentos;
- testes de exclusão;
- testes de responsividade;
- validação das mensagens de pendência;
- teste final de publicação;
- confirmação de que o catálogo e as imagens permaneceram funcionando;
- decisão de deixar a edição direta de algumas estruturas como melhoria futura.

A IA foi utilizada como ferramenta de apoio ao desenvolvimento, enquanto as regras, validações funcionais, testes e decisões finais de produto permaneceram sob avaliação humana.

---

# Resultado da Etapa 6

Ao final da Etapa 6, o Boraí passou a possuir um módulo funcional de gerenciamento de eventos para o perfil `ORGANIZER`.

O fluxo implementado permite:

```text
login como Organizador
+
visualização dos próprios eventos
+
criação de evento
+
edição dos dados principais
+
configuração de setores
+
configuração de modalidades
+
QUANTITY / SEAT
+
categorias de preço
+
múltiplos lotes
+
preços
+
assentos
+
controle visual de capacidades
+
exclusão de configurações
+
validação das pendências
+
publicação
+
visualização pública do evento
```

Com isso, o módulo de Organização e Criação de Eventos encontra-se concluído e o projeto está preparado para continuar com a interface de seleção de ingressos e checkout.

[Etapa 7] Front-End: Seleção de Ingressos & Checkout Simulado

Status: Concluído

Objetivo da Etapa

Conectar a página pública de detalhes do evento ao núcleo de checkout já existente no Back-End, permitindo que o perfil CLIENT selecione ingressos, revise os valores da compra e conclua o fluxo de pagamento simulado.

A Etapa 7 passou a contemplar dois comportamentos de venda:

QUANTITY
→ seleção por categoria e quantidade

SEAT
→ seleção de assentos individuais
→ definição da categoria de preço de cada assento

Também foi mantida a integração com as regras de estoque, capacidade, cotas, reservas e concorrência implementadas anteriormente no Back-End.

1. Ajuste da resposta pública dos eventos

A API pública de detalhes do evento foi ajustada para fornecer os dados necessários à compra sem expor ao Cliente toda a estrutura interna de lotes.

Para modalidades SEAT, a resposta pública passou a incluir os assentos disponíveis com os campos necessários para a seleção visual.

A consulta utiliza apenas dados válidos do modelo de assento, incluindo:

id
label
normalizedLabel
isAvailable

Esse ajuste permitiu que a página pública apresentasse os assentos disponíveis diretamente ao comprador.

2. Lote vigente

Foi implementada uma regra para identificar o lote atualmente em venda em cada modalidade.

A identificação considera:

lotes ativos
+
ordem/sequence
+
quantidade do lote
+
Tickets VALID ou USED já vendidos

O primeiro lote ativo que ainda possuir estoque é tratado como o lote vigente.

Exemplo:

LOTE 1
Quantidade: 400
Vendidos: 400
→ esgotado

LOTE 2
Quantidade: 400
Vendidos: 50
→ lote vigente

O Front-End não precisa decidir qual lote deve ser utilizado.

Essa responsabilidade permanece no Back-End.

3. Lotes não são exibidos ao comprador

Foi decidido que o Cliente não deve visualizar informações como:

LOTE 1
LOTE 2
LOTE 3

Essas informações permanecem úteis para controle comercial do Organizador, mas não fazem parte da experiência de compra.

Na página pública são apresentados somente:

categoria do ingresso
+
preço atualmente vigente

Exemplo:

INTEIRA       R$ 500,00
MEIA          R$ 300,00
MEIA SOCIAL   R$ 300,00

Quando o lote atual se esgota, o Back-End passa automaticamente a fornecer os preços do próximo lote disponível.

4. Validação do lote no checkout

Além de informar somente o lote vigente na API pública, o Back-End passou a validar o lote também ao iniciar e concluir o checkout.

Foi criada lógica compartilhada para:

getCurrentBatchForModality()
validateCurrentBatch()

Assim, não é suficiente enviar manualmente um ticketBatchPriceId pertencente a um lote ativo.

O lote do preço precisa ser o lote realmente vigente naquele momento.

Caso o preço tenha ficado desatualizado, o checkout é rejeitado e o Cliente precisa atualizar a seleção.

Essa validação reduz o risco de compra utilizando preço antigo ou lote futuro.

5. Seleção de ingressos QUANTITY

Para modalidades QUANTITY, a página passou a apresentar cada categoria de preço com controle de quantidade.

Exemplo:

INTEIRA       R$ 220,00    [-] 2 [+]
MEIA          R$ 110,00    [-] 1 [+]
MEIA SOCIAL   R$ 140,00    [-] 0 [+]

O Cliente pode aumentar ou diminuir a quantidade antes de iniciar o checkout.

A seleção respeita:

limite máximo de 10 ingressos por compra;

quantidade disponível no lote vigente;

validações definitivas do Back-End durante o checkout.

A modalidade QUANTITY continua sem bloquear estoque durante a criação da sessão, conforme a regra definida na Etapa 4.

6. Seleção de ingressos SEAT

Para modalidades SEAT, foi criada seleção visual dos assentos disponíveis.

O Cliente pode selecionar vários assentos antes de definir o tipo de ingresso.

Fluxo adotado:

selecionar assentos
       ↓
A1, A2, A3...
       ↓
definir individualmente a categoria de cada assento
       ↓
continuar para checkout

Essa organização substituiu a primeira abordagem, na qual uma categoria era escolhida antes dos assentos.

A nova experiência permite, por exemplo:

A1 → INTEIRA
A2 → MEIA
A3 → MEIA SOCIAL

na mesma compra.

7. Categoria individual por assento

Cada assento selecionado mantém sua própria associação com um ticketBatchPriceId.

Dessa forma, assentos da mesma modalidade podem utilizar categorias diferentes na mesma compra.

O Front-End impede o início do checkout enquanto existir um assento selecionado sem categoria definida.

A estrutura enviada ao Back-End agrupa os assentos pela opção de preço correspondente.

Exemplo conceitual:

INTEIRA
→ seatIds: [A1]

MEIA
→ seatIds: [A2]

MEIA SOCIAL
→ seatIds: [A3]

8. Limite máximo de 10 ingressos

O limite definido no Back-End também passou a ser aplicado visualmente no Front-End.

Regra:

máximo de 10 ingressos por checkout

O contador considera conjuntamente:

ingressos QUANTITY;

assentos SEAT;

diferentes categorias;

diferentes modalidades do mesmo evento.

Ao atingir 10 ingressos, a interface impede a seleção do 11º.

O Back-End continua realizando sua própria validação independentemente do bloqueio visual.

9. Resumo da compra

A página de detalhes passou a possuir um resumo da compra contendo:

quantidade total de ingressos
subtotal
taxa de serviço
total

O subtotal é atualizado conforme as quantidades e categorias selecionadas.

Para SEAT, o valor considera a categoria atribuída individualmente a cada assento.

10. Taxa de serviço

Foi mantida a regra definida anteriormente:

12%

A taxa é calculada separadamente do subtotal e adicionada ao total da compra.

O cálculo definitivo continua sendo realizado pelo Back-End na conclusão da compra.

Melhoria visual registrada

Foi decidido que, em uma revisão futura do componente de resumo, a interface não deverá destacar a porcentagem da taxa ao comprador.

A cobrança e o cálculo permanecem inalterados; a mudança prevista é apenas de apresentação, mantendo:

Taxa de serviço    R$ ...

sem exibir o texto percentual ao lado.

Essa alteração visual não foi tratada isoladamente para evitar modificar o componente apenas por esse detalhe e não impede o encerramento da Etapa 7.

11. Autenticação para compra

O catálogo e os detalhes do evento continuam públicos.

Entretanto, ao iniciar a compra, o usuário precisa estar autenticado com:

role = CLIENT

Caso não esteja autenticado, o fluxo direciona para o login antes de continuar.

Perfis diferentes de CLIENT não podem executar o checkout.

12. Integração do Front-End com o checkout

Foi criado serviço específico no Front-End para comunicação com os endpoints de checkout.

Fluxos utilizados:

POST /checkout
POST /checkout/:checkoutId/complete

O Front-End envia a seleção preparada de acordo com o tipo de modalidade.

QUANTITY

ticketBatchPriceId
quantity

SEAT

ticketBatchPriceId
seatIds[]

13. Reserva de assentos

Ao iniciar um checkout contendo modalidade SEAT, o Back-End mantém a regra de reserva temporária já implementada.

O assento selecionado fica indisponível durante a sessão.

Prazo:

10 minutos

A interface informa ao Cliente que os assentos estão temporariamente reservados enquanto o checkout estiver ativo.

14. Pagamento simulado

A interface passou a permitir a execução do pagamento simulado com os dois resultados suportados pelo Back-End:

APPROVED
REFUSED

Isso permite validar o fluxo completo sem integração com um gateway de pagamento externo.

15. Pagamento aprovado

O cenário APPROVED foi testado manualmente através do Front-End.

Resultado confirmado:

checkout iniciado
       ↓
pagamento aprovado
       ↓
pedido criado
       ↓
Tickets criados
       ↓
compra concluída

Após a compra:

a disponibilidade de QUANTITY é atualizada;

assentos comprados deixam de aparecer entre os disponíveis;

o resumo de sucesso apresenta os dados principais do pedido.

16. Pagamento recusado

O cenário REFUSED também foi testado manualmente através do Front-End.

Resultado confirmado:

compra não é concluída;

Tickets válidos não são criados;

checkout é cancelado;

assentos temporariamente reservados são liberados;

o estoque não é consumido pela tentativa recusada.

17. Atualização da disponibilidade após compra

Após uma compra aprovada, a página pública pode buscar novamente os dados do evento.

Isso permite refletir imediatamente alterações como:

redução do estoque disponível

ou:

remoção de assento vendido da lista de disponíveis

A disponibilidade pública permanece baseada nos dados reais do Back-End.

18. Concorrência

A lógica de concorrência permanece protegida pelo Back-End desenvolvido e testado na Etapa 4.

Para SEAT:

mesmo assento
→ apenas um checkout consegue efetivar o bloqueio

Para QUANTITY:

múltiplos checkouts podem começar
→ estoque é validado na finalização
→ first-to-complete wins

O teste de concorrência não foi repetido manualmente durante o encerramento visual da Etapa 7, pois a regra já havia sido validada diretamente no núcleo do Back-End.

19. Arquivos envolvidos na Etapa 7

Entre os arquivos criados ou modificados durante a implementação estão:

backend/src/controllers/eventController.js
backend/src/controllers/checkoutController.js
backend/src/services/checkoutService.js
frontend/src/pages/EventDetailsPage.jsx
frontend/src/pages/EventDetailsCheckout.css
frontend/src/services/checkoutService.js

A Etapa também utilizou serviços e estruturas existentes de autenticação, eventos e checkout.

20. Testes funcionais realizados

Foram validados manualmente no Front-End:

evento publicado continua carregando normalmente;

imagens e informações públicas preservadas;

somente o lote vigente é utilizado na venda;

nome/número do lote não é apresentado ao Cliente;

preços do lote vigente são apresentados;

seleção QUANTITY funciona;

aumento e redução de quantidade funcionam;

seleção de múltiplos assentos funciona;

remoção de assento selecionado funciona;

categoria individual por assento funciona;

subtotal é atualizado;

taxa de serviço é calculada;

total é atualizado;

limite visual de 10 ingressos funciona;

Cliente autenticado consegue iniciar checkout;

pagamento aprovado funciona;

pagamento recusado funciona;

compra aprovada atualiza estoque;

assento comprado deixa de aparecer disponível;

pagamento recusado não consome a compra;

reservas e concorrência permanecem protegidas pelo Back-End já validado.

21. Problemas encontrados e correções

Durante a Etapa 7 foram corrigidos problemas relacionados a:

campos inexistentes na consulta de assentos
retorno público inicialmente causando evento indisponível
exibição de todos os lotes ao Cliente
validação insuficiente do lote vigente
seleção inicial de categoria para SEAT pouco flexível
necessidade de categoria diferente para cada assento
integração do checkout com usuário CLIENT

A abordagem final manteve as decisões de estoque e lote no Back-End e deixou o Front-End responsável principalmente pela seleção e apresentação ao usuário.

22. Decisões Humanas / Manuais

Durante a implementação foram definidas e validadas manualmente as seguintes decisões:

não mostrar os nomes dos lotes ao comprador;

mostrar somente os preços atualmente em venda;

manter a progressão de lote como responsabilidade do Back-End;

selecionar primeiro os assentos e somente depois definir a categoria de cada um;

permitir categorias diferentes para assentos da mesma compra;

manter o limite máximo de 10 ingressos também na interface;

manter autenticação obrigatória apenas no início efetivo do checkout;

preservar o catálogo e detalhes públicos sem exigir login;

manter o cálculo da taxa no Back-End;

registrar como melhoria visual futura a remoção da porcentagem exibida ao lado da taxa de serviço;

validar manualmente os cenários de pagamento aprovado e recusado;

não repetir no encerramento da etapa o teste de concorrência já validado anteriormente no Back-End.

23. Uso de IA nesta Etapa

Geração e Refatoração de Código

A IA foi utilizada como apoio na implementação e revisão de:

consultas Prisma para detalhes públicos;

lógica de lote vigente;

validação de lote no checkout;

serviços de checkout do Front-End;

seleção por quantidade;

seleção visual de assentos;

associação de categoria por assento;

resumo financeiro;

CSS responsivo da área de compra.

Resolução de Problemas

A IA auxiliou na investigação de:

evento ficando indisponível após consulta de campos inexistentes;

estrutura dos dados públicos de assentos;

diferença entre lote ativo e lote vigente;

exposição indevida de múltiplos lotes na interface;

envio dos itens QUANTITY e SEAT ao checkout;

organização do fluxo de seleção de assentos e categorias.

Testes

A IA foi utilizada para orientar os cenários de teste do fluxo completo, enquanto a execução e a confirmação dos resultados foram realizadas manualmente.

24. Critério de aceite da Etapa 7

O critério original da Etapa 7 era permitir que o Cliente concluísse uma compra através do Front-End, incluindo seleção de pista ou assento, reserva quando aplicável e tratamento de sucesso ou erro.

Ao final da implementação foi validado:

CLIENT
   ↓
abre evento publicado
   ↓
visualiza preços do lote vigente
   ↓
seleciona QUANTITY ou SEAT
   ↓
para SEAT, escolhe os assentos
   ↓
define a categoria de cada assento
   ↓
respeita limite de 10 ingressos
   ↓
revisa subtotal, taxa e total
   ↓
inicia checkout
   ↓
pagamento simulado
   ↓
APPROVED ou REFUSED
   ↓
estoque/assentos atualizados conforme o resultado

Portanto, o critério principal da Etapa 7 foi atendido.

Resultado da Etapa 7

Ao término da Etapa 7, o Boraí passou a possuir um fluxo funcional de compra de ingressos no Front-End para o perfil CLIENT.

O fluxo implementado permite:

catálogo público
+
detalhes do evento
+
lote vigente automático
+
preços atualmente em venda
+
QUANTITY
+
SEAT
+
categoria individual por assento
+
limite de 10 ingressos
+
resumo financeiro
+
autenticação do Cliente
+
checkout
+
reserva de assentos
+
pagamento simulado
+
sucesso
+
recusa
+
atualização de disponibilidade

Com isso, a Etapa 7 — Seleção de Ingressos & Checkout Simulado encontra-se concluída e o projeto está preparado para seguir para a Etapa 8 — Meus Ingressos & Visualização de QR Code.

---

# [Etapa 8] Front-End: Meus Ingressos & Visualização de QR Code

**Status:** Concluído

## Objetivo da Etapa

Implementar a área de ingressos do perfil `CLIENT`, permitindo que o Cliente visualize os ingressos adquiridos, consulte os dados individuais de cada Ticket, acesse seu QR Code privado e compartilhe uma visualização pública segura do ingresso.

A etapa integrou ao Front-End funcionalidades que já haviam sido preparadas no Back-End durante a Etapa 4, principalmente a geração de QR Code assinado, a proteção do ingresso por proprietário e o compartilhamento através de `sharedToken`.

## O que foi feito

- Criação do endpoint `GET /tickets/mine` para listar somente os ingressos pertencentes ao Cliente autenticado.
- Proteção da rota de listagem utilizando `authenticate` e `authorize("CLIENT")`.
- Manutenção da validação de propriedade do Ticket através da relação entre `Ticket`, `Order` e `clientId`.
- Retorno, na listagem, das informações necessárias para apresentação dos ingressos:
  - ID;
  - status;
  - `sharedToken`;
  - valor individual;
  - evento;
  - imagem;
  - data;
  - local;
  - setor;
  - modalidade;
  - categoria de preço;
  - assento, quando aplicável.
- Decisão de não retornar todos os QR Codes juntamente com a listagem dos ingressos.
- Manutenção da geração do QR Code somente quando o Cliente abre um Ticket específico.
- Criação de `frontend/src/services/ticketService.js` para centralizar as requisições relacionadas aos ingressos.
- Integração do Front-End com:
  - `GET /tickets/mine`;
  - `GET /tickets/:ticketId/qr`;
  - `GET /tickets/shared/:sharedToken`.
- Atualização da página `ClientPage.jsx` para substituir o conteúdo provisório da Área do Cliente por uma listagem funcional de ingressos.
- Exibição da quantidade total de ingressos pertencentes ao usuário autenticado.
- Criação de cards individuais para os Tickets adquiridos.
- Exibição nos cards de:
  - imagem do evento;
  - título;
  - categoria do evento;
  - data;
  - local;
  - setor;
  - modalidade;
  - categoria do ingresso;
  - assento;
  - valor pago;
  - status.
- Tratamento dos estados `VALID`, `USED` e `CANCELLED`.
- Suporte tanto para ingressos `SEAT` quanto para ingressos `QUANTITY`.
- Exibição do assento apenas quando o Ticket possuir um lugar associado.
- Implementação do botão `Ver ingresso / QR Code`.
- Carregamento individual do QR através de `GET /tickets/:ticketId/qr`.
- Manutenção da validação de propriedade antes da geração do QR.
- Renderização do QR Code retornado pelo Back-End em formato `data:image/png;base64`.
- Criação de modal para visualização do ingresso individual.
- Exibição no modal de:
  - evento;
  - data;
  - local;
  - setor;
  - modalidade;
  - categoria;
  - assento;
  - status;
  - QR Code;
  - identificador do Ticket.
- Desabilitação da visualização normal do QR para Ticket cancelado.
- Implementação da opção `Compartilhar`.
- Utilização do `sharedToken` individual de cada Ticket para gerar o link público.
- Criação da rota pública `/ingresso/:sharedToken`.
- Criação de `SharedTicketPage.jsx`.
- Integração da página pública com `GET /tickets/shared/:sharedToken`.
- Possibilidade de abrir o ingresso compartilhado sem autenticação.
- Exibição pública das informações permitidas do ingresso e do evento.
- Preservação da regra de segurança que impede a exposição pública do QR Code de entrada.
- Manutenção da separação entre:
  - QR privado, utilizado como credencial de entrada;
  - `sharedToken`, utilizado somente para visualização pública.
- Criação de `ClientTickets.css` para os cards, modal, QR Code, estados e responsividade da Área do Cliente.
- Criação de `SharedTicketPage.css` para a visualização pública do ingresso.
- Atualização de `App.jsx` para registrar a nova rota pública de compartilhamento.
- Preservação da rota `/cliente` como área protegida exclusiva do perfil `CLIENT`.

## Segurança aplicada

A Etapa 8 manteve as regras de segurança estabelecidas anteriormente para os ingressos.

O QR privado continua disponível somente através de:

`GET /tickets/:ticketId/qr`

e exige autenticação como `CLIENT`.

Além disso, o Back-End verifica se o Ticket pertence ao usuário autenticado antes de retornar o QR.

O link público utiliza uma credencial diferente, o `sharedToken`, e não permite acesso ao QR Code utilizado pela Portaria.

A resposta pública não expõe:

- `qrCode`;
- `qrCodeHash`;
- token assinado do QR;
- `orderId`;
- `clientId`;
- e-mail do comprador;
- dados pessoais do comprador.

Dessa forma, compartilhar um ingresso não equivale a compartilhar sua credencial de entrada.

## Arquivos principais envolvidos

### Back-End

- `backend/src/controllers/ticketController.js`
- `backend/src/routes/ticketRoutes.js`

### Front-End

- `frontend/src/App.jsx`
- `frontend/src/pages/ClientPage.jsx`
- `frontend/src/pages/ClientTickets.css`
- `frontend/src/pages/SharedTicketPage.jsx`
- `frontend/src/pages/SharedTicketPage.css`
- `frontend/src/services/ticketService.js`

## Problemas encontrados durante a implementação

Durante a implementação ocorreu uma substituição incorreta de arquivo no Front-End.

O conteúdo destinado ao `App.jsx` foi colocado em `ClientPage.jsx`, fazendo o Vite interpretar imports como:

- `./layouts/PublicLayout.jsx`;
- `./routes/ProtectedRoute.jsx`;
- `./pages/...`;

a partir da pasta `src/pages`.

O Vite retornou erro de resolução de import indicando que `./layouts/PublicLayout.jsx` não poderia ser localizado a partir de `ClientPage.jsx`.

O problema não estava nos caminhos originais do projeto, mas no conteúdo ter sido colocado no arquivo incorreto.

A correção consistiu em restaurar:

- o roteamento em `frontend/src/App.jsx`;
- a Área do Cliente em `frontend/src/pages/ClientPage.jsx`.

Após a correção, o Front-End voltou a carregar normalmente.

## Testes realizados

Foram realizados testes manuais com usuário do perfil `CLIENT`.

### Listagem de ingressos

- [x] Login como Cliente realizado.
- [x] Área `/cliente` acessada.
- [x] Endpoint `GET /tickets/mine` integrado.
- [x] Ingressos pertencentes ao Cliente carregados.
- [x] Todos os ingressos adquiridos foram apresentados.
- [x] Informações do evento foram exibidas.
- [x] Setor e modalidade foram exibidos.
- [x] Categoria de preço foi exibida.
- [x] Assento foi apresentado quando aplicável.
- [x] Valor individual foi apresentado.
- [x] Status do Ticket foi apresentado.

### QR Code privado

- [x] Ação `Ver ingresso / QR Code` funcionando.
- [x] Ticket individual carregado.
- [x] Modal aberto corretamente.
- [x] Dados do ingresso apresentados.
- [x] QR Code privado retornado pelo Back-End.
- [x] QR Code renderizado corretamente na interface.

### Compartilhamento público

- [x] Ação `Compartilhar` funcionando.
- [x] Link com `sharedToken` gerado.
- [x] Rota `/ingresso/:sharedToken` funcionando.
- [x] Link aberto sem autenticação.
- [x] Página pública carregada corretamente.
- [x] Dados públicos do ingresso exibidos.
- [x] QR Code privado não exibido na página compartilhada.

## Critério de aceite da Etapa 8

O critério previsto para a Etapa 8 era disponibilizar o painel `Meus Ingressos`, renderizar corretamente o QR Code do proprietário e permitir a visualização pública do ingresso através de um link compartilhável sem exigir login.

Os testes confirmaram que:

- o Cliente consegue visualizar seus Tickets adquiridos;
- cada Ticket pode ser aberto individualmente;
- o QR Code privado é renderizado corretamente;
- o QR permanece protegido pelo usuário proprietário;
- o ingresso pode ser compartilhado através de `sharedToken`;
- a página compartilhada pode ser aberta sem autenticação;
- a página pública não expõe o QR Code de entrada.

Portanto, o critério principal da Etapa 8 foi atendido.

## Uso de IA nesta Etapa

### Geração e Refatoração de Código

A IA foi utilizada como apoio na implementação e revisão de:

- endpoint de listagem dos Tickets do Cliente;
- consultas Prisma;
- rotas;
- serviços do Front-End;
- Área do Cliente;
- cards dos ingressos;
- modal de QR Code;
- página pública de compartilhamento;
- CSS;
- integração entre Front-End e Back-End.

### Resolução de Problemas

A IA auxiliou no diagnóstico de:

- necessidade de uma rota para listar os Tickets do Cliente;
- organização entre listagem e carregamento individual do QR;
- erro de importação provocado por conteúdo colocado no arquivo incorreto;
- integração do `sharedToken` com a rota pública;
- separação entre QR privado e visualização compartilhada.

### Decisões Humanas / Manuais

Foram realizadas manualmente:

- validação visual da Área do Cliente;
- confirmação de que todos os ingressos adquiridos estavam sendo apresentados;
- teste de abertura do QR Code;
- confirmação de que o QR estava sendo renderizado corretamente;
- teste do compartilhamento;
- abertura do link público sem autenticação;
- confirmação de que o QR privado não aparecia na visualização compartilhada;
- decisão de manter o QR privado separado da listagem geral dos ingressos;
- validação final do fluxo antes do encerramento da etapa.

A IA foi utilizada como ferramenta de apoio ao desenvolvimento, enquanto os testes funcionais, decisões de produto e validação final permaneceram sob avaliação humana.

---

# Resultado da Etapa 8

Ao final da Etapa 8, o Boraí passou a possuir uma Área do Cliente funcional para gerenciamento e visualização dos ingressos adquiridos.

O perfil `CLIENT` agora consegue visualizar seus Tickets, consultar suas informações, abrir individualmente o QR Code privado e gerar um link público de compartilhamento.

A página compartilhada pode ser acessada sem login e mantém protegida a credencial utilizada na entrada do evento.

Com isso, a Etapa 8 — Meus Ingressos & Visualização de QR Code encontra-se concluída e o projeto está preparado para continuar com a Etapa 9 — Portal da Portaria.