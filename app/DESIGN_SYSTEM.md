# FirstShot Design System

> **For Claude MCP Reference**: This document defines all design tokens, components, and patterns used in the FirstShot application.

---

## 🎨 Design Tokens

### Colors

```css
/* Background Gradients */
bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950

/* Brand Gradient */
from-indigo-500 via-purple-500 to-pink-500

/* Surface Colors */
bg-slate-900/50    /* Cards, panels with transparency */
bg-slate-900/30    /* Navigation, headers */
bg-slate-800/50    /* Secondary surfaces */
bg-slate-800       /* Buttons, inputs */

/* Border Colors */
border-slate-800   /* Primary borders */
border-slate-700   /* Input/card borders */
border-slate-600   /* Hover states */
border-purple-500  /* Accent borders */

/* Text Colors */
text-white         /* Headings, primary text */
text-slate-300     /* Body text, labels */
text-slate-400     /* Secondary text */
text-slate-500     /* Muted text */
text-purple-400    /* Accent text */
text-purple-300    /* Badge text */
text-red-400       /* Destructive actions */
```

### Spacing & Breakpoints

```css
/* Container Padding */
px-4               /* Mobile: 16px */
py-8               /* Mobile: 32px vertical */
md:py-12           /* Tablet: 48px vertical */
lg:py-16           /* Desktop: 64px vertical */

/* Breakpoints (Tailwind defaults) */
sm: 640px          /* Small tablets */
md: 768px          /* Tablets */
lg: 1024px         /* Desktop */
xl: 1280px         /* Large desktop */
```

### Typography

```css
/* Headings */
text-2xl md:text-3xl lg:text-4xl font-bold    /* H1 - Main titles */
text-xl md:text-2xl lg:text-3xl font-bold     /* H2 - Section titles */
text-lg font-semibold                          /* H3 - Subsections */

/* Body Text */
text-base md:text-lg leading-relaxed           /* Large body */
text-sm                                        /* Small body */
text-xs                                        /* Labels, captions */
```

### Borders & Radius

```css
/* Border Radius */
rounded-lg         /* 8px - Buttons, inputs */
rounded-xl         /* 12px - Images, cards */
rounded-2xl        /* 16px - Major containers */
rounded-full       /* Pills, avatars */

/* Border Width */
border             /* 1px default */
border-2           /* 2px accent borders */
```

---

## 🧩 Core Components

### 1. Logo Component

**File**: `/src/app/components/logo.tsx`

**Usage**:
```tsx
<Logo size="small" | "medium" | "large" showText={boolean} />
```

**Sizes**:
- `small`: 8x8 container, good for navigation
- `medium`: 12x12 container, good for headers
- `large`: 20x20 container, good for splash screens

---

### 2. Navigation Component

**File**: `/src/app/components/navigation.tsx`

**Features**:
- Desktop: Horizontal menu with account dropdown
- Mobile: Hamburger menu with slide-down panel
- Account menu includes: Profile, Settings, Notifications, Help, Logout

**Usage**:
```tsx
<Navigation />
```

---

### 3. Loading Spinner

**File**: `/src/app/components/loading-spinner.tsx`

**Usage**:
```tsx
<LoadingSpinner size="small" | "medium" | "large" message="Loading..." />
```

---

### 4. Page Template

**File**: `/src/app/components/page-template.tsx`

**Usage**:
```tsx
<PageTemplate
  showNavigation={true}
  maxWidth="sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full"
  centerContent={false}
  animate={true}
>
  {children}
</PageTemplate>
```

**Props**:
- `showNavigation`: Include nav bar (default: true)
- `maxWidth`: Content width constraint (default: "4xl")
- `centerContent`: Vertically center content (default: false)
- `animate`: Fade-in animation (default: true)

---

### 5. Content Card

**File**: `/src/app/components/content-card.tsx`

**Usage**:
```tsx
<ContentCard padding="sm" | "md" | "lg">
  {children}
</ContentCard>
```

**Padding Sizes**:
- `sm`: p-4 md:p-6
- `md`: p-6 md:p-8
- `lg`: p-6 md:p-8 lg:p-12 (default)

---

### 6. Basic Content Page

**File**: `/src/app/components/basic-content-page.tsx`

**Usage**:
```tsx
<BasicContentPage
  title="Page Title"
  content="Paragraph of content text"
  imageUrl="https://..."
  imageAlt="Image description"
  actionButton={{
    label: "Continue",
    onClick: () => navigate('/next'),
    icon: <ArrowRight className="w-5 h-5" />
  }}
/>
```

**Perfect for**: Simple informational pages with title, paragraph, image, and action button

---

## 🎭 UI Patterns

### Button Styles

