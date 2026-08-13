
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


agora do msm jeito, atualize o readme

Baixar o README.md atualizado 


README.md
Documento


Biblioteca
/
README.md


Boraí
Seu próximo rolê a um clique de distância

Boraí é uma plataforma web para descoberta, gerenciamento, venda e
validação de ingressos para diferentes tipos de eventos, como shows,
cinema, teatro, workshops, eventos literários e experiências especiais.

O projeto funciona como um hub multi-eventos e possui três perfis
principais:

Organizador

Cliente

Portaria

Status do Projeto
Em desenvolvimento.

Etapas concluídas
Etapa 0 --- Conceituação e documentação base

Etapa 1 --- Setup do projeto, banco de dados e seeds

Etapa 2 --- Autenticação JWT e controle de acesso por perfil
(RBAC)

Etapa 3 --- Modelagem avançada de eventos, ingressos, setores,
modalidades e lotes

Etapa 4 --- Reservas, checkout, pagamento simulado, QR Code e
validação de ingressos

Etapa 5 --- Front-End: autenticação, catálogo público e
estrutura dos perfis

Etapa 6 --- Painel do Organizador e criação/edição de eventos

Etapa 7 --- Seleção de ingressos e checkout no Front-End

Etapa 8 --- Meus Ingressos e QR Code

Etapa 9 --- Portal da Portaria

Etapa 10 --- Busca avançada, filtros e métricas

Etapa 11 --- Cancelamento e devolução ao estoque

Etapa 12 --- Docker e testes automatizados

Etapa 13 --- Publicação, polimento e entrega final

O escopo técnico é refinado durante o desenvolvimento conforme novas
regras de negócio são identificadas. O histórico detalhado está
disponível em documents/etapas_desenvolvimento.md.

Funcionalidades disponíveis atualmente
Área pública
Home;

catálogo público de eventos;

eventos em destaque;

cards de eventos;

card inteiro clicável;

busca textual;

filtros por categoria, cidade, mês e ano;

filtro de categoria recebido pela URL;

página de detalhes do evento;

exibição de setores, modalidades, lotes e preços;

navegação responsiva;

página 404.

Autenticação e acesso
login integrado ao Back-End;

autenticação JWT;

persistência da sessão no navegador;

controle de acesso por perfil;

rotas privadas;

logout;

redirecionamento de usuários não autenticados;

bloqueio de acesso a áreas de outros perfis.

Áreas autenticadas
/cliente --- área inicial do Cliente;

/organizador --- área inicial do Organizador;

/portaria --- área inicial da Portaria.

As funcionalidades específicas desses painéis serão ampliadas nas
próximas etapas.

Back-End de venda e ingresso
O Back-End já possui estrutura para:

checkout;

limite de até 10 ingressos por compra;

modalidades por assento (SEAT);

modalidades por quantidade (QUANTITY);

reservas;

expiração de reservas;

validação de estoque;

validação de capacidade;

cotas;

pagamento simulado;

taxa de serviço;

pedidos;

Tickets individuais;

QR Code assinado;

visualização privada do QR;

compartilhamento público seguro;

validação de ingresso pela Portaria;

prevenção de reutilização do ingresso.

Tecnologias
Back-End
Node.js

Express

Prisma ORM

SQLite

JWT (jsonwebtoken)

bcryptjs

CORS

dotenv

Front-End
React

Vite

React Router

JavaScript

CSS

ESLint

Estrutura do Projeto
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
│       ├── services/
│       └── server.js
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
│   ├── package.json
│   └── vite.config.js
├── documents/
│   └── etapas_desenvolvimento.md
├── .gitignore
└── README.md
Perfis de Usuário
Organizador (ORGANIZER)
Responsável pela criação e gerenciamento dos eventos.

A arquitetura está preparada para permitir que o Organizador configure:

capacidade total;

setores;

capacidade dos setores;

modalidades;

modo SEAT ou QUANTITY;

lotes;

quantidades;

preços;

categorias comerciais;

assentos quando aplicável.

O painel inicial já existe em:

/organizador
O CRUD completo será desenvolvido na Etapa 6.

Cliente (CLIENT)
Responsável por descobrir eventos e adquirir ingressos.

A área inicial já existe em:

/cliente
O Front-End já possui catálogo e detalhes públicos. Seleção, checkout e
"Meus Ingressos" serão implementados nas Etapas 7 e 8.

Portaria (CHECKIN)
Responsável pela validação dos ingressos no acesso aos eventos.

A área inicial já existe em:

/portaria
O Back-End de validação já foi implementado. A interface de scanner e
digitação manual será desenvolvida na Etapa 9.

Catálogo Público
O Boraí permite consultar eventos sem autenticação.

Rotas principais:

/
Home.

/eventos
Catálogo.

/eventos/:eventId
Detalhes do evento.

O catálogo possui:

busca;

categoria;

cidade;

mês;

ano;

combinação de filtros;

limpeza dos filtros;

quantidade de resultados;

tratamento de lista vazia.

Também é possível abrir o catálogo com categoria pela URL:

/eventos?categoria=...
Estrutura dos Eventos
A modelagem permite representar diferentes formatos de evento.

Hierarquia principal:

Evento
  ↓
Setor
  ↓
Modalidade
  ↓
Lote
  ↓
Categoria de preço
As modalidades podem utilizar:

SEAT
para lugares marcados, ou:

QUANTITY
para controle somente por quantidade.

Categorias de Preço
As categorias iniciais incluem:

Inteira;

Meia;

Meia Social;

Valor Único.

As categorias não possuem estoques físicos independentes. O estoque é
compartilhado conforme a modalidade e o lote.

Regra de Meia-Entrada
MEIA e MEIA SOCIAL pertencem ao mesmo grupo global:

