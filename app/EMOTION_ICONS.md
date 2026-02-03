# Emotion Icons Guide

This document explains how to swap, customize, or replace emotion icons in the FirstShot template.

## Overview

All emotion icons are **discrete, standalone components** located in `/src/app/components/emotion-icons.tsx`. Each icon can be individually replaced without affecting others.

## Icon Structure

Each icon is a React component that accepts these props:

```typescript
interface EmotionIconProps {
  isSelected: boolean;  // Whether the icon is currently selected
  className?: string;   // Optional CSS classes
}
```

## Available Icons

| Icon Component | Emotion | Color | Animation |
|---------------|---------|-------|-----------|
| `StartledIcon` | Startled | Yellow/Amber | Pulsing eyes and mouth |
| `WarmthIcon` | Warmth | Orange | Rocking with expanding smile |
| `CuriosityIcon` | Curiosity | Purple | Tilting head with eyebrow raise |
| `FrustrationIcon` | Frustration | Red | Furrowed brow pulsing |
| `FearIcon` | Fear | Indigo | Trembling motion |
| `HeavinessIcon` | Heaviness | Gray | Slow downward drift |
| `RevulsionIcon` | Revulsion | Lime Green | Recoiling rotation |
| `AversionIcon` | Aversion | Pink | Turning away |
| `ShameIcon` | Shame | Purple/Violet | Shrinking downward |

## How to Swap Icons

### Method 1: Replace Individual Icon Component

Open `/src/app/components/emotion-icons.tsx` and replace the entire function:

```typescript
// Before
export function StartledIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <svg viewBox="0 0 128 128" className={className}>
      {/* old icon code */}
    </svg>
  );
}

// After - swap with your custom icon
export function StartledIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <svg viewBox="0 0 128 128" className={className}>
      {/* your new icon code */}
    </svg>
  );
}
```

### Method 2: Create New Icon and Update Mapping

1. Create your custom icon component in `/src/app/components/emotion-icons.tsx`:

```typescript
export function MyCustomStartledIcon({ isSelected, className = "" }: EmotionIconProps) {
  return (
    <svg viewBox="0 0 128 128" className={className}>
      {/* your custom icon */}
    </svg>
  );
}
```

2. Update the mapping in `/src/app/components/emotion-selection-screen.tsx`:

```typescript
import { MyCustomStartledIcon } from "@/app/components/emotion-icons";

const emotions: Emotion[] = [
  { id: "startled", name: "Startled", Icon: MyCustomStartledIcon }, // Changed
  { id: "warmth", name: "Warmth", Icon: WarmthIcon },
  // ... rest unchanged
];
```

### Method 3: Use External Image/Icon

Replace any icon with an image component:

```typescript
// In emotion-selection-screen.tsx
const emotions: Emotion[] = [
  { 
    id: "startled", 
    name: "Startled", 
    Icon: ({ className }) => (
      <img src="/path/to/icon.png" alt="Startled" className={className} />
    )
  },
  // ... rest of emotions
];
```

## Animation Guidelines

All icons use Motion (Framer Motion) for animations. Common animation patterns:

### Continuous Loop Animation
```typescript
<motion.element
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

### Selection-Based Animation
```typescript
<motion.element
  animate={isSelected ? { rotate: [0, 10, 0] } : {}}
  transition={{ duration: 1, repeat: Infinity }}
/>
```

### Hover/Interaction Animation
These are handled in the parent component and don't need to be added to individual icons.

## Icon Requirements

For icons to work properly, they must:

1. ✅ Accept `EmotionIconProps` as props
2. ✅ Return an SVG or image element
3. ✅ Use `className` prop on the root element
4. ✅ Have a consistent viewBox (recommended: `0 0 128 128`)
5. ✅ Be exported from `/src/app/components/emotion-icons.tsx`

## Reordering Emotions

Simply rearrange the array in `/src/app/components/emotion-selection-screen.tsx`:

```typescript
const emotions: Emotion[] = [
  { id: "warmth", name: "Warmth", Icon: WarmthIcon },      // Now first
  { id: "startled", name: "Startled", Icon: StartledIcon }, // Now second
  // ... rest in your preferred order
];
```

## Adding New Emotions

1. Create the icon component in `/src/app/components/emotion-icons.tsx`
2. Export it
3. Add it to the emotions array:

```typescript
const emotions: Emotion[] = [
  // ... existing emotions
  { id: "excitement", name: "Excitement", Icon: ExcitementIcon },
];
```

## Removing Emotions

Simply remove the emotion from the array in `/src/app/components/emotion-selection-screen.tsx`. The grid will automatically adjust.

## Best Practices

- **Keep it simple**: Icons should be recognizable at 128x128px
- **Use gradients**: Match the FirstShot purple/pink aesthetic
- **Animate subtly**: Animations should enhance, not distract
- **Test responsiveness**: Icons scale to 96px (mobile) and 128px (tablet/desktop)
- **Maintain consistency**: All icons should feel like part of the same family

## Technical Notes

- Icons are rendered as inline SVG for performance
- Animations use Motion for GPU acceleration
- The `isSelected` prop triggers enhanced animations
- Icons are wrapped with hover/tap animations from the parent component
- All icons support the purple glow effect when selected
