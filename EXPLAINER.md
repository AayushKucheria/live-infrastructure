# Live Coordination Infrastructure - Application Explainer

## Overview

This application is a prototype for **live coordination infrastructure** that enables research labs focused on pathogen detection and early biothreat detection to coordinate information quickly while respecting institutional constraints (privacy, reputation, legal concerns).

### The Core Problem

Research labs face a fundamental tension when coordinating about potential biothreats:
- **Time-sensitive**: Early detection requires fast information sharing
- **Institutional constraints**: Privacy, reputation, legal concerns, bioweapon concerns, economic impact
- **Current solutions fail**:
  - **Too slow**: Manual coordination, lawyers, formal agreements → too late
  - **Too lossy**: Over-sanitization, generic indicators → miss critical connections
  - **Centralized**: Single point of failure, privacy concerns

### The Solution

Live coordination infrastructure that enables:
- **Real-time negotiation** of what to share (adapts to trust, reciprocity, urgency)
- **Context-preserving translation** across trust boundaries
- **Decentralized coordination** (no central authority)
- **Just-in-time structure** generation (not rigid protocols)

### Design Philosophy: Live Machinery

This application embodies the "Live Machinery" design philosophy, which emphasizes:
- **Prayer-based**: Informal hints/wishes ("prayers") that AI interprets contextually
- **Non-modular**: Production happens post-distribution, not pre-packaged
- **Seamless**: Minimal disturbance to user flow
- **Pluralistic**: Different views/interpretations for different users
- **Recontextualizing**: Preserves context while adapting to recipient needs

---

## Application Flows and Screens

### 1. Landing Page (Lab Selection) - `/`

**What happens:**
- User sees a grid of 5 national biosecurity agencies:
  - National Institute of Virology (NIV) - India
  - UK Health Security Agency (UKHSA) - United Kingdom
  - US Centers for Disease Control and Prevention (CDC) - United States
  - National Centre for Infectious Diseases (NCID) - Singapore
  - Fiocruz - Oswaldo Cruz Foundation - Brazil
- Currently, only NIV (India) is selectable (controlled by `PRIMARY_LAB_ID` constant)
- Other labs are shown but disabled (grayed out) to demonstrate the multi-lab world
- Clicking on NIV stores the selection in localStorage and redirects to the lab dashboard

**Why this design:**
- **Pluralistic view**: Shows the multi-stakeholder nature of the coordination problem
- **Single-user focus**: Only one lab is playable to keep the prototype focused on the core coordination flow
- **Context setting**: Immediately shows users they're joining a world with multiple labs already active
- **No authentication**: Simplifies the prototype - users "join as" a lab rather than logging in

**Technical implementation:**
- Component: `app/components/LabSelector.tsx`
- Uses `MOCK_LABS` from `app/lib/mockData.ts`
- Stores selection via `setCurrentLab()` in localStorage
- Redirects to `/lab/[labId]` route

---

### 2. Lab Dashboard - `/lab/[labId]`

**What happens:**
- Displays the selected lab's name, location, and type
- Shows a "Create Abnormality Bubble" button
- Lists all abnormality bubbles associated with this lab:
  - User-created bubbles (stored in localStorage)
  - Pre-defined mock bubbles (from `MOCK_ABNORMALITY_BUBBLES`)
- Each bubble is displayed as a card with description, location, detection method, timeline, and urgency
- User-created bubbles can be deleted (mock bubbles cannot)
- "Switch Lab" button clears the current lab selection and returns to landing page

**Why this design:**
- **Immediate context**: Shows the lab's existing abnormality bubbles so the world feels "alive"
- **Mixed data sources**: Combines user-created and mock data to demonstrate the coordination ecosystem
- **Ownership clarity**: Distinguishes between user-created and pre-existing bubbles
- **Simple navigation**: Direct path to create new bubbles or view existing ones

