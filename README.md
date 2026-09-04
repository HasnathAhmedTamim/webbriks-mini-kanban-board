# Mini Kanban Board

Full-stack collaborative kanban for the **Webbriks Technical Assessment**.

- **Frontend:** Next.js + TypeScript + Tailwind CSS + dnd-kit + TanStack Query + Axios + Zod  
- **Backend:** Express + TypeScript + Prisma + PostgreSQL + JWT + bcrypt + Zod  
- **Local DevOps:** Docker Compose  
- **Live deploy (required):** Neon (Postgres) + Render (API) + Vercel (frontend)

## Project structure

```text
.
├── frontend/          # Next.js App Router
├── backend/           # Express API
├── docker-compose.yml
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 20+
- Docker Desktop (for local PostgreSQL / full stack)
- npm

## Quick start (local)

### 1. Environment files

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Default local database URL (matches Compose; host port **5433** to avoid clashing with a local Postgres on 5432):

```text
DATABASE_URL=postgresql://kanban:kanban@localhost:5433/kanban?schema=public
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

API: `http://localhost:5000/api`  
Health: `http://localhost:5000/api/health`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

### Full stack with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000/api  
- Postgres: localhost:5433  

## Core API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login (JWT) |
| GET/POST | `/api/boards` | List / create boards |
| GET/PATCH/DELETE | `/api/boards/:id` | Board detail / update / delete |
| POST/DELETE | `/api/boards/:boardId/members` | Share / remove member |
| POST | `/api/boards/:boardId/columns` | Create column |
| POST | `/api/columns/:columnId/tasks` | Create task |
| PATCH | `/api/tasks/:id/move` | Reorder / move across columns |

### Move task body

```json
{
  "targetColumnId": "column-id",
  "targetPosition": 1
}
```

Authorization: `Authorization: Bearer <token>`

Access control is enforced on the backend (board membership / ownership). Knowing a task ID alone is not enough.

## Postman

Import [`postman/Mini-Kanban-API.postman_collection.json`](postman/Mini-Kanban-API.postman_collection.json) into Postman.

Suggested order: **Register/Login** → **Create Board** → **Create Task** → **Move Task**.  
Login/Register scripts save `token`; Create Board saves `boardId`, `columnId`, and `targetColumnId`.

## Auth notes

- Passwords hashed with bcrypt  
- JWT stored in `localStorage` on the client and sent via Axios interceptor  

## Live deployment

### 1. Neon (database)

1. Create a Neon project  
2. Copy the **Prisma / PostgreSQL connection string**  
3. That value is your production `DATABASE_URL`

### 2. Render (backend)

1. New Web Service from this repo, root `backend`  
2. Build: `npm install && npx prisma generate && npm run build`  
3. Start: `npx prisma migrate deploy && npm start`  
4. Env vars:
   - `DATABASE_URL` = Neon connection string  
   - `JWT_SECRET` = long random secret  
   - `CORS_ORIGIN` = your Vercel URL (e.g. `https://your-app.vercel.app`)  
   - `NODE_ENV=production`  
   - `PORT=5000` (or Render’s port)

### 3. Vercel (frontend)

1. Import repo, root `frontend`  
2. Env: `NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api`  
3. Deploy  

### Live URL

After deploy, put the public frontend URL here:

```text
Live app: <YOUR_VERCEL_URL>
API: <YOUR_RENDER_URL>/api
```

## Sample env

See [`.env.example`](.env.example), [`backend/.env.example`](backend/.env.example), and [`frontend/.env.example`](frontend/.env.example).

## Submission

Single GitHub repository with `frontend/` and `backend/`, this README, and Docker Compose.  
Submit via the Webbriks form before **September 6, 2026 — 10:20 PM (Bangladesh Time)**.
