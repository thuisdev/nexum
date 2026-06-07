# Design Sprint — Week 2.5 (between Week 2 and Week 3)

> **Sprint goal:** After this sprint, every MVP screen and component exists in Figma with specs. Week 3–5 = implementation only (no UI invention in code).

**Duration:** 7–10 working days (1 focused week or 2 relaxed weeks)  
**Tool:** Figma (+ FigJam for flows)  
**Prerequisite:** Week 2 auth done ✅  
**Next after sprint:** Week 3 Mon — `POST /api/projects` (backend)

---

## START HERE — Execution order (read this first)

> **Components before screens. Wireframes only in FigJam (gray boxes), not a full second pass in Figma.**  
> **Tailwind `@theme` in code:** after Figma Variables + Button/Card exist (end of Step 2), not before.

### Quick answer: Figma first thing?

| Order | What | Tool |
|-------|------|------|
| 1 | Design specs (tokens, type, states) | Doc ✅ |
| 2 | Flows + action matrix | FigJam |
| 3 | Tokens → Figma Variables | Figma page 01 |
| 4 | **Components (Hi-Fi)** | Figma page 02 |
| 5 | **Wireframes (light)** | FigJam only |
| 6 | **Screens (Hi-Fi)** | Figma pages 03–07 |
| 7 | Mobile + prototype + handoff | Figma 08–10 |

---

## Step-by-step checklist (your roadmap)

Tick boxes as you go. **Do not skip ahead to screens before Step 2 components exist.**

---

### Step 1 — Design specs ✅ DONE

**What you have:** Token doc (ink, brand, semantic colors, typography, states, badges, component sizes, Tailwind class mapping).

- [x] Color palettes `ink` + `brand` + semantic (emerald, amber, red, sky)
- [x] Light + Dark role mapping (`bg-white dark:bg-ink-950`, etc.)
- [x] Text roles (headings, body, muted, links, amounts)
- [x] State matrix (buttons, inputs, nav, cards)
- [x] Status badges (DRAFT → PAID)
- [x] Typography (Clash Display, Satoshi, JetBrains Mono)
- [x] Spacing, radius, shadows, breakpoints
- [x] Component sizes (button, input, card, navbar, form)
- [ ] **Optional:** Save doc as `docs/design/TOKENS.md` in repo

**Not done yet (code — later):** `@theme` in `index.css`, fonts in `index.html` → end of Step 2 or start of Week 3.

---

### Step 2 — Figma foundations + components (DO THIS NOW)

**Goal:** Reusable Hi-Fi components on Figma page **02 — Patterns**. No full screens yet.

#### 2a — FigJam discovery (~2–3 h) ⬜ NOT DONE

Do this **in parallel with start of 2b** if you hate FigJam first — but matrix must exist before ProjectCard.

- [ ] Action matrix complete (every button on every surface — see template below)
- [ ] Flow: Client create → invite → fund
- [ ] Flow: Freelancer accept → submit
- [ ] Flow: Client approve milestone
- [ ] Flow: Job board → apply → client accept (Week 5 preview)

**Action matrix (copy to FigJam and fill):**

| Surface | Role | Primary action | Secondary | Hidden when |
|---------|------|----------------|-----------|-------------|
| ProjectCard | CLIENT | View project | — | — |
| ProjectCard | FREELANCER (assigned) | View project | — | — |
| ProjectCard | FREELANCER (pending) | Accept invite | View project | — |
| ProjectCard | JOB BOARD | View project | Apply | already applied |
| MilestoneCard | FREELANCER | Submit work | — | status ≠ IN_PROGRESS |
| MilestoneCard | CLIENT | Review & approve | — | status ≠ SUBMITTED |
| Project detail | CLIENT | Fund project | Invite freelancer | not DRAFT+accepted |
| Navbar | logged out | — | Login, Register | — |
| Navbar | logged in | — | Notifications, User menu | — |

#### 2b — Figma Variables + text styles (~2 h) ⬜ NOT DONE

Figma page **01 — Foundations**. Copy hex **exactly** from token doc.