**Technical implementation:**
- Route: `app/lab/[labId]/page.tsx`
- Loads bubbles from both `getAbnormalityBubbles()` (localStorage) and `MOCK_ABNORMALITY_BUBBLES`
- Uses `AbnormalityBubbleCard` component to display bubbles
- Validates that user is joined as the correct lab before showing dashboard

---

### 3. Create Abnormality Bubble - `/lab/[labId]/create-abnormality`

**What happens:**
- Two-column layout:
  - **Left column**: Free-form text input with AI assistance
  - **Right column**: Live preview of structured data being extracted
- User selects privacy level (High/Medium/Low) which controls what details are shared
- User types or pastes a free-form description of an abnormality
- AI analyzes the text in real-time (debounced after 1 second of no typing):
  - Extracts structured fields: description, location, detection method, timeline, urgency
  - Generates AI suggestions for additional context
- "🎲 Roll Random Situation" button inserts a curated sample prompt
- User can add "clarification annotations" to specific sections
- Preview shows how the data will be structured and what will be visible at the selected privacy level
- On save, creates the abnormality bubble and redirects to its detail page

**Why this design (Live Machinery principles):**
- **Prayer-based input**: User writes in natural language ("prayers") rather than filling rigid forms
- **Production post-distribution**: The structure is generated just-in-time from free-form input, not pre-defined
- **Seamless flow**: AI analysis happens in the background without interrupting typing
- **Recontextualizing**: Privacy level adapts what's shown without losing the original context
- **Pluralistic**: Different privacy levels create different views of the same information

**Technical implementation:**
- Route: `app/lab/[labId]/create-abnormality/page.tsx`
- Components:
  - `FreeFormAbnormalityInput`: Handles text input and triggers AI analysis
  - `PostFormalArtifactEditor`: Shows structured preview and allows editing
  - `AISuggestionBubbles`: Displays AI-generated suggestions
- AI endpoints:
  - `/api/openrouter/analyze-abnormality`: Extracts structured data from free-form text
  - `/api/openrouter/generate-suggestions`: Generates contextual suggestions
- Debounced analysis (1 second) to avoid excessive API calls
- Stores final bubble in localStorage via `saveAbnormalityBubble()`

---

### 4. Abnormality Detail & Canvas View - `/abnormality/[abnormalityId]`

**What happens:**
- Displays the abnormality bubble in an interactive canvas interface
- **Main abnormality**: Centered on the canvas, showing full details
- **Suggested abnormalities**: 2-3 AI-recommended bubbles from other labs, shown as draggable cards
- **Library panel**: Floating dock containing all other abnormality bubbles
- User can:
  - Drag suggested bubbles onto the canvas to explore connections
  - Click "Why Relevant?" on connections to see AI-generated explanations
  - Drag bubbles from the library onto the canvas
  - Create connections between bubbles to analyze relationships
- If viewing another lab's abnormality, shows "Open Communication Channel" button
- Canvas supports zoom, pan, and drag-and-drop interactions

**Why this design:**
- **Visual sensemaking**: Canvas allows users to spatially organize and explore relationships
- **AI-assisted discovery**: Suggested bubbles use AI to find relevant connections automatically
- **Non-modular exploration**: Users can freely arrange and connect bubbles without rigid structure
- **Context preservation**: Connections show explanations that preserve why bubbles are related
- **Seamless interaction**: Drag-and-drop feels natural, not like filling forms

**Technical implementation:**
- Route: `app/abnormality/[abnormalityId]/page.tsx`
- Component: `AbnormalityConnectionCanvas` (complex canvas with drag-and-drop)
- AI endpoint: `/api/openrouter/find-relevant-bubbles` finds top 3 relevant bubbles
- AI endpoint: `/api/openrouter/explain-match` explains why two bubbles are connected
- Uses `@dnd-kit/core` for drag-and-drop
- Uses `react-zoom-pan-pinch` for canvas navigation
- Loads bubbles from both localStorage and mock data

---

### 5. Communication Channel - `/abnormality/[abnormalityId]/communicate`

