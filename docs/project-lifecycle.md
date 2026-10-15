# Project Lifecycle

> **Source of truth for status transitions and who may do what.**  
> Enums: `backend/prisma/schema.prisma`  
> Product scope: see root [README](../README.md)

Phase 1 is simulated escrow (Postgres records lock / payout / refund). Phase 2 replaces the payout layer with an on-chain contract; the status machine below stays the same.

---

## Roles

A user has a global `Role` (`CLIENT`, `FREELANCER`, `ARBITER`, `ADMIN`), but **project actions are determined by project membership**, not only by global role.

| Project role | How assigned | Typical actions |
|--------------|--------------|-----------------|
| **Client** | `project.clientId` — creator | Create, edit (unfunded draft), invite, fund, cancel unassigned funded job, approve, request changes, open dispute |
| **Freelancer** | `project.freelancerId` — invite accept or application accept | Accept/decline invite, apply, submit work, open dispute |
| **Arbiter** | First `ARBITER` user in the DB, set on `project.arbiterId` when a dispute opens | Start review (`IN_REVIEW`), then resolve |
| **Admin** | Platform role | Same dispute resolve as arbiter; can open a dispute only on `IN_PROGRESS` / `SUBMITTED` like everyone else |

**Rule:** An endpoint must verify the caller is the correct participant on that project (e.g. only `clientId` may fund or approve). Admin is not a silent bypass on milestone status gates.

---

## Happy path

Two ways to hire, then the same work loop:

```
Invite path:     Create (private) → Invite → Accept → Fund → Submit → Approve → …
Job-board path:  Create (public) → Fund → listed → Apply → Accept application → Submit → Approve → …
```

Prefunded public jobs stay `FUNDED` until a freelancer is assigned, then become `IN_PROGRESS` and milestone 0 starts.

---

## Project status (`ProjectStatus`)

| Status | When | Escrow | Next states |
|--------|------|--------|-------------|
| **DRAFT** | Created; not yet funded | `NOT_FUNDED` | `FUNDED` or `IN_PROGRESS` (on fund) |
| **FUNDED** | Client funded; no freelancer yet (job board) | `FUNDED` | `IN_PROGRESS` |
| **IN_PROGRESS** | Freelancer assigned and work is active | `FUNDED` until every milestone is terminal | `COMPLETED` |
| **COMPLETED** | Every milestone is `PAID` or `REFUNDED` | `RELEASED` if any was paid, else `REFUNDED` | — |
| **CANCELLED** | Client cancelled a funded job before a freelancer was assigned | `REFUNDED` | Unfunded drafts are still **deleted** |

### Transitions (detail)

| From | To | Trigger | Actor |
|------|----|---------|-------|
| — | `DRAFT` | `POST /api/projects` | **Client** |
| `DRAFT` | `DRAFT` | Invite (`POST …/invite`) — also allowed while `FUNDED` before assignment | **Client** |
| `DRAFT` / `FUNDED` | `DRAFT` / `FUNDED` | Freelancer accepts invite (`POST …/accept`) | **Freelancer** |
| `DRAFT` | `FUNDED` | Fund (`POST …/fund`) with **no** freelancer — job stays listed | **Client** |
| `DRAFT` | `IN_PROGRESS` | Fund with freelancer already assigned — M0 → `IN_PROGRESS` | **Client** |
| `FUNDED` | `IN_PROGRESS` | Application or invite accept on a prefunded job — M0 → `IN_PROGRESS` | **Client** / **Freelancer** |
| `FUNDED` | `CANCELLED` | `POST …/cancel` while no freelancer is assigned | **Client** |
| `IN_PROGRESS` | `IN_PROGRESS` | A milestone becomes `PAID` or `REFUNDED`; others remain | *System* |
| `IN_PROGRESS` | `COMPLETED` | Last remaining milestone is `PAID` or `REFUNDED` | *System* |

Full edit / delete: only while `DRAFT`, `escrowStatus = NOT_FUNDED`, and `freelancerId` is null.

Cancel funded listing: `POST /api/projects/:id/cancel` while `FUNDED`, escrow `FUNDED`, and `freelancerId` is null. Escrow → `REFUNDED`. Pending applications are rejected; a pending invite is cancelled.

---

## Milestone status (`MilestoneStatus`)

Milestones are ordered by `orderIndex`. Only **one** milestone should be active (`IN_PROGRESS`, `SUBMITTED`, or `DISPUTED`) at a time.

| Status | When | Who acts next |
|--------|------|---------------|
| **PENDING** | Created with the project; not started | — |
| **IN_PROGRESS** | Active; freelancer may deliver | **Freelancer** → submit; either party may dispute |
| **SUBMITTED** | Delivered; awaiting client | **Client** → approve or request changes; either party → dispute |
| **APPROVED** | Enum only | **Unused** — approve writes `PAID` in the same transaction |
| **PAID** | Payout recorded (`paidAt`, simulated `payoutTxRef`) | — |
| **DISPUTED** | Open dispute; escrow stays locked | **Arbiter** or **Admin** → resolve |
| **REFUNDED** | Client-win dispute (or all-refund completion) | — |

