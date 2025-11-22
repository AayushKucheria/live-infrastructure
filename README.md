# Live Coordination Infrastructure

A prototype for **live coordination infrastructure** that enables research labs focused on pathogen detection and early biothreat detection systems to coordinate information quickly while respecting institutional constraints.

## The Problem

Research labs need to coordinate about potential biothreats quickly, but face institutional constraints (privacy, reputation, legal concerns). Current solutions are either too slow (manual coordination) or too lossy (over-sanitization).

## The Solution

Live coordination infrastructure that enables:
- **Real-time negotiation** of what to share (adapts to trust, reciprocity, urgency)
- **Context-preserving translation** across trust boundaries
- **Decentralized coordination** (no central authority)
- **Just-in-time structure** generation (not rigid protocols)

## Design Philosophy

This project embodies "Live Machinery" design principles:
- Prayer-based interfaces (informal hints interpreted by AI)
- Production post-distribution (fluid, context-sensitive)
- Peer-to-peer meaning (not centralized)
- Recontextualizing (preserve context while adapting)

See `docs/design_guidelines.md` for the full philosophy.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Documentation

- `agent.md` - Context for AI agents working on this project
- `docs/specifics.md` - Core problem and solution approach
- `docs/product_focus.md` - Hackathon context
- `docs/design_guidelines.md` - Live Machinery design philosophy
- `docs/architecture.md` - Architecture and codebase tracking

## Deploy on Vercel

This project is configured for Vercel deployment. See `docs/architecture.md` for deployment details.
