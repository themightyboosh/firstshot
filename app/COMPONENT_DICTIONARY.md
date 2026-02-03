# FirstShot Template - Component Dictionary

This dictionary provides semantic descriptions of all components in the FirstShot template for Claude AI to understand and work with.

## Template Overview

**Name:** FirstShot  
**Purpose:** Single-page application template for 24-year-old Discord users  
**Tech Stack:** React, TypeScript, Tailwind CSS v4, React Router, Motion (Framer Motion)  
**Theme:** Dark mode with purple/pink gradient aesthetic  
**Responsive:** Mobile, tablet, desktop breakpoints

---

## Application Structure

### Entry Point
- **File:** `/src/app/App.tsx`
- **Description:** Main application component using React Router's RouterProvider
- **Pattern:** React Router Data mode with centralized routing

### Routing Configuration
- **File:** `/src/app/routes.ts`
- **Description:** Browser router configuration defining all app routes
- **Routes:**
  - `/` - Splash screen
  - `/login` - User login
  - `/situation` - Situation selector
  - `/questions` - Likert scale survey (previously `/likert`)
  - `/emotions` - Emotion selection grid
  - `/content` - Content display page
  - `/results` - Results with save functionality
  - `/forgot-password` - Password recovery flow
  - `/forgot-password/check-email` - Email sent confirmation
  - `/reset-password` - New password entry
  - `/reset-password/success` - Reset success confirmation

---

## Core Screens

### 1. Splash Screen
- **File:** `/src/app/components/splash-screen.tsx`
- **Purpose:** Initial landing/welcome screen with FirstShot branding
- **Features:**
  - Animated logo entrance
  - Call-to-action button
  - Auto-navigation to login after timeout (optional)
- **Key Elements:** Logo, gradient background, enter button
- **Navigation:** Leads to `/login`

### 2. Login Screen
- **File:** `/src/app/components/login-screen.tsx`
- **Purpose:** User authentication interface
- **Features:**
  - Email/username input
  - Password input with show/hide toggle
  - Remember me checkbox
  - "Forgot password?" link
  - Social login buttons (mock)
- **Key Elements:** Form inputs, validation, error states
- **Navigation:** Success → `/situation`, Forgot → `/forgot-password`

### 3. Situation Selector Screen
- **File:** `/src/app/components/situation-selector-screen.tsx`
- **Purpose:** Let users select their current situation from a predefined list
- **Features:**
  - 9 situation options with icons, titles, descriptions
  - Single-select interaction
  - Icon on left, text on right layout
  - Animated selection states
- **Key Elements:**
  - Work Stress, Social Anxiety, Relationship Issues, Academic Pressure, Personal Growth, Health Concerns, Communication Difficulties, Life Transition, Home & Family
- **Customization:** Add/remove/edit situations in `situations` array
- **Navigation:** Leads to `/questions` with selected situation in state
- **Data Flow:** Passes selected situation ID to next screen

### 4. Likert Questions Screen
- **File:** `/src/app/components/likert-questions-screen.tsx`
- **Purpose:** Multi-question survey using 7-point Likert scale
- **Features:**
  - Progress bar showing completion
  - Question pagination (one at a time)
  - 7-point scale (Strongly Disagree to Strongly Agree)
  - Previous/Next navigation
  - Responsive layouts (horizontal on desktop, vertical on mobile)
- **Key Elements:** 
  - Question text display
  - Radio button scale (1-7)
  - Navigation buttons
  - Progress indicator
- **Data Structure:** Questions array with id and text
- **Navigation:** Leads to `/emotions` after all questions answered

### 5. Emotion Selection Screen
- **File:** `/src/app/components/emotion-selection-screen.tsx`
- **Purpose:** Visual emotion picker with animated icons
- **Features:**
  - 9 animated emotion icons in grid
  - Single or multi-select (configurable)
  - Hover and selection animations
  - Custom animated SVG icons
- **Key Elements:**
  - Startled, Warmth, Curiosity, Frustration, Fear, Heaviness, Revulsion, Aversion, Shame
- **Icon Components:** `/src/app/components/emotion-icons.tsx`
- **Customization:** Each icon is discrete and swappable
- **Navigation:** Leads to `/content` or `/results`

### 6. Content Screen
- **File:** `/src/app/components/content-screen.tsx`
- **Purpose:** Display content with title, paragraph, and square image
- **Features:**
  - Title heading
  - Body text paragraphs
  - Square aspect ratio image
  - Responsive image sizing
- **Key Elements:** Text content, image, navigation controls
- **Image Handling:** Uses Unsplash for placeholders, square crop enforced
- **Navigation:** Can lead to `/results` or other content pages

