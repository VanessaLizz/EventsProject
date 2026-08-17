# Boraí

> **Seu próximo rolê a um clique de distância.**

Boraí é uma plataforma web para descoberta, gerenciamento, venda e validação de ingressos para diferentes tipos de eventos.

O sistema funciona como um hub multi-eventos e suporta cenários como shows, cinema, teatro, eventos literários, palestras, workshops e eventos esportivos, com venda por quantidade ou lugares marcados.

---

## Status

**Versão funcional em fase de revisão final.**

As funcionalidades planejadas para esta versão foram implementadas. A etapa restante consiste no teste final de ponta a ponta.

O histórico detalhado do desenvolvimento está disponível em:

```text
documents/etapas_desenvolvimento.md
```

---

# Principais Funcionalidades

## Área Pública

Visitantes podem:

- visualizar a Home;
- consultar o catálogo de eventos;
- pesquisar eventos;
- filtrar por categoria, cidade, mês e ano;
- combinar filtros;
- abrir detalhes de um evento;
- consultar setores, modalidades e preços disponíveis;
- acessar ingressos compartilhados através de link público.

Principais rotas:

```text
/
/eventos
/eventos/:eventId
/ingresso/:sharedToken
/login
```

---

# Autenticação e Perfis

A autenticação utiliza **JWT** e controle de acesso baseado em perfil.

Perfis disponíveis:

```text
CLIENT
ORGANIZER
CHECKIN
```

As rotas protegidas validam autenticação e perfil antes de permitir o acesso.

---

# Cliente

Área principal:

```text
/cliente
```

O Cliente pode:

- selecionar ingressos;
- comprar por quantidade;
- selecionar lugares marcados;
- escolher categoria de preço;
- realizar checkout;
- utilizar pagamento simulado;
- visualizar seus ingressos;
- consultar QR Code;
- compartilhar uma visualização pública do ingresso.

Cada checkout permite no máximo:

```text
10 ingressos
```

---

# Organizador

Área principal:

```text
/organizador
```

O Organizador pode:

- criar eventos manualmente;
- consultar eventos externos;
- utilizar TMDb e Ticketmaster como fontes de dados;
- revisar dados externos antes da criação;
- editar eventos em rascunho;
- configurar setores;
- criar novos tipos de setor;
- configurar modalidades;
- criar novos tipos de modalidade;
- configurar categorias de preço;
- configurar lotes e valores;
- configurar lugares marcados;
- publicar eventos;
- acompanhar eventos publicados e encerrados;
- visualizar métricas comerciais.

Os eventos são organizados em:

```text
Rascunhos
Publicados
Encerrados
```

## Rascunhos

Eventos com:

```text
DRAFT
```

podem permanecer incompletos enquanto estão sendo configurados.

## Publicados

Eventos com:

```text
PUBLISHED
```

são disponibilizados no catálogo público quando aplicável.

## Encerrados

Eventos publicados cuja data já passou permanecem no histórico do Organizador.

---

# Criação e Publicação de Eventos

O fluxo principal é:

```text
Criação manual ou seleção de evento externo
                ↓
              DRAFT
                ↓
       Editar informações
                ↓
       Configurar setores
                ↓
     Configurar modalidades
                ↓
     Categorias de preço
                ↓
              Lotes
                ↓
    Assentos, quando aplicável
                ↓
            Validação
                ↓
       Publicação manual
                ↓
           PUBLISHED
```

Um evento só pode ser publicado quando sua configuração obrigatória estiver consistente.

O Back-End valida, entre outros pontos:

- capacidade do evento;
- capacidade dos setores;
- capacidade das modalidades;
- categorias de preço;
- lotes;
- preços;
- quantidades;
- assentos em modalidades `SEAT`.

---

# Estrutura Comercial

A estrutura de venda segue a hierarquia:

```text
Evento
└── Setor
    └── Modalidade
        ├── Categoria de preço
        ├── Lotes
        └── Assentos, quando aplicável
```

## Setores

Exemplos:

```text
PISTA
CAMAROTE
CADEIRA INFERIOR
CADEIRA SUPERIOR
PLATEIA
```

Cada setor possui sua própria capacidade.

O Organizador também pode criar novos tipos de setor.

## Modalidades

Existem dois modos principais de ocupação:

```text
QUANTITY
SEAT
```

### QUANTITY

Venda controlada por quantidade, sem escolha individual de lugar.

### SEAT

Venda utilizando assentos individuais.

Exemplo:

```text
A1
A2
A3
...
```

Cada assento possui disponibilidade própria.

## Categorias de Preço

Exemplos:

```text
INTEIRA
MEIA
MEIA SOCIAL
VALOR ÚNICO
```

`MEIA` e `MEIA SOCIAL` podem compartilhar um grupo de cota configurado no sistema.

## Lotes

Cada lote possui:

- sequência;
- quantidade;
- preços por categoria;
- estado ativo.

