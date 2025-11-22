# Architecture & Codebase Tracking

## Project: Live Coordination Infrastructure

**Status**: Prototype (Draft One)  
**Framework**: Next.js 16 (App Router)  
**Deployment**: Vercel

## Current Structure

```
live-infrastructure/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── docs/
│   ├── specifics.md           # Core problem & solution
│   ├── product_focus.md       # Hackathon context
│   ├── design_guidelines.md   # Live Machinery philosophy
│   └── architecture.md        # This file
├── public/               # Static assets
├── agent.md             # Agent context documentation
└── package.json         # Dependencies
```

## Design Principles (from Live Machinery)

### Core Principles
1. **Prayer-based**: Informal hints/wishes interpreted by AI
2. **Non-modular**: Production post-distribution
3. **Seamless**: Minimal flow disruption
4. **Pluralistic**: Different views for different users
5. **Recontextualizing**: Preserve context while adapting

### What We're Building
- Real-time negotiation interface for information sharing
- Context-preserving translation across trust boundaries
- Adaptive sharing based on trust/reciprocity/urgency
- Decentralized coordination (no central authority)
- Just-in-time structure generation

## Implementation Notes

### Key Features to Implement
- [ ] Lab/organization profiles with trust/constraint settings
- [ ] Real-time negotiation interface for sharing requests
- [ ] Context-preserving message translation/adaptation
- [ ] Trust and reciprocity tracking
- [ ] Urgency-based prioritization
- [ ] Privacy-preserving information flow

### Technical Considerations
- Need to handle real-time updates (WebSockets or similar)
- AI integration for context-preserving translation
- Privacy-preserving data handling
- Trust/reputation system
- Decentralized architecture (no central database?)

## Vercel Deployment

This project is configured for Vercel deployment. Track deployment status and environment variables here:

- **Production URL**: [To be added]
- **Environment Variables**: [To be configured]

