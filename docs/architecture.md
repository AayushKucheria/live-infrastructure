# Architecture & Codebase Tracking

## Project: Live Coordination Infrastructure

**Status**: Draft One - Core Features Implemented  
**Framework**: Next.js 16 (App Router)  
**Language**: TypeScript  
**Styling**: Tailwind CSS  
**Storage**: Client-side (localStorage)  
**Deployment**: Vercel

## Current Structure

```
live-infrastructure/
├── app/
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page (lab selection)
│   ├── globals.css                   # Global styles
│   ├── components/
│   │   ├── LabSelector.tsx           # Lab selection interface
│   │   ├── ThreatBubbleCard.tsx      # Display threat bubbles
│   │   ├── ThreatBubbleForm.tsx      # Create threat bubble form
│   │   └── CommunicationChannel.tsx  # Communication interface
│   ├── lab/
│   │   └── [labId]/
│   │       ├── page.tsx              # Lab dashboard
│   │       └── create-threat/
│   │           └── page.tsx          # Create threat bubble flow
│   ├── threat/
│   │   └── [threatId]/
│   │       ├── page.tsx              # View threat bubble + relevant bubbles
│   │       └── communicate/
│   │           └── page.tsx          # Communication channel interface
│   └── lib/
│       ├── mockData.ts               # Mock labs, situations, threat bubbles
│       ├── storage.ts                 # localStorage utilities
│       └── matching.ts                # Relevance matching algorithm
├── docs/
│   ├── specifics.md           # Core problem & solution
│   ├── product_focus.md       # Hackathon context
│   ├── design_guidelines.md  # Live Machinery philosophy
│   └── architecture.md       # This file
├── public/                   # Static assets
├── agent.md                  # Agent context documentation
└── package.json              # Dependencies
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

## Implementation Status

### ✅ Implemented Features (Draft One)

#### Core Functionality
- [x] **Lab Selection**: Users can join as one of 5 national biosecurity agencies with predefined situations
- [x] **Threat Bubble Creation**: Form-based creation with privacy levels (high/medium/low)
- [x] **Privacy Filtering**: Details shown/hidden based on selected privacy level
- [x] **Threat Bubble Feed**: View created bubbles and relevant bubbles from other labs
- [x] **Relevance Matching**: Simple algorithm matching by location, method, urgency, timeline, keywords
- [x] **Communication Channels**: Interface for requesting info, sending info, conditional flows

#### Data Models
- **Lab**: id, name, situation, location, type
- **ThreatBubble**: id, labId, description, location, detectionMethod, timeline, urgency, privacyLevel, createdAt, detailedFindings, specificLocation, sampleCount, geneticMarkers
- **CommunicationChannel**: id, threatBubbleId, participants, messages (with type: request/send/conditional)

#### Technical Implementation
- Client-side storage using localStorage (no backend required for draft)
- Mock data for labs and initial threat bubbles
- Simple keyword/location/urgency-based matching algorithm
- Responsive UI with dark mode support
- TypeScript for type safety

### 🔄 Future Enhancements

#### Planned Features
- [ ] Real-time updates (WebSockets or similar)
- [ ] AI integration for context-preserving translation
- [ ] Trust and reciprocity tracking
- [ ] More sophisticated matching algorithm
- [ ] Backend API for persistent storage
- [ ] User authentication (optional, currently no login required)
- [ ] Advanced conditional information flows with game theory considerations

### Technical Considerations
- Current: Client-side only (localStorage) - suitable for prototype/demo
- Future: Backend API needed for production
- Future: Real-time coordination requires WebSocket or similar
- Future: AI integration for adaptive privacy/context preservation

## Key Features Overview

### Lab Selection Flow
1. User lands on homepage and sees 5 national biosecurity agencies
2. Each agency has a predefined situation (e.g., "Detected unusual pattern in wastewater")
3. User selects an agency to "join as" (stored in localStorage)
4. Redirects to lab dashboard

### Available Labs (National Biosecurity Agencies)
- **india-niv**: National Institute of Virology (NIV) - Pune, India - National Biosecurity Agency
- **uk-ukhsa**: UK Health Security Agency (UKHSA) - London, UK - National Public Health Agency
- **us-cdc**: US Centers for Disease Control and Prevention (CDC) - Atlanta, USA - National Public Health Agency
- **singapore-ncid**: National Centre for Infectious Diseases (NCID) - Singapore - National Infectious Disease Center
- **brazil-fiocruz**: Fiocruz - Oswaldo Cruz Foundation - Rio de Janeiro, Brazil - National Health Research Institute

### Threat Bubble Creation
1. From lab dashboard, user can create a threat bubble
2. Form includes: description, location, detection method, timeline, urgency, privacy level
3. Privacy level determines what additional details are shown:
   - **High**: Bare minimum (description, location, method, timeline)
   - **Medium**: Adds specific location and detailed findings
   - **Low**: Full details including sample count and genetic markers
4. Created bubble is stored in localStorage

### Threat Bubble Viewing
1. View individual threat bubble with full details (filtered by privacy level)
2. Sidebar shows relevant threat bubbles from other labs
3. Relevance matching based on:
   - Location similarity
   - Detection method match
   - Urgency level
   - Timeline proximity
   - Keyword matching in descriptions
   - Genetic marker overlap (if available)

### Communication Channels
1. From any threat bubble (not your own), can start a communication channel
2. Three message types:
   - **Request Information**: Ask for specific details
   - **Send Information**: Share information proactively
   - **Conditional Flow**: Set up conditional exchange (e.g., "I'll share X if you share Y")
3. Message history displayed in conversation format

## Vercel Deployment

This project is configured for Vercel deployment. Track deployment status and environment variables here:

- **Production URL**: [To be added]
- **Environment Variables**: [To be configured - none required for current draft]