- [ ] Variables: `ink/50` … `ink/950`
- [ ] Variables: `brand/50` … `brand/900`
- [ ] Semantic swatches (emerald, amber, red, sky — for badges)
- [ ] Text styles: H1, H2, H3, Body, Muted, Label, Caption, Mono/Amount
- [ ] Layout frame template (1280 desktop, padding per token doc)

#### 2c — Core components (~8–12 h) ⬜ NOT DONE

Build as **Figma components with variants**. Hi-Fi from day one (use tokens, not gray).

**Buttons**
- [ ] Primary (default, hover, disabled, loading)
- [ ] Secondary
- [ ] Ghost
- [ ] Danger / Destructive
- [ ] Small size variant

**Form elements**
- [ ] Text input (default, focus, error, disabled)
- [ ] Textarea (+ character count slot)
- [ ] Select (role, currency)
- [ ] Search input (job board)
- [ ] File upload zone (empty, file selected, error)
- [ ] Label + helper text + error message slots

**Feedback**
- [ ] Message/Alert: success, error, warning, info
- [ ] Skeleton (card, text lines)

**Data display**
- [ ] StatusBadge (all project + milestone statuses from token doc)
- [ ] Avatar (sm, md, initials)
- [ ] Skill tag
- [ ] Currency amount (mono, tabular)
- [ ] Empty state block

**Cards & lists**
- [ ] Card / surface base
- [ ] **ProjectCard** ⭐ (dashboard client, freelancer assigned, freelancer pending+Accept, job board+Apply)
- [ ] **MilestoneCard** ⭐ (per status + action slot)
- [ ] ApplicationCard (accept/reject — Week 5)
- [ ] ActivityTimeline item
- [ ] NotificationItem

**Navigation & layout**
- [ ] Navbar desktop (logged out + logged in)
- [ ] Navbar mobile (hamburger / drawer)
- [ ] User menu dropdown
- [ ] Notification bell + dropdown panel
- [ ] Footer
- [ ] PageHeader (title + breadcrumb + CTA slot)
- [ ] Auth layout shell (centered card)
- [ ] Dashboard layout shell

**Overlays**
- [ ] Modal shell (confirm + form layouts)
- [ ] Dialog: Fund project (confirm)
- [ ] Dialog: Approve & release
- [ ] Dialog: Submit work
- [ ] Dialog: Apply (pitch)

**Step 2 done when:** ProjectCard + MilestoneCard + Button + Input + StatusBadge exist as components.

---

### Step 3 — Wireframes (FigJam only, light) ⬜ NOT DONE

**Not** 23 gray screens in Figma. **Only** gray-box flows where layout is unclear.

**Tool:** FigJam (or one Figma page "00 — Wireframes" as **low-fi boxes only**).

- [ ] Project Detail — box layout (header / parties / milestones / actions / timeline)
- [ ] Create Project — box layout (form + milestone rows + budget warning)
- [ ] Client Dashboard — box layout (header CTA + card grid)

**Skip wireframes for:** Login, Register, 404 (obvious single-column).

**Time budget:** 1–2 hours total. Then move on — do not polish wireframes.

---

### Step 4 — Hi-Fi screens (compose from Step 2 components) ⬜ NOT DONE

**Only place instances of components.** No new colors/fonts here.

Figma pages **03–07**. Desktop **1280px** first.

#### Public
- [ ] Landing (P-01)
- [ ] Job Board + no results (P-02, P-03)
- [ ] 404 (P-04)

#### Auth
- [ ] Login (A-01) + error state
- [ ] Register (A-02) + validation errors

#### Client
- [ ] Client Dashboard + empty state (C-01)
- [ ] Create Project + budget mismatch warning (C-02, C-03)
- [ ] Project Detail — DRAFT, no freelancer (C-04)
- [ ] Project Detail — invited, awaiting accept (C-05)
- [ ] Project Detail — ready to fund (C-06)
- [ ] Project Detail — FUNDED (C-08)
- [ ] Project Detail — milestone SUBMITTED (C-09)
- [ ] Project Detail — milestone PAID (C-11)
- [ ] Project Detail — Applications tab (C-12, Week 5)

