1. Visão Geral do Produto (PRD)
    Objetivo: Criar uma plataforma multi-eventos no estilo Sympla, agregando cinema, shows, teatro, comédia e workshops.
        Perfis de Acesso:
            Organizador: Cadastra, edita e gerencia eventos locais ou importados de APIs externas.  
            Cliente: Navega no catálogo, escolhe os tipos ingressos, realiza pagamento e visualiza/compartilha ingressos.  
            Portaria: Realiza leitura e validação de ingressos na entrada dos eventos via QR Code ou código manual.  

2. Decisões de Arquitetura e Escolhas Tecnológicas
    Linguagem e Ecossistema: JavaScript / Node.js e React - Padronizar a linguagem em toda a stack, acelerar o desenvolvimento e facilitar o versionamento único do projeto.  
    Front-End (React + Vite + Tailwind CSS): Vite para um ambiente de build rápido. O Tailwind CSS para autonomia no design ao construir componentes com identidade própria. 
    Back-End (Node.js + Express + Prisma ORM): Praticidade na definição de esquemas de banco de dados, migrações automáticas e geração de seeds tipados.  
    Banco de Dados (SQLite / PostgreSQL): SQLite para agilidade e simplicidade no ambiente de desenvolvimento/avaliação sem dependências externas complexas; compatível com PostgreSQL para deploy em produção.  
    Integração Dupla com APIs Externas (TMDb e Ticketmaster): O TMDb enriquece a categoria de cinema, enquanto a Ticketmaster fornece eventos e shows reais, atendendo ao conceito de hub de eventos.  
    Segurança dos Ingressos (JWT / HMAC Hash): Os QR Codes contêm um token assinado criptograficamente contendo dados do ingresso. Isso impede a falsificação e permite validação segura no back-end sem expor informações sensíveis. 

3. Modelo de Dados Relacional (ERD)
    User: id, name, email, password_hash, role (ORGANIZER, CLIENT, CHECKIN), created_at.  
    Event: id, title, description, category (Cinema, Show, Comédia, Workshop), location, date_time, external_id, ticket_type (SEATED ou GA/Pista), organizer_id.  
    Seat / TicketType: id, event_id, label (ex: "Poltrona A1" ou "Pista Lote 1"), price, is_available.  
    Order: id, client_id, status (APPROVED, REFUSED, CANCELLED), total_amount, created_at.  
    Ticket: id, order_id, seat_id, qr_code_hash, status (VALID, USED, CANCELLED), shared_token.  