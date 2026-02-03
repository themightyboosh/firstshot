# Situation Selector Guide

This guide explains how to customize the situation selector screen in the FirstShot template.

## Overview

The situation selector allows users to choose from a list of predefined situations. Each situation displays:
- **Icon** (left side) - Visual representation
- **Title** - Main situation name
- **Description** - Brief explanation of the situation

## File Location

**Component:** `/src/app/components/situation-selector-screen.tsx`

**Route:** `/situation` (configured in `/src/app/routes.ts`)

## Customizing Situations

All situations are defined in a single array. Open `/src/app/components/situation-selector-screen.tsx` and find the `situations` array:

```typescript
const situations: Situation[] = [
  {
    id: "work-stress",
    title: "Work Stress",
    description: "Dealing with workplace pressure, deadlines, or conflicts",
    Icon: BriefcaseIcon,
  },
  // ... more situations
];
```

### Situation Structure

Each situation object has:
- **id** - Unique identifier (used for tracking selection)
- **title** - Display name shown to user
- **description** - Brief explanation (1-2 lines)
- **Icon** - Lucide React icon component

## How to Customize

### Change a Situation

Replace any field in an existing situation:

```typescript
{
  id: "work-stress",
  title: "Workplace Challenges", // Changed title
  description: "Managing stress from job responsibilities", // Changed description
  Icon: BuildingIcon, // Changed icon
}
```

### Add a New Situation

Add a new object to the array:

```typescript
import { CoffeeIcon } from "lucide-react"; // Import the icon first

const situations: Situation[] = [
  // ... existing situations
  {
    id: "burnout",
    title: "Burnout",
    description: "Feeling exhausted and overwhelmed by responsibilities",
    Icon: CoffeeIcon,
  },
];
```

### Remove a Situation

Simply delete the entire object from the array. The list will automatically adjust.

### Reorder Situations

Drag and drop or cut/paste situations in the array to change their display order.

## Available Icons

The template uses [Lucide React](https://lucide.dev/icons) icons. Popular options:

| Icon Component | Use Case |
|---------------|----------|
| `BriefcaseIcon` | Work, career |
| `UsersIcon` | Social, groups |
| `HeartIcon` | Relationships, love |
| `GraduationCapIcon` | School, learning |
| `ActivityIcon` | Health, fitness |
| `HomeIcon` | Family, household |
| `MessageSquareIcon` | Communication |
| `TrendingUpIcon` | Growth, improvement |
| `ZapIcon` | Energy, change |
| `BrainIcon` | Mental health |
| `SmileIcon` | Happiness, mood |
| `CloudRainIcon` | Depression, sadness |
| `DollarSignIcon` | Financial |
| `CalendarIcon` | Time management |

### Using Custom Icons

Import any Lucide icon:

```typescript
import { YourIconName } from "lucide-react";

const situations: Situation[] = [
  {
    id: "custom",
    title: "Your Situation",
    description: "Description here",
    Icon: YourIconName,
  },
];
```

## Navigation Flow

### Current Flow
```
Splash → Login → Situation Selector → Likert Questions → Emotion Selection → Content → Results
```

### Change Next Screen

Modify the `handleContinue` function:

```typescript
const handleContinue = () => {
  if (selectedSituation) {
    navigate("/your-next-screen", { state: { situation: selectedSituation } });
  }
};
```

### Access Selected Situation

In the next screen, retrieve the selection:

```typescript
import { useLocation } from "react-router";

function NextScreen() {
  const location = useLocation();
  const situation = location.state?.situation;
  
  // Use the situation data
  console.log("User selected:", situation);
}
```

## Styling & Theming

### Colors

The component uses FirstShot's gradient colors:
- **Selected state:** Purple gradient with glow effect
- **Hover state:** Lighter slate colors
- **Icons:** Gradient background when selected

### Responsive Design

The component is fully responsive:
- **Mobile:** Compact padding, smaller icons
- **Tablet:** Medium sizing
- **Desktop:** Full sizing with larger touch targets

### Animations

Each situation card includes:
- **Entry animation** - Slides in from left
- **Hover effect** - Icon scales and rotates
- **Selection animation** - Checkmark appears with spring animation
- **Active state** - Pulsing gradient overlay

## Best Practices

### Writing Descriptions
- Keep descriptions under 60 characters
- Be specific but concise
- Use active, relatable language
- Avoid jargon

### Choosing Icons
- Select icons that are immediately recognizable
- Maintain visual consistency
- Avoid overly complex or abstract icons
- Test at small sizes (48px)

### Number of Situations
- **Recommended:** 6-12 situations
- Too few: Users may not find a match
- Too many: Overwhelming and hard to scan

## Example Configurations

### Mental Health Focus
```typescript
const situations: Situation[] = [
  {
    id: "anxiety",
    title: "Anxiety",
    description: "Feeling worried, nervous, or on edge",
    Icon: CloudRainIcon,
  },
  {
    id: "depression",
    title: "Depression",
    description: "Experiencing low mood or loss of interest",
    Icon: CloudIcon,
  },
  {
    id: "stress",
    title: "Stress",
    description: "Overwhelmed by daily pressures",
    Icon: ZapIcon,
  },
];
```

### Life Domains Focus
```typescript
const situations: Situation[] = [
  {
    id: "career",
    title: "Career",
    description: "Work, job search, or professional development",
    Icon: BriefcaseIcon,
  },
  {
    id: "relationships",
    title: "Relationships",
    description: "Romantic, family, or friendship connections",
    Icon: HeartIcon,
  },
  {
    id: "health",
    title: "Health & Wellness",
    description: "Physical or mental health concerns",
    Icon: ActivityIcon,
  },
];
```

## Integration with Backend

When integrating with a backend, the selected situation ID can be:
- Saved to user profile
- Used to filter content recommendations
- Tracked for analytics
- Included in survey responses

Example with state management:

```typescript
const handleContinue = () => {
  if (selectedSituation) {
    // Save to backend
    await saveSituationSelection(userId, selectedSituation);
    
    // Navigate with data
    navigate("/next-screen", { state: { situation: selectedSituation } });
  }
};
```

## Accessibility

The situation selector includes:
- Keyboard navigation support
- Clear focus states
- Semantic HTML structure
- ARIA labels (can be added for screen readers)

To enhance accessibility, consider adding:

```typescript
<motion.button
  aria-label={`Select ${situation.title}: ${situation.description}`}
  role="radio"
  aria-checked={isSelected}
  // ... rest of props
>
```

## Testing Checklist

- [ ] All situations display correctly
- [ ] Icons load properly
- [ ] Selection works on first click
- [ ] Only one situation can be selected
- [ ] Continue button is disabled when nothing is selected
- [ ] Navigation flows to the correct next screen
- [ ] Selected situation data is passed correctly
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Animations perform smoothly
- [ ] Text is readable on all backgrounds
