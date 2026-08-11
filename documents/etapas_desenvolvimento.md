# Etapas do Desenvolvimento

---

## [Etapa 0] Conceituação e Documentação Base

**Status:** Concluído

### O que foi feito:
- Definição do produto no estilo hub multi-eventos (Sympla), unindo cinema, shows, teatro e workshops.
- Mapeamento das permissões por perfil (Organizador, Cliente e Portaria).
- Especificação da arquitetura técnica (Node.js + Express, React + Vite + Tailwind CSS, Prisma ORM, SQLite).
- Desenho do Modelo de Dados Relacional.

### Uso de IA nesta Etapa:
- **Geração de Conteúdo:** Auxílio na estruturação do documento de PRD e definição técnica inicial.
- **Decisões Humanas:** Definição do modelo de produto (estilo Sympla), escolha da stack e unificação das APIs externas (TMDb e Ticketmaster).

---

## [Etapa 1] Setup do Monorepo/Projeto, Banco de Dados & Seeds

**Status:** Concluído

### O que foi feito:
- Estruturação do repositório em formato monorepo (`backend/` e `frontend/`).
- Inicialização e configuração do ambiente Node.js e instalações no backend (`express`, `@prisma/client`, `bcryptjs`, `cors`, `dotenv`).
- Criação e ajuste do modelo de dados no `prisma/schema.prisma` utilizando tipos nativos de texto compatíveis com o SQLite (substituindo enums) para armazenar papéis e status.
- Configuração do arquivo `.env` com a variável `DATABASE_URL` e execução das migrações do banco de dados local (`dev.db`).
- Criação e execução do script de **seeds** (`prisma/seed.js`), populando a base inicial com:
  - 1 Organizador (`organizador@teste.com`)
  - 2 Clientes (`cliente1@teste.com` e `cliente2@teste.com`)
  - 1 Usuário de Portaria (`portaria@teste.com`)
  - 1 Evento cadastrado (*"Filhos do Éden: Paraíso Perdido"*) com 3 ingressos do tipo Assento/Lote 1 disponíveis.

### Uso de IA nesta Etapa:
- **Geração de Código:** Estruturação do esquema Prisma e do script de seeds personalizado com o evento da peça teatral.
- **Resolução de Problemas:** Diagnóstico e correção de incompatibilidade de `enum` do Prisma com SQLite e auxílio na configuração do comando de seed no `package.json`.
- **Decisões Humanas / Manuais:** Escolha e personalização do evento seeded, execução das migrações via CLI do Prisma e criação manual do arquivo `.env`.

---

## [Etapa 2] Back-End: Autenticação (JWT) & RBAC (3 Perfis)

**Status:** Concluído

### O que foi feito:

- Instalação e configuração da biblioteca `jsonwebtoken` para geração e validação de tokens JWT.
- Configuração das variáveis de ambiente `JWT_SECRET`, `JWT_EXPIRES_IN` e `PORT`, mantendo os valores sensíveis apenas no arquivo `.env` local e documentando a estrutura necessária no `.env.example`.
- Configuração inicial do servidor Express com suporte a CORS, leitura de JSON e carregamento das variáveis de ambiente.
- Criação de uma instância reutilizável do Prisma Client em `src/lib/prisma.js`.
- Implementação do endpoint `POST /auth/register` para cadastro de novos clientes.
- Restrição do cadastro público ao perfil `CLIENT`, impedindo que o usuário atribua a si mesmo os papéis `ORGANIZER` ou `CHECKIN`.
- Implementação de política de senha forte para novos cadastros, exigindo no mínimo 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.
- Armazenamento seguro das senhas utilizando hash com `bcryptjs`.
- Normalização dos e-mails para letras minúsculas antes da consulta e persistência.
- Validação de e-mail duplicado e campos obrigatórios no cadastro.
- Implementação do endpoint `POST /auth/login`.
- Validação das credenciais utilizando comparação de hash com `bcryptjs`.
- Geração de token JWT assinado contendo apenas o identificador do usuário e seu papel (`id` e `role`), com tempo de expiração configurável.
- Criação do middleware de autenticação JWT utilizando `jwt.verify()`, validando assinatura e expiração do token.
- Implementação da rota protegida `GET /auth/me` para validar o fluxo de autenticação.
- Criação de middleware RBAC (Role-Based Access Control) para controle de permissões baseado nos três perfis do sistema:
  - `ORGANIZER` — Organizador
  - `CLIENT` — Cliente
  - `CHECKIN` — Portaria
- Criação de rotas protegidas de teste para validar individualmente as permissões de Organizador, Cliente e Portaria.
- Tratamento dos principais cenários de erro HTTP:
  - `400 Bad Request` para dados obrigatórios ausentes ou senha fora da política definida.
  - `401 Unauthorized` para credenciais incorretas, token ausente, inválido ou expirado.
  - `403 Forbidden` para usuário autenticado sem permissão para acessar determinado recurso.
  - `409 Conflict` para tentativa de cadastro com e-mail já existente.
- Testes manuais dos endpoints e middlewares utilizando requisições REST via PowerShell.
- Validação do login e das permissões dos três usuários de teste criados pelos seeds.
- Validação de que senhas e `passwordHash` não são retornados pelas respostas da API nem armazenados no payload do JWT.

### Observação sobre as senhas de teste:

Os novos usuários cadastrados pelo endpoint `/auth/register` devem seguir a política de senha forte definida nesta etapa.

Os usuários de demonstração criados anteriormente pelo script de seeds continuam utilizando a senha `123456`. Esses registros foram criados antes da implementação da nova política e são mantidos dessa forma para facilitar a avaliação dos três perfis do sistema.

A política de senha forte é aplicada ao fluxo de novos cadastros e não altera retroativamente os usuários previamente criados pelo seed.

### Testes realizados:

- Cadastro válido de novo Cliente.
- Rejeição de senha que não atende à política de segurança.
- Rejeição de cadastro com e-mail duplicado.
- Rejeição de cadastro com campos obrigatórios ausentes.
- Tentativa de cadastro enviando `role: "ORGANIZER"`, confirmando que o usuário é criado como `CLIENT`.
- Login válido com Cliente.
- Login com senha incorreta.
- Login com usuário inexistente.
- Login com campos obrigatórios ausentes.
- Login dos perfis `ORGANIZER`, `CLIENT` e `CHECKIN`.
- Inspeção do payload JWT, confirmando presença de `id`, `role`, `iat` e `exp`.
- Acesso à rota protegida utilizando JWT válido.
- Rejeição de acesso sem token.
- Rejeição de token inválido.
- Rejeição de header de autenticação fora do formato `Bearer`.
- Acesso autorizado e negado conforme o perfil do usuário nas rotas protegidas por RBAC.

### Uso de IA nesta Etapa:

- **Geração de Código:** Auxílio na estruturação dos controllers e rotas de autenticação, geração e validação de JWT e criação dos middlewares de autenticação e autorização por perfil.
- **Resolução de Problemas:** Diagnóstico da incompatibilidade entre CommonJS (`require`) e ES Modules (`import`), identificação de conflito da porta `3000`, correção da importação da função de login e orientação dos testes REST.
- **Revisão e Segurança:** Auxílio na revisão da política de senhas, proteção contra autoatribuição de privilégios, respostas HTTP e definição dos cenários de teste da autenticação e do RBAC.
- **Decisões Humanas / Manuais:** Definição da política de senha forte, execução manual de todos os testes, validação das respostas da API, decisão de manter os usuários seed com senha simplificada para demonstração e acompanhamento incremental dos commits.