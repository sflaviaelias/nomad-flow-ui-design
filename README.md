# Go Nomad

**A travel planning app and a hands-on product engineering learning project.**

[Live app](https://nomad-flow-ui-design.vercel.app) · [Issues and roadmap](https://github.com/sflaviaelias/nomad-flow-ui-design/issues) · [Sprint 1](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/13)

## Why this project exists

Go Nomad is an independent learning project created to explore the full journey of building a digital product, from product discovery and UX decisions to implementation, testing, data modeling and deployment.

The goal is to put product management and software engineering concepts into practice by evolving a real travel planning app in small, testable increments. The project is **not presented as a production-ready commercial service**.

> **PT-BR:** O Go Nomad é um projeto independente de estudo e desenvolvimento prático. Seu objetivo é explorar o ciclo completo de construção de um produto digital, unindo gestão de produto, UX, programação, testes, banco de dados e publicação. É um laboratório de aprendizado com um aplicativo real de planejamento de viagens.

## Product goal / Objetivo do produto

Help travelers organize upcoming trips and relevant information in one place, starting with reliable core journeys before expanding into advanced planning features.

Ajudar viajantes a organizar viagens futuras e informações importantes em um só lugar, priorizando primeiro os fluxos essenciais e sua confiabilidade.

## What works today / O que funciona hoje

- Account creation, sign-in and authenticated sessions using Supabase Auth.
- Creating, listing and viewing trips, with destination, dates and optional budget in BRL.
- Persisting trips in Supabase with Row Level Security (RLS) and per-user data isolation.
- Destination covers retrieved via a Supabase Edge Function and Unsplash, with a fallback when no verified photo is available. Coverage is still limited.
- Navigation between trip creation, trip list and details, with session-local draft restoration.
- Responsive interface, with mobile UX improvements in progress.

**PT-BR:** Já é possível criar conta, entrar, cadastrar viagens, consultar viagens salvas e visualizar detalhes. Os dados são persistidos no Supabase com isolamento por usuário. Capas de destinos estão disponíveis para parte das localidades, com fallback para casos não atendidos.

**Important:** Editing and deleting trips are not yet implemented. Some interface sections are prototypes, use placeholder content or are not connected to live services. The app does **not** currently provide a working AI travel assistant or automatic multi-currency conversion.

## Roadmap / Próximos passos

Development is tracked in [GitHub Issues](https://github.com/sflaviaelias/nomad-flow-ui-design/issues), which is the single source of truth for the backlog.

- **Sprint 1:** Improve trip management, including navigation, editing and deletion. Navigation fix [#12](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/12) was merged and validated on iPhone; editing [#10](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/10) and deletion [#11](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/11) remain open.
- **Later:** Improve destination validation/autocomplete, photo coverage, profile usability, localization and budgeting.

These are planned improvements, not claims about current functionality.

## Tech stack / Tecnologias

- **Frontend:** React, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui and Radix UI
- **Backend and authentication:** Supabase (PostgreSQL, Auth, Row Level Security and Edge Functions)
- **Server state:** TanStack Query
- **Testing:** Vitest and React Testing Library
- **Deployment:** Vercel
- **Version control and backlog:** GitHub, GitHub Issues and pull requests
- **Destination photography:** Unsplash through a Supabase Edge Function

## How it is being built / Processo de desenvolvimento

The initial interface was prototyped using **Lovable**. Development has since evolved into a GitHub-based workflow with code changes, AI-assisted development using tools such as **Codex**, code review, tests, pull requests, deployment checks and hands-on QA.

AI is used as a **development aid**, not as a claim that Go Nomad already contains functional AI-powered travel features. Tools used during prototyping or temporary events do not imply an ongoing technical dependency or endorsement.

O projeto começou como um protótipo no Lovable e evoluiu para um fluxo de desenvolvimento com GitHub, Codex, revisão de código, testes, PRs e validação manual. O uso de IA faz parte do processo de aprendizado e desenvolvimento, não significa que o aplicativo ofereça hoje um assistente de IA funcional.

## Local development / Desenvolvimento local

Requirements: Node.js and npm.

```bash
git clone https://github.com/sflaviaelias/nomad-flow-ui-design.git
cd nomad-flow-ui-design
npm install
npm run dev
```

Other commands:

```bash
npm test
npm run build
npm run lint
```

Supabase-backed flows require a correctly configured development environment. Do not commit credentials or secrets.

### Branch and release workflow

- `main` is the repository's default branch.
- `dev/incremental-rls-deploy` is currently the source branch for the Vercel deployment.
- Changes to application behavior should be reviewed and tested through feature branches and pull requests before merging.

## Learning goals / Objetivos de aprendizado

- Translate user needs and UX findings into actionable product requirements.
- Learn how frontend, authentication, APIs and databases work together.
- Practice secure data access, integration design and end-to-end testing.
- Improve engineering collaboration through code reviews, issues and incremental releases.
- Understand the real cost and trade-offs of building and maintaining software.

## Project status / Estado do projeto

**Active learning project, iteratively developed.** Features, screenshots and implementation details may change as the product evolves.

**Projeto de estudo ativo, desenvolvido de forma incremental.** O README é revisado quando uma funcionalidade importante ou sprint é concluída.

## Author / Autoria

Created and maintained by [Flávia Elias](https://github.com/sflaviaelias), Product Manager.

---

*Go Nomad is an independent learning project. Lovable, Codex, Supabase, Vercel and Unsplash are tools/services used during its development, not co-authors or sponsors.*
