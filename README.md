# Pactum

> Open job board with milestone-based escrow for Web3 freelance work.

**Status:** In development — auth backend live, Figma design complete, frontend implementation in progress

**Author:** Adrian — [@thuisdev](https://github.com/thuisdev)

---

## What is Pactum?

Pactum is a freelance marketplace where clients and freelancers collaborate with **milestone-based escrow**:

- **Clients** post projects, fund work (simulated in Phase 1), and approve milestones before payment is released.
- **Freelancers** accept work, submit deliverables, and get paid per approved milestone.
- A **public job board** surfaces open projects; reviews after completion build pseudonymous reputation.
- **Arbiters** resolve disputes when client and freelancer disagree.

Phase 1 (this repo) is a **Web2 application** with database-simulated escrow.  
Phase 2 replaces simulated escrow with a **self-authored smart contract** on an Ethereum L2 testnet.

---

## Design (Figma)

All MVP screens and UI components are designed in Figma **before** implementation — no UI invention in code during build weeks.

| Resource | Description |
|----------|-------------|
| **[Figma — Pactum](https://www.figma.com/design/)** | Design system, components, and all MVP screens *(replace with your share link)* |
| [`docs/DESIGN_SPRINT.md`](docs/DESIGN_SPRINT.md) | Sprint checklist, component inventory, screen list |
| [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) | Roadmap, mental model, daily workflow |

**Figma file structure**

| Page | Contents |
|------|----------|
| 01 — Foundations | Color tokens, typography, spacing |
| 02 — Patterns | Buttons, inputs, cards, badges, nav |
| 03 — Public | Landing, job board |
| 04 — Auth | Login, register |
| 05 — Client | Dashboard, create project, project detail |
| 06 — Freelancer | Dashboard, submit work |
| 07 — Shared | Settings, profile, notifications |
| 08–10 | Empty states, mobile, prototypes |

**Design → code mapping:** Figma components map to React paths, e.g. `ProjectCard` → `frontend/src/components/features/project/ProjectCard.tsx`.

---

## Current progress

| Area | Status |
|------|--------|
| Database schema (Prisma) | Done |
| Auth API (register, login, JWT, `/me`, profile) | Done |
| Role-based routes (Client, Freelancer, Admin, Arbiter) | Done |
| Figma design system + MVP screens | Done |
| Frontend routing + auth guards | Done |
| Project & milestone flows | Next |
| Job board + deploy | Planned (Week 5) |

---

## Tech stack

| Layer | Stack |
|-------|-------|
| **Backend** | Node.js, Express, Prisma, PostgreSQL, JWT, Zod |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, React Hook Form |
| **Infra** | Docker (local Postgres), GitHub Actions (CI), Railway (planned) |

---

## Project structure

```
pactum/
├── backend/          # Express + Prisma API
│   ├── prisma/       # Schema & migrations
│   └── src/          # Routes, controllers, services, middleware
├── frontend/         # React + Vite SPA
│   └── src/
│       ├── components/   # ui/, layout/, features/
│       ├── pages/        # Route-level pages
│       ├── router/       # AppRoutes, guards, lazy pages
│       ├── context/      # Auth provider
│       ├── hooks/        # useAuth, useApi, …
│       └── lib/          # API client, validation, constants
└── docs/             # Design sprint, lifecycle, Postman collection
```

---

## Local development

### Prerequisites

- Node.js 20+ (frontend) / 22+ (backend)
- Docker Desktop (for Postgres)

### 1. Database

```bash
cd backend
cp .env.example .env        # edit JWT_SECRET and passwords
docker compose up -d
npx prisma migrate dev
```

### 2. Backend

```bash
cd backend
npm install
npm run dev                 # http://localhost:4000
```

Health check: `GET http://localhost:4000/api/health`

### 3. Frontend

```bash
cd frontend
cp example.env .env         # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

### API testing

Import [`docs/postman/Pactum.postman_collection.json`](docs/postman/Pactum.postman_collection.json) into Postman or Bruno.

---

## Frontend routes

| Path | Page | Access |
|------|------|--------|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Guest only |
| `/jobs` | Job board | Public |
| `/dashboard` | Role redirect | Authenticated |
| `/dashboard/client` | Client dashboard | Client, Admin |
| `/dashboard/freelancer` | Freelancer dashboard | Freelancer, Admin |
| `/dashboard/admin` | Admin dashboard | Admin |
| `/dashboard/arbiter` | Arbiter dashboard | Arbiter |
| `/projects/new` | Create project | Client, Admin |
| `/projects/:id` | Project detail | Authenticated |
| `/users/:id` | User profile | Authenticated |
| `/settings` | Settings | Authenticated |

---

## Roadmap

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Planning, repo setup | Prisma schema, project structure |
| 2 | Auth | Register, login, JWT, role routes |
| 2.5 | Design sprint | Figma: tokens, components, all MVP screens |
| 3 | Projects | Create, invite, fund, accept |
| 4 | Milestones | Submit, approve, timeline, notifications |
| 5 | Ship | Job board, Railway deploy, demo video |
| Phase 2 | Web3 | Smart contract escrow on L2 testnet |

---

## CI

GitHub Actions runs on every push/PR to `main` and `dev`:

- **Backend:** ESLint, TypeScript, Prisma validate
- **Frontend:** ESLint, TypeScript

---

## License

Private project — capstone / portfolio work.
