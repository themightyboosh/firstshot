# FirstShot Frontend Build Instructions

This document serves as the comprehensive guide for building the FirstShot frontend application. It maps the configuration managed in the Admin Panel to the user experience, logic, and design system required.

---

## 1. Core System Architecture

The application generates personalized relationship advice by combining three distinct data points:
1.  **User Archetype** (Who they are) - Determined via CAS Assessment.
2.  **Target Affect** (Who they are dealing with) - Selected from Affects list.
3.  **Situation** (Context of the issue) - Selected from Situations list.

These three inputs are fed into a **Master Prompt** (managed in Global Settings) to generate the final AI response.

### Tech Stack
*   **Framework**: React (Vite) PWA or React Native (Expo) - depending on target.
*   **Design System**: Reference `/front-end-design` directory. Use Tailwind CSS + Shadcn UI or equivalent components.
*   **Data/Auth**: Firebase (Client SDK).
*   **State**: Zustand or Context API.

---

## 2. Design System & Branding

*   **Design Source**: All UI components, colors, and typography MUST follow the design system located in the `/front-end-design` directory.
*   **Logo**: The app logo is dynamic. It is managed in the Admin Panel under **Global Settings**.
    *   Fetch `global_settings/main` -> `appLogoUrl` (SVG).
    *   Fallback: Default app title text if no logo.

---

## 3. Data Models (Admin Managed)

The frontend consumes data from these Firestore collections:

### A. CAS Configuration (`cas_config/main`)
*   **Purpose**: Determines the user's Attachment Archetype.
*   **Structure**: `questions` (array), `archetypes` (array).

### B. Affects (`affects/{id}`)
*   **Purpose**: Target's emotional state/vibe.
*   **UI**: Grid of 9 core affects. Use `iconUrl` (black circle background) and `name`.

### C. Situations (`situations/{id}`)
*   **Purpose**: Relationship scenario.
*   **UI**: List of scenarios. Use `squarePngUrl` and `name`.

### D. CMS Content (`cms_content/{id}`)
*   **Purpose**: Dynamic copy for app screens.
*   **Structure**: `title`, `copy`, `imageUrl`, `buttonText`, `buttonAction` (NL description).

---

## 4. User Flow & Screen Requirements

### Phase 1: Authentication & Onboarding

**Step 1: Splash / Welcome**
*   **CMS Key**: `welcome`
*   **Content**: Use `title`, `copy`, `imageUrl` (if set), and `buttonText`.
*   **Logic**:
    *   If user is NOT logged in: Show "Get Started" -> Go to Auth.
    *   If user IS logged in: Skip to Dashboard (or Assessment if incomplete).

**Step 2: Authentication**
*   **Requirement**: "Typical login/create account process".
*   **Methods**:
    *   Email/Password (Sign Up & Login).
    *   Google Sign-In.
*   **CMS**: You may create new CMS entries (e.g., `auth_screen`) if dynamic copy is needed here, otherwise standard UI copy.

**Step 3: CAS Assessment (Mandatory)**
*   **Trigger**: After Signup, check if user profile has `archetypeId`. If not -> Assessment.
*   **UI**: 8 Questions, Ranked Choice V2 (Most/Next/Least).
*   **Result**:
    *   Calculate Score.
    *   Reveal Archetype (Animation).
    *   Save to User Profile (`users/{uid}`).

### Phase 2: The Core Loop

**Step 1: Dashboard**
*   **Display**: Current Archetype (small badge/card).
*   **Action**: "New Situation" card.
*   **Billing/Usage**: (Optional) Display user's remaining credits if applicable (tracked in `getUserUsageStats`).

**Step 2: Situation Selection**
*   **CMS Key**: `select_situation` (Header title/copy).
*   **Data**: Fetch all from `situations` collection.
*   **UI**: Horizontal cards or Grid with Image + Name.

**Step 3: Affect Selection**
*   **CMS Key**: `select_affect` (Header title/copy).
*   **Data**: Fetch all from `affects` collection.
*   **UI**: Grid of Icons + Names.

**Step 4: Generation**
*   **Action**: Call `runGeminiPrompt` (via backend proxy or specialized endpoint).
*   **Payload Construction**:
    *   Ideally, the backend handles prompt construction to keep logic secure.
    *   Frontend sends: `{ archetypeId, situationId, affectId }`.
    *   Backend fetches Master Prompt and fills tokens.
