# 💈 Cavalcante BarberShop — PWA de Agendamentos

> Agendamento sem cadastro, com escolha de barbeiro, lembretes por notificação push e um
> painel para o barbeiro acompanhar a agenda e o faturamento do dia — tudo em um PWA
> instalável e mobile-first.

> 🎨 **Projeto de portfólio.** Nasceu como encomenda para uma barbearia real, que no fim
> optou por não colocar o produto no ar. Os dados (nome, marca, e-mail, senha de exemplo)
> foram totalmente mockados para "Cavalcante BarberShop" e o projeto segue como peça de
> portfólio/demonstração técnica.

---

## 🚀 O que tem aqui

- **Agendamento sem login:** o cliente informa nome + telefone e escolhe barbeiro, serviço,
  dia e horário — sem senha, sem cadastro.
- **Agenda por barbeiro:** cada barbeiro tem seu próprio calendário; conflitos de horário
  são verificados por barbeiro, não globalmente.
- **Painel do barbeiro:** resumo diário de faturamento (realizado vs. previsto), agenda com
  troca de status (confirmar/concluir/cancelar/não compareceu), encaixes avulsos, gestão de
  clientes/barbeiros/serviços e feedbacks recebidos.
- **Lembretes por Web Push:** notificação nativa do navegador ~24h antes do horário, sem
  depender de WhatsApp/SMS/e-mail. O barbeiro também recebe um push a cada novo agendamento.
- **PWA instalável e mobile-first:** manifest + service worker + ícones; alvo de toque
  mínimo de 44px e layout responsivo pensado para uso no celular tanto pelo cliente quanto
  pelo barbeiro.
- **Cancelamento e avaliação sem conta:** cada agendamento carrega um token opaco único
  usado internamente para cancelar ou avaliar o atendimento, sem expor nada ao cliente.

---

## 🎨 Sistema de design

Tokens em `src/app/globals.css`, sob o `@theme inline` do Tailwind v4. Estética industrial
(bordas "steel", grade sutil no fundo) em navy + dourado.

| Papel | Valor |
|---|---|
| Fundo | `#0a1128` |
| Superfície | `#101a35` / `#16223f` |
| Borda | `#223057` |
| Texto | `#eef1f8` · Texto secundário `#93a0c0` |
| Dourado (destaque) | `#d4af37` · `#e8cd7a` · `#8f6f1d` |

Tipografia: **Oswald** nos títulos (`font-heading`), **Inter** no corpo.

### Marca — Cavalcante BarberShop

Monograma "CB" dourado sobre navy.

| Arquivo | Uso |
|---|---|
| `public/icons/icon.svg` | Fonte do ícone (editar aqui e rodar `npm run icons:generate`) |
| `public/icons/icon-192.png` / `icon-512.png` | Ícones do manifest do PWA |
| `public/icons/icon-maskable-512.png` | Ícone "maskable" (Android recorta em círculo) |
| `public/icons/apple-touch-icon.png` | Ícone para tela inicial no iOS |

---

## 💻 Stack