```tsx
/* Primary Button (Gradient) */
<button className="px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
  Button Text
</button>

/* Secondary Button */
<button className="px-6 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition-all">
  Button Text
</button>

/* Ghost Button */
<button className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
  Button Text
</button>

/* Destructive Button */
<button className="px-6 py-3 rounded-lg text-red-400 hover:bg-slate-800 transition-all">
  Delete
</button>
```

### Input Fields

```tsx
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
  <input
    type="text"
    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
    placeholder="Placeholder text"
  />
</div>
```

### Card Surfaces

```tsx
/* Primary Card */
<div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 md:p-8 lg:p-12 shadow-2xl">
  {content}
</div>

/* Secondary Card (nested) */
<div className="bg-slate-800/50 rounded-xl p-4 md:p-6 border border-slate-700">
  {content}
</div>
```

### Square Images

```tsx
<div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
  <ImageWithFallback
    src="url"
    alt="description"
    className="w-full h-full object-cover"
  />
</div>
```

### Progress Bars

```tsx
<div className="h-2 bg-slate-700 rounded-full overflow-hidden">
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: "75%" }}
    transition={{ duration: 1 }}
    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
  />
</div>
```

### Badges/Pills

```tsx
<span className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-full text-purple-300 text-sm font-semibold">
  Badge Text
</span>
```

---

## 🎬 Animation Patterns

### Page Transitions (Motion/React)

```tsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {content}
</motion.div>
```

### Loading States

```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
>
  <Loader2 className="w-5 h-5" />
</motion.div>
```

### Hover Transitions

```tsx
className="group"

<Icon className="group-hover:translate-x-1 transition-transform" />
<Icon className="group-hover:scale-110 transition-transform" />
```

---

## 📱 Responsive Design

### Mobile-First Approach

```tsx
/* Base: Mobile (< 768px) */
className="flex-col gap-3"

/* Tablet (≥ 768px) */
className="md:flex-row md:gap-6"

/* Desktop (≥ 1024px) */
className="lg:gap-8"
```

### Common Responsive Patterns

```tsx
/* Hide on mobile, show on tablet+ */
className="hidden md:flex"

/* Show on mobile, hide on tablet+ */
className="md:hidden"

/* Conditional layout */
className="flex-col md:flex-row"

/* Responsive grid */
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 🔧 Utility Classes

### Spacing

```css
gap-2              /* 8px */
gap-3              /* 12px */
gap-4              /* 16px */
gap-6              /* 24px */

mb-4               /* margin-bottom: 16px */
mb-6               /* margin-bottom: 24px */
mb-8               /* margin-bottom: 32px */
```

### Flexbox

```css
flex items-center justify-center     /* Center everything */
flex items-center justify-between    /* Space between */
flex-col                             /* Vertical stack */
flex-1                               /* Grow to fill */
```

### Effects

```css
backdrop-blur-xl                     /* Glass effect */
shadow-2xl                           /* Large shadow */
shadow-lg shadow-purple-500/50       /* Colored glow */
```

---

## 📦 Component Architecture

### Screen Components

All full-page screens follow this pattern:

```tsx
export function ScreenName() {
  return (
    <PageTemplate showNavigation={true} centerContent={false}>
      <ContentCard>
        {/* Screen content */}
      </ContentCard>
    </PageTemplate>
  );
}
```

### Reusable Components Folder

```
/src/app/components/
├── logo.tsx                  # Brand logo
├── loading-spinner.tsx       # Loading states
├── navigation.tsx            # Main navigation
├── page-template.tsx         # Page wrapper
├── content-card.tsx          # Card surface
├── basic-content-page.tsx    # Simple page template
└── [screen-name].tsx         # Full screen components
```

---

## 🚀 Quick Start for Claude

### Creating a New Page

```tsx
import { PageTemplate } from "@/app/components/page-template";
import { ContentCard } from "@/app/components/content-card";

export function MyNewPage() {
  return (
    <PageTemplate>
      <ContentCard>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 text-center">
          New Page Title
        </h1>
        <p className="text-base md:text-lg text-slate-300 leading-relaxed text-center">
          Content goes here
        </p>
      </ContentCard>
    </PageTemplate>
  );
}
```

### Adding to Router

Edit `/src/app/routes.ts`:

```tsx
import { MyNewPage } from "@/app/components/my-new-page";

{
  path: "/my-new-page",
  Component: MyNewPage,
}
```

---

## 📝 Notes for MCP Integration

- All components use **description-based logic** via props
- **Responsive breakpoints**: mobile (default), md (768px), lg (1024px)
- **Brand colors**: Purple/Pink gradient throughout
- **All images**: Use square aspect ratio (`aspect-square`)
- **Navigation**: Auto-collapses to hamburger on mobile
- **Animations**: Motion/React for smooth transitions
- **State management**: React hooks (useState, useNavigate)

---

**Updated**: January 2026
