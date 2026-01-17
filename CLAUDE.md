# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a workflow automation SaaS (similar to n8n/Zapier) built with Next.js 15, featuring a visual editor for creating automated workflows with AI, HTTP, and integration nodes.

## Commands

```bash
# Development (runs Next.js with Turbopack)
npm run dev

# Run all services together (Next.js + Inngest + ngrok)
npm run dev:all

# Inngest development server (required for workflow execution)
npm run inngest:dev

# Production build
npm run build

# Linting and formatting (uses Biome)
npm run lint        # Check code quality
npm run format      # Format code
```

## Architecture

### Stack
- **Frontend**: Next.js 15 App Router, React 19, React Flow (@xyflow/react), Radix UI, Tailwind CSS 4
- **Backend**: tRPC 11, Prisma ORM, PostgreSQL, Inngest (workflow orchestration)
- **Auth**: Better Auth with GitHub/Google OAuth
- **State**: Jotai (client), React Query (server cache), nuqs (URL params)

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── (dashboard)/       # Dashboard routes group
│   ├── api/
│   │   ├── trpc/[trpc]/   # tRPC endpoint
│   │   ├── inngest/       # Inngest event handler
│   │   └── webhooks/      # External webhooks (Google Forms, Stripe)
├── features/              # Feature-based modules (self-contained)
│   ├── workflows/         # Workflow CRUD & graph
│   ├── credentials/       # Encrypted API key management
│   ├── executions/        # Execution history & node executors
│   ├── editor/            # Visual workflow editor
│   └── triggers/          # Trigger node implementations
├── trpc/
│   ├── init.ts            # Context, procedures, middleware
│   └── routers/           # Feature routers composed in _app.ts
├── inngest/
│   ├── functions.ts       # Main executeWorkflow function
│   └── channels/          # Node execution logic
└── lib/
    ├── auth.ts            # Better Auth config
    ├── db.ts              # Prisma singleton
    └── encryption.ts      # Credential encryption
```

### Key Patterns

**Feature-based Architecture**: Each feature in `src/features/` is self-contained with its own components, hooks, and server routers.

**tRPC Procedures**: Use `protectedProcedure` for authenticated routes, `premiumProcedure` for subscription-gated features.

**Executor Registry**: Node executors live in `features/executions/components/[nodeType]/executor.ts` and are registered in `executor-registry.ts`. Inngest uses this registry to execute workflow nodes.

**Workflow Execution Flow**:
1. Inngest receives `workflow.execute` event
2. Fetches workflow, runs topological sort (detects cycles)
3. Executes nodes sequentially via executor registry
4. Updates execution record with results

**Credentials**: Stored encrypted in database via `lib/encryption.ts`, decrypted server-side only.

### Database

PostgreSQL with Prisma. Key models: `User`, `Workflow`, `Node`, `Connection`, `Execution`, `Credential`.

`NodeType` enum defines available node types: `MANUAL_TRIGGER`, `HTTP_REQUEST`, `GOOGLE_FORM_TRIGGER`, `STRIPE_TRIGGER`, `ANTHROPIC`, `GEMINI`, `OPENAI`, `DISCORD`, `SLACK`, `INITIAL`.

### Adding New Node Types

1. Add type to `NodeType` enum in Prisma schema
2. Create executor in `features/executions/components/[nodeType]/executor.ts`
3. Register in `executor-registry.ts`
4. Add UI component for node configuration in editor
