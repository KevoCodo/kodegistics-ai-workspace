# AI Workflow Automation Dashboard - Project Overview

## Project name
AI Workflow Automation Dashboard

## Purpose
Build a public, sanitized portfolio project that demonstrates how an AI-enabled workflow dashboard could be designed: workflow routing, run orchestration, execution state, validation, and observable logs/results.

This project starts with **simulated workflow execution** (no external AI calls) to keep it safe, repeatable, and GitHub-ready.

## Target audience
- Hiring managers and engineers evaluating fullstack engineering ability
- Developers interested in workflow orchestration patterns
- People who want a realistic-but-generic example of AI automation UX and backend design

## What this project demonstrates
- Fullstack TypeScript architecture (Next.js + NestJS)
- Workflow catalog and routing concepts (types, categories, inputs/outputs)
- Run lifecycle management (queued -> running -> completed/failed)
- Input validation and safe execution boundaries
- Persistent logs and results (observable, debuggable runs)
- Clean separation of concerns (UI, API, persistence, execution engine)

## What this project intentionally does not do
- No authentication/authorization in the MVP
- No billing, payments, subscriptions, or usage metering
- No multi-tenant org/team management or admin role complexity
- No real OpenAI or other external AI integration in early phases
- No private company/client data, proprietary workflows, or internal prompts
- No production-hardening guarantees (this is a portfolio demo, not a SaaS)

## Public showcase goals
- Keep all code and data **generic, sanitized, and safe** for public GitHub
- Prioritize clarity, maintainability, and developer experience over scale
- Provide an end-to-end demo: define workflows, start runs, view logs/results
- Make it easy to extend later (optional real AI connectors as a future phase)

## High-level MVP summary
The MVP is a small dashboard that lets a user:
1. Browse a catalog of predefined workflows (generic templates).
2. Start a workflow run by submitting a simple input form.
3. Observe execution state transitions and logs in real time (or near-real time).
4. View final run output (simulated) and a structured execution history.
