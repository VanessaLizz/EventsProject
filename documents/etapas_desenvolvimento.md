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