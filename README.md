# Mini Kanban Board

Collaborative kanban board for the **Webbriks Technical Assessment** — auth, board sharing with access control, and drag-and-drop task reordering.

**Live app:** [webbriks-mini-kanban-board.vercel.app](https://webbriks-mini-kanban-board.vercel.app)  
**API:** [webbriks-mini-kanban-board.onrender.com/api](https://webbriks-mini-kanban-board.onrender.com/api) · [Health](https://webbriks-mini-kanban-board.onrender.com/api/health)

---

## Features

- Register / login with JWT (bcrypt password hashing)
- Create, rename, and delete boards
- Share boards with registered users (`OWNER` / `MEMBER`)
- Backend ACL — non-members cannot access board data
- Columns & tasks CRUD
- Drag-and-drop reorder within a column and across columns
- Optimistic UI updates with transactional move API
- Responsive layout (stacked columns on small screens)

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, dnd-kit, TanStack Query, Axios, Zod |
| Backend | Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod |
| Local | Docker Compose |
| Deploy | Neon + Render + Vercel |

---

## Project structure

```text
.
├── frontend/           # Next.js App Router
├── backend/            # Express + Prisma API
├── postman/            # API collection
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick start

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

> Postgres is exposed on host port **5433** to avoid clashing with a local instance on `5432`.

### 3. Database

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

API: `http://localhost:5000/api`

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

---

## Docker (full stack)

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api |
| Postgres | localhost:5433 |

```bash
docker compose down
```

---

## API

Base URL: `http://localhost:5000/api` (local) or the live API above.

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

Positions are reindexed in a transaction. Board membership is required — knowing a task ID alone is not enough.

Full request/response examples: import [`postman/Mini-Kanban-API.postman_collection.json`](postman/Mini-Kanban-API.postman_collection.json).  
Suggested flow: **Register → Login → Create Board → Create Task → Move Task**.

---

## Live deployment

| Role | Service | URL / notes |
|------|---------|-------------|
| App | Vercel | https://webbriks-mini-kanban-board.vercel.app |
| API | Render | https://webbriks-mini-kanban-board.onrender.com/api |
| DB | Neon | PostgreSQL |

**Render env:** `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN=https://webbriks-mini-kanban-board.vercel.app`, `NODE_ENV=production`  
**Vercel env:** `NEXT_PUBLIC_API_URL=https://webbriks-mini-kanban-board.onrender.com/api`

---

## Submission

Single repository with `frontend/`, `backend/`, this README, sample env files, and `docker-compose.yml`.  
Repo: [github.com/HasnathAhmedTamim/webbriks-mini-kanban-board](https://github.com/HasnathAhmedTamim/webbriks-mini-kanban-board)