[![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

- **Next.js 16** (App Router, Turbopack) · **React 19**
- **Tailwind CSS 4** — tokens via `@theme inline`, sem arquivo de config
- **Route Handlers** do próprio Next.js como back-end (`src/app/api/**/route.ts`)
- **Prisma 7** + `@prisma/adapter-pg` sobre **PostgreSQL** (Supabase em produção, Docker em dev)
- **Autenticação própria** do admin — cookie assinado com JWT (`jose`) + `bcryptjs`, sem
  dependências externas de auth
- **Web Push** (`web-push` no servidor, Service Worker no cliente) para os lembretes
- **Vercel** — deploy + Cron Job para o disparo dos lembretes

> ⚠️ Este projeto foi gerado com Next.js 16, que trocou `middleware.ts` por `proxy.ts` e
> mudou como o Prisma conecta ao banco (conexão via `prisma.config.ts` + driver adapter, não
> mais `url`/`directUrl` no `schema.prisma`). Se for pedir ajuda a uma IA sobre este código,
> avise que é Next 16 / Prisma 7 — o conhecimento "padrão" de treinamento costuma estar
> desatualizado nesses dois pontos.

---

## 📁 Estrutura

```
prisma/schema.prisma       # Admin, Barber, Client, Service, Appointment, Feedback, PushSubscription
prisma.config.ts           # Conexão do Prisma CLI (migrations) — usa DIRECT_URL
src/
  lib/
    prisma.ts              # PrismaClient em runtime (driver adapter pg) — usa DATABASE_URL (pooler)
    business-hours.ts      # Horário de funcionamento + geração de horários disponíveis
    auth.ts                # Sessão do admin (JWT em cookie httpOnly)
    appointments.ts         # Regra de negócio compartilhada de agendamento (por barbeiro)
  proxy.ts                 # Protege /admin/** e /api/admin/** (equivalente ao antigo middleware.ts)
  app/
    api/**                 # Route Handlers (a "API" da aplicação)
    agendar/, meus-agendamentos/, avaliar/[token]/   # Fluxo público do cliente
    admin/                 # Painel do barbeiro (protegido)
public/
  sw.js                    # Service worker (cache do shell + notificações push)
  manifest.webmanifest     # Manifest do PWA
```

---

## ⚙️ Rodando localmente

**Pré-requisitos:** [Node.js](https://nodejs.org/en/) 20+ e [Docker](https://www.docker.com/)
(para o Postgres local).

```bash
git clone https://github.com/usrJosephC/cavalcante-barbershop-pwa.git
cd cavalcante-barbershop-pwa
npm install
```

**Banco de dados** (Postgres local via Docker — o `.env` já vem configurado para ele):

```bash
docker compose up -d
npm run db:migrate   # cria as tabelas
npm run db:seed      # cria os 3 serviços, um barbeiro e o admin de exemplo
```

O admin criado pelo seed usa as credenciais do `.env`
(`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, padrão
`admin@cavalcantebarbershop.com.br` / `troque-esta-senha`).

**Rodar o projeto:**

```bash
npm run dev
```

Acesse `http://localhost:3000` (site do cliente) e `http://localhost:3000/admin/login`
(painel do barbeiro).

> Preferir Supabase em vez de Docker? Em *Project Settings → Database → Connection string*
> copie a conexão **Transaction pooler** (porta `6543`) para `DATABASE_URL` e a **direta**
> (porta `5432`) para `DIRECT_URL` no `.env`.

---

## 🔔 Testando notificações push localmente

1. Já existe um par de chaves VAPID de exemplo no `.env` — para gerar o seu:
   `npx web-push generate-vapid-keys` e cole em `NEXT_PUBLIC_VAPID_PUBLIC_KEY` /
   `VAPID_PRIVATE_KEY`.
2. Faça um agendamento e clique em "Ativar lembrete por notificação" na confirmação (ou em
   "Meus horários"). No painel admin, clique em "Ativar avisos" para receber um push a cada
   novo agendamento.
3. Para simular o cron de lembretes manualmente:

   ```bash
   curl -H "Authorization: Bearer SEU_CRON_SECRET" http://localhost:3000/api/cron/reminders
   ```

---

## ☁️ Deploy (Vercel)

Funciona com qualquer Postgres — Supabase ou a integração **Prisma Postgres** do próprio
Vercel (gratuita, provisiona em 1 clique direto na tela de import do projeto).

1. **Banco:** ao importar o repositório na Vercel, adicione a integração opcional
   **Prisma Postgres** (aba *Storage*) — ela já injeta `DATABASE_URL` sozinha. Se preferir
   Supabase, crie o projeto lá e configure `DATABASE_URL` (pooler, porta `6543`) e
   `DIRECT_URL` (direta, porta `5432`) manualmente.
2. Configure as demais variáveis de ambiente do `.env.example`: `AUTH_SECRET`,
   `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`,
   `NEXT_PUBLIC_APP_URL`.
3. O `vercel.json` já configura o Cron Job (`/api/cron/reminders`, a cada hora) — a Vercel
   envia `Authorization: Bearer <CRON_SECRET>` automaticamente.
4. Depois do primeiro deploy, rode as migrations e o seed **uma vez** contra o banco de
   produção (pegue a `DATABASE_URL` real em Project Settings → Environment Variables, ou via
   `npx vercel env pull`):
   ```bash
   DATABASE_URL=... npm run db:deploy   # aplica as migrations (prisma migrate deploy)
   DATABASE_URL=... SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run db:seed
   ```
5. Abra o domínio da Vercel (HTTPS) no celular e use "Instalar app" para adicionar o PWA à
   tela inicial.

---

## 🧰 Scripts úteis

| Script | Descrição |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` / `npm run start` | Build e execução em produção |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Cria/aplica migrations do Prisma |
| `npm run db:seed` | Popula serviços, barbeiro e admin |
| `npm run db:studio` | Abre o Prisma Studio (inspecionar o banco) |
| `npm run icons:generate` | Regera os ícones PNG a partir de `public/icons/icon.svg` |

---

## 📄 Licença

MIT.

Feito com ❤️ por **Joseph Cavalcante**.
