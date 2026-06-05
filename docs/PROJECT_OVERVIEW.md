# Pactum — Project Overview

> **One doc to open when you feel lost.**  
> Last updated: Week 2 complete → Design Sprint next → Week 3 code after.

---

## What is Pactum? (30 seconds)

**Pactum** is a freelance marketplace with **milestone-based escrow**:

- **Clients** post projects, fund work (simulated in Phase 1), approve milestones.
- **Freelancers** accept work, submit deliverables, get paid per milestone.
- **Job board** (later) lets freelancers discover public projects.

Phase 1 = Web2 app (Postgres, simulated escrow).  
Phase 2 = Smart contract on Ethereum L2 (not now).

---

## Where you are RIGHT NOW

```
✅ Week 1 — Repo, Prisma schema, planning
✅ Week 2 — Auth backend + frontend (register, login, /me, PATCH profile, protected + role routes)
⬜ Week 2.5 — DESIGN SPRINT (Figma) ← YOU ARE HERE
⬜ Week 3 — Projects (create, invite, fund)
⬜ Week 4 — Submit, approve, timeline, notifications
⬜ Week 5 — Job board, deploy, demo
```

**Do not start Week 3 backend until core Figma patterns exist** (ProjectCard, Project Detail, Create Project form).

---

## The 4 layers (mental model)

Think in layers, not in 100 tasks:

| Layer | What it is | Your status |
|-------|------------|-------------|
| **1. Design** | Figma: flows, components, screens | Not started (next) |
| **2. Backend** | Express API, Prisma, auth, business rules | Auth done; projects next |
| **3. Frontend** | React pages wired to API | Auth done; rest after design |
| **4. Ship** | Railway, seed, README, demo video | Week 5 |

**Rule:** Design → Backend (Postman) → Frontend (browser). Never skip Postman.

---

## The one user story (north star)

When the MVP is done, this works in the browser:

```
Client:  Register → Create project + milestones → Invite freelancer → Fund
Freelancer: Accept → Submit work on milestone
Client:  Approve → Milestone PAID
Both:    See project on dashboard + detail page + activity log
Public:  Browse job board → Apply (Week 5)
```

If a task does not serve this story, it is low priority or out of scope.

---

## How to keep overview (daily habits)

### 1. Only ONE active focus

At any time you have exactly **one** of:

- Design (Figma)
- Backend (one endpoint or flow)
- Frontend (one page from Figma)
- Ship (deploy/docs)

Write it on a sticky note: *"Today: DS-12 ProjectCard spec"*.

### 2. Three questions every morning (2 min)

1. **What week am I in?** → See roadmap above.
2. **What is the sprint goal of this week?** → One sentence from syllabus.
3. **What is the smallest done-able task today?** → One ClickUp card, size S or M.

### 3. Three questions every evening (2 min)

1. Did I finish **one** task (not five half-done)?
2. Can I demo it (Postman, Figma, or browser)?
3. What is **tomorrow's one task**?

### 4. ClickUp: 4 lists only

Do not create 50 lists. Use:

| List | Contents |
|------|----------|
| **Now** | Max 3 tasks you are doing this week |
| **Design** | Figma sprint tasks |
| **Build** | Week 3–5 backend + frontend |
| **Done** | Completed (move cards here) |

Everything else = backlog or delete.

### 5. When overwhelmed

```
Stop adding tasks.
Open this doc.
Pick ONE task from "Now".
Work 90 minutes.
Stop.
```

---

## Roadmap (one page)

| Week | Sprint goal | Main deliverable |
|------|-------------|------------------|
| **2** ✅ | Auth works | Login, dashboards (empty), role routes |
| **2.5** | Design system + key screens | Figma: ProjectCard, Detail, Create, Dashboards |
| **3** | Client creates & funds project | POST/GET projects, invite, accept, fund |
| **4** | Milestone lifecycle | Submit, approve, timeline, notifications |
| **5** | Public + deploy | Job board, apply, Railway, seed, video |

---

## Design sprint (simplified — what to do next)

Senior order (do not skip):

```
Step 1  Action matrix     → Who clicks what on which card? (2h)
Step 2  Design tokens     → Colors, fonts, spacing (2h)
Step 3  ProjectCard       → Anatomy + View button + variants (3h)
Step 4  MilestoneCard     → Anatomy + Submit/Review actions (2h)
Step 5  Project Detail    → Master screen, all statuses (6h)
Step 6  Dashboards        → Compose cards only (3h)
Step 7  Create Project    → Form + milestone rows (4h)
Step 8  Auth + Landing    → Compose form patterns (3h)
Step 9  Mobile + empty states (4h)
Step 10 Prototype 3 flows (3h)
```

**Not:** 45 random screens. **Yes:** Patterns first, screens = composition.

