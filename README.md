# Boraí

> **Seu próximo rolê a um clique de distância.**

Boraí é uma plataforma web para descoberta, gerenciamento, venda e validação de ingressos para diferentes tipos de eventos.

O projeto funciona como um **hub multi-eventos**, permitindo trabalhar com formatos como:

- shows e festas;
- cinema;
- teatro e espetáculos;
- workshops e palestras;
- eventos literários;
- eventos com lugares marcados;
- eventos com controle apenas por quantidade.

A aplicação possui três perfis principais:

- **Organizador**
- **Cliente**
- **Portaria**

---

# Status do Projeto

**Em desenvolvimento.**

## Etapas concluídas

- [x] **Etapa 0** — Conceituação e documentação base
- [x] **Etapa 1** — Setup do projeto, banco de dados e seeds
- [x] **Etapa 2** — Autenticação JWT e controle de acesso por perfil (RBAC)
- [x] **Etapa 3** — Modelagem avançada de eventos, ingressos, setores, modalidades e lotes
- [x] **Etapa 4** — Reservas, checkout, pagamento simulado, QR Code e validação de ingressos no Back-End
- [x] **Etapa 5** — Front-End: autenticação, catálogo público e estrutura dos perfis
- [x] **Etapa 6** — Módulo do Organizador, criação, configuração e publicação de eventos

## Próximas etapas

- [ ] **Etapa 7** — Seleção de ingressos e checkout no Front-End
- [ ] **Etapa 8** — Meus Ingressos e QR Code
- [ ] **Etapa 9** — Portal da Portaria
- [ ] **Etapa 10** — Busca avançada, filtros e métricas
- [ ] **Etapa 11** — Cancelamento e devolução ao estoque
- [ ] **Etapa 12** — Docker e testes automatizados
- [ ] **Etapa 13** — Publicação, polimento e entrega final

O histórico detalhado do desenvolvimento está disponível em:

```text
documents/etapas_desenvolvimento.md
```

---

# Funcionalidades Disponíveis

## Área Pública

O visitante pode utilizar a aplicação sem autenticação para descobrir eventos.

Atualmente estão disponíveis:

- Home;
- catálogo público;
- eventos em destaque;
- cards de eventos;
- card inteiro clicável;
- página de detalhes;
- busca textual;
- filtros por categoria;
- filtros por cidade;
- filtros por mês;
- filtros por ano;
- combinação de filtros;
- filtro recebido através da URL;
- visualização de informações do evento;
- visualização da estrutura comercial disponível;
- navegação responsiva;
- página 404;
- tratamento visual para eventos sem imagem.

Rotas principais:

```text
/
```

Home pública.

```text
/eventos
```

Catálogo público.

```text
/eventos/:eventId
```

Detalhes de um evento.

```text
/login
```

Autenticação.

---

# Autenticação

A autenticação utiliza:

```text
JWT
```

O Front-End possui integração com o Back-End para:

- login;
- persistência da sessão;
- identificação do usuário;
- logout;
- proteção de rotas;
- redirecionamento;
- controle de acesso conforme o perfil.

Os três papéis existentes são:

```text
CLIENT
ORGANIZER
CHECKIN
```

---

# Controle de Acesso — RBAC

O sistema possui controle de acesso por perfil.

## Cliente

```text
CLIENT
```

Área:

```text
/cliente
```

## Organizador

```text
ORGANIZER
```

Área:

```text
/organizador
```

## Portaria

```text
CHECKIN
```

Área:

```text
/portaria
```

Um usuário autenticado não pode acessar diretamente uma área destinada a outro perfil.

---

# Módulo do Organizador

A Etapa 6 implementou o fluxo principal de gerenciamento dos eventos pelo perfil:

```text
ORGANIZER
```

O Organizador pode:

- visualizar seus próprios eventos;
- criar novos eventos;
- editar eventos em rascunho;
- configurar a capacidade;
- adicionar setores;
- definir a capacidade dos setores;
- adicionar modalidades;
- escolher entre `QUANTITY` e `SEAT`;
- configurar categorias de preço;
- criar múltiplos lotes;
- definir quantidade de ingressos por lote;
- configurar preços por categoria;
- gerar assentos;
- excluir configurações;
- acompanhar a capacidade utilizada;
- acompanhar a capacidade disponível;
- visualizar pendências;
- publicar eventos;
- visualizar o evento publicado no catálogo público.