#### Freelancer
- [ ] Freelancer Dashboard + pending invites (F-01)
- [ ] Project Detail — pending invite + Accept (F-02)
- [ ] Project Detail — IN_PROGRESS + Submit (F-03, F-04)
- [ ] Project Detail — submitted, awaiting approval (F-05)
- [ ] Job Board — Apply dialog (F-06, F-07)

#### Shared
- [ ] Project Detail + Activity Timeline section (S-01, S-02)
- [ ] Settings + success message (S-03)
- [ ] Public User Profile (S-04)
- [ ] Admin + Arbiter dashboard placeholder (X-01, X-02)

#### States (page 08)
- [ ] Loading skeletons (dashboard, detail)
- [ ] Empty states wired (no projects, no jobs, no notifications)
- [ ] API/form error examples

**Step 4 order (do not randomize):**
1. Client Dashboard
2. Create Project
3. Project Detail (all status frames) ⭐ master
4. Freelancer Dashboard
5. Landing + Auth
6. Job Board + Settings + Profile
7. States

---

### Step 5 — Mobile + prototype + handoff ⬜ NOT DONE

- [ ] Mobile 375px: Landing, Auth, both Dashboards, Create Project, Project Detail, Job Board
- [ ] Light mode complete first; dark mode on key components only (optional full dark later)
- [ ] 3 Figma prototypes (client fund, freelancer submit, approve)
- [ ] Consistency audit (matrix ↔ Figma)
- [ ] `docs/design/HANDOFF.md` + screen PNG exports
- [ ] Tailwind `@theme` + fonts in code (from token doc)
- [ ] ClickUp Design Sprint → Done; Week 3 Build unblocked

---

## Where you are right now

```
✅ Step 1 — Design specs (document)
⬜ Step 2a — FigJam matrix + flows
⬜ Step 2b — Figma variables
⬜ Step 2c — Components  ← YOU ARE HERE
⬜ Step 3 — Wireframes (FigJam, light)
⬜ Step 4 — Hi-Fi screens
⬜ Step 5 — Mobile + handoff
```

**Today:** Step 2a (action matrix) → Step 2b (variables) → first component (Primary Button).

---

## Definition of Done (sprint is complete when ALL are true)

- [ ] Figma file structured (pages listed below)
- [ ] Design tokens as Figma Variables (colors, type, spacing, radius)
- [ ] Action matrix signed off (every button on every card defined)
- [ ] All **patterns** built as components with variants
- [ ] All **MVP screens** at desktop 1280px
- [ ] Critical screens also at mobile 375px
- [ ] Empty, loading, error states for main flows
- [ ] 3 clickable prototypes in Figma
- [ ] Handoff doc: token table + component → code name map
- [ ] Screenshots exported to `docs/design/` (optional but recommended)

**You do NOT need:** Dark mode, disputes, reviews, wallet, admin workflows, pixel-perfect mobile for every screen.

---

## ClickUp setup (copy this structure)

### Space / Folder
```
Pactum
└── 🎨 Design Sprint (Week 2.5)
```

### Lists (only these 5)

| List | Purpose |
|------|---------|
| **DS — Discovery** | Flows, matrix, IA (no pixels yet) |
| **DS — Foundations** | Tokens, grid, status colors |
| **DS — Patterns** | Reusable Figma components |
| **DS — Screens** | Full pages composed from patterns |
| **DS — Done** | Completed cards moved here |

### Custom fields (on each task)

| Field | Values |
|-------|--------|
| **T-Shirt** | XS · S · M · L · XL |
| **Figma page** | 00–11 (see file structure) |
| **Blocks** | Week 3 · Week 4 · Week 5 · Auth polish |
| **Handoff** | Not started · Ready for dev |

### Labels (tags)

`figjam` `component` `screen` `mobile` `state` `prototype` `handoff`

### Rule for ClickUp