### Transitions (detail)

| From | To | Trigger | Actor |
|------|----|---------|-------|
| — | `PENDING` | Project created with milestones | **Client** |
| `PENDING` | `IN_PROGRESS` | Fund with freelancer, accept on prefunded job, or previous milestone terminal | *System* |
| `IN_PROGRESS` | `SUBMITTED` | `POST /api/milestones/:id/submit` | **Freelancer** |
| `SUBMITTED` | `PAID` | `POST /api/milestones/:id/approve` | **Client** |
| `SUBMITTED` | `IN_PROGRESS` | `POST /api/milestones/:id/return` | **Client** |
| `IN_PROGRESS` / `SUBMITTED` | `DISPUTED` | `POST /api/projects/:id/disputes` | **Client** or **Freelancer** (or **Admin**) |
| `DISPUTED` | `PAID` | Resolve `RESOLVED_FREELANCER` (100%) or `SPLIT` (half) | **Arbiter** / **Admin** |
| `DISPUTED` | `REFUNDED` | Resolve `RESOLVED_CLIENT` | **Arbiter** / **Admin** |
| `PAID` / `REFUNDED` | next `PENDING` → `IN_PROGRESS` | If another milestone remains | *System* |

### Submission rules

- Only the assigned **freelancer** on an `IN_PROGRESS` or `SUBMITTED` milestone may submit.
- `content` minimum 50 characters; `fileUrl` optional (PDF, ZIP, raster image, or text; max 10 MB). Omitting a file on re-submit keeps the previous attachment.
- Re-submit is a new `Submission` row with incremented `version` (milestone stays `SUBMITTED`).

---

## Disputes (`DisputeStatus`)

Implemented in Phase 1 (simulated money). Opening requires at least one user with role `ARBITER`; otherwise the API returns 409.

| Outcome | Milestone | Money (simulated) |
|--------|-----------|-------------------|
| `RESOLVED_FREELANCER` | `PAID` | Full milestone amount to freelancer |
| `RESOLVED_CLIENT` | `REFUNDED` | Full amount treated as returned to client |
| `SPLIT` | `PAID` (split metadata) | Half to freelancer (rounded down); leftover cent stays with the client |

Rules:

- Project must be `FUNDED` or `IN_PROGRESS`.
- Milestone must be `IN_PROGRESS` or `SUBMITTED` (including when an admin opens).
- One open dispute per project (`OPEN` or `IN_REVIEW`). Opening writes `OPEN`. Assigned arbiter or admin starts review (`POST …/disputes/:id/review`) and writes `IN_REVIEW`.
- Freelancer and client are notified; the assigned arbiter is notified too.
- Resolve is claimed with `updateMany` so a double-click cannot pay twice.

Escrow does **not** jump to `RELEASED` after a single paid milestone. It stays `FUNDED` until **every** milestone is `PAID` or `REFUNDED`.

---

## Escrow status (`EscrowStatus`)

Parallel to project status; tracks money state (simulated in Phase 1).

| Status | When |
|--------|------|
| `NOT_FUNDED` | Draft, no deposit |
| `FUNDED` | Client funded; budget locked — **including** after some (but not all) milestones are paid or refunded |
| `RELEASED` | Project completed and at least one milestone was `PAID` |
| `REFUNDED` | Project completed and every milestone was `REFUNDED` |

---

## Action matrix

| Action | Actor | Preconditions | API | Status change |
|--------|-------|---------------|-----|---------------|
| Create project | **Client** | Logged in as client | `POST /api/projects` | → `DRAFT` |
| Edit project | **Client** | `DRAFT`, not funded, no freelancer | `PATCH /api/projects/:id` | — |
| Invite freelancer | **Client** | `DRAFT` or `FUNDED`, no freelancer | `POST …/invite` | — |
| Accept / decline invite | **Freelancer** | Pending invite | `POST …/accept` or `…/decline` | `freelancerId` set on accept |
| Fund project | **Client** | `DRAFT`, not yet funded | `POST …/fund` | Escrow → `FUNDED`; project → `FUNDED` or `IN_PROGRESS` |
| Cancel funded job | **Client** | `FUNDED`, no freelancer | `POST …/cancel` | → `CANCELLED`; escrow → `REFUNDED` |
| Apply (job board) | **Freelancer** | Public, escrow `FUNDED`, no freelancer | `POST …/apply` | — |
| Accept application | **Client** | Pending application, project still open | `POST …/applications/:id/accept` | Same assignment as invite accept |
| Submit work | **Freelancer** | Milestone `IN_PROGRESS` or `SUBMITTED` | `POST …/milestones/:id/submit` | → `SUBMITTED` (new version if already submitted) |
| Approve & release | **Client** | Milestone `SUBMITTED` | `POST …/milestones/:id/approve` | → `PAID` (no `APPROVED` row) |
| Request changes | **Client** | Milestone `SUBMITTED` | `POST …/milestones/:id/return` | → `IN_PROGRESS`; no payout |
| Open dispute | **Client** or **Freelancer** | Active/submitted milestone, no other open dispute, an arbiter exists | `POST …/disputes` | Milestone → `DISPUTED`; dispute → `OPEN` |
| Start dispute review | **Arbiter** or **Admin** | Dispute `OPEN` (idempotent if already `IN_REVIEW`) | `POST …/disputes/:id/review` | Dispute → `IN_REVIEW` |
| Resolve dispute | **Arbiter** or **Admin** | Dispute `OPEN` / `IN_REVIEW` | `POST …/disputes/:id/resolve` | See outcomes above |
| Review | Either party | Project `COMPLETED`, one review each | `POST …/reviews` | — |