---

# Fluxo de Criação do Evento

O fluxo atual do Organizador segue:

```text
Organizador
    ↓
Criar evento
    ↓
Informar dados gerais
    ↓
Definir capacidade total
    ↓
Salvar como DRAFT
    ↓
Configurar setores
    ↓
Configurar modalidades
    ↓
Definir QUANTITY ou SEAT
    ↓
Adicionar categorias de preço
    ↓
Criar lotes
    ↓
Definir preços
    ↓
Configurar assentos quando aplicável
    ↓
Verificar pendências
    ↓
Publicar
    ↓
PUBLISHED
```

---

# Estados dos Eventos

Os principais estados utilizados são:

```text
DRAFT
PUBLISHED
CANCELLED
```

## `DRAFT`

Evento em configuração.

Enquanto está em rascunho, o Organizador pode montar sua estrutura comercial.

## `PUBLISHED`

Evento publicado e disponível no catálogo público.

## `CANCELLED`

Evento cancelado.

---

# Publicação de Eventos

A publicação é realizada dentro da própria página de configuração do evento.

Antes da publicação, o sistema verifica se existem pendências.

A interface apresenta ao Organizador o que ainda precisa ser configurado.

Entre as validações estão:

- existência de setores;
- capacidade dos setores;
- modalidades configuradas;
- capacidades das modalidades;
- categorias de preço;
- existência de lotes;
- quantidade distribuída nos lotes;
- preços para as categorias;
- assentos em modalidades `SEAT`.

Quando a configuração está completa:

```text
DRAFT
↓
PUBLISHED
```

O evento passa a aparecer no catálogo público.

---

# Controle de Capacidade

A estrutura possui controle hierárquico:

```text
EVENTO
   ↓
SETOR
   ↓
MODALIDADE
   ↓
LOTE / ASSENTO
```

`Event.capacity` representa a capacidade física máxima do evento.

Exemplo:

```text
Evento
Capacidade: 1000

PISTA
Capacidade: 600

CAMAROTE
Capacidade: 400
```

Total:

```text
600 + 400 = 1000
```

A configuração não deve ultrapassar a capacidade definida no nível superior.

---

# Visualização da Capacidade

A tela de configuração apresenta ao Organizador:

```text
Capacidade máxima
Em uso
Disponível
```

Também são utilizados indicadores de progresso para facilitar a visualização da distribuição.

Exemplo:

```text
Capacidade máxima: 1000
Em uso: 700
Disponível: 300
```

---

# Setores

Os eventos podem possuir diferentes setores.

Exemplos:

```text
PISTA
CAMAROTE
CADEIRA SUPERIOR
CADEIRA INFERIOR
PLATEIA
SALA DE CINEMA
ENTRADA GERAL
```

Cada setor possui capacidade própria.

---

# Modalidades

Um setor pode possuir uma ou mais modalidades.

Exemplo:

```text
CAMAROTE
├── NORMAL
├── OPEN BAR
├── OPEN FOOD
└── OPEN BAR + FOOD
```

Também existem modalidades utilizadas para formatos específicos de evento.

Exemplo:

```text
AUTOGRAFO + LIVRO
AUTOGRAFO + FOTO + LIVRO
```

---

# Modos de Ocupação

As modalidades possuem dois modos principais.

## `QUANTITY`

Controle baseado somente em quantidade.

Exemplos:

```text
PISTA
ENTRADA GERAL
WORKSHOP
```

Não existe escolha de um lugar específico.

---

## `SEAT`

Controle através de assentos individualmente identificados.

Exemplos:

```text
CINEMA
TEATRO
CADEIRAS NUMERADAS
```

Os assentos pertencem à modalidade correspondente.

---

# Assentos

Modalidades `SEAT` possuem registros individuais de assento.

Exemplo:

```text
A1
A2
A3
A4
...
```

Cada assento pode ser relacionado posteriormente ao checkout e ao ingresso adquirido.

Modalidades `QUANTITY` não utilizam registros de assento.

---

# Categorias de Preço