- **Max 3 tasks** in "In Progress" at once
- Move to **DS — Done** only when Acceptance Criteria checked
- Do **not** start Week 3 Build list until sprint DoD above is 100%

---

## Figma file structure

Create one file: **`Pactum — MVP Design`**

```
📄 Cover (sprint goal + changelog)
📄 00 — FigJam: Flows & Action Matrix (or link to FigJam file)
📄 01 — Foundations (tokens, grid, typography)
📄 02 — Patterns / Components
📄 03 — Screens / Public
📄 04 — Screens / Auth
📄 05 — Screens / Client
📄 06 — Screens / Freelancer
📄 07 — Screens / Shared
📄 08 — States (empty, loading, error)
📄 09 — Mobile (375px)
📄 10 — Prototypes
```

---

## Sprint phases & schedule

| Phase | Days | ClickUp list |
|-------|------|--------------|
| **A — Discovery** | Day 1 | DS — Discovery |
| **B — Foundations** | Day 1–2 | DS — Foundations |
| **C — Patterns** | Day 2–5 | DS — Patterns |
| **D — Screens** | Day 4–8 | DS — Screens |
| **E — States + Mobile** | Day 8–9 | DS — Screens + States page |
| **F — Prototype + Handoff** | Day 9–10 | DS — Done criteria |

---

# CLICKUP TASKS (copy each card)

Format per task:
- **Title**
- **List**
- **T-Shirt**
- **Description**
- **Acceptance Criteria**

---

## PHASE A — Discovery

### DS-A01 — Jobs-to-be-done (1-pager)
- **List:** DS — Discovery
- **T-Shirt:** S
- **Description:** Why Pactum exists for Client vs Freelancer.
- **AC:**
  - [ ] Client: hire with escrow confidence (3 bullets)
  - [ ] Freelancer: paid per milestone (3 bullets)
  - [ ] Saved in ClickUp doc or Figma cover note

### DS-A02 — Sitemap + route map
- **List:** DS — Discovery
- **T-Shirt:** S
- **Description:** Map every route in `frontend/src/router/routes.ts` to public/auth/role.
- **AC:**
  - [ ] FigJam diagram: all routes
  - [ ] Mark public vs protected vs role-specific

### DS-A03 — User flow: Client (create → fund)
- **List:** DS — Discovery
- **T-Shirt:** M
- **Labels:** figjam
- **AC:**
  - [ ] Register → Dashboard → Create → Detail → Invite → Accept → Fund
  - [ ] Each step labeled (screen or modal)

### DS-A04 — User flow: Freelancer (accept → submit)
- **List:** DS — Discovery
- **T-Shirt:** M
- **AC:**
  - [ ] Invite → Accept → Detail → Submit → Awaiting approval

### DS-A05 — User flow: Client (approve milestone)
- **List:** DS — Discovery
- **T-Shirt:** S
- **AC:**
  - [ ] Submitted milestone → Review → Approve dialog → PAID

### DS-A06 — User flow: Job board → apply → accept
- **List:** DS — Discovery
- **T-Shirt:** M
- **Blocks:** Week 5
- **AC:**
  - [ ] Browse → Apply dialog → Client sees applications → Accept

### DS-A07 — Action matrix (CRITICAL)
- **List:** DS — Discovery
- **T-Shirt:** M
- **Description:** Table: every UI surface → who sees it → primary/secondary actions → when disabled.
- **AC:**
  - [ ] ProjectCard: all variants (dashboard client, dashboard freelancer pending, job board)
  - [ ] MilestoneCard: all status actions
  - [ ] Project detail: Fund, Invite, Submit, Approve buttons with conditions
  - [ ] No undefined buttons on any screen
  - [ ] Saved on FigJam page 00 or spreadsheet linked in ClickUp

**Action matrix template (fill in FigJam):**

