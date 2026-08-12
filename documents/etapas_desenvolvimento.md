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
* **Decisões Humanas / Manuais:** definição das regras de negócio para capacidade, setores, modalidades, categorias, meia-entrada, meia social, lotes, progressão proporcional, taxa de serviço e escolha dos eventos de demonstração.
