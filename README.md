# Pactum

Freelance marketplace with **milestone-based escrow** for Web3-oriented work. Clients fund projects in stages; freelancers deliver per milestone; payment releases only after client approval.

**Author:** Adrian — [@thuisdev](https://github.com/thuisdev)

Phase 1 is a full-stack Web2 MVP with simulated escrow in PostgreSQL. Phase 2 will replace the payout layer with a self-authored escrow contract on an Ethereum L2 testnet.

**MVP status:** Feature-complete for local demo and deployment. See [Manual test plan](#manual-test-plan) before recording a demo.

---

## MVP feature checklist

| Area | Status |
|------|--------|
| Auth (register, login, JWT, roles) | Done |
| Projects (CRUD, milestones, public/private) | Done |
| Invite / accept (private projects) | Done |
| Job board + applications (public projects) | Done |
| Simulated fund + escrow | Done |
| Submit work + file upload | Done |
| Approve milestone + payout ref | Done |
| Activity timeline | Done |
| In-app notifications | Done |
| Profiles + settings (bio, skills) | Done |
| Disputes + arbiter dashboard | Done (stretch) |
| Demo seed data | Done |
| Postman collection | Done |
| Railway deploy config | Done |
| Automated E2E tests | Not in scope for MVP |

---

## North-star flows

Both paths below work end-to-end in the browser:

**Private (invite)**

```
Client → Create project → Invite freelancer → Freelancer accepts → Fund
→ Submit milestone → Client approves → PAID → (repeat) → COMPLETED
```

**Public (job board)**

```
Client → Create public project → Freelancer applies from /jobs
→ Client accepts application → Fund → Submit → Approve → COMPLETED
```

---

## Demo accounts

After seeding (`npm run db:seed`), use password **`12345678`** for all accounts:

| Email | Role | Seeded state |
|-------|------|----------------|
| `client@example.com` | Client | Owns public + private projects |
| `freelancer@example.com` | Freelancer | Pending invite on private project |
| `freelancer2@example.com` | Freelancer | Pending application on public project |
| `arbiter@example.com` | Arbiter | For dispute resolution |

Public job board project ID (stable after seed): `00000000-0000-4000-8000-000000000001`

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Backend | Node.js 22, Express 5, Prisma 7, PostgreSQL, JWT, Zod, Multer |
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v7, React Hook Form, Axios |
| Tooling | Docker Compose, GitHub Actions, Postman, Railway (deploy) |

---

## Repository layout

```
pactum/
├── backend/
│   ├── prisma/           Schema, migrations, seed.ts
│   ├── src/
│   │   ├── routes/       HTTP routes
│   │   ├── controllers/  Request/response mapping
│   │   ├── services/     Business logic
│   │   ├── middleware/   Auth, errors
│   │   └── schemas/      Zod validation
│   ├── Dockerfile        Production image
│   └── railway.toml
├── frontend/
│   ├── src/pages/        Route-level views
│   ├── src/components/   ui/, layout/, features/
│   ├── Dockerfile        Nginx static image
│   └── railway.toml
└── docs/
    ├── project-lifecycle.md
    ├── postman/          API test collection
    └── DESIGN_SPRINT.md
```

Backend request flow: **route → middleware → controller → service → Prisma**.

---

## Local development

### Requirements

- Node.js 22 (backend), Node.js 20+ (frontend)
- Docker Desktop

### 1. Database

```bash
cd backend
cp .env.example .env
docker compose up -d
npx prisma migrate dev
npm run db:seed
```

Set `JWT_SECRET` in `.env`. Default Postgres port is **5433** (see `DATABASE_URL` in `.env.example`).

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

- API: `http://localhost:4000`
- Health: `GET /api/health`
- Uploads: `backend/uploads/` served at `/uploads/*`

### 3. Frontend

```bash
cd frontend
cp example.env .env
npm install
npm run dev
```

- App: `http://localhost:5173`
- `VITE_API_URL` must be `http://localhost:4000/api`

### Useful scripts

| Command | Where | Purpose |
|---------|-------|---------|
| `npm run db:seed` | backend | Load demo users + projects |
| `npm run db:reset` | backend | Reset DB + migrate + seed |
| `npm run build` | backend / frontend | Production build |
| `npm run start:prod` | backend | Migrate + start (production) |

---

## Manual test plan

Run through both flows once before demo or deploy sign-off.

### Flow A — Invite (private)

1. Login as `client@example.com`
2. Open private project → confirm invite pending for freelancer
3. Login as `freelancer@example.com` → accept invite on dashboard
4. Login as client → fund project
5. Login as freelancer → submit work (≥50 chars) on milestone 1
6. Login as client → approve → verify milestone `PAID` and activity log

### Flow B — Apply (public)

1. Login as `freelancer2@example.com` → dashboard **Applied** tab shows pending app  
   *(or apply fresh from `/jobs` as any freelancer)*
2. Login as `client@example.com` → open public project → accept application
3. Fund → submit → approve (same as Flow A steps 4–6)

### API smoke test (Postman)

Import [`docs/postman/Pactum.postman_collection.json`](docs/postman/Pactum.postman_collection.json).

Set collection variable `baseUrl` to `http://localhost:4000`.

Run folders in order: **Authentication → Projects → Applications → Job Board**.

---

## API overview

### Auth

| Method | Path | Access |
|--------|------|--------|
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |

### Projects

| Method | Path | Access |
|--------|------|--------|
| `POST` | `/api/projects` | Client |
| `GET` | `/api/projects` | Authenticated |
| `GET` | `/api/projects/:id` | Participant |
| `GET` | `/api/projects/:id/preview` | Public (if `isPublic`) |
| `PATCH` | `/api/projects/:id` | Client (draft) |
| `DELETE` | `/api/projects/:id` | Client (draft) |
| `POST` | `/api/projects/:id/invite` | Client |
| `POST` | `/api/projects/:id/accept` | Freelancer |
| `POST` | `/api/projects/:id/fund` | Client |
| `POST` | `/api/projects/:id/milestones` | Client |
| `GET` | `/api/projects/:id/activity` | Participant |
| `POST` | `/api/projects/:id/disputes` | Client or freelancer |

### Applications

| Method | Path | Access |
|--------|------|--------|
| `POST` | `/api/projects/:id/apply` | Freelancer |
| `GET` | `/api/projects/:id/applications` | Client (owner) |
| `GET` | `/api/projects/:id/my-application` | Freelancer |
| `GET` | `/api/applications/me` | Freelancer |
| `POST` | `/api/applications/:id/accept` | Client |
| `POST` | `/api/applications/:id/reject` | Client |

### Milestones

| Method | Path | Access |
|--------|------|--------|
| `POST` | `/api/milestones/:id/submit` | Freelancer (`content` + optional `file`) |
| `POST` | `/api/milestones/:id/approve` | Client |

### Other

| Method | Path | Access |
|--------|------|--------|
| `GET` | `/api/jobs` | Public |
| `GET` | `/api/notifications` | Authenticated |
| `PATCH` | `/api/notifications/:id/read` | Authenticated |
| `GET` | `/api/users/:id/public` | Public |

Status rules: [`docs/project-lifecycle.md`](docs/project-lifecycle.md)

---

## Frontend routes

| Path | Page | Access |
|------|------|--------|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Guest |
| `/jobs` | Job board | Public |
| `/projects/:id` | Project detail | Public preview or participant |
| `/dashboard` | Role redirect | Authenticated |
| `/dashboard/client` | Client dashboard | Client, Admin |
| `/dashboard/freelancer` | Freelancer dashboard | Freelancer, Admin |
| `/dashboard/arbiter` | Arbiter dashboard | Arbiter |
| `/projects/new` | Create project | Client, Admin |
| `/projects/:id/edit` | Edit project | Client (draft) |
| `/users/:id` | User profile | Public |
| `/settings` | Settings | Authenticated |

---

## Milestone lifecycle

```
PENDING → IN_PROGRESS → SUBMITTED → PAID
              ↑                          │
              └──── next milestone ──────┘
```

Project moves `DRAFT` → `IN_PROGRESS` on fund and `COMPLETED` when all milestones are `PAID`. Escrow is simulated; `Approval.payoutTxRef` holds a placeholder (`SIM-…`) until on-chain release in Phase 2.

---

## Deploy (Railway)

Deploy as **three** Railway resources: Postgres plugin, backend service, frontend service.

### Postgres

1. Add **PostgreSQL** plugin to the project
2. Copy `DATABASE_URL` into the backend service variables

### Backend service

1. New service → connect repo → set **root directory** to `backend`
2. Railway picks up `backend/Dockerfile` and `railway.toml`
3. Variables:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | From Postgres plugin |
| `JWT_SECRET` | Random 32+ byte secret |
| `CORS_ORIGIN` | `https://your-frontend.up.railway.app` |
| `PORT` | `4000` (Railway sets automatically) |

4. Deploy → runs `prisma migrate deploy` then starts API
5. After first deploy: open shell or one-off job → `npm run db:seed`
6. Health check: `GET /api/health`

### Frontend service

1. New service → connect repo → set **root directory** to `frontend`
2. Add Docker build arg / variable:

| Variable | Example |
|----------|---------|
| `VITE_API_URL` | `https://your-backend.up.railway.app/api` |

3. Deploy → Nginx serves the Vite build

### Production notes

- File uploads use `backend/uploads/` on the container filesystem (ephemeral on Railway). For persistent files, attach a volume or move to object storage in Phase 2.
- Update `CORS_ORIGIN` whenever the frontend URL changes.
- Re-run `db:seed` only on empty databases (seed uses upserts).

---

## CI

On push/PR to `main` and `dev`:

- **Backend:** ESLint, TypeScript, `prisma validate`
- **Frontend:** ESLint, TypeScript

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## Roadmap

| Milestone | Status |
|-----------|--------|
| Auth, schema, project CRUD | Done |
| Invite, accept, fund | Done |
| Submit, approve, file uploads | Done |
| Activity timeline, notifications | Done |
| Job board, applications | Done |
| Dispute flow, arbiter dashboard | Done |
| Seed data, Postman, deploy config | Done |
| Demo video / live URL | Record after deploy |
| On-chain escrow (L2 testnet) | Phase 2 |

---

## License

Private — capstone / portfolio project.
