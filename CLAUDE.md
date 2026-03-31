# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev

# Build (generates Prisma client first, then Next.js build)
bun run build

# Local build (skips Prisma generate)
bun run build_local

# Lint
bun run lint

# Seed the database
bun run seed
```

There are no automated tests in this project.

## Architecture Overview

**TailorCV** is a Next.js 15 App Router SaaS application that uses AI to generate tailored CVs from job offers. Users provide a job posting (text, PDF, or image), an optional CV template, and their profile data — the AI generates a complete HTML CV styled to the job.

### Core CV Generation Flow

The central flow lives in `src/app/generar-cv/page.tsx` and orchestrates:

1. **`CVHandler`** (`src/app/Handler/CVHandler.ts`) — The main business logic class. All CV operations go through it:
   - `crearCV()` — orchestrates the full pipeline: extracts info from file if needed, fetches/converts the PDF template to HTML via Gemini, then calls `generarCVAdaptado()`.
   - `generarCVAdaptado()` — sends system + user prompts to the AI fallback chain and returns HTML.
   - `analyzeCV()` — scores and analyzes a CV against a job title/industry, returns structured JSON.
   - File-to-base64 conversion and prompt-building are encapsulated here.

2. **`/api/ai` route** (`src/app/api/ai/route.ts`) — The AI gateway used by `CVHandler`. Accepts `messages`, `provider`, and `modelId`. Tries the requested provider first, then falls back through `openrouter → groq → deepseek → gemini`. OpenAI clients are **module-level singletons**.

3. **All prompts** are centralized in `src/app/utils/cv-prompts.ts` — edit prompts only there.

4. **Gemini** (via `@google/generative-ai`) is used **directly** (not through `/api/ai`) for multimodal tasks: extracting info from PDF/image job offers and converting PDF templates to HTML. The text-generation fallback chain uses the OpenAI-compatible SDK interface.

### Database & Data Layer

- **MySQL** via **Prisma** (`prisma/schema.prisma`). Models: `User`, `WorkExperience`, `Skill`, `Education`, `SocialLink`, `CvPreferences`, `Subscription`, `PaymentMethod`, `SubscriptionPlan`.
- The Prisma singleton is in `src/lib/utils.ts` — import `prisma` from there everywhere, never instantiate `PrismaClient` directly.
- Query logging (`log: ["query"]`) is **dev-only**.
- Each entity has its own Handler class in `src/app/Handler/PrismaHandler/` implementing a `BaseHandler<T>` interface. These are instantiated per-route (not singletons).
- All CRUD API routes follow the pattern `src/app/api/apiHandler/<entity>/[id]/route.ts`.

### Authentication

NextAuth.js (`src/app/api/auth/[...nextauth]/route.ts`) with three providers:
- **Credentials** — email/password with bcrypt, rate-limited by IP via `AuthHandler`.
- **Google OAuth** / **LinkedIn OAuth** — auto-creates DB user on first login with default `CvPreferences`.

The session uses **JWT strategy** (30-day expiry). The JWT stores `userId`, `phone`, `location`, `profilePicture`, `stripeCustomerId`. The `Session` type is augmented and exported from the NextAuth route — import it from there when you need the extended type.

### State Management

Two layers coexist:
- **Zustand store** (`useStore` from `src/app/context/AppContext.tsx`) — persists `templateId` to localStorage. Holds `user`, `template` (full CV HTML string), `templateId`, `authOpen`.
- **React Context** (`useAppContext`) — wraps the same Zustand values for legacy consumers. Prefer `useStore()` directly in new code to benefit from Zustand's selective subscriptions and avoid re-renders when the full `template` HTML changes.

### i18n

Custom lightweight system in `src/app/context/I18nContext.tsx`. Supported locales: `en`, `es`, `fr`, `zh`. Translation files live in `public/locales/<locale>/common.json`. The `locale` string is also passed into AI prompts so generated CVs match the user's language. Use `useI18n()` hook to access `t(key)` and `locale`.

### CV Templates

Templates are PDF files stored on the **filesystem** at `public/templates/` (not in the database). The `/api/templates` route reads this directory directly. When a template is selected for CV generation, Gemini converts the PDF to an HTML structure that becomes the visual scaffold for the AI-generated CV.

### Payments

Stripe integration (`src/lib/stripe.ts`) handles subscriptions. Webhook handler at `/api/stripe/webhook`. Plans are seeded via `prisma/seed-subscriptions.js`.

### Key Environment Variables

```
DATABASE_URL_LOCAL_MYSQL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET
OPENROUTER_API_KEY
GROQ_API_KEY
DEEPSEEK_API_KEY
GEMINI_API_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY / NEXT_PUBLIC_API_STRIPE_PUBLIC_KEY (client publishable key) / STRIPE_WEBHOOK_SECRET
APP_URL
RESEND_API_KEY
```

### Page Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/generar-cv` | Main CV generator + CV analysis tool |
| `/templates` | Browse & manage CV template PDFs |
| `/profile` | User profile (personal info, work, skills, education, social links) |
| `/plans` | Subscription plans |
| `/auth/login`, `/auth/register` | Auth pages |

### UI Conventions

- Component library: **shadcn/ui** (Radix primitives + Tailwind), configured in `components.json`. UI primitives are in `src/components/ui/`.
- Heavy editor components (`CanvaEditor` / GrapesJS, `AnalysisResults`) are loaded with `next/dynamic` + `ssr: false` to avoid SSR issues.
- The `generar-cv` page layout is a fixed `h-screen` split: 30% left accordion panel (scrolls internally), 70% right preview canvas (scrolls internally). Do not add `min-h-screen` or outer scroll to this page.
- All AI prompts produce plain HTML with inline CSS — no Tailwind in generated CVs.