### 7. Results Screen
- **File:** `/src/app/components/results-screen.tsx`
- **Purpose:** Display survey/session results with save functionality
- **Features:**
  - Results summary display
  - Save button with confirmation
  - Download/export options
  - Visual data representation
- **Key Elements:** Result cards, save button, action buttons
- **Data Flow:** Collects data from previous screens (situation, Likert, emotions)
- **Navigation:** Can restart flow or return to home

---

## Password Recovery Flow

### 8. Forgot Password Screen
- **File:** `/src/app/components/forgot-password-screen.tsx`
- **Purpose:** Email entry for password reset
- **Features:** Email input, validation, submit button
- **Navigation:** Leads to `/forgot-password/check-email`

### 9. Check Email Screen
- **File:** `/src/app/components/check-email-screen.tsx`
- **Purpose:** Confirmation that reset email was sent
- **Features:** Success message, return to login button
- **Navigation:** Leads back to `/login`

### 10. Reset Password Screen
- **File:** `/src/app/components/reset-password-screen.tsx`
- **Purpose:** Enter new password
- **Features:** New password input, confirmation input, validation
- **Navigation:** Leads to `/reset-password/success`

### 11. Password Reset Success Screen
- **File:** `/src/app/components/password-reset-success-screen.tsx`
- **Purpose:** Confirmation of successful password reset
- **Features:** Success message, login button
- **Navigation:** Leads to `/login`

---

## Reusable Components

### Logo Component
- **File:** `/src/app/components/logo.tsx`
- **Purpose:** FirstShot branding logo
- **Props:** `size` (small/medium/large), `showText` (boolean)
- **Usage:** Header, splash screen, login

### Navigation Component
- **File:** `/src/app/components/navigation.tsx`
- **Purpose:** Top navigation bar with logo and links
- **Features:** Responsive menu, navigation items
- **Usage:** All main screens

### Loading Spinner
- **File:** `/src/app/components/loading-spinner.tsx`
- **Purpose:** Loading state indicator
- **Features:** Animated spinner with gradient colors
- **Usage:** Async operations, transitions

### Page Template
- **File:** `/src/app/components/page-template.tsx`
- **Purpose:** Consistent page layout wrapper
- **Features:** Standard padding, background, responsive container
- **Usage:** Template for creating new pages

### Content Card
- **File:** `/src/app/components/content-card.tsx`
- **Purpose:** Reusable card component for content display
- **Features:** Rounded corners, border, padding, gradient effects
- **Usage:** Display grouped information

### Basic Content Page
- **File:** `/src/app/components/basic-content-page.tsx`
- **Purpose:** Simple content page template
- **Features:** Title, body text, image support
- **Usage:** Quick content pages without custom logic

---

## Emotion Icons (Discrete Components)

**File:** `/src/app/components/emotion-icons.tsx`

All icons are animated SVG components that accept `{ isSelected: boolean, className?: string }`

1. **StartledIcon** - Yellow/amber, pulsing eyes and mouth
2. **WarmthIcon** - Orange, rocking with expanding smile
3. **CuriosityIcon** - Purple, tilting head with raised eyebrow
4. **FrustrationIcon** - Red, furrowed brow pulsing
5. **FearIcon** - Indigo, trembling motion
6. **HeavinessIcon** - Gray, slow downward drift with tear
7. **RevulsionIcon** - Lime green, recoiling rotation
8. **AversionIcon** - Pink, turning away
9. **ShameIcon** - Purple/violet, shrinking downward

**Swapping:** Replace individual icon functions or update mapping in emotion-selection-screen.tsx

---

## UI Component Library

**Location:** `/src/app/components/ui/`

Shadcn-style components (Tailwind-based, fully customizable):

- **accordion.tsx** - Collapsible sections
- **alert.tsx** - Alert/notification banners
- **alert-dialog.tsx** - Modal confirmation dialogs
- **avatar.tsx** - User avatar/profile images
- **badge.tsx** - Status badges
- **button.tsx** - Primary button component
- **card.tsx** - Card container
- **checkbox.tsx** - Checkbox input
- **dialog.tsx** - Modal dialogs
- **drawer.tsx** - Side drawer/sheet
- **dropdown-menu.tsx** - Dropdown menus
- **form.tsx** - Form wrapper with validation
- **input.tsx** - Text input field
- **label.tsx** - Form labels
- **select.tsx** - Select dropdown
- **separator.tsx** - Visual divider
- **slider.tsx** - Range slider
- **switch.tsx** - Toggle switch
- **tabs.tsx** - Tab navigation
- **textarea.tsx** - Multi-line text input
- **tooltip.tsx** - Hover tooltips