As categorias iniciais incluem:

```text
INTEIRA
MEIA
MEIA SOCIAL
VALOR UNICO
```

As categorias não possuem estoque físico independente.

Elas utilizam o estoque existente na modalidade e no lote.

---

# Regra de Meia-Entrada

As categorias:

```text
MEIA
MEIA SOCIAL
```

pertencem ao grupo:

```text
MEIA ENTRADA
```

O grupo possui limite:

```text
50%
```

A regra é:

```text
MEIA + MEIA SOCIAL <= 50%
```

da capacidade aplicável.

---

# Lotes

Uma modalidade pode possuir múltiplos lotes.

Exemplo:

```text
PISTA
Capacidade: 800

LOTE 1
Quantidade: 400

LOTE 2
Quantidade: 400
```

Cada lote pode possuir preços diferentes.

Exemplo:

```text
LOTE 1

INTEIRA      R$ 220,00
MEIA         R$ 110,00
MEIA SOCIAL  R$ 140,00
```

As categorias compartilham a quantidade disponível no lote.

---

# Valores Monetários

Valores financeiros são armazenados em centavos.

Exemplo:

```text
R$ 220,00 → 22000
R$ 89,90  → 8990
```

Isso reduz problemas de precisão com números decimais.

---

# Taxa de Serviço

A taxa padrão definida para compras online é:

```text
12%
```

A taxa é calculada separadamente do valor-base dos ingressos.

O pedido registra:

```text
subtotal
taxa de serviço
total
```

---

# Checkout — Back-End

O Back-End já possui o núcleo do checkout implementado.

Rota para iniciar:

```text
POST /checkout
```

Rota para concluir:

```text
POST /checkout/:checkoutId/complete
```

As duas operações são destinadas a:

```text
CLIENT
```

autenticado.

O Front-End completo desse fluxo será implementado na Etapa 7.

---

# Limite por Checkout

Foi definida a regra:

```text
máximo de 10 ingressos por checkout
```

O limite considera o total da compra.

Exemplo:

```text
5 INTEIRA
+
5 MEIA
=
10
```

Permitido.

```text
11 ingressos
```

Bloqueado.

---

# Checkout `QUANTITY`

Para modalidades:

```text
QUANTITY
```

o início do checkout não bloqueia estoque.

A disponibilidade é validada novamente no momento da finalização.

Fluxo:

```text
seleção
↓
checkout
↓
intenção de compra
↓
finalização
↓
validação atômica do estoque
```

---

# Checkout `SEAT`

Para modalidades:

```text
SEAT
```

o assento selecionado precisa ser bloqueado temporariamente.

Fluxo:

```text
seleção do assento
↓
checkout
↓
bloqueio
↓
prazo
↓
pagamento
```

O prazo definido para a reserva temporária é:

```text
10 minutos
```

---

# Concorrência

O Back-End possui validações para impedir:

- dupla venda;
- dupla reserva de assento;
- venda acima do estoque;
- venda acima da capacidade;
- ultrapassar limites de cota.

Para `QUANTITY`, a estratégia utilizada é:

```text
first-to-complete wins
```

Ou seja, quando dois clientes disputam o estoque restante, a disponibilidade é decidida na conclusão da compra.

---

# Pagamento Simulado

O projeto utiliza pagamento simulado para permitir a validação do fluxo sem gateway externo.

Resultados possíveis:

```text
APPROVED
REFUSED
```

## Pagamento aprovado

Quando aprovado:

- estoque é validado;
- pedido é criado;
- ingressos são criados;
- valores são registrados;
- checkout é concluído.

## Pagamento recusado

Quando recusado:

- não ocorre compra;
- não são criados Tickets válidos;
- checkout é cancelado;
- assentos temporariamente reservados são liberados.

---

# Pedidos

Uma compra aprovada gera:

```text
Order
```

O pedido registra separadamente:

```text
subtotalInCents
serviceFeeRateBps
serviceFeeInCents
totalInCents
```

---

# Tickets

Cada ingresso comprado gera um registro individual:

```text
Ticket
```

Mesmo que uma compra tenha:

```text
quantity > 1
```

cada unidade se transforma em um Ticket próprio.

Isso permite:

