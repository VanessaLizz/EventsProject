# Boraí

**Seu próximo rolê a um clique de distância**

Boraí é uma plataforma web para descoberta, gerenciamento, venda e validação de ingressos para diferentes tipos de eventos, como shows, cinema, teatro, workshops, eventos literários e experiências especiais.

O projeto funciona como um hub multi-eventos e possui três perfis principais:

* **Organizador**
* **Cliente**
* **Portaria**

## Status do Projeto

Em desenvolvimento.

### Etapas concluídas

* [x] Etapa 0 — Conceituação e documentação base
* [x] Etapa 1 — Setup do projeto, banco de dados e seeds
* [x] Etapa 2 — Autenticação JWT e controle de acesso por perfil (RBAC)
* [x] Etapa 3 — Modelagem avançada de eventos, ingressos, setores, modalidades e lotes
* [ ] Etapa 4 — Reservas, pagamento simulado e QR Code
* [ ] Etapa 5 — Autenticação e catálogo no Front-End
* [ ] Etapa 6 — Painel do Organizador
* [ ] Etapa 7 — Seleção de ingressos e checkout
* [ ] Etapa 8 — Meus Ingressos e QR Code
* [ ] Etapa 9 — Portal da Portaria
* [ ] Etapa 10 — Busca, filtros e métricas
* [ ] Etapa 11 — Cancelamento e devolução ao estoque
* [ ] Etapa 12 — Docker e testes automatizados
* [ ] Etapa 13 — Publicação e entrega final

> O escopo técnico é refinado durante o desenvolvimento conforme novas regras de negócio são identificadas. O histórico detalhado dessas decisões está disponível em `documents/etapas_desenvolvimento.md`.

## Tecnologias

### Back-End

* Node.js
* Express
* Prisma ORM
* SQLite
* JWT (`jsonwebtoken`)
* bcryptjs
* CORS
* dotenv

### Front-End

Planejado para as próximas etapas:

* React
* Vite
* Tailwind CSS

## Estrutura do Projeto

```text
EventsProject/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── controllers/
│       ├── lib/
│       ├── middleware/
│       ├── routes/
│       └── server.js
├── documents/
│   └── etapas_desenvolvimento.md
├── .gitignore
└── README.md
```

## Perfis de Usuário

### Organizador (`ORGANIZER`)

Responsável pela criação e gerenciamento dos eventos.

A arquitetura foi preparada para permitir que o Organizador configure futuramente:

* título;
* descrição;
* categoria;
* data;
* local;
* capacidade;
* setores;
* modalidades;
* tipo de ocupação;
* categorias de preço;
* lotes;
* preços;
* quantidade de ingressos;
* assentos, quando aplicável.

O projeto também prevê criação, consulta, edição e exclusão de eventos.

### Cliente (`CLIENT`)

Responsável por:

* navegar pelo catálogo;
* consultar eventos;
* selecionar ingressos;
* escolher lugares quando necessário;
* realizar checkout;
* acessar ingressos adquiridos;
* visualizar QR Codes.

### Portaria (`CHECKIN`)

Responsável pela validação dos ingressos no acesso aos eventos.

## Autenticação e Segurança

O Back-End possui:

* cadastro de novos Clientes;
* login com e-mail e senha;
* hash de senha com `bcryptjs`;
* autenticação JWT;
* expiração configurável dos tokens;
* middleware para validação do JWT;
* controle de acesso baseado em perfil (RBAC);
* proteção contra autoatribuição dos perfis `ORGANIZER` e `CHECKIN`;
* validação de e-mail duplicado;
* política de senha forte para novos cadastros.

### Política de senha

Novos usuários devem utilizar senha com pelo menos 8 caracteres contendo:

* uma letra maiúscula;
* uma letra minúscula;
* um número;
* um caractere especial.

> Os usuários de demonstração criados pelos seeds utilizam a senha `123456`. Essas credenciais são destinadas exclusivamente ao ambiente de desenvolvimento e demonstração.

## Endpoints Implementados

### Autenticação

| Método | Endpoint         | Descrição                        |
| ------ | ---------------- | -------------------------------- |
| POST   | `/auth/register` | Cadastro de Cliente              |
| POST   | `/auth/login`    | Autenticação e geração do JWT    |
| GET    | `/auth/me`       | Validação do usuário autenticado |

Também existem rotas protegidas utilizadas durante o desenvolvimento para testar as permissões dos três perfis.

## Modelagem de Eventos

O Boraí possui uma estrutura flexível para representar diferentes formatos de evento sem exigir um modelo fixo para todos eles.

A arquitetura separa:

```text
Evento
↓
Setor
↓
Modalidade
↓
Categoria de preço
↓
Lote
```