### UI visibility (buttons hidden when)

| Surface | Role | Primary | Hidden when |
|---------|------|---------|-------------|
| MilestoneCard | Freelancer | Submit work / Update submission | not `IN_PROGRESS` or `SUBMITTED` |
| MilestoneCard | Client | Approve / Request changes | status ≠ `SUBMITTED` |
| Project detail | Client | Fund project | not `DRAFT` |
| Project detail | Client | Invite freelancer | freelancer already set, or not `DRAFT`/`FUNDED` |
| ProjectCard | Freelancer (pending) | Accept invite | already accepted |

---

## State diagram

### Project

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Client creates
    DRAFT --> DRAFT: Invite / Accept
    DRAFT --> FUNDED: Fund without freelancer
    DRAFT --> IN_PROGRESS: Fund with freelancer
    FUNDED --> IN_PROGRESS: Freelancer assigned
    FUNDED --> CANCELLED: Client cancels unassigned job
    IN_PROGRESS --> IN_PROGRESS: Milestone PAID or REFUNDED, more remain
    IN_PROGRESS --> COMPLETED: All milestones PAID or REFUNDED
```

### Milestone (single)

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> IN_PROGRESS: Activated
    IN_PROGRESS --> SUBMITTED: Freelancer submits
    IN_PROGRESS --> DISPUTED: Either party disputes
    SUBMITTED --> SUBMITTED: Freelancer updates
    SUBMITTED --> IN_PROGRESS: Client requests changes
    SUBMITTED --> PAID: Client approves
    SUBMITTED --> DISPUTED: Either party disputes
    DISPUTED --> PAID: Freelancer-win or SPLIT
    DISPUTED --> REFUNDED: Client-win
    PAID --> [*]
    REFUNDED --> [*]
```

---

## Notifications & activity log

| Event | `NotificationType` | Recipient |
|-------|-------------------|-----------|
| Invited to project | `PROJECT_INVITED` | Freelancer |
| Invite cancelled / displaced | `INVITE_CANCELLED` | Previous invitee |
| Invite declined | `INVITE_DECLINED` | Client |
| Application received / accepted / rejected | `APPLICATION_*` | Client or freelancer |
| Work submitted | `MILESTONE_SUBMITTED` | Client |
| Milestone approved | `MILESTONE_APPROVED` | Freelancer |
| Changes requested | `MILESTONE_CHANGES_REQUESTED` | Freelancer |
| Dispute raised | `MILESTONE_DISPUTED` | Counterparty + arbiter |
| Dispute review started | `DISPUTE_IN_REVIEW` | Client and freelancer |
| Dispute resolved | `DISPUTE_RESOLVED` | Client and freelancer |
| Payment released | `PAYMENT_RELEASED` | Freelancer |
| Review received | `REVIEW_RECEIVED` | Subject |

`ActivityLog.action` examples: `PROJECT_CREATED`, `FREELANCER_INVITED`, `FREELANCER_ACCEPTED`, `PROJECT_FUNDED`, `PROJECT_CANCELLED`, `MILESTONE_SUBMITTED`, `MILESTONE_APPROVED`, `MILESTONE_CHANGES_REQUESTED`, `MILESTONE_PAID`, `MILESTONE_DISPUTED`, `MILESTONE_REFUNDED`, `DISPUTE_IN_REVIEW`, `DISPUTE_RESOLVED`, `PROJECT_COMPLETED`.

---

## Not built yet (schema may still have the enum)

| Feature | Statuses involved | Notes |
|---------|-------------------|--------|
| Milestone `APPROVED` as a stored status | `APPROVED` | Intentional: approve goes `SUBMITTED` → `PAID` |
| Verify / KYC | `VerificationMethod`, `verifiedAt` | Seed sets `isVerified`; no KYC flow yet |
| Real escrow / wallet | `payoutTxRef` | Phase 2 (Solidity) |

Unfunded drafts are still **deleted** (not `CANCELLED`). Funded unassigned jobs cancel as above.

---

## Resolved vs still open

- Opening a dispute writes `OPEN`. The assigned arbiter starting review writes `IN_REVIEW`.
- Approve **does** skip `APPROVED` and go straight to `PAID` in one transaction.
- Freelancer may submit again while the milestone is `SUBMITTED` (new version). There is no `REVISION` status.
- Client can send a submission back to `IN_PROGRESS` with request changes (no dispute, no payout).
- Job board: `isPublic` + escrow `FUNDED` + no freelancer. Unfunded public drafts are **not** listed.

---

## Related docs

- [README](../README.md) — product overview, API, deploy
- `backend/prisma/schema.prisma` — enum definitions
