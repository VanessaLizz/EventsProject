# Boraí
**Seu próximo rolê a um clique de distância**

Plataforma web para gerenciamento, venda e validação de ingressos para diferentes tipos de eventos, como shows, cinema, teatro, workshops e eventos especiais.

O projeto é desenvolvido no formato de um hub multi-eventos, permitindo a atuação de três perfis distintos: **Organizador**, **Cliente** e **Portaria**.

## Status do Projeto

Em desenvolvimento.

### Etapas concluídas

- [x] Etapa 0 — Conceituação e documentação base
- [x] Etapa 1 — Setup do projeto, banco de dados e seeds
- [x] Etapa 2 — Autenticação JWT e controle de acesso por perfil (RBAC)
- [ ] Etapa 3 — Integração com APIs externas e gestão de eventos
- [ ] Etapa 4 — Reservas e QR Code
- [ ] Etapa 5 — Autenticação e catálogo no Front-End
- [ ] Etapa 6 — Painel do Organizador
- [ ] Etapa 7 — Seleção de ingressos e checkout
- [ ] Etapa 8 — Meus Ingressos e QR Code
- [ ] Etapa 9 — Portal da Portaria
- [ ] Etapa 10 — Busca, filtros e métricas
- [ ] Etapa 11 — Cancelamento e devolução ao estoque
- [ ] Etapa 12 — Docker e testes automatizados
- [ ] Etapa 13 — Publicação e entrega final

## Tecnologias

### Back-End

- Node.js
- Express
- Prisma ORM
- SQLite
- JWT (`jsonwebtoken`)
- bcryptjs
- CORS
- dotenv

### Front-End

Planejado para as próximas etapas:

- React
- Vite
- Tailwind CSS

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
├── .gitignore
└── README.md
```

## Perfis de Usuário

### Organizador (`ORGANIZER`)

Responsável pelo gerenciamento dos eventos.

O projeto prevê que o Organizador possa criar, consultar, editar e excluir eventos, configurar datas, tipos e quantidades de ingressos, preços e demais informações necessárias para cada evento.

### Cliente (`CLIENT`)

Responsável pela navegação no catálogo, seleção e compra de ingressos e acesso aos ingressos adquiridos.

### Portaria (`CHECKIN`)

Responsável pela validação dos ingressos na entrada dos eventos.

## Autenticação e Segurança

O Back-End possui:

- Cadastro de novos clientes;
- Login com e-mail e senha;
- Hash de senhas com `bcryptjs`;
- Autenticação utilizando JWT;
- Expiração configurável dos tokens;
- Middleware para validação do JWT;
- Controle de acesso baseado em perfil (RBAC);
- Proteção contra autoatribuição dos perfis `ORGANIZER` e `CHECKIN`;
- Validação de e-mail duplicado;
- Política de senha forte para novos cadastros.

Novos usuários devem utilizar senha com pelo menos 8 caracteres, contendo:

- uma letra maiúscula;
- uma letra minúscula;
- um número;
- um caractere especial.

> Os usuários de demonstração criados pelos seeds utilizam a senha `123456`. Eles foram criados antes da implementação da política de senha forte e são mantidos para facilitar os testes dos diferentes perfis.

## Endpoints Implementados

### Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro de Cliente |
| POST | `/auth/login` | Autenticação e geração do JWT |
| GET | `/auth/me` | Validação do usuário autenticado |

Também existem rotas protegidas utilizadas durante o desenvolvimento para testar as permissões dos três perfis.

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

Execute as migrações:

```bash
npx prisma migrate dev
```

Popule o banco de desenvolvimento:

```bash
npm run seed
```

Inicie a API:

```bash
npm run dev
```

Por padrão, a aplicação ficará disponível em:

```text
http://localhost:3000
```

## Usuários de Demonstração

O seed inicial cria:

| Perfil | E-mail | Senha |
|---|---|---|
| Organizador | `organizador@teste.com` | `123456` |
| Cliente | `cliente1@teste.com` | `123456` |
| Cliente | `cliente2@teste.com` | `123456` |
| Portaria | `portaria@teste.com` | `123456` |

Essas credenciais são destinadas exclusivamente ao ambiente de desenvolvimento e demonstração.

## Eventos

O banco atualmente possui dados iniciais para permitir testes da aplicação.

Nas próximas etapas, o sistema será expandido para permitir que o Organizador gerencie eventos dinamicamente, incluindo criação, edição e exclusão, definição de data, preços, quantidade disponível e diferentes modalidades de ingresso.

A arquitetura será preparada para diferentes modelos de eventos e ingressos, incluindo eventos com assentos numerados, setores, pista, camarote, categorias de preço e pacotes especiais.

## Documentação

A documentação técnica e o histórico detalhado das etapas de desenvolvimento estão disponíveis na pasta:

```text
documents/
```

O documento de etapas registra também a utilização de Inteligência Artificial durante o desenvolvimento e as decisões e atividades realizadas manualmente.

## Uso de Inteligência Artificial

Ferramentas de Inteligência Artificial são utilizadas como apoio durante o desenvolvimento para geração e revisão de código, análise de problemas, documentação e discussão de decisões técnicas.

As implementações são testadas e validadas durante o desenvolvimento antes de serem incorporadas ao projeto.

A descrição detalhada do uso de IA em cada fase está registrada em `documents/etapas_desenvolvimento.md`.

## Licença

Projeto desenvolvido para fins acadêmicos e de portfólio.