| Surface | Role | Primary action | Secondary | Hidden when |
|---------|------|----------------|-----------|-------------|
| ProjectCard | CLIENT | View project | — | — |
| ProjectCard | FREELANCER (assigned) | View project | — | — |
| ProjectCard | FREELANCER (pending invite) | Accept invite | View project | — |
| ProjectCard | FREELANCER (job board) | View project | Apply | already applied |
| MilestoneCard | FREELANCER | Submit work | — | status ≠ IN_PROGRESS |
| MilestoneCard | CLIENT | Review & approve | — | status ≠ SUBMITTED |
| Project detail header | CLIENT | Fund project | Invite freelancer | wrong status |
| Project detail | CLIENT | — | — | Fund hidden if not DRAFT+accepted |
| Navbar | logged out | — | Login, Register | — |
| Navbar | logged in | — | Notifications, User menu | — |

---

## PHASE B — Foundations

### DS-B01 — Color tokens (Figma Variables)
- **List:** DS — Foundations
- **T-Shirt:** M
- **Figma page:** 01
- **AC:**
  - [ ] primary, primary-hover, background, surface, surface-elevated, border
  - [ ] text, text-muted, text-inverse
  - [ ] success, warning, error, info
  - [ ] Status colors: draft, funded, in-progress, submitted, approved, paid, public

### DS-B02 — Typography scale
- **List:** DS — Foundations
- **T-Shirt:** S
- **AC:**
  - [ ] Font family chosen (1 sans; optional 1 mono for USDC amounts)
  - [ ] Scale: xs, sm, base, lg, xl, 2xl, 3xl
  - [ ] Text styles in Figma: Heading/H1, H2, H3, Body, Caption, Mono/Amount

### DS-B03 — Spacing, radius, shadows
- **List:** DS — Foundations
- **T-Shirt:** S
- **AC:**
  - [ ] Spacing: 4, 8, 12, 16, 24, 32, 48, 64
  - [ ] Radius: sm, md, lg, full
  - [ ] Shadows: sm (card), md (dropdown), lg (modal)

### DS-B04 — Layout grid
- **List:** DS — Foundations
- **T-Shirt:** XS
- **AC:**
  - [ ] Desktop max-width 1200px, padding 24–32
  - [ ] Mobile padding 16
  - [ ] Layout frame template component (empty shell)

### DS-B05 — Status badge system
- **List:** DS — Foundations
- **T-Shirt:** S
- **AC:**
  - [ ] Project: DRAFT, FUNDED, IN_PROGRESS, COMPLETED, CANCELLED
  - [ ] Milestone: PENDING, IN_PROGRESS, SUBMITTED, APPROVED, PAID
  - [ ] Each: color + label + optional icon

---

## PHASE C — Patterns (Figma Components)

> Build on page **02 — Patterns**. Every pattern = component with variants.

### DS-C01 — Button system
- **List:** DS — Patterns
- **T-Shirt:** M
- **AC:**
  - [ ] Variants: primary, secondary, ghost, danger, sm
  - [ ] States: default, hover, disabled, loading (spinner)

### DS-C02 — Form: Text input
- **List:** DS — Patterns
- **T-Shirt:** M
- **AC:**
  - [ ] States: default, focus, error, disabled
  - [ ] With label, helper text, error message slots

### DS-C03 — Form: Textarea
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Char count slot (for submission min 50, pitch min 100)

### DS-C04 — Form: Select + Search input
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Select: role, currency
  - [ ] Search: job board

### DS-C05 — Form: File upload
- **List:** DS — Patterns
- **T-Shirt:** M
- **Blocks:** Week 4
- **AC:**
  - [ ] Empty zone, file selected, error (max 10MB)

### DS-C06 — Message / Alert (no Sonner)
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] success, error, warning, info (inline banner)

### DS-C07 — Badge + Tag
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] StatusBadge uses B05 tokens
  - [ ] Skill tag for profile

### DS-C08 — Avatar
- **List:** DS — Patterns
- **T-Shirt:** XS
- **AC:**
  - [ ] Sizes sm/md, initials fallback, image

### DS-C09 — Card / Surface
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Base card: padding, border, shadow, hover optional