**What happens:**
- Opens a communication interface with another lab about a specific abnormality bubble
- Shows the abnormality bubble context at the top
- Displays message history (if any) in a conversation format
- User can send three types of messages:
  - **Request Information**: Ask for specific details
  - **Send Information**: Share information proactively
  - **Conditional Flow**: Set up conditional exchange (e.g., "I'll share X if you share Y")
- Messages are color-coded by type (blue for request, green for send, purple for conditional)
- Each message shows sender lab, type, timestamp, and content
- Conditional messages include the conditions in a highlighted box

**Why this design:**
- **Real-time negotiation**: Three message types enable different coordination strategies
- **Context-preserving**: Abnormality context is always visible during communication
- **Conditional flows**: Enables game-theory-like negotiation without rigid protocols
- **Seamless**: Conversation format feels natural, not like formal documentation
- **Pluralistic**: Different message types create different interaction patterns

**Technical implementation:**
- Route: `app/abnormality/[abnormalityId]/communicate/page.tsx`
- Component: `CommunicationChannel`
- Stores messages in localStorage via `saveCommunicationChannel()`
- Prevents communication with own bubbles (redirects to view page)
- Supports query parameter `?target=[bubbleId]` to communicate about a different bubble

---

### 6. Threat Pages (Similar Structure)

**What happens:**
- Similar structure to abnormality pages but for "threat" entities
- Routes: `/threat/[threatId]` and `/threat/[threatId]/communicate`
- Currently appears to be a parallel system to abnormalities
- Uses similar canvas and communication channel components

**Why this design:**
- **Conceptual separation**: Threats might represent different types of concerns than abnormalities
- **Consistent patterns**: Reuses the same interaction patterns for familiarity
- **Future extensibility**: Allows for different entity types in the coordination system

---

## Key Components Deep Dive

### FreeFormAbnormalityInput

**Purpose**: Allows users to describe abnormalities in natural language

**Features:**
- Large textarea for free-form input
- "🎲 Roll Random Situation" button that inserts curated sample prompts
- Real-time AI analysis (debounced) that extracts structured data
- Shows "Analyzing..." indicator while processing
- Triggers suggestion generation after analysis

**Why**: Embodies "prayer-based" design - users write naturally, AI interprets

---

### PostFormalArtifactEditor

**Purpose**: Shows and allows editing of structured data extracted from free-form input

**Features:**
- Live preview of structured fields
- Privacy level filtering (shows/hides fields based on level)
- Clarification annotations (users can add context to specific sections)
- Editable fields that update the structured data

**Why**: "Production post-distribution" - structure is generated from informal input, not pre-defined

---

### AbnormalityConnectionCanvas

**Purpose**: Interactive canvas for exploring relationships between abnormalities

**Features:**
- Zoom and pan navigation
- Drag-and-drop bubbles onto canvas
- Connection lines between bubbles
- "Why Relevant?" buttons that expand to show AI explanations
- Floating dock with library of all bubbles
- Magic node in center for AI-assisted suggestions

**Why**: 
- **Non-modular**: Free-form spatial organization
- **Seamless**: Natural drag-and-drop interaction
- **AI-assisted**: Automatically suggests relevant connections

---

### CommunicationChannel

**Purpose**: Enables coordination between labs about specific abnormalities

**Features:**
- Three message types (request, send, conditional)
- Conversation history display
- Color-coded message types
- Conditional flow support with condition fields

**Why**: 
- **Real-time negotiation**: Flexible message types enable adaptive coordination
- **Context-preserving**: Always shows abnormality context
- **Just-in-time structure**: No pre-defined protocols, just message types

---

## AI Integration

### AI Endpoints

1. **`/api/openrouter/analyze-abnormality`**
   - Extracts structured data from free-form text
   - Returns: description, location, detection method, timeline, urgency, and optional detailed fields

2. **`/api/openrouter/generate-suggestions`**
   - Generates contextual suggestions based on free-form input
   - Returns: Array of suggestion objects with text, category, and priority

