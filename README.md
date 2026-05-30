# Pactum

> Open job board with milestone-based escrow for Web3 freelance work.

**Status:** In development 

**Author:** Adrian — [@thuisdev(https://github.com/thuisdev)]

## What is this

Pactum is a platform that lets clients hire freelancers for crypto-paid work with confidence:

funds are held in escrow, work is broken into milestones, and payment is released only when

each deliverable is approved. A public job board surfaces open work; reviews after completion

build pseudonymous reputation.

Phase 1 (this repo) is a Web2 application with database-simulated escrow. Phase 2,

during the upcoming Solidity module, replaces the simulated escrow with a self-authored

smart contract deployed to an Ethereum L2 testnet.

## Tech stack

- **Backend:** Node.js, Express, Prisma, PostgreSQL, JWT, Zod

- **Frontend:** React, Vite, TailwindCSS, shadcn/ui, React Router, React Hook Form

- **Infra:** Railway (hosting + managed Postgres), GitHub Actions (CI)

## Project structure

pactum/ ├── backend/      # Express + Prisma API ├── frontend/     # React + Vite SPA └── docs/         # ADRs and supporting documents

## Local development

See `docs/SETUP.md` for full instructions. Short version:

```bash

# Backend

cd backend

cp .env.example .env

npm install

npx prisma migrate dev

npm run dev

# Frontend (in a separate terminal)

cd frontend

cp .env.example .env

npm install

npm run dev

Roadmap
Week 1 — Planning, design, repo setup
Week 2 — Backend foundation + auth
Week 3 — Project + milestone core flow
Week 4 — Submission, approval, activity log
Week 5 — Public job board, polish, deploy
Phase 2 — Smart contract integration