*   **Async Job Queue Pattern**:
    *   **Requirement**: Backend uses BullMQ job queue pattern for advice generation.
    *   **Implementation**: 
        *   Frontend initiates generation request and receives a job ID.
        *   Frontend polls/listens for job completion status via async endpoint.
        *   Polling interval: Recommended 1-2 seconds with exponential backoff.
        *   Maximum polling duration: Configurable timeout (default 60 seconds).
*   **Progress Indicators**:
    *   **UI Requirement**: Display progress indicators during generation.
    *   **States to Display**:
        *   "Queued" - Job submitted, waiting to start.
        *   "Processing" - Active generation in progress (with animated spinner/loader).
        *   "Completed" - Generation finished, transitioning to results.
        *   "Error" - Generation failed, show error message with retry option.
    *   **Visual Design**: Use indeterminate progress bars or spinners consistent with design system.
    *   **User Feedback**: Provide estimated time remaining when available from job status.

**Step 5: Result & Guidance**
*   **Output**: The AI returns JSON.
    *   **Format**: `[ { "Script": "...", "Action": "...", "Strategy": "..." } ]`
    *   **Requirement**: Style these elements distinctly.
        *   **"Script"**: Chat bubble style.
        *   **"Action"**: Action card / Checklist style.
        *   **"Strategy"**: Path/Arrow style.
*   **CSAT Feedback**:
    *   **CMS Key**: `customer_satisfaction` (Header/Copy).
    *   **Trigger**: Show immediately after guidance is presented.
    *   **Action**: Submit score (1-5) + comment to `submitFeedback` endpoint.

---

## 5. Prompt Token Mapping (Reference)

This logic is handled by the backend simulator/generator but referenced here for completeness.

| Token | Source |
| :--- | :--- |
| `*core-recognition*` | Archetype Profile |
| `*protective-logic*` | Archetype Profile |
| `*prompt-fragment*` / `*situation_context*` | Situation |
| `*affect_name*` | Affect |
| `*affect_guidance*` | Affect |

---

## 6. API Endpoints

*   **Auth**: Firebase Auth SDK.
*   **Data**: Firestore Client SDK (`getDocs`, `doc`).
*   **Actions**:
    *   `https://us-central1-realness-score.cloudfunctions.net/submitUserResponse`
    *   `https://us-central1-realness-score.cloudfunctions.net/runGeminiPrompt`
    *   `https://us-central1-realness-score.cloudfunctions.net/submitFeedback`
*   **API Contract Requirements**:
    *   **OpenAPI Introspection**: All API endpoints MUST have OpenAPI/Swagger specification.
    *   **Strict Typing**: Frontend MUST use generated TypeScript types from OpenAPI schema.
    *   **Implementation**:
        *   Use OpenAPI code generators (e.g., `openapi-typescript`, `swagger-typescript-api`) to generate type-safe API clients.
        *   All API requests/responses MUST be strictly typed based on OpenAPI schema.
        *   Runtime validation of API contracts recommended (e.g., using `zod` schemas derived from OpenAPI).
    *   **Benefits**: Type safety, better IDE autocomplete, compile-time error detection, automatic API documentation.

---

## 7. JSON Output Format (Strict)

The AI is instructed to return **valid JSON** with this structure. The frontend MUST parse this and render components accordingly.

**Critical Requirements**:
*   **Valid JSON Only**: The response MUST be valid JSON. No markdown code blocks, no markdown formatting, no explanatory text before or after the JSON.
*   **Character Limits**: Each field has maximum character limits to ensure concise, actionable guidance:
    *   `"Script"`: Maximum 500 characters
    *   `"Action"`: Maximum 500 characters
    *   `"Strategy"`: Maximum 300 characters
*   **Structure**: Must be an array containing a single object with exactly these three keys.

**Expected Format**:
```json
[
  {
    "Script": "Text content here...",
    "Action": "Actionable advice here...",
    "Strategy": "Follow up steps..."
  }
]
```

**Styling Rules**:
*   **"Script"**: Emphasize as a script. High visibility.
*   **"Action"**: Emphasize as instructions. Bullet points or clear steps.
*   **"Strategy"**: Emphasize as future looking. Lighter styling.