3. **`/api/openrouter/find-relevant-bubbles`**
   - Finds most relevant abnormality bubbles from other labs
   - Uses semantic analysis of descriptions, locations, methods, urgency, timeline, genetic markers
   - Returns: Top 2-3 bubbles with relevance scores and explanations

4. **`/api/openrouter/explain-match`**
   - Explains why two abnormality bubbles are connected
   - Returns: Natural language explanation of the relationship

5. **`/api/openrouter/analyze-threat`** (for threat entities)
   - Similar to analyze-abnormality but for threat entities

**Why AI integration:**
- **Autostructuring**: AI converts informal input to structured data
- **Context-sensitive matching**: Finds relevant connections that humans might miss
- **Just-in-time generation**: Structure is created when needed, not pre-defined
- **Recontextualizing**: AI explanations preserve context while adapting to different views

---

## Data Models

### Lab
```typescript
{
  id: string;
  name: string;
  situation: string;  // Predefined situation description
  location: string;
  type: string;
}
```

### AbnormalityBubble
```typescript
{
  id: string;
  labId: string;
  description: string;
  location: string;
  detectionMethod: string;
  timeline: string;
  urgency: 'low' | 'medium' | 'high';
  privacyLevel: 'high' | 'medium' | 'low';
  createdAt: string;
  // Optional fields (filtered by privacy level):
  detailedFindings?: string;
  specificLocation?: string;
  sampleCount?: number;
  geneticMarkers?: string[];
  rawFreeformInput?: string;  // Original free-form text
  clarifications?: ClarificationAnnotation[];
}
```

### CommunicationChannel
```typescript
{
  id: string;
  abnormalityBubbleId: string;
  participants: string[];  // Array of labIds
  messages: Array<{
    id: string;
    fromLabId: string;
    type: 'request' | 'send' | 'conditional';
    content: string;
    timestamp: string;
    conditions?: string;  // For conditional flows
  }>;
}
```

---

## Storage Strategy

**Current Implementation**: Client-side only (localStorage)

**Why:**
- Prototype/demo purposes - no backend required
- Fast iteration and development
- Suitable for demonstrating the coordination flow

**What's stored:**
- Current lab selection (`currentLab`)
- User-created abnormality bubbles (`abnormalityBubbles`)
- Communication channels (`communicationChannels`)

**Future considerations:**
- Backend API for persistent storage
- Real-time updates via WebSockets
- Multi-user coordination across devices

---

## Privacy Levels

The system uses three privacy levels that control what information is shared:

1. **High Privacy**: Only essential information
   - Description, location, detection method, timeline, urgency
   - No detailed findings, specific locations, sample counts, or genetic markers

2. **Medium Privacy**: Anonymized details
   - Everything from High, plus:
   - Detailed findings (anonymized)
   - Specific location (generalized)

3. **Low Privacy**: Full details
   - Everything from Medium, plus:
   - Sample counts
   - Genetic markers
   - Specific locations

**Why this design:**
- **Recontextualizing**: Same information, different views based on trust level
- **Adaptive sharing**: What gets shared adapts to recipient, not one-size-fits-all
- **Context-preserving**: Privacy doesn't mean losing all context, just adapting it

---

## Design Decisions Explained

### Why Free-Form Input Instead of Forms?

**Live Machinery principle**: Prayer-based interfaces
- Users write naturally ("prayers") rather than filling rigid forms
- AI interprets contextually, preserving meaning
- More flexible and expressive than checkboxes and dropdowns

### Why Canvas Instead of Lists?

**Live Machinery principle**: Non-modular, seamless interaction
- Spatial organization allows free-form exploration
- Drag-and-drop feels natural, not like database queries
- Connections can be visualized and explored visually
- No rigid structure - users organize as they see fit

### Why Three Message Types?

**Live Machinery principle**: Just-in-time structure
- Not pre-defined protocols, but flexible message types
- Enables different coordination strategies (request, share, negotiate)
- Conditional flows enable game-theory-like negotiation
- Adapts to context rather than forcing rigid workflows

### Why AI Suggestions?