O comprador visualiza somente os valores correspondentes ao lote atualmente disponível.

---

# Integração com APIs Externas

O projeto possui integração com:

- **TMDb**
- **Ticketmaster Discovery API**

Essas APIs são utilizadas somente como fontes auxiliares de dados.

Elas **não criam nem publicam eventos automaticamente**.

## Catálogo Externo

Rota:

```text
/organizador/eventos/importar
```

O Organizador pode:

- escolher o tipo de evento;
- visualizar opções disponíveis;
- pesquisar;
- filtrar por estado quando aplicável;
- navegar entre páginas;
- selecionar um ou vários eventos;
- revisar cada item antes da criação.

Fluxo:

```text
TMDb / Ticketmaster
        ↓
Catálogo externo
        ↓
Seleção
        ↓
Revisão no formulário
        ↓
Edição / complementação
        ↓
Confirmação
        ↓
DRAFT
```

A publicação continua sendo manual.

---

# Checkout

O checkout suporta:

```text
QUANTITY
SEAT
```

Fluxo:

```text
Evento
↓
Seleção do ingresso
↓
Categoria
↓
Quantidade ou assento
↓
Checkout
↓
Subtotal
↓
Taxa de serviço
↓
Pagamento simulado
↓
APPROVED ou REFUSED
```

A taxa padrão configurada no projeto é:

```text
12%
```

Quando o pagamento é aprovado:

- o pedido é criado;
- os Tickets são emitidos;
- o estoque é atualizado;
- assentos vendidos ficam indisponíveis;
- cada Ticket recebe uma identificação própria.

---

# Reservas e Concorrência

Modalidades `QUANTITY` validam a disponibilidade no momento da conclusão da compra.

Modalidades `SEAT` utilizam bloqueio temporário durante o checkout.

Se a sessão expirar, o assento ainda não vendido volta a ficar disponível.

Assentos efetivamente vendidos permanecem indisponíveis.

---

# Ingressos e QR Code

Cada Ticket pode assumir estados como:

```text
VALID
USED
CANCELLED
```

O Cliente proprietário pode acessar seu QR Code privado.

O QR Code e o link público possuem responsabilidades diferentes:

```text
QR privado
→ validação de entrada

sharedToken
→ visualização pública
```

O compartilhamento público não expõe a credencial utilizada pela Portaria.

---

# Portaria

Área principal:

```text
/portaria
```

O perfil:

```text
CHECKIN
```

pode validar ingressos através de:

- leitura pela câmera;
- inserção manual do token.

A leitura pela câmera utiliza:

```text
@zxing/browser
```

Estados tratados:

```text
VÁLIDO
JÁ UTILIZADO
CANCELADO
INVÁLIDO
```

Após uma validação bem-sucedida:

```text
VALID
↓
USED
```

O mesmo ingresso não pode autorizar uma segunda entrada.

---

# Métricas do Organizador

O Organizador possui visão geral e métricas individuais por evento.

Entre os indicadores disponíveis estão:

- receita;
- ingressos vendidos;
- ticket médio;
- ocupação;
- capacidade disponível;
- vendas por categoria;
- vendas por setor.

O painel geral possui filtros por:

- categoria;
- período;
- ano.

---

# Tecnologias

## Front-End

- React
- Vite
- React Router
- CSS
- `@zxing/browser`

## Back-End

- Node.js
- Express
- Prisma ORM
- JWT
- bcryptjs
- QRCode

## Banco de Dados

- SQLite

## APIs Externas

- TMDb API
- Ticketmaster Discovery API

## Ferramentas

- Git
- GitHub
- npm
- VS Code

---

# Estrutura do Projeto

```text
EventosProject/
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
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── documents/
│   └── etapas_desenvolvimento.md
│
└── README.md
```

---

# Instalação

## Pré-requisitos

É necessário possuir:

```text
Node.js
npm
Git
```

---

## 1. Clonar o Projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd EventosProject
```

---

## 2. Configurar o Back-End

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie:

```text
backend/.env
```

utilizando:

```text
backend/.env.example
```

como referência.

Exemplo:

```env
DATABASE_URL="file:./dev.db"

JWT_SECRET="seu_segredo_jwt"
JWT_EXPIRES_IN="1d"

QR_SECRET="seu_segredo_qr"

TMDB_ACCESS_TOKEN="seu_token_tmdb"
TICKETMASTER_API_KEY="sua_chave_ticketmaster"

