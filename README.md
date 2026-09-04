# Mini Kanban Board

Full-stack collaborative kanban for the **Webbriks Technical Assessment**.

**Live app:** [webbriks-mini-kanban-board.vercel.app](https://webbriks-mini-kanban-board.vercel.app)  
**API:** [webbriks-mini-kanban-board.onrender.com/api](https://webbriks-mini-kanban-board.onrender.com/api) · [Health](https://webbriks-mini-kanban-board.onrender.com/api/health)  
**Repository:** [github.com/HasnathAhmedTamim/webbriks-mini-kanban-board](https://github.com/HasnathAhmedTamim/webbriks-mini-kanban-board)

### Submission checklist

| Deliverable | Status |
|-------------|--------|
| Single GitHub repo with `frontend/` + `backend/` | Done |
| README with local setup + sample env | Done |
| `docker-compose.yml` (Postgres + API + frontend) | Done |
| Live deploy (optional) | Done — Vercel + Render + Neon |

---

## Features

- Register / login with JWT (passwords hashed with bcrypt)
- Boards CRUD — create, rename, delete
- Share boards with registered users (`OWNER` / `MEMBER`)
- Backend ACL — non-members cannot access board data (403)
- Columns & tasks CRUD
- Drag-and-drop reorder within a column and across columns
- Optimistic UI + transactional `PATCH /api/tasks/:id/move`
- Responsive layout (stacked columns on small screens)
- Error / 404 pages and loading skeletons

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, dnd-kit, TanStack Query, Axios, Zod |
| Backend | Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod |
| Local | Docker Compose |
| Deploy | Neon (Postgres) + Render (API) + Vercel (frontend) |

---

## Project structure

```text
.
├── frontend/           # Next.js App Router
├── backend/            # Express + Prisma API
├── docker-compose.yml
├── .env.example
└── README.md
```

### Frontend (`frontend/`)

```text
frontend/
├── app/                      # App Router pages
│   ├── (auth)/               # Login & register
│   ├── boards/               # Board list + shared layout/chrome
│   │   └── [boardId]/        # Kanban board detail
│   ├── error.tsx             # Route error UI
│   ├── global-error.tsx      # Root error UI
│   ├── not-found.tsx         # 404 page
│   ├── layout.tsx            # Root layout + providers
│   └── page.tsx              # Landing / redirect
├── components/
│   ├── auth/                 # Auth forms & redirects
│   ├── boards/               # Board list, create, share
│   ├── kanban/               # Columns, cards, DnD board
│   ├── layout/               # AppShell, boards chrome
│   └── ui/                   # Button, Modal, StatusPage, …
├── hooks/                    # useAuth, useBoards (TanStack Query)
├── lib/                      # Axios client, auth storage, move helpers, Zod
├── providers/                # QueryClient + toaster
├── types/                    # Shared TS types
└── public/
```

### Backend (`backend/`)

```text
backend/
├── prisma/
│   ├── schema.prisma         # User, Board, Member, Column, Task
│   └── migrations/
├── src/
│   ├── app.ts                # Express app (CORS, helmet, routes)
│   ├── server.ts             # HTTP server entry
│   ├── config/               # Env validation (Zod)
│   ├── lib/                  # Prisma client, JWT helpers
│   ├── middlewares/          # Auth, errors, 404
│   ├── modules/              # Feature modules (routes → controller → service)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── boards/
│   │   ├── members/
│   │   ├── columns/
│   │   └── tasks/            # Includes PATCH /tasks/:id/move
│   ├── routes/               # API router mount
│   └── utils/                # AppError, ACL helpers, response envelope
├── Dockerfile
└── package.json
```

---

## Quick start (local)

**Prerequisites:** Node.js 20+, npm, Docker Desktop

### 1. Clone and env files

```bash
git clone https://github.com/HasnathAhmedTamim/webbriks-mini-kanban-board.git
cd webbriks-mini-kanban-board

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Sample environment variables

`backend/.env`

```env
DATABASE_URL=postgresql://kanban:kanban@localhost:5433/kanban?schema=public
JWT_SECRET=change-me-to-a-long-random-secret
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

`frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

> Host port **5433** maps to Postgres in Docker (avoids clashing with Postgres on `5432`).

### 3. Start Postgres

```bash
docker compose up -d postgres
```

### 4. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

- API: `http://localhost:5000/api`
- Health: `http://localhost:5000/api/health`

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

---

## Docker (full stack)

Stop anything already using ports **3000** / **5000**, then:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api |
| Postgres (from host) | `localhost:5433` |

```bash
docker compose down
```

### Local DB access (Compose)

| Field | Value |
|--------|--------|
| Host | `localhost` |
| Port | `5433` |
| User / password / DB | `kanban` / `kanban` / `kanban` |

```bash
docker exec -it kanban-postgres psql -U kanban -d kanban
```

---

## API

**Base URL (local):** `http://localhost:5000/api`  
**Base URL (live):** `https://webbriks-mini-kanban-board.onrender.com/api`

Auth / boards / tasks use **POST/PATCH/DELETE** — opening those paths in a browser (GET) returns `Route not found`. Use the app UI or a REST client.

**Auth header (protected routes):** `Authorization: Bearer <token>`

**Success**

```json
{ "success": true, "message": "…", "data": {} }
```

**Error**

```json
{ "success": false, "message": "…", "errors": {} }
```

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API welcome (also on server root `/`) |
| GET | `/health` | Health check |
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/users/me` | Current user |
| GET/POST | `/boards` | List / create boards |
| GET/PATCH/DELETE | `/boards/:id` | Board detail / rename / delete |
| POST/DELETE | `/boards/:boardId/members` | Share / remove member |
| POST | `/boards/:boardId/columns` | Create column |
| PATCH/DELETE | `/columns/:id` | Update / delete column |
| POST | `/columns/:columnId/tasks` | Create task |
| PATCH/DELETE | `/tasks/:id` | Update / delete task |
| PATCH | `/tasks/:id/move` | Reorder or move across columns |

### Move task

```http
PATCH /api/tasks/:id/move
```

```json
{
  "targetColumnId": "column-id",
  "targetPosition": 1
}
```

Positions are reindexed in a transaction. Board membership is required.

---

## Live deployment

| Role | Service | URL |
|------|---------|-----|
| App | Vercel | https://webbriks-mini-kanban-board.vercel.app |
| API | Render | https://webbriks-mini-kanban-board.onrender.com/api |
| DB | Neon | PostgreSQL (production only) |

**Render env:** `DATABASE_URL` (Neon), `JWT_SECRET`, `CORS_ORIGIN=https://webbriks-mini-kanban-board.vercel.app`, `NODE_ENV=production`  
**Vercel env:** `NEXT_PUBLIC_API_URL=https://webbriks-mini-kanban-board.onrender.com/api`

Local Docker / `npm run dev` use **local Postgres** by default. Neon is for the live API.

---

## Submission

This repository is ready for the Webbriks form:

- Single repo with `frontend/` and `backend/`
- Setup instructions + sample env in this README
- `docker-compose.yml` for local Postgres and optional full stack
- Live demo links above