**Live Machinery principle**: Autostructuring, recontextualizing
- AI finds connections humans might miss
- Suggestions adapt to the specific abnormality being viewed
- Explanations preserve context while showing relevance
- Just-in-time generation, not pre-computed matches

### Why Privacy Levels Instead of Binary Public/Private?

**Live Machinery principle**: Recontextualizing
- Same information, different views based on trust
- Adaptive sanitization, not one-size-fits-all
- Preserves context while respecting privacy
- Enables gradual trust building

---

## Current Limitations & Future Enhancements

### Current Limitations (Draft One)
- Client-side only (localStorage) - no persistence across devices
- Only one lab is playable (NIV)
- No real-time updates - changes are local only
- Mock data for other labs - not real coordination
- Simple AI matching - could be more sophisticated
- No trust/reciprocity tracking
- No authentication system

### Future Enhancements (Planned)
- Backend API for persistent storage
- Real-time updates via WebSockets
- Multi-user coordination
- Trust and reciprocity tracking
- More sophisticated AI matching
- Advanced conditional information flows
- User authentication (optional)
- More labs playable
- Threat analysis and clustering
- Historical coordination patterns

---

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenRouter API (accessing various LLMs)
- **Drag-and-Drop**: @dnd-kit/core
- **Canvas Navigation**: react-zoom-pan-pinch
- **Storage**: localStorage (client-side)
- **Deployment**: Vercel (configured)

---

## Key Files Reference

### Routes
- `/` - Landing page (LabSelector)
- `/lab/[labId]` - Lab dashboard
- `/lab/[labId]/create-abnormality` - Create abnormality bubble
- `/lab/[labId]/create-threat` - Create threat bubble
- `/abnormality/[abnormalityId]` - Abnormality detail & canvas
- `/abnormality/[abnormalityId]/communicate` - Communication channel
- `/threat/[threatId]` - Threat detail & canvas
- `/threat/[threatId]/communicate` - Threat communication channel

### Components
- `LabSelector.tsx` - Lab selection interface
- `FreeFormAbnormalityInput.tsx` - Free-form text input with AI
- `PostFormalArtifactEditor.tsx` - Structured data preview/editor
- `AbnormalityConnectionCanvas.tsx` - Interactive canvas for exploring connections
- `CommunicationChannel.tsx` - Communication interface
- `AbnormalityBubbleCard.tsx` - Card display for abnormality bubbles
- `AISuggestionBubbles.tsx` - AI-generated suggestions display

### Libraries
- `mockData.ts` - Mock labs and abnormality bubbles
- `storage.ts` - localStorage utilities
- `matching.ts` - Relevance matching algorithm (legacy, now uses AI)
- `openrouter.ts` - OpenRouter API integration
- `constants.ts` - App constants (PRIMARY_LAB_ID)

### API Routes
- `/api/openrouter/analyze-abnormality` - Extract structured data from text
- `/api/openrouter/generate-suggestions` - Generate AI suggestions
- `/api/openrouter/find-relevant-bubbles` - Find relevant bubbles
- `/api/openrouter/explain-match` - Explain bubble connections
- `/api/openrouter/analyze-threat` - Analyze threat entities

---

## Summary

This application demonstrates a new paradigm for coordination infrastructure that:

1. **Enables fast coordination** without losing context
2. **Respects privacy** through adaptive sharing, not binary public/private
3. **Uses AI intelligently** to find connections and structure information
4. **Provides flexible interfaces** that adapt to user needs, not rigid forms
5. **Preserves meaning** while adapting to different trust levels and contexts

The design embodies "Live Machinery" principles by:
- Using prayer-based (natural language) input instead of rigid forms
- Generating structure just-in-time from informal input
- Creating seamless, non-modular interfaces
- Providing pluralistic views that adapt to context
- Recontextualizing information rather than decontextualizing it

This is a prototype that demonstrates the core coordination flow: labs can create abnormality bubbles, view relevant bubbles from other labs, and initiate communication channels. All while respecting privacy constraints and enabling fast, context-preserving coordination.

