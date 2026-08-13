# GreenTech

Portal web para apoio à gestão e comercialização de produtos da agricultura familiar.

O **GreenTech** é um projeto desenvolvido como Trabalho de Conclusão de Curso em Análise e Desenvolvimento de Sistemas. 

A solução tem como objetivo aproximar agricultores familiares e consumidores por meio de um portal web responsivo, permitindo a divulgação de produtos, realização de pedidos, controle básico de estoque, registro de certificações e comunicação externa via WhatsApp.

## Objetivo

Apoiar agricultores familiares na gestão e comercialização de seus produtos, reduzindo a dependência de intermediários e ampliando a visibilidade da produção local.

## Funcionalidades

#### Agricultor

- Cadastro e login;
- Gerenciamento de perfil;
- Cadastro, edição e desativação de produtos;
- Controle de estoque;
- Cadastro de certificações vinculadas aos produtos;
- Gerenciamento de pedidos recebidos;
- Atualização de status dos pedidos;
- Painel com indicadores básicos.

#### Consumidor

- Cadastro e login;
- Catálogo de produtos;
- Busca e filtros;
- Visualização de detalhes dos produtos;
- Carrinho de compras;
- Finalização de pedidos;
- Histórico e detalhes dos pedidos;
- Cancelamento de pedidos pendentes;
- Contato externo com o agricultor via WhatsApp.

## Principais módulos do sistema
- Autenticação;
- Usuários e perfis;
- Produtos;
- Catálogo;
- Carrinho;
- Pedidos;
- Certificações;
- Estoque;
- Comunicação via WhatsApp;
- Conteúdo informativo.

## Tecnologias utilizadas

### Frontend Web

- React
- TypeScript
- TanStack Router
- TanStack Query
- Tailwind CSS
- Shadcn UI / Radix UI
- Axios
- Vite

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- Zod
- bcrypt

### Banco de Dados e Infraestrutura

- PostgreSQL
- Docker
- Docker Compose
- pgAdmin

## Estrutura do projeto

```txt
greentech-app/
  apps/
    api/       # Backend da aplicação
    web/       # Portal web responsivo
    mobile/    # Protótipo mobile legado preservado
  docker-compose.yml
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml
  tsconfig.base.json
```

## Pré-requisitos

**Antes de executar o projeto, é necessário ter instalado:**

- Node.js
- pnpm
- Docker
- Git

## Como executar o projeto

Clone o repositório:
```
git clone https://github.com/GuiiAbreu/greentech-app.git
cd greentech-app
```
Instale as dependências:
```
pnpm install
```
Suba o banco de dados com Docker:
```
pnpm db:up
```
**Configure as variáveis de ambiente.**

Na API, crie o arquivo:
```
apps/api/.env
```
Exemplo:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/greentech?schema=public"
JWT_SECRET="sua_chave_secreta"
CORS_ORIGIN="http://localhost:8080"
```
No frontend web, crie o arquivo:
```
apps/web/.env
```
Exemplo:
```
VITE_API_URL="http://localhost:3333"
```
Execute as migrations do banco:
```
pnpm --filter @greentech/api exec prisma migrate dev
pnpm --filter @greentech/api exec prisma generate
```
Inicie a API:
```
pnpm dev:api
```
Inicie o portal web:
```
pnpm dev:web
```
Acesse o portal em:
```
http://localhost:8080
```
A API será executada em:
```
http://localhost:3333
```
---
### Scripts úteis:
```
pnpm db:up
```
Sobe os serviços Docker.
```
pnpm db:down
```
Encerra os serviços Docker.
```
pnpm dev:api
```
Executa a API em ambiente de desenvolvimento.
```
pnpm dev:web
```
Executa o portal web em ambiente de desenvolvimento.
```
pnpm --filter @greentech/api typecheck
```
Verifica os tipos da API.
```
pnpm --filter @greentech/web build
```
Gera o build do portal web.

## Protótipo interativo utilizado como prévia
Para acessar a versão completa do protótipo e interações, o leitor pode acessar: 
https://agri-market-web.lovable.app/.
  
## Status do projeto

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) em Análise e Desenvolvimento de Sistemas pelo Instituto Federal da Paraíba (IFPB) - Campus Cajazeiras.

## Autor

**Guilherme Henrique de Abreu Pessoa.**