---

## Styling System

### Theme Configuration
- **File:** `/src/styles/theme.css`
- **Description:** CSS custom properties for colors, spacing, typography
- **Features:**
  - Light and dark mode tokens
  - Color system with semantic names
  - Font size and weight variables
  - Border radius tokens

### Font System
- **File:** `/src/styles/fonts.css`
- **Description:** Single root font family configuration
- **Variable:** `--font-family` controls entire app font
- **Swapping:** Change one CSS variable to update all fonts
- **Default:** System font stack (-apple-system, BlinkMacSystemFont, etc.)

### Tailwind CSS
- **File:** `/src/styles/tailwind.css`
- **Description:** Tailwind v4 base import
- **Version:** 4.0 (uses CSS-based configuration, no tailwind.config.js)

### Main Styles
- **File:** `/src/styles/index.css`
- **Description:** Imports fonts, Tailwind, and theme in correct order

---

## Design System

### Color Palette
- **Primary Gradient:** Indigo → Purple → Pink
- **Background:** Slate-950 with gradient overlays
- **Text:** White primary, slate-300/400 secondary
- **Accents:** Purple-500 for highlights, purple-500/50 for glows

### Typography
- **Font Weights:** 400 (normal), 500 (medium), 600 (semi-bold), 700 (bold)
- **Headings:** H1 (2xl), H2 (xl), H3 (lg), H4 (base)
- **Body:** Base (16px root)

### Spacing
- **Container:** Max-width with responsive padding
- **Sections:** py-8 (mobile), py-12 (tablet), py-16 (desktop)
- **Components:** Consistent 4px grid

### Animations
- **Library:** Motion (Framer Motion)
- **Patterns:** Fade in, slide, scale, rotate
- **Timing:** Smooth easing with spring physics

### Responsive Breakpoints
- **Mobile:** Default (< 768px)
- **Tablet:** md: (768px+)
- **Desktop:** lg: (1024px+)

---

## Data Flow Patterns

### State Management
- **Method:** React useState for local state
- **Navigation State:** React Router location.state for passing data between screens
- **Pattern:** No global state management (keep it simple)

### Form Handling
- **Validation:** Client-side validation with error states
- **Submission:** Mock handlers (ready for backend integration)

### Data Persistence
- **Current:** In-memory (resets on refresh)
- **Ready for:** localStorage, Supabase, or backend API integration

---

## Backend Integration Points

**Marked in code but not implemented (frontend-only template):**

1. **Authentication** - Login, logout, session management
2. **Password Recovery** - Email sending, token validation
3. **Survey Data** - Save Likert responses, emotion selections, situation choices
4. **Results Storage** - Persist and retrieve user results
5. **User Profile** - Store preferences, history

**Integration Strategy:**
- Replace mock functions with API calls
- Add Supabase or custom backend
- Implement authentication flow
- Set up database schemas

---

## Configuration Files

### Package Configuration
- **File:** `/package.json`
- **Description:** npm dependencies and scripts
- **Key Packages:**
  - react, react-router
  - motion/react (Framer Motion)
  - lucide-react (icons)
  - tailwindcss

### Build Configuration
- **File:** `/vite.config.ts`
- **Description:** Vite bundler configuration
- **Features:** Path aliases (`@` → `/src`)

---

## Documentation Files

- **DESIGN_SYSTEM.md** - Complete design system documentation
- **EMOTION_ICONS.md** - Emotion icon customization guide
- **FONT_GUIDE.md** - Font swapping instructions
- **SITUATION_SELECTOR.md** - Situation selector customization
- **COMPONENT_DICTIONARY.md** - This file
- **ATTRIBUTIONS.md** - Third-party credits

---

## Key Design Patterns

### Description-Driven Logic
All components use clear, semantic naming and descriptive comments for Claude to understand:
- Variable names explain purpose
- Functions describe what they do
- Comments explain why, not what
- TypeScript interfaces document data structures

### Component Organization
- **Screens:** Full-page components in `/src/app/components/`
- **UI Elements:** Reusable components in `/src/app/components/ui/`
- **Shared:** Cross-cutting components like Logo, Navigation
- **One file per component** - No barrel exports

### Styling Approach
- **Tailwind-first:** Utility classes for most styling
- **CSS Variables:** For theme tokens and customization points
- **No inline styles:** Everything through Tailwind or CSS classes
- **Responsive:** Mobile-first with breakpoint modifiers

### Code Quality
- **TypeScript:** Full type safety
- **Consistent formatting:** Standard React/TS conventions
- **No console warnings:** Clean production build
- **Accessibility:** Semantic HTML, keyboard navigation