Essa separação permite configurar eventos com características muito diferentes utilizando a mesma estrutura de banco.

## Categorias de Eventos

Algumas categorias globais disponíveis atualmente são:

* Shows e Festas;
* Cinema;
* Teatro e Espetáculos;
* Literatura e Lançamentos;
* Cursos, Palestras e Workshops;
* Comédia e Stand Up;
* Esportes.

A estrutura foi preparada para permitir novas categorias futuramente.

## Setores

Exemplos de setores disponíveis:

* Pista;
* Camarote;
* Cadeira Superior;
* Cadeira Inferior;
* Plateia;
* Sala de Cinema;
* Entrada Geral.

Os setores são templates globais reutilizáveis.

Um mesmo setor pode possuir configurações diferentes em eventos diferentes.

Exemplo:

```text
Evento A
PISTA — capacidade 800

Evento B
PISTA — capacidade 1500
```

## Modalidades

Setores também podem possuir modalidades.

Exemplo:

```text
CAMAROTE
├── NORMAL
├── OPEN BAR
├── OPEN FOOD
└── OPEN BAR + FOOD
```

As modalidades são independentes.

Um evento pode utilizar somente as opções necessárias para sua configuração.

Também podem existir modalidades específicas, como:

```text
AUTOGRAFO + LIVRO
AUTOGRAFO + FOTO + LIVRO
```

## Personalização e prevenção de duplicidades

A estrutura foi preparada para permitir opções pré-cadastradas e também a criação futura de novas opções.

Os nomes reutilizáveis devem ser normalizados antes da persistência.

A normalização considera:

* remoção de acentos;
* conversão para letras maiúsculas;
* remoção de espaços excedentes;
* validação de unicidade.

Assim, valores como:

```text
camarote
CAMAROTE
Cámarote
 CAMAROTE
```

representam a mesma opção:

```text
CAMAROTE
```

Quando uma nova opção global for criada por um Organizador, ela poderá ficar disponível para os demais Organizadores.

## Formas de ocupação

A modelagem diferencia duas formas principais de controle.

### `QUANTITY`

Controle baseado somente na quantidade disponível.

Aplicável a situações como:

* Pista;
* Entrada Geral;
* eventos sem lugar marcado;
* workshops;
* pacotes especiais.

### `SEAT`

Controle utilizando lugares individualizados.

Aplicável a:

* cinema;
* teatro;
* cadeiras numeradas;
* modalidades de eventos com assentos marcados.

Os assentos são relacionados à modalidade correspondente para evitar conflito entre diferentes configurações do mesmo setor.

## Controle de Capacidade

Todo evento possui uma capacidade máxima.

A estrutura permite controle hierárquico:

```text
Evento
↓
Setor
↓
Modalidade
↓
Lote
```

As capacidades internas deverão respeitar o limite físico do evento.

Exemplo:

```text
EPICA
Capacidade: 2000

PISTA             800
CAMAROTE          200
CADEIRA SUPERIOR  500
CADEIRA INFERIOR  500
```

## Categorias de Preço

As categorias iniciais incluem:

* Inteira;
* Meia;
* Meia Social;
* Valor Único.

As categorias **não possuem estoques independentes**.

O estoque é compartilhado dentro da modalidade e do lote.

## Regra de Meia-Entrada

`MEIA` e `MEIA SOCIAL` pertencem ao mesmo grupo global:

```text
MEIA ENTRADA
```

O grupo possui limite máximo de:

```text
50%
```

Portanto:

```text
MEIA + MEIA SOCIAL <= 50%
```

da capacidade aplicável.

Esse limite não representa reserva antecipada de ingressos.

`INTEIRA` pode consumir qualquer quantidade restante disponível.

## Lotes

Os eventos podem possuir múltiplos lotes.

Cada lote possui:

* ordem;
* quantidade;
* preços por categoria.

Exemplo:

```text
PISTA — 800 ingressos

LOTE 1 — 400

INTEIRA      R$ 220
MEIA         R$ 110
MEIA SOCIAL  R$ 140

LOTE 2 — 400

INTEIRA      R$ 260
MEIA         R$ 130
MEIA SOCIAL  R$ 160
```

As categorias compartilham a quantidade do lote.

## Progressão proporcional dos lotes

A arquitetura foi preparada para permitir que categorias sujeitas a limite proporcional avancem para o lote seguinte independentemente das demais categorias.

Exemplo:

```text
LOTE 1
Quantidade: 400

MEIA ENTRADA
Limite: 200
```

Se `MEIA + MEIA SOCIAL` atingir 200 ingressos, essas categorias poderão passar para os preços do `LOTE 2`.

Se ainda houver estoque físico no `LOTE 1`, `INTEIRA` poderá continuar sendo vendida pelo preço do primeiro lote.