MEIA ENTRADA
O grupo possui limite máximo de 50% da capacidade aplicável:

MEIA + MEIA SOCIAL <= 50%
Esse limite não representa uma reserva antecipada de ingressos.

Lotes
Os eventos podem possuir múltiplos lotes.

Cada lote possui:

ordem;

quantidade;

preços por categoria.

Os valores monetários são armazenados em centavos para evitar problemas
de arredondamento.

Exemplo:

R$ 220,00 → 22000
R$ 89,90  → 8990
Taxa de Serviço
O Boraí utiliza taxa de serviço padrão de:

12% do valor dos ingressos

A taxa é adicionada no checkout separadamente do preço-base.

Checkout e Reservas
O Back-End implementado na Etapa 4 possui fluxo de checkout com:

autenticação do Cliente;

limite máximo de 10 ingressos;

seleção SEAT ou QUANTITY;

reserva quando necessária;

expiração de reservas;

validação de estoque;

validação das capacidades;

validação das cotas;

pagamento simulado;

criação de pedido;

criação dos ingressos individuais.

Endpoints principais:

POST /checkout
POST /checkout/:checkoutId/complete
O Front-End desse fluxo será desenvolvido na Etapa 7.

QR Code e Compartilhamento
Após uma compra aprovada, o Back-End possui suporte a QR Code assinado.

Endpoint privado:

GET /tickets/:ticketId/qr
O QR é destinado ao proprietário autenticado do ingresso.

Também existe compartilhamento público seguro:

GET /tickets/shared/:sharedToken
A visualização pública não deve expor o QR Code privado.

A interface de "Meus Ingressos" e a renderização do QR serão
desenvolvidas na Etapa 8.

Validação pela Portaria
O Back-End disponibiliza:

POST /checkin/validate
A validação protege contra reutilização do ingresso e permite atualizar
seu estado de:

VALID → USED
A interface da Portaria deverá apresentar resultados como:

Válido
Inválido
Já Utilizado
Evento Errado
O scanner por câmera e a entrada manual serão implementados na Etapa 9.

Eventos de Demonstração
Os seeds incluem eventos demonstrativos de diferentes categorias e
formatos, incluindo exemplos de:

teatro e espetáculos;

shows e festas;

literatura e lançamentos;

cinema;

controle por assento;

controle por quantidade;

múltiplos setores;

modalidades;

lotes;

categorias de preço.

Configuração do Back-End
Entre na pasta:

cd backend
Instale as dependências:

npm install
Crie o .env com base em:

backend/.env.example
Execute as migrations:

npx prisma migrate dev
Popule o banco:

npm run seed
ou:

npx prisma db seed
Inicie a API:

npm run dev
Por padrão, a API é executada localmente na porta configurada pelo
projeto.

Configuração do Front-End
Em outro terminal, a partir da raiz do projeto:

cd frontend
Instale as dependências:

npm install
Inicie o ambiente de desenvolvimento:

npm run dev
Para validar o código:

npm run lint
Para gerar o build de produção:

npm run build
No encerramento da Etapa 5:

ESLint: aprovado
Build Vite: aprovado
91 módulos transformados
Prisma Studio
Para inspecionar o banco:

cd backend
npx prisma studio
O Prisma Studio permite visualizar usuários, eventos, setores,
modalidades, categorias, lotes, preços, assentos, pedidos, ingressos e
demais relações existentes no banco.

Usuários de Demonstração
Perfil E-mail Senha

Organizador organizador@teste.com 123456
Cliente cliente1@teste.com 123456
Cliente cliente2@teste.com 123456
Portaria portaria@teste.com 123456

Essas credenciais são destinadas exclusivamente ao ambiente de
desenvolvimento e demonstração.

Próximas Etapas
Etapa 6 --- Painel do Organizador
Implementação de:

criação de eventos;

edição;

gerenciamento;

preços;

cotas;

setores;

modalidades;

lotes;

assento/pista;

importação externa prevista no projeto.

Etapa 7 --- Seleção de Ingressos e Checkout
Implementação da interface para:

seleção de pista;

seleção de assentos;

reserva;

checkout;

pagamento simulado;

sucesso;

recusa.

Etapa 8 --- Meus Ingressos
Implementação de:

painel de ingressos;

QR Code;

visualização;

compartilhamento público.

Etapa 9 --- Portaria
Implementação de:

scanner pela câmera;

digitação manual;

feedback da validação.

Etapas 10 a 13
Incluem:

busca avançada e métricas;

cancelamento e devolução ao estoque;

Docker e Docker Compose;

testes automatizados;

deploy;

polimento;

documentação final;

entrega.

Documentação
O histórico detalhado do desenvolvimento está disponível em:

documents/etapas_desenvolvimento.md
Esse documento registra:

implementações;

testes;

decisões arquiteturais;

mudanças de escopo;

correções;

uso de Inteligência Artificial;

decisões realizadas manualmente.

A documentação da Etapa 5 registra especificamente a construção do
Front-End, catálogo, autenticação, RBAC, áreas por perfil, correções de
lint/build e decisões visuais.

Uso de Inteligência Artificial
Ferramentas de Inteligência Artificial são utilizadas como apoio durante
o desenvolvimento para:

planejamento;

geração e revisão de código;

análise de erros;

modelagem;

estruturação de componentes;

documentação;

discussão de decisões técnicas;

criação de cenários de teste;

investigação de problemas de Git, lint e build.

As decisões de produto e regras de negócio são revisadas durante o
desenvolvimento.

As implementações são executadas e testadas manualmente antes de serem
incorporadas ao projeto.

O detalhamento do uso de IA por etapa está registrado em:

documents/etapas_desenvolvimento.md
Licença
Projeto desenvolvido para fins acadêmicos e de portfólio.

