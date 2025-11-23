# Live Coordination Infrastructure - Agent Context

## Project Overview

This is a prototype for **live coordination infrastructure** that enables research labs focused on pathogen detection and early biothreat detection systems to coordinate information quickly while respecting institutional constraints.

## Core Problem

Research labs face a fundamental tension when coordinating about potential biothreats:

- **Time-sensitive**: Early detection requires fast information sharing
- **Institutional constraints**: Privacy, reputation, legal concerns, bioweapon concerns, economic impact
- **Current solutions fail**:
  - **Too slow**: Manual coordination, lawyers, formal agreements → too late
  - **Too lossy**: Over-sanitization, generic indicators → miss critical connections
  - **Centralized**: Single point of failure, privacy concerns

## The Solution: Live Machinery

We're building coordination infrastructure that is:

1. **Fast AND smart AND decentralized**
2. **Real-time negotiation**: What gets shared adapts based on:
   - Who's asking
   - Trust level
   - Reciprocity (what they've shared)
   - Urgency
   - Relevance to their infrastructure
3. **Context-preserving**: Sanitization adapts to recipient, not one-size-fits-all
4. **Just-in-time structure**: No pre-defined protocols, generated based on parties involved
5. **No central authority**: Peer-to-peer coordination

## Design Philosophy: Live Machinery

This project embodies the "Live Machinery" design philosophy (see `docs/design_guidelines.md`):

- **Prayer-based**: Informal hints/wishes ("prayers") that AI interprets contextually
- **Non-modular**: Production happens post-distribution, not pre-packaged
- **Seamless**: Minimal disturbance to user flow
- **Pluralistic**: Different views/interpretations for different users
- **Recontextualizing**: Preserves context while adapting to recipient needs

## Example Scenario

**Party A (Indian biotech lab)**: Detects unusual pattern in local wastewater samples - possible novel pathogen, but not sure, don't want to cause panic

**Party B (UK NHS genomics)**: Has seen similar genetic markers in respiratory illness cases, but assumed it was flu variant

**Party C (US CDC)**: Has modeling suggesting something should be emerging but no concrete data

Each has pieces valuable to others, but also reasons to be cautious. The system enables them to:
- Negotiate what to share in real-time
- Preserve context while respecting privacy
- Adapt sharing based on trust/reciprocity
- Coordinate without losing meaning

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Project Structure

```
live-infrastructure/
├── app/                      # Next.js app directory
│   ├── components/           # React components
│   │   ├── LabSelector.tsx
│   │   ├── ThreatBubbleCard.tsx
│   │   ├── ThreatBubbleForm.tsx
│   │   └── CommunicationChannel.tsx
│   ├── lab/[labId]/         # Lab dashboard routes
│   ├── threat/[threatId]/   # Threat bubble routes
│   └── lib/                  # Utilities
│       ├── mockData.ts       # Mock labs and threat bubbles
│       ├── storage.ts        # localStorage utilities
│       └── matching.ts       # Relevance matching algorithm
├── docs/                     # Project documentation
│   ├── specifics.md          # Core problem and solution
│   ├── product_focus.md      # Hackathon context
│   ├── design_guidelines.md  # Live Machinery philosophy
│   └── architecture.md       # Architecture and implementation details
├── agent.md                  # This file - agent context
└── README.md                 # Project setup
```

## Key Documents

- `docs/specifics.md`: Core problem statement and solution approach
- `docs/product_focus.md`: Context from the Defensive Acceleration Hackathon
- `docs/design_guidelines.md`: Comprehensive Live Machinery design philosophy

## Development Principles

1. **Live over lazy**: Design for fluid, context-sensitive interfaces, not rigid forms
2. **Prayer-based**: Use informal hints that AI interprets, not formal schemas
3. **Peer-to-peer**: Decentralized meaning, not centralized authority
4. **Context-preserving**: Recontextualize rather than decontextualize
5. **Just-in-time**: Generate structure based on context, not pre-defined protocols

## Current Status

**Draft One Complete** - Core features implemented:

- ✅ Lab selection interface (5 mock labs with predefined situations)
- ✅ Threat bubble creation with privacy levels (high/medium/low)
- ✅ Threat bubble viewing with relevance matching
- ✅ Communication channels (request/send/conditional flows)
- ✅ Client-side storage (localStorage)
- ✅ Simple relevance matching algorithm

The prototype demonstrates the core coordination flow: labs can create threat bubbles, view relevant bubbles from other labs, and initiate communication channels. Privacy levels control information visibility. All data is stored client-side for the draft version.

See `docs/architecture.md` for detailed implementation status and future enhancements.