### DS-C10 — ProjectCard ⭐
- **List:** DS — Patterns
- **T-Shirt:** M
- **Blocks:** Week 3
- **Anatomy:**
  - Title (2-line clamp)
  - StatusBadge
  - Amount (USDC, mono)
  - Meta: client or freelancer name
  - Footer: primary button **View project**
- **AC:**
  - [ ] Variant: dashboard / client
  - [ ] Variant: dashboard / freelancer / assigned
  - [ ] Variant: dashboard / freelancer / pending + **Accept invite** secondary
  - [ ] Variant: jobboard / public + **Apply** secondary
  - [ ] State: skeleton
  - [ ] Matches DS-A07 matrix

### DS-C11 — MilestoneCard ⭐
- **List:** DS — Patterns
- **T-Shirt:** M
- **Blocks:** Week 3–4
- **Anatomy:**
  - Order #, title, amount, deadline, StatusBadge
  - Action slot (Submit / Review / none)
- **AC:**
  - [ ] Variants per status from matrix
  - [ ] PAID shows check + timestamp placeholder

### DS-C12 — ApplicationCard
- **List:** DS — Patterns
- **T-Shirt:** S
- **Blocks:** Week 5
- **AC:**
  - [ ] Freelancer name, pitch preview, Accept / Reject (client)

### DS-C13 — ActivityTimeline item
- **List:** DS — Patterns
- **T-Shirt:** S
- **Blocks:** Week 4
- **AC:**
  - [ ] Icon per action type, actor, label, relative time

### DS-C14 — NotificationItem + Bell
- **List:** DS — Patterns
- **T-Shirt:** M
- **Blocks:** Week 4
- **AC:**
  - [ ] Bell with unread count badge
  - [ ] Dropdown panel, read/unread item

### DS-C15 — EmptyState
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Variants: no projects, no jobs, no notifications, no applications

### DS-C16 — Skeleton loaders
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Card skeleton, text lines, detail page skeleton

### DS-C17 — Modal / Dialog shell
- **List:** DS — Patterns
- **T-Shirt:** M
- **AC:**
  - [ ] Base modal, confirm layout (title, body, cancel, confirm)
  - [ ] Form layout (for submit, apply)

### DS-C18 — PageHeader
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Title, optional breadcrumb, optional primary CTA slot

### DS-C19 — Navbar (desktop)
- **List:** DS — Patterns
- **T-Shirt:** M
- **AC:**
  - [ ] Logged out: Logo, Jobs, Login, Register
  - [ ] Logged in: Logo, Dashboard, Jobs, NotificationBell, UserMenu dropdown

### DS-C20 — Navbar (mobile)
- **List:** DS — Patterns
- **T-Shirt:** M
- **AC:**
  - [ ] Hamburger menu, drawer or full-screen nav

### DS-C21 — Footer
- **List:** DS — Patterns
- **T-Shirt:** XS

### DS-C22 — Auth layout shell
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Centered card on subtle background

### DS-C23 — Dashboard layout shell
- **List:** DS — Patterns
- **T-Shirt:** S
- **AC:**
  - [ ] Navbar + content area + optional sidebar placeholder

---

## PHASE D — Screens (compose patterns only)

> Desktop 1280 unless noted. Page references in Figma 03–07.

### DS-D01 — Landing
- **List:** DS — Screens
- **T-Shirt:** M
- **Figma:** 03 — Public
- **Uses:** Navbar, Footer, Button, PageHeader
- **AC:** Hero, 3 features, CTA register + jobs, logged-in variant CTA dashboard

### DS-D02 — Job Board
- **List:** DS — Screens
- **T-Shirt:** M
- **Blocks:** Week 5
- **Uses:** Search, ProjectCard jobboard variant, EmptyState
- **AC:** Grid, search bar, pagination placeholder, no results state

### DS-D03 — 404 Not Found
- **List:** DS — Screens
- **T-Shirt:** XS
- **AC:** Link home, link jobs

### DS-D04 — Login
- **List:** DS — Screens
- **T-Shirt:** S
- **Figma:** 04 — Auth
- **Uses:** Auth layout, Form input, Button, Message error
- **AC:** Desktop + link to register

