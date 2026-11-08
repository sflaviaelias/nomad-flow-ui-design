# Go Nomad

**An early-stage, mobile-first travel companion concept for remote workers, developed as a hands-on product engineering learning project.**

[Live app](https://nomad-flow-ui-design.vercel.app) · [Issues and roadmap](https://github.com/sflaviaelias/nomad-flow-ui-design/issues) · [Sprint 1](https://github.com/sflaviaelias/nomad-flow-ui-design/issues/13)

## Why this project exists

**Product purpose.** Go Nomad is designed for people who want to travel without putting their work on hold. Planning a trip while working remotely requires more than destinations, dates and budgets: travelers need to understand where they can actually work, whether accommodation is suitable for calls, how reliable the internet is, and how to fit exploration around their work schedule.

**Project history and learning purpose.** Go Nomad began around 2025 as an early prototype, was paused, and was resumed in 2026 with a more structured development approach: version control, a prioritized GitHub backlog, incremental changes, automated tests, pull requests and hands-on QA. It is also an independent learning project exploring product discovery, UX, engineering, data modeling and deployment. It is **not a publicly launched or production-ready service**.

> **PT-BR:** O Go Nomad é pensado para quem quer viajar sem deixar de trabalhar. A proposta é apoiar decisões práticas da rotina remota dentro do contexto de cada viagem: onde ficar, onde trabalhar, como avaliar internet e ambiente e como aproveitar o destino nos horários livres. O projeto começou por volta de 2025 como um protótipo, ficou pausado e foi retomado em 2026 com uma estrutura mais organizada de desenvolvimento, testes, PRs e gestão do backlog. Continua sendo um projeto de estudo, ainda não lançado publicamente como produto.

## Product goal / Objetivo do produto

**Help remote workers plan trips around the realities of their work, not the other way around.**

Unlike a general travel itinerary app, Go Nomad aims to connect travel planning with the needs of someone working from another city or country. A user's destination, travel dates, work routine and available time should guide what information and recommendations are relevant.

**Illustrative use cases, part of the product vision (not yet implemented):**

- **Remote-work-friendly accommodation:** understand whether an Airbnb or other stay has a desk, a quiet environment, suitable space for video calls and reliable connectivity.
- **Work-friendly cafés and places:** identify whether remote work is permitted, whether there is a time limit or minimum consumption, access to outlets, noise level and Wi-Fi quality.
- **Connectivity confidence:** assess whether the connection is sufficient for video calls and day-to-day work, with transparent sources rather than unsupported claims.
- **Travel around work:** suggest activities and experiences for evenings, weekends and free hours when the person works Monday through Friday.
- **Trip-specific context:** prioritize information relevant to the actual destination and dates rather than offer a generic directory of places.

**PT-BR:** A proposta não é ser apenas um aplicativo para registrar viagens ou montar roteiros turísticos. É ajudar pessoas que trabalham remotamente a conciliar trabalho e viagem, com ferramentas e informações contextualizadas para o destino e a rotina de cada viagem. Isso pode servir tanto a nômades digitais quanto a quem faz uma viagem temporária sem tirar férias.

## Target experience and platform / Experiência e plataforma pretendidas

**The long-term goal is a mobile application**, designed for the on-the-go needs of remote workers. The current prototype is a **responsive web app**, accessible on mobile browsers, and is **not yet a native iOS or Android application**. Any future mobile implementation and distribution will depend on validation and technical decisions.

**PT-BR:** A intenção é que o Go Nomad evolua para um **aplicativo mobile**, pensado para uso durante as viagens. Hoje, porém, a implementação é uma **aplicação web responsiva**, acessível pelo navegador do celular, e não um aplicativo nativo para iOS ou Android.

## What works in the current prototype / O que funciona no protótipo atual

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
- **Later, foundational improvements:** Improve destination validation/autocomplete, photo coverage, profile usability, localization and budgeting.
- **Long-term product vision (not implemented):** Work-friendly accommodation and café information, connectivity and workspace suitability, constraints such as minimum consumption or time limits, and context-aware suggestions for free time around a remote-work schedule. Data sources, verification and feasibility are still to be defined.

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

**Early-stage learning prototype, resumed in 2026 after a pause. Not publicly launched as a finished product.** Features, screenshots and implementation details may change as the product evolves.

**Protótipo em desenvolvimento, retomado em 2026 após uma pausa, ainda não lançado como produto final.** O README é revisado quando uma funcionalidade importante ou sprint é concluída.

## Author / Autoria

Created and maintained by [Flávia Elias](https://github.com/sflaviaelias), Product Manager.

---

*Go Nomad is an independent learning project. Lovable, Codex, Supabase, Vercel and Unsplash are tools/services used during its development, not co-authors or sponsors.*