---

## Usage Instructions for Claude

When working with this template, Claude should:

1. **Understand the flow:** Splash → Login → Situation → Questions → Emotions → Content → Results
2. **Respect the theme:** Dark mode, purple/pink gradients, Discord-friendly
3. **Maintain patterns:** Use description-driven logic, semantic naming
4. **Keep responsive:** Test mobile, tablet, desktop
5. **Preserve structure:** Don't break routing or component organization
6. **Use existing components:** Leverage UI library before creating new components
7. **Follow font system:** Use single `--font-family` variable
8. **Swap, don't rewrite:** Emotion icons and situations are designed to be swapped
9. **Document changes:** Update relevant .md files when making significant changes

---

## Quick Reference: Common Tasks

### Add a new screen
1. Create component in `/src/app/components/your-screen.tsx`
2. Add route in `/src/app/routes.ts`
3. Import and use Navigation component
4. Follow existing screen patterns

### Customize situations
1. Open `/src/app/components/situation-selector-screen.tsx`
2. Modify `situations` array
3. Import new icons if needed

### Customize emotions
1. Open `/src/app/components/emotion-icons.tsx`
2. Replace individual icon component
3. Or update mapping in emotion-selection-screen.tsx

### Change font
1. Open `/src/styles/fonts.css`
2. Import font at top (if external)
3. Change `--font-family` value

### Modify theme colors
1. Open `/src/styles/theme.css`
2. Update CSS custom properties in `:root` or `.dark`
3. Colors auto-apply via Tailwind

### Add backend integration
1. Install backend SDK (e.g., Supabase)
2. Replace mock functions with API calls
3. Update data flow to use real data
4. Add error handling and loading states

---

## File Structure Summary

```
FirstShot/
├── src/
│   ├── app/
│   │   ├── App.tsx (entry point)
│   │   ├── routes.ts (routing config)
│   │   └── components/
│   │       ├── splash-screen.tsx
│   │       ├── login-screen.tsx
│   │       ├── situation-selector-screen.tsx
│   │       ├── likert-questions-screen.tsx
│   │       ├── emotion-selection-screen.tsx
│   │       ├── emotion-icons.tsx
│   │       ├── content-screen.tsx
│   │       ├── results-screen.tsx
│   │       ├── forgot-password-screen.tsx
│   │       ├── check-email-screen.tsx
│   │       ├── reset-password-screen.tsx
│   │       ├── password-reset-success-screen.tsx
│   │       ├── logo.tsx
│   │       ├── navigation.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── page-template.tsx
│   │       ├── content-card.tsx
│   │       ├── basic-content-page.tsx
│   │       └── ui/ (40+ Shadcn components)
│   └── styles/
│       ├── index.css (main import)
│       ├── fonts.css (font config)
│       ├── tailwind.css (Tailwind import)
│       └── theme.css (design tokens)
├── package.json
├── vite.config.ts
├── DESIGN_SYSTEM.md
├── EMOTION_ICONS.md
├── FONT_GUIDE.md
├── SITUATION_SELECTOR.md
└── COMPONENT_DICTIONARY.md (this file)
```

---

## Component Dependency Graph

```
App.tsx
  └── RouterProvider
      ├── SplashScreen → LoginScreen
      ├── LoginScreen → SituationSelectorScreen
      ├── SituationSelectorScreen → LikertQuestionsScreen
      ├── LikertQuestionsScreen → EmotionSelectionScreen
      ├── EmotionSelectionScreen → ContentScreen
      ├── ContentScreen → ResultsScreen
      └── Password Recovery Flow
          ├── ForgotPasswordScreen
          ├── CheckEmailScreen
          ├── ResetPasswordScreen
          └── PasswordResetSuccessScreen

Shared across all screens:
  ├── Navigation (header)
  ├── Logo (branding)
  └── LoadingSpinner (async states)
```

---

## Version & Compatibility

- **React:** 18+
- **TypeScript:** 5+
- **Tailwind CSS:** 4.0
- **React Router:** 7+
- **Motion:** Latest (formerly Framer Motion)
- **Node:** 18+ recommended
- **Package Manager:** pnpm (configured), npm/yarn compatible

---

## Notes for Claude

This template is designed to be:
- **Understandable:** Clear patterns and semantic naming
- **Modifiable:** Swap components easily without breaking others
- **Scalable:** Add features without refactoring
- **Production-ready:** Clean code, no warnings, optimized build

When the user asks Claude to work on this template, Claude should reference this dictionary to understand component purposes, locations, and integration points.