- identificador individual;
- QR Code individual;
- status individual;
- compartilhamento individual;
- relacionamento com assento quando necessário.

---

# Estados dos Tickets

Os principais estados são:

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

Ingresso cancelado.

---

# QR Code

O Back-End possui suporte a QR Code assinado.

Foi criada uma chave própria:

```text
QR_SECRET
```

separada de:

```text
JWT_SECRET
```

O QR utiliza assinatura:

```text
HS256
```

e o token original não é armazenado diretamente no banco.

É persistido:

```text
qrCodeHash
```

gerado através de:

```text
SHA-256
```

---

# QR Code Privado

Endpoint:

```text
GET /tickets/:ticketId/qr
```

O QR privado somente pode ser acessado pelo proprietário autenticado do ingresso.

A interface correspondente será desenvolvida na Etapa 8.

---

# Compartilhamento Público do Ingresso

Também existe suporte a compartilhamento público seguro.

Endpoint:

```text
GET /tickets/shared/:sharedToken
```

A visualização pública não deve expor o QR Code privado utilizado pela Portaria.

---

# Validação pela Portaria

O Back-End disponibiliza:

```text
POST /checkin/validate
```

O fluxo permite validar o ingresso e impedir reutilização.

Mudança esperada:

```text
VALID
↓
USED
```

A interface da Portaria será desenvolvida na Etapa 9.

---

# Catálogo Público

O catálogo pode ser acessado sem autenticação.

A API pública utiliza:

```text
GET /events
```

para listagem e:

```text
GET /events/:eventId
```

para detalhes.

Somente eventos com:

```text
status = PUBLISHED
```

são apresentados publicamente.

---

# Filtros do Catálogo

O catálogo possui filtros para:

- texto;
- categoria;
- cidade;
- mês;
- ano.

Os filtros podem ser combinados.

Também existe suporte a categoria pela URL:

```text
/eventos?categoria=...
```

---

# Eventos de Demonstração

Os seeds possuem eventos demonstrativos que representam diferentes cenários da aplicação.

Entre eles:

## Filhos do Éden: Paraíso Perdido

Exemplo de:

- teatro;
- assentos;
- lotes.

## Epica - Live in Brazil

Exemplo de:

- show;
- múltiplos setores;
- pista;
- camarote;
- modalidades;
- assentos;
- múltiplos lotes.

## Lançamento e Autógrafos — Enciclopédia Serial Killers: A Maldade de A a Z

Exemplo de:

- evento literário;
- controle por quantidade;
- modalidades especiais.

## Amanhecer - Parte 1 | Relançamento

Exemplo de:

- cinema;
- sala;
- assentos;
- categorias de preço.

---

# Tecnologias

## Back-End

- Node.js
- Express
- Prisma ORM
- SQLite
- JSON Web Token (`jsonwebtoken`)
- bcryptjs
- CORS
- dotenv
- qrcode

## Front-End

- React
- Vite
- React Router
- JavaScript
- CSS
- ESLint

---

# Estrutura do Projeto

```text
EventsProject/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── documents/
│   └── etapas_desenvolvimento.md
│
├── .gitignore
└── README.md
```

---

# Configuração do Back-End

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie o arquivo:

```text
.env
```

utilizando como referência:

```text
backend/.env.example
```

Execute as migrations:

```bash
npx prisma migrate dev
```

Popule o banco:

```bash
npx prisma db seed
```

ou, conforme os scripts disponíveis:

```bash
npm run seed
```

Inicie a API:

```bash
npm run dev
```

---

# Configuração do Front-End

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local utilizado pelo Front-End.

---

# Executando o Projeto

São necessários dois terminais.

## Terminal 1 — Back-End

```bash
cd backend
npm run dev
```

## Terminal 2 — Front-End

```bash
cd frontend
npm run dev
```

---

# Prisma Studio

Para inspecionar o banco:

```bash
cd backend
npx prisma studio
```

O Prisma Studio permite visualizar entidades como:

- usuários;
- eventos;
- setores;
- modalidades;
- categorias;
- lotes;
- preços;
- assentos;
- checkouts;
- pedidos;
- ingressos.

---