---

## Feature checklist (big picture)

| Feature | Backend | Frontend | Design |
|---------|---------|----------|--------|
| Register / Login | ✅ | ✅ | ⬜ polish |
| /me + profile PATCH | ✅ | ✅ Settings | ⬜ |
| Protected + role routes | ✅ | ✅ | ⬜ |
| Create project + milestones | ⬜ | ⬜ | ⬜ |
| List projects (dashboard) | ⬜ | ⬜ | ⬜ |
| Project detail | ⬜ | ⬜ | ⬜ |
| Invite / accept | ⬜ | ⬜ | ⬜ |
| Fund (simulated) | ⬜ | ⬜ | ⬜ |
| Submit milestone | ⬜ | ⬜ | ⬜ |
| Approve milestone | ⬜ | ⬜ | ⬜ |
| Activity timeline | ⬜ | ⬜ | ⬜ |
| Notifications | ⬜ | ⬜ | ⬜ |
| Job board + apply | ⬜ | ⬜ | ⬜ |
| Deploy Railway | ⬜ | — | — |

---

## Repo map (where code lives)

```
pactum/
├── backend/src/
│   ├── routes/        → URL → handler mapping
│   ├── controllers/   → req/res logic
│   ├── services/      → bcrypt, business helpers
│   ├── schemas/       → Zod validation
│   ├── middleware/    → checkAuth, requireRole, errors
│   └── lib/prisma.ts
├── frontend/src/
│   ├── pages/         → One file per screen
│   ├── components/    → Reusable UI
│   ├── context/       → AuthProvider
│   ├── router/        → Routes + guards
│   └── lib/           → api, validation
├── docs/
│   ├── PROJECT_OVERVIEW.md  ← this file
│   └── postman/             ← API tests
└── prisma/schema.prisma     → Database shape (source of truth)
```

**When lost in code:** Start at `routes` → `controller` → `prisma`.

---

## API endpoints (planned vs done)

### Done (Week 2)

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/users/me`

### Week 3

- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `POST /api/projects/:id/invite`
- `POST /api/projects/:id/accept`
- `POST /api/projects/:id/fund`

### Week 4

- `POST /api/milestones/:id/submit`
- `POST /api/milestones/:id/approve`
- `GET /api/projects/:id/activity`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

### Week 5

- `GET /api/jobs`
- `POST /api/projects/:id/apply`
- `GET /api/projects/:id/applications`
- `POST /api/applications/:id/accept`
- `POST /api/applications/:id/reject`

---

## Frontend routes

| Path | Page | Auth |
|------|------|------|
| `/` | Landing | Public |
| `/login`, `/register` | Auth | Guest |
| `/jobs` | Job board | Public |
| `/dashboard/client` | Client dashboard | CLIENT |
| `/dashboard/freelancer` | Freelancer dashboard | FREELANCER |
| `/projects/new` | Create project | CLIENT |
| `/projects/:id` | Project detail | Participant |
| `/settings` | Settings | Logged in |
| `/users/:id` | Public profile | Public |

---

## Out of scope (do NOT build in MVP)

- Smart contracts / wallet / real crypto
- Disputes & arbiter workflow
- Reviews & reputation scores
- Email notifications
- Admin panel (beyond placeholder)
- shadcn (you decided against)
- Sonner toasts (custom messages instead)

Put energy into **one vertical slice** instead.

---

## Decision tree (I don't know what to do)

```
Am I designing?
  → Open Figma. Work on ONE pattern from Design sprint list.
  → Stuck? Do Action matrix first.

Am I coding backend?
  → One endpoint. Postman test. Done.
  → Stuck? Read routes → controller of similar feature (auth).

Am I coding frontend?
  → Is there a Figma frame? No → stop, design first.
  → Yes → one page, match Figma.

Am I panicking?
  → Close ClickUp. Read "Where you are RIGHT NOW" above.
  → Do one S-sized task. Walk away.
```

---

## Useful links in this repo

- [README](../README.md) — project pitch & stack
- [Postman collection](./postman/Pactum.postman_collection.json) — API tests
- Prisma schema: `backend/prisma/schema.prisma`

---

## Weekly wrap template (copy to ClickUp / LinkedIn)

```markdown
Week N done:
- Shipped: [1-3 bullets]
- Learned: [1 sentence]
- Next week: [sprint goal in one sentence]
- Blocked: [none / what]
```

---

## Remember

- You have not lost the plot — the project is just **big**, not **complicated**.
- Big = many small tasks in order.
- You already finished **full auth** (hard part for many juniors).
- Design sprint feels like delay but **saves** weeks of UI rework.
- **One task. One layer. One week goal.**

---

*When this doc and ClickUp disagree, trust this doc for "what week am I in" and ClickUp for "what task today".*
