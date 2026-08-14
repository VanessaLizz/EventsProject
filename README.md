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
- [x] **Etapa 7** — Seleção de ingressos e checkout no Front-End
- [x] **Etapa 8** — Meus Ingressos e visualização de QR Code
- [x] **Etapa 9** — Portal da Portaria e validação de ingressos

## Próximas etapas

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
- tratamento visual para eventos sem imagem;
- visualização pública de ingresso compartilhado.

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
/ingresso/:sharedToken
```

Visualização pública de um ingresso compartilhado.

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

O Cliente pode:

- visualizar seus ingressos;
- consultar informações dos Tickets adquiridos;
- visualizar QR Code privado;
- compartilhar uma visualização pública do ingresso.

## Organizador

```text
ORGANIZER
```

Área:

```text
/organizador
```

O Organizador pode:

- criar eventos;
- editar eventos;
- configurar setores;
- configurar modalidades;
- configurar categorias de preço;
- configurar lotes;
- configurar assentos;
- visualizar pendências;
- publicar eventos.

## Portaria

```text
CHECKIN
```

Área:

```text
/portaria
```

A Portaria pode:

- validar ingressos;
- utilizar leitura por câmera;
- inserir manualmente o token do QR Code;
- identificar ingresso válido;
- identificar ingresso já utilizado;
- identificar ingresso cancelado;
- rejeitar QR Code inválido.

Um usuário autenticado não pode acessar diretamente uma área destinada a outro perfil.

---

# Módulo do Organizador

O módulo do Organizador permite gerenciar o ciclo principal de criação e publicação de eventos.

O fluxo inclui:

```text
Criar evento
↓
Configurar estrutura comercial
↓
Setores
↓
Modalidades
↓
Categorias
↓
Lotes
↓
Assentos, quando aplicável
↓
Validar pendências
↓
Publicar
```

O evento somente pode ser publicado quando atende às regras obrigatórias de configuração.

A interface apresenta as pendências diretamente na página do próprio evento antes da publicação.

---

# Estrutura Comercial dos Eventos

O Boraí permite configurar eventos utilizando diferentes estruturas de venda.

## Setores

Os setores representam divisões do evento, como:

```text
Pista
Camarote
Cadeira Superior
Cadeira Inferior
```

Cada setor possui capacidade própria.

## Modalidades

As modalidades determinam como o ingresso é vendido dentro de um setor.

O projeto suporta:

```text
QUANTITY
SEAT
```

### QUANTITY

Venda controlada por quantidade.

Exemplo:

```text
Pista
↓
1000 lugares
↓
controle por quantidade
```

### SEAT

Venda utilizando assentos individuais.

Exemplo:

```text
Cadeira Inferior
↓
A1
A2
A3
A4
...
```

Cada assento possui disponibilidade própria.

---

# Categorias de Preço

Uma modalidade pode possuir diferentes categorias de ingresso.

Exemplos:

```text
INTEIRA
MEIA
MEIA SOCIAL
```

As categorias podem participar de grupos de cota.

O Back-End controla os limites definidos para esses grupos.

---

# Lotes

Os ingressos podem ser organizados em lotes.

Cada lote possui:

- quantidade;
- preço;
- ordem;
- estado ativo.

A progressão ocorre conforme a disponibilidade.

Para o comprador, os nomes e números dos lotes não são apresentados durante a seleção.

O Front-End exibe somente os preços correspondentes ao lote atualmente disponível para venda.

---

# Seleção de Ingressos e Checkout

A Etapa 7 implementou o fluxo de compra no Front-End para o perfil `CLIENT`.

Na página de detalhes de um evento publicado, o Cliente pode:

- visualizar somente os preços do lote atualmente em venda;
- selecionar ingressos de modalidades `QUANTITY`;
- aumentar ou reduzir quantidades por categoria;
- selecionar múltiplos assentos em modalidades `SEAT`;
- definir individualmente a categoria de cada assento;
- selecionar no máximo 10 ingressos por checkout;
- visualizar subtotal, taxa de serviço e total;
- iniciar o checkout autenticado;
- executar pagamento simulado aprovado ou recusado;
- visualizar a confirmação da compra;
- receber a disponibilidade atualizada após a conclusão.

Fluxo principal:

```text
Evento publicado
↓
Selecionar ingressos
↓
QUANTITY ou SEAT
↓
Quantidade ou assentos
↓
Categoria de preço
↓
Máximo de 10 ingressos
↓
Login CLIENT
↓
Checkout
↓
Subtotal + taxa + total
↓
Pagamento simulado
↓
APPROVED ou REFUSED
```

---

# Regra de Limite por Checkout

Cada checkout aceita no máximo:

```text
10 ingressos
```

O limite considera a soma de:

- ingressos por quantidade;
- assentos selecionados.

A interface impede a seleção acima desse limite e o Back-End também mantém sua própria validação.

---

# Taxa de Serviço

O checkout utiliza taxa de serviço de:

```text
12%
```

O cálculo considera:

```text
subtotal
serviceFee
total
```

A porcentagem é uma regra interna de cálculo e não precisa ser apresentada explicitamente ao Cliente na interface.

---

# Checkout e Pagamento

O checkout exige autenticação como:

```text
CLIENT
```

Caso o visitante inicie uma compra sem estar autenticado, ele é direcionado ao login e pode retornar ao fluxo posteriormente.

O pagamento atual é simulado.

Estados principais:

```text
APPROVED
REFUSED
```

Quando aprovado:

- o pedido é concluído;
- os Tickets são gerados;
- o estoque é atualizado;
- assentos adquiridos permanecem indisponíveis;
- QR Codes individuais ficam associados aos Tickets.

Quando recusado:

- a compra não é concluída;
- não são emitidos Tickets válidos.

---

# Meus Ingressos

A Etapa 8 implementou a área de ingressos do Cliente.

Na rota:

```text
/cliente
```

o usuário pode visualizar os Tickets pertencentes à sua conta.

Cada ingresso apresenta informações como:

- evento;
- imagem;
- data;
- local;
- setor;
- modalidade;
- categoria;
- assento, quando aplicável;
- valor;
- status.

Estados suportados:

```text
VALID
USED
CANCELLED
```

---

# QR Code do Ingresso

Cada Ticket possui um QR Code privado.

O QR utiliza um token assinado contendo informações relacionadas ao:

```text
ticketId
orderId
```

O token é assinado utilizando segredo privado do servidor.

O banco não armazena diretamente o token completo utilizado pelo QR.

É armazenado um hash utilizado para verificar sua integridade.

O QR privado somente pode ser solicitado pelo Cliente proprietário do Ticket.

---

# Compartilhamento Público

Cada Ticket também possui um:

```text
sharedToken
```

Ele permite criar um endereço público:

```text
/ingresso/:sharedToken
```

Esse endereço pode ser aberto sem autenticação.

A página compartilhada apresenta informações permitidas sobre o ingresso e o evento.

Ela não retorna:

- QR Code privado;
- hash do QR;
- token assinado;
- `orderId`;
- informações pessoais do comprador.

O `sharedToken` não funciona como credencial de entrada.

---

# Portal da Portaria

A Etapa 9 implementou a interface utilizada pelo perfil:

```text
CHECKIN
```

para controle de acesso aos eventos.

A Portaria possui duas formas de fornecer o QR para validação:

```text
Leitura pela câmera
```

ou:

```text
Inserção manual
```

As duas utilizam o mesmo endpoint e as mesmas regras de segurança no Back-End.

---

# Leitura de QR Code pela Câmera

O Front-End utiliza:

```text
@zxing/browser
```

para leitura do QR Code através da câmera do dispositivo.

O fluxo é:

```text
Ativar câmera
↓
Autorizar acesso
↓
Apontar para QR Code
↓
Código identificado
↓
Token capturado
↓
Câmera interrompida
↓
API de check-in
↓
Resultado
```

A interface também trata:

- ausência de câmera;
- falha de acesso;
- permissão recusada;
- ativação e desativação manual.

---

# Validação de Ingressos

A validação utiliza:

```text
POST /checkin/validate
```

A rota exige:

```text
authenticate
authorize("CHECKIN")
```

O Back-End valida:

- assinatura do token;
- estrutura do payload;
- existência do Ticket;
- relação com o pedido;
- hash do QR;
- status atual do Ticket.

O Front-End apenas captura o token e apresenta o resultado da API.

---

# Uso Único do Ingresso

Um Ticket válido começa com:

```text
VALID
```

Após uma entrada autorizada:

```text
VALID
↓
USED
```

O mesmo QR apresentado novamente não autoriza uma segunda entrada.

A Portaria apresenta:

```text
JÁ UTILIZADO
```

para esse cenário.

Também são tratados:

```text
VÁLIDO
INVÁLIDO
CANCELADO
JÁ UTILIZADO
```

---

# Segurança do QR Code

O QR Code e o link público de compartilhamento possuem responsabilidades diferentes.

```text
QR privado
↓
credencial de entrada
```

```text
sharedToken
↓
visualização pública
```

Durante os testes foi confirmado que utilizar o endereço público `/ingresso/:sharedToken` na Portaria resulta em QR inválido.

Isso impede que o simples compartilhamento da página pública forneça uma credencial válida para entrada no evento.

---

# Reservas e Concorrência

Modalidades `QUANTITY` não utilizam bloqueio temporário.

O estoque é validado atomicamente na finalização.

Modalidades `SEAT` utilizam bloqueio temporário de assentos durante o checkout.

Se a sessão expirar:

- a sessão passa para `EXPIRED`;
- assentos ainda não vendidos são liberados.

Tickets já efetivamente vendidos não têm seus assentos liberados.

---

# Capacidades

O Back-End valida múltiplos níveis de capacidade:

```text
Evento
↓
Setor
↓
Modalidade
↓
Lote
```

Uma compra não pode ultrapassar nenhum desses limites.

Também são consideradas cotas associadas às categorias de preço.

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
- bcrypt
- QRCode

## Banco de Dados

- SQLite

## Ferramentas

- Git
- GitHub
- npm
- PowerShell
- VS Code

---

# Estrutura Geral

```text
EventosProject/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
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
│   └── package.json
│
├── documents/
│   └── etapas_desenvolvimento.md
│
└── README.md
```

---

# Execução do Projeto

## Back-End

Entre na pasta:

```powershell
cd backend
```

Instale as dependências:

```powershell
npm install
```

Execute:

```powershell
npm run dev
```

O servidor utiliza:

```text
http://localhost:3000
```

## Front-End

Em outro terminal:

```powershell
cd frontend
```

Instale as dependências:

```powershell
npm install
```

Execute:

```powershell
npm run dev
```

O Vite disponibiliza a aplicação localmente, normalmente em:

```text
http://localhost:5173
```

---

# Variáveis de Ambiente

O Back-End utiliza variáveis de ambiente para informações que não devem permanecer diretamente no código.

Entre elas:

```text
JWT_SECRET
QR_SECRET
```

Segredos reais não devem ser enviados ao repositório.

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

## Etapa 10 — Busca Avançada, Filtros & Métricas

Com os principais fluxos de Organizador, Cliente, compra, ingressos e Portaria implementados, a próxima etapa será dedicada à ampliação dos recursos de consulta e acompanhamento da plataforma.

A Etapa 10 está prevista para trabalhar principalmente com:

- evolução da busca;
- filtros adicionais;
- métricas;
- indicadores;
- informações úteis para acompanhamento dos eventos.

O escopo detalhado será validado antes da implementação para evitar duplicar funcionalidades de busca e filtros que já existem atualmente.

---

# Licença

Projeto desenvolvido para fins acadêmicos e de portfólio.