Assim, poderá existir:

```text
INTEIRA      → LOTE 1
MEIA         → LOTE 2
MEIA SOCIAL  → LOTE 2
```

A lógica transacional dessa progressão será implementada durante o fluxo de reservas e checkout.

## Valores Monetários

Os preços são armazenados em centavos.

Exemplos:

```text
R$ 220,00 → 22000
R$ 89,90  → 8990
```

Isso evita problemas de arredondamento associados a valores financeiros em ponto flutuante.

## Taxa de Serviço

O Boraí utilizará taxa de serviço padrão de:

**12% do valor dos ingressos**

A taxa será adicionada durante o checkout e apresentada separadamente do preço-base.

Exemplo:

```text
Ingresso                  R$ 200,00
Taxa de serviço (12%)     R$  24,00
------------------------------------
Total                     R$ 224,00
```

## Eventos de Demonstração

Atualmente, os seeds criam quatro eventos.

### Filhos do Éden: Paraíso Perdido

Categoria:

**Teatro e Espetáculos**

Utilizado para demonstrar estrutura teatral com lugares marcados e lotes.

### Epica - Live in Brazil

Categoria:

**Shows e Festas**

Capacidade:

**2.000 pessoas**

Setores:

* Pista;
* Camarote;
* Cadeira Superior;
* Cadeira Inferior.

A Pista utiliza controle por quantidade.

O Camarote demonstra diferentes modalidades:

* Normal;
* Open Bar;
* Open Food;
* Open Bar + Food.

O evento também demonstra múltiplos lotes e diferentes preços.

### Lançamento e Autógrafos — Enciclopédia Serial Killers: A Maldade de A a Z

Categoria:

**Literatura e Lançamentos**

Evento demonstrativo inspirado em uma sessão com Harold Schechter.

Modalidades:

* Autógrafo + Livro;
* Autógrafo + Foto + Livro.

Controle por quantidade.

### Amanhecer - Parte 1 | Relançamento

Categoria:

**Cinema**

Capacidade:

**120 lugares**

Controle por assento.

## Configuração do Back-End

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` com base em:

```text
backend/.env.example
```

Configure as variáveis necessárias.

Execute as migrations:

```bash
npx prisma migrate dev
```

Popule o banco de desenvolvimento:

```bash
npm run seed
```

ou:

```bash
npx prisma db seed
```

Inicie a API:

```bash
npm run dev
```

Por padrão:

```text
http://localhost:3000
```

## Prisma Studio

Para visualizar os dados do banco de desenvolvimento:

```bash
npx prisma studio
```

O Prisma Studio permite inspecionar visualmente:

* usuários;
* eventos;
* setores;
* modalidades;
* categorias;
* lotes;
* preços;
* relações entre as entidades.

## Usuários de Demonstração

| Perfil      | E-mail                  | Senha    |
| ----------- | ----------------------- | -------- |
| Organizador | `organizador@teste.com` | `123456` |
| Cliente     | `cliente1@teste.com`    | `123456` |
| Cliente     | `cliente2@teste.com`    | `123456` |
| Portaria    | `portaria@teste.com`    | `123456` |

Essas credenciais são destinadas exclusivamente ao ambiente de desenvolvimento e demonstração.

## Recursos Planejados

A arquitetura está sendo preparada para incluir:

* reservas de ingressos;
* bloqueio temporário de assentos;
* checkout simulado;
* taxa de serviço;
* QR Code assinado;
* compartilhamento de ingresso;
* catálogo visual;
* painel do Organizador;
* criação, edição e exclusão de eventos;
* filtros;
* localização;
* integração com Ticketmaster;
* integração com TMDb;
* descoberta de eventos externos;
* validação de ingressos pela Portaria;
* cancelamentos;
* métricas;
* testes automatizados;
* Docker;
* deploy.

## Documentação

O histórico detalhado das etapas está disponível em:

```text
documents/etapas_desenvolvimento.md
```

Esse documento registra:

* implementações;
* testes;
* decisões arquiteturais;
* mudanças de escopo;
* uso de Inteligência Artificial;
* decisões realizadas manualmente.

## Uso de Inteligência Artificial

Ferramentas de Inteligência Artificial são utilizadas como apoio durante o desenvolvimento para:

* geração e revisão de código;
* análise de erros;
* modelagem de dados;
* documentação;
* discussão de decisões técnicas;
* criação de cenários de teste.

As decisões de produto e regras de negócio são revisadas durante o desenvolvimento, e as implementações são testadas manualmente antes de serem incorporadas ao projeto.

O detalhamento do uso de IA por etapa está registrado em:

```text
documents/etapas_desenvolvimento.md
```

## Licença

Projeto desenvolvido para fins acadêmicos e de portfólio.