PORT=3000
```

As credenciais reais não devem ser versionadas.

---

## 3. Preparar o Banco de Dados

Ainda dentro de:

```text
backend
```

gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrations existentes:

```bash
npx prisma migrate deploy
```

Execute o seed:

```bash
npx prisma db seed
```

O seed pode ser executado novamente quando necessário.

Ele recria apenas os eventos de demonstração controlados pelo próprio seed e preserva os demais eventos criados normalmente pela aplicação.

---

## 4. Iniciar o Back-End

Dentro de:

```text
backend
```

execute:

```bash
npm run dev
```

Por padrão:

```text
http://localhost:3000
```

---

## 5. Configurar o Front-End

Abra outro terminal a partir da raiz do projeto.

Entre na pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço utilizado pelo Front-End, normalmente:

```text
http://localhost:5173
```

---

# Desenvolvimento do Banco

Para criar uma nova migration durante o desenvolvimento, altere primeiro:

```text
backend/prisma/schema.prisma
```

Depois, dentro de:

```text
backend
```

execute:

```bash
npx prisma migrate dev --name nome_da_migration
```

Após alterações no schema, também pode ser necessário executar:

```bash
npx prisma generate
```

Para apenas preparar um projeto recém-clonado, utilize as migrations já existentes:

```bash
npx prisma migrate deploy
```

Não é necessário criar uma nova migration durante a instalação normal.

---

# Prisma Studio

Para visualizar os dados:

```bash
cd backend
npx prisma studio
```

---

# Usuários de Demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Organizador | `organizador@teste.com` | `123456` |
| Cliente | `cliente1@teste.com` | `123456` |
| Cliente | `cliente2@teste.com` | `123456` |
| Portaria | `portaria@teste.com` | `123456` |

Essas credenciais existem apenas para desenvolvimento e demonstração.

---

# Principais Endpoints

## Autenticação

```text
POST /auth/register
POST /auth/login
GET  /auth/me
```

## Eventos Públicos

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

POST /events/organizer/:eventId/publish
```

## Configuração

```text
GET /events/organizer/:eventId/configuration

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

## APIs Externas

```text
GET /events/external/catalog/types
GET /events/external/catalog

GET /events/external/tmdb/search
GET /events/external/tmdb/:externalId

GET /events/external/ticketmaster/search
GET /events/external/ticketmaster/:externalId
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

O projeto utiliza:

- senhas armazenadas com hash;
- autenticação JWT;
- RBAC;
- proteção de rotas;
- validação de propriedade dos Tickets;
- QR Code privado;
- token público separado para compartilhamento;
- validações de estoque no Back-End;
- validações de configuração e publicação de eventos.

Segredos e credenciais devem permanecer apenas no `.env`.

---

# Dados de Demonstração

O seed cria quatro eventos principais para testar diferentes cenários:

- teatro com lugares marcados;
- show com setores e diferentes modalidades;
- evento literário com venda por quantidade;
- cinema com lugares marcados.

Também são criados:

- usuários de demonstração;
- categorias;
- setores;
- modalidades;
- categorias de preço;
- lotes;
- preços;
- assentos.

O seed foi validado para ser executado repetidamente sem duplicar os eventos controlados por ele.

---

# Escopo desta Versão

Esta versão contempla o fluxo principal:

```text
Autenticação
↓
Descoberta ou criação de evento
↓
Configuração
↓
Publicação
↓
Catálogo público
↓
Seleção de ingressos
↓
Checkout
↓
Pagamento simulado
↓
Ticket
↓
QR Code
↓
Check-in
↓
Métricas
```

Algumas funcionalidades que fizeram parte do planejamento inicial não integram a entrega final desta versão:

- cancelamento e devolução como fluxo completo;
- integração real com gateway de pagamento;
- Docker;
- suíte de testes automatizados;
- deploy em produção.

O pagamento permanece simulado.

O objetivo desta versão é demonstrar de ponta a ponta os principais fluxos de uma plataforma de gerenciamento e venda de ingressos.

---

# Documentação

O README apresenta apenas a visão geral necessária para instalar, executar e compreender o projeto.

O histórico detalhado das etapas, decisões, mudanças de escopo, problemas encontrados e correções está em:

```text
documents/etapas_desenvolvimento.md
```

---

# Uso de Inteligência Artificial

Ferramentas de Inteligência Artificial foram utilizadas como apoio durante o desenvolvimento para:

- planejamento;
- geração e revisão de código;
- análise de erros;
- modelagem de dados;
- integração de APIs;
- documentação;
- criação de cenários de teste.

As decisões de produto e as implementações foram revisadas e testadas durante o desenvolvimento.

O detalhamento está registrado em:

```text
documents/etapas_desenvolvimento.md
```

---

# Etapa Final

A Etapa 12 é a última etapa desta versão.

Situação atual:

```text
Revisão do seed.js
✅ concluída

Revisão da instalação e banco
✅ concluída

Teste completo de ponta a ponta
✅ concluída

## Status

**Projeto concluído.**

As funcionalidades planejadas para esta versão foram implementadas e os principais fluxos foram validados durante o desenvolvimento.

O histórico detalhado do desenvolvimento está disponível em:

```text
documents/etapas_desenvolvimento.md

---

# Licença

Projeto desenvolvido para fins acadêmicos e de portfólio.