### DS-D05 — Register
- **List:** DS — Screens
- **T-Shirt:** S
- **AC:** email, password, role select, validation error state frame

### DS-D06 — Client Dashboard
- **List:** DS — Screens
- **T-Shirt:** M
- **Figma:** 05 — Client
- **Uses:** Dashboard layout, PageHeader + **New Project** CTA, ProjectCard×3, EmptyState
- **AC:** Matches DS-C10 client variant

### DS-D07 — Freelancer Dashboard
- **List:** DS — Screens
- **T-Shirt:** M
- **Figma:** 06 — Freelancer
- **AC:** Assigned cards + pending invite cards with Accept

### DS-D08 — Create Project ⭐
- **List:** DS — Screens
- **T-Shirt:** L
- **Blocks:** Week 3
- **Uses:** Form inputs, dynamic milestone rows (design 2 rows + add/remove affordance), budget sum warning
- **AC:**
  - [ ] title, description, totalBudget, currency USDC
  - [ ] Milestone row: title, description, amount, deadline
  - [ ] Inline warning: sum ≠ budget
  - [ ] Submit CTA

### DS-D09 — Project Detail — DRAFT (no freelancer)
- **List:** DS — Screens
- **T-Shirt:** L
- **Figma:** 07 — Shared
- **AC:** Header, parties, milestones list, **Invite freelancer** CTA

### DS-D10 — Project Detail — DRAFT (invited, awaiting accept)
- **List:** DS — Screens
- **T-Shirt:** M
- **AC:** Status banner, freelancer pending

### DS-D11 — Project Detail — ready to Fund
- **List:** DS — Screens
- **T-Shirt:** M
- **AC:** **Fund project** button visible (client only)

### DS-D12 — Dialog: Fund project
- **List:** DS — Screens
- **T-Shirt:** S
- **Uses:** DS-C17 confirm
- **AC:** Amount summary, confirm/cancel

### DS-D13 — Project Detail — FUNDED (milestones IN_PROGRESS)
- **List:** DS — Screens
- **T-Shirt:** M
- **AC:** Freelancer sees Submit on active milestone

### DS-D14 — Dialog: Submit work
- **List:** DS — Screens
- **T-Shirt:** M
- **Blocks:** Week 4
- **AC:** Textarea + char count ≥50, file upload optional

### DS-D15 — Project Detail — milestone SUBMITTED
- **List:** DS — Screens
- **T-Shirt:** M
- **AC:** Client sees expandable submission + **Approve & release**

### DS-D16 — Dialog: Approve & release
- **List:** DS — Screens
- **T-Shirt:** S
- **AC:** Payout amount, confirm

### DS-D17 — Project Detail — milestone PAID
- **List:** DS — Screens
- **T-Shirt:** S
- **AC:** PAID badge + timestamp on milestone card

### DS-D18 — Project Detail — with Activity Timeline
- **List:** DS — Screens
- **T-Shirt:** M
- **Blocks:** Week 4
- **AC:** Timeline section at bottom, 4+ sample entries

### DS-D19 — Project Detail — Applications tab (Client)
- **List:** DS — Screens
- **T-Shirt:** M
- **Blocks:** Week 5
- **AC:** Tabs: Overview | Applications, ApplicationCard list

### DS-D20 — Dialog: Apply to project
- **List:** DS — Screens
- **T-Shirt:** S
- **AC:** Pitch textarea min 100 chars

### DS-D21 — Settings
- **List:** DS — Screens
- **T-Shirt:** M
- **AC:** name, displayName, bio, skills (comma tags), save, success message

### DS-D22 — Public User Profile
- **List:** DS — Screens
- **T-Shirt:** M
- **Blocks:** Week 5
- **AC:** Avatar, bio, skill tags, member since, completed projects count placeholder

### DS-D23 — Admin + Arbiter dashboard (placeholder)
- **List:** DS — Screens
- **T-Shirt:** XS
- **AC:** 1 frame each, „Coming soon“ — consistent shell only