# Usuários de Demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Organizador | `organizador@teste.com` | `123456` |
| Cliente | `cliente1@teste.com` | `123456` |
| Cliente | `cliente2@teste.com` | `123456` |
| Portaria | `portaria@teste.com` | `123456` |

Essas credenciais são utilizadas exclusivamente no ambiente de desenvolvimento e demonstração.

Novos usuários cadastrados através do endpoint público seguem a política de senha definida pela aplicação.

---

# Principais Endpoints

## Autenticação

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

## Eventos públicos

```text
GET /events
GET /events/:eventId
```

## Organizador

```text
GET  /events/templates
GET  /events/organizer/mine
GET  /events/organizer/:eventId

POST /events/organizer
PUT  /events/organizer/:eventId
```

## Configuração do evento

```text
GET /events/organizer/:eventId/configuration
```

### Setores

```text
POST   /events/organizer/:eventId/sectors
DELETE /events/organizer/:eventId/sectors/:sectorId
```

### Modalidades

```text
POST   /events/organizer/:eventId/sectors/:sectorId/modalities
DELETE /events/organizer/:eventId/modalities/:modalityId
```

### Categorias de preço

```text
POST   /events/organizer/:eventId/modalities/:modalityId/categories
DELETE /events/organizer/:eventId/modalities/:modalityId/categories/:categoryId
```

### Lotes

```text
POST   /events/organizer/:eventId/modalities/:modalityId/batches
DELETE /events/organizer/:eventId/modalities/:modalityId/batches/:batchId
```

### Assentos

```text
POST   /events/organizer/:eventId/modalities/:modalityId/seats
DELETE /events/organizer/:eventId/modalities/:modalityId/seats/:seatId
```

## Checkout

```text
POST /checkout
POST /checkout/:checkoutId/complete
```

## Tickets

```text
GET /tickets/:ticketId/qr
GET /tickets/shared/:sharedToken
```

## Portaria

```text
POST /checkin/validate
```

---

# Segurança

Entre as medidas existentes no projeto estão:

- senhas armazenadas com hash;
- autenticação JWT;
- expiração de token;
- RBAC;
- proteção das rotas privadas;
- restrição de operações ao proprietário do recurso;
- QR Code assinado;
- segredo do QR separado do JWT;
- armazenamento apenas do hash do token do QR;
- proteção contra reutilização do ingresso;
- validação de disponibilidade no Back-End;
- operações de concorrência para assentos e estoque.

---

# Documentação do Desenvolvimento

O histórico detalhado está disponível em:

```text
documents/etapas_desenvolvimento.md
```

O documento registra:

- implementações;
- regras de negócio;
- decisões arquiteturais;
- migrations;
- testes;
- problemas encontrados;
- correções;
- mudanças de escopo;
- decisões manuais;
- utilização de Inteligência Artificial.

---

# Uso de Inteligência Artificial

Ferramentas de Inteligência Artificial são utilizadas como apoio durante o desenvolvimento para:

- planejamento;
- geração de código;
- revisão de código;
- análise de erros;
- modelagem de dados;
- estruturação de componentes;
- documentação;
- criação de cenários de teste;
- investigação de problemas técnicos.

As decisões de produto e regras de negócio são revisadas durante o desenvolvimento.

As implementações são executadas e testadas manualmente antes de serem incorporadas ao projeto.

O detalhamento do uso de IA em cada etapa está registrado em:

```text
documents/etapas_desenvolvimento.md
```

---

# Próxima Etapa

## Etapa 7 — Seleção de Ingressos e Checkout no Front-End

A próxima etapa conecta o catálogo público ao núcleo de checkout já existente no Back-End.

O fluxo previsto é:

```text
Evento
   ↓
Selecionar ingressos
   ↓
QUANTITY ou SEAT
   ↓
Escolher categoria
   ↓
Escolher quantidade ou assento
   ↓
Autenticação do Cliente
   ↓
Checkout
   ↓
Subtotal
   ↓
Taxa de serviço de 12%
   ↓
Total
   ↓
Pagamento simulado
   ↓
Sucesso ou recusa
```

O Front-End também deverá respeitar o limite de:

```text
10 ingressos por checkout
```

além das validações obrigatórias já existentes no Back-End.

---

# Licença

Projeto desenvolvido para fins acadêmicos e de portfólio.