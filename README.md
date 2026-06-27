# Pactum

Freelance marketplace with milestone-based escrow for Web3-oriented work. Clients fund projects in stages; freelancers deliver per milestone; payment releases only after client approval.

**Author:** Adrian — [@thuisdev](https://github.com/thuisdev)

Phase 1 is a full-stack Web2 application with simulated escrow in PostgreSQL. Phase 2 will replace the payout layer with a self-authored escrow contract on an Ethereum L2 testnet.

---

## Features

| Area | Description |
|------|-------------|
| **Auth** | Email/password registration, JWT sessions, role-based access (`CLIENT`, `FREELANCER`, `ARBITER`, `ADMIN`) |
| **Projects** | Create, edit, and delete draft projects with ordered milestones |
| **Collaboration** | Client invites freelancer by email; freelancer accepts before funding |
| **Escrow (simulated)** | Client funds project; first milestone becomes active |
| **Milestones** | Freelancer submits work (text + optional file); client approves and triggers simulated payout |
| **Activity** | Per-project timeline of actions with actor attribution |
| **Notifications** | In-app bell for invites, submissions, approvals, and disputes |
| **Job board** | Public listing of open projects (`isPublic` + `DRAFT`) |
| **Disputes** | Parties can open disputes; arbiters resolve assigned cases |

---

## Tech stack

| Layer | Stack |
|-------|-------|
| Backend | Node.js 22, Express 5, Prisma 7, PostgreSQL, JWT, Zod, Multer |
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v7, React Hook Form, Axios |
| Tooling | Docker Compose (local DB), GitHub Actions, Postman collection |

---

## Repository layout

```
pactum/
├── backend/
│   ├── prisma/              Schema and migrations
│   └── src/
│       ├── routes/          HTTP route definitions
│       ├── controllers/     Request parsing and response mapping
│       ├── services/        Business logic and transactions
│       ├── middleware/      Auth, error handling
│       └── schemas/         Zod validation
├── frontend/
│   └── src/
│       ├── pages/           Route-level views
│       ├── components/      ui/, layout/, features/
│       ├── lib/             API client, display helpers, validation
│       └── router/          Routes and access guards
└── docs/
    ├── project-lifecycle.md Status transitions and action matrix
    ├── postman/             API test collection
    └── DESIGN_SPRINT.md     Figma component and screen inventory
```

Request flow on the backend: **route → middleware → controller → service → Prisma**.

---

## Getting started

### Requirements

- Node.js 22 (backend), Node.js 20+ (frontend)
- Docker Desktop

### Database

```bash
cd backend
cp .env.example .env
docker compose up -d
npx prisma migrate dev
```

Set `JWT_SECRET` in `.env` before running the API. Default Postgres port is **5433** (see `DATABASE_URL` in `.env.example`).

### Backend

```bash
cd backend
npm install
npm run dev
```

API base: `http://localhost:4000`  
Health: `GET /api/health`

Uploaded files are stored in `backend/uploads/` and served at `/uploads/*`.

### Frontend

```bash
cd frontend
cp example.env .env
npm install
npm run dev
```

App: `http://localhost:5173` — `VITE_API_URL` must point to `http://localhost:4000/api`.

### API tests

Import [`docs/postman/Pactum.postman_collection.json`](docs/postman/Pactum.postman_collection.json). The collection covers auth, project lifecycle, milestone submit/approve, and error cases.

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
| `GET` | `/api/projects/:id` | Project participant |
| `GET` | `/api/projects/:id/preview` | Public (if `isPublic`) |
| `PATCH` | `/api/projects/:id` | Client (draft only) |
| `DELETE` | `/api/projects/:id` | Client (draft only) |
| `POST` | `/api/projects/:id/invite` | Client |
| `POST` | `/api/projects/:id/accept` | Freelancer |
| `POST` | `/api/projects/:id/fund` | Client |
| `POST` | `/api/projects/:id/milestones` | Client |
| `GET` | `/api/projects/:id/activity` | Project participant |
| `POST` | `/api/projects/:id/disputes` | Client or freelancer |

### Milestones

| Method | Path | Access |
|--------|------|--------|
| `POST` | `/api/milestones/:id/submit` | Freelancer (`multipart/form-data`: `content`, optional `file`) |
| `POST` | `/api/milestones/:id/approve` | Client |

Submit requires at least 50 characters in `content`. Approve sets the milestone to `PAID`, records a simulated `payoutTxRef` (`SIM-…`), activates the next milestone, and marks the project `COMPLETED` when all milestones are paid.

### Other

| Method | Path | Access |
|--------|------|--------|
| `GET` | `/api/jobs` | Public |
| `GET` | `/api/notifications` | Authenticated |
| `PATCH` | `/api/notifications/:id/read` | Authenticated |
| `GET` | `/api/users/:id/public` | Public |

Status transitions and role rules are documented in [`docs/project-lifecycle.md`](docs/project-lifecycle.md).

---

## Frontend routes

| Path | Page | Access |
|------|------|--------|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Guest |
| `/jobs` | Job board | Public |
| `/dashboard` | Role redirect | Authenticated |
| `/dashboard/client` | Client dashboard | Client, Admin |
| `/dashboard/freelancer` | Freelancer dashboard | Freelancer, Admin |
| `/dashboard/arbiter` | Arbiter dashboard | Arbiter |
| `/projects/new` | Create project | Client, Admin |
| `/projects/:id/edit` | Edit project | Client (draft) |
| `/projects/:id` | Project detail | Authenticated |
| `/users/:id` | User profile | Authenticated |
| `/settings` | Settings | Authenticated |

---

## Milestone lifecycle

```
PENDING → IN_PROGRESS → SUBMITTED → PAID
              ↑                          │
              └──── next milestone ──────┘
```

Project status moves from `DRAFT` to `IN_PROGRESS` on fund and to `COMPLETED` when every milestone is `PAID`. Escrow is simulated in the database; `Approval.payoutTxRef` holds a placeholder reference until on-chain release is implemented.

---

## Design

UI is built against a Figma design system (tokens, components, screen specs). Component inventory and screen checklist: [`docs/DESIGN_SPRINT.md`](docs/DESIGN_SPRINT.md).

Figma components map to `frontend/src/components/features/` (e.g. `ProjectCard`, `MilestoneCard`, `SubmitWorkDialog`).

---

## CI

On push and pull requests to `main` and `dev`:

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
| Dispute flow, arbiter dashboard | Done |
| Production deploy, demo | Planned |
| On-chain escrow (L2 testnet) | Phase 2 |

---

## License

Private — capstone / portfolio project.