---

## PHASE E — States & Mobile

### DS-E01 — Empty states (all variants)
- **List:** DS — Screens
- **T-Shirt:** S
- **Figma:** 08 — States
- **AC:** Wire DS-C15 into dashboard, job board, notifications

### DS-E02 — Loading skeletons
- **List:** DS — Screens
- **T-Shirt:** S
- **AC:** Dashboard loading, project detail loading

### DS-E03 — Form/API error states
- **List:** DS — Screens
- **T-Shirt:** XS
- **AC:** Login error, create project error banner

### DS-E04 — Mobile: Landing + Auth
- **List:** DS — Screens
- **T-Shirt:** S
- **Figma:** 09 — Mobile
- **Labels:** mobile

### DS-E05 — Mobile: Dashboards
- **List:** DS — Screens
- **T-Shirt:** M

### DS-E06 — Mobile: Create Project
- **List:** DS — Screens
- **T-Shirt:** M

### DS-E07 — Mobile: Project Detail
- **List:** DS — Screens
- **T-Shirt:** M

### DS-E08 — Mobile: Job Board
- **List:** DS — Screens
- **T-Shirt:** S

---

## PHASE F — Prototype & Handoff

### DS-F01 — Prototype: Client happy path
- **List:** DS — Done (when complete)
- **T-Shirt:** M
- **Figma:** 10 — Prototypes
- **AC:** Landing → Register → Create → Invite → Fund

### DS-F02 — Prototype: Freelancer submit path
- **List:** DS — Done
- **T-Shirt:** M
- **AC:** Accept → Detail → Submit

### DS-F03 — Prototype: Approve + Job apply
- **List:** DS — Done
- **T-Shirt:** M
- **AC:** Client approve; optional job board apply flow

### DS-F04 — Consistency audit
- **List:** DS — Done
- **T-Shirt:** S
- **AC:**
  - [ ] Action matrix ↔ Figma 100% match
  - [ ] Status colors consistent
  - [ ] Button labels consistent (View project, not mixed)
  - [ ] Only token spacing used

### DS-F05 — Dev handoff package
- **List:** DS — Done
- **T-Shirt:** M
- **Labels:** handoff
- **AC:**
  - [ ] `docs/design/HANDOFF.md` — token hex/px table
  - [ ] Component map: Figma name → React path (e.g. `ProjectCard` → `components/features/project/ProjectCard.tsx`)
  - [ ] Export PNGs of every screen to `docs/design/screens/`
  - [ ] Mark Week 3 tasks in ClickUp "Build" as unblocked

---

# After sprint: how Week 3–5 changes

| Week | Before (old plan) | After design sprint |
|------|-------------------|---------------------|
| **3 Thu** | Invent CreateProject UI | **Implement** DS-D08 from Figma |
| **3 Fri** | Design ProjectCard | **Implement** DS-C10 |
| **5 Sat** | Big polish pass | Only responsive fixes + edge cases |

**Build list in ClickUp** (separate folder, start after DS-F05):

```
Week 3 — Build
Week 4 — Build
Week 5 — Build
```

Each build task links to Figma frame URL in description.

---

# Quick reference: task count

| Phase | Tasks | Est. hours |
|-------|-------|------------|
| A Discovery | 7 | 8–10h |
| B Foundations | 5 | 6–8h |
| C Patterns | 23 | 20–28h |
| D Screens | 23 | 24–32h |
| E States/Mobile | 8 | 10–14h |
| F Handoff | 5 | 8–10h |
| **Total** | **71 tasks** | **~76–102h** |

Plan **1.5–2 calendar weeks** if not full-time.

---

# Daily rhythm during sprint

```
Morning:   1 pattern OR 1 screen from ClickUp
Midday:    Continue — finish before switching
Evening:   Move card to DS — Done, link Figma frame in comment
```

**Never:** Design a screen before its patterns exist.  
**Order:** A07 matrix → B tokens → C10/C11 cards → D08/D09 detail → rest.

---

# Link to main overview

See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for where this sprint sits in the full project.
