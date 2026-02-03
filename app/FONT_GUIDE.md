# Font Configuration Guide

This guide explains how to swap the font family for the entire FirstShot template.

## Quick Start: Swap the Font

**All fonts are controlled by a single CSS variable.** To change the font for the entire application:

1. Open `/src/styles/fonts.css`
2. Modify the `--font-family` value
3. (Optional) Import your custom font at the top of the file

That's it! The entire app will use your new font.

## Current Configuration

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

## Examples

### System Font Stack (Current Default)
```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

### Google Fonts - Inter
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-family: "Inter", sans-serif;
}
```

### Google Fonts - Poppins
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

:root {
  --font-family: "Poppins", sans-serif;
}
```

### Google Fonts - Montserrat
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

:root {
  --font-family: "Montserrat", sans-serif;
}
```

### Google Fonts - Work Sans
```css
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-family: "Work Sans", sans-serif;
}
```

### Adobe Fonts
```css
/* Add your Adobe Fonts embed code to /index.html <head> */

:root {
  --font-family: "your-adobe-font", sans-serif;
}
```

### Self-Hosted Font
```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/CustomFont-Regular.woff2') format('woff2'),
       url('/fonts/CustomFont-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/CustomFont-Bold.woff2') format('woff2'),
       url('/fonts/CustomFont-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-family: "CustomFont", sans-serif;
}
```

## Font Weights Used in FirstShot

The template uses these font weights:
- **400** (Regular/Normal) - Body text, inputs
- **500** (Medium) - Labels, buttons, headings
- **600** (Semi-Bold) - Emphasized text
- **700** (Bold) - Strong emphasis, numbers

When choosing a font, make sure it supports at least weights 400, 500, and 700.

## Popular Font Recommendations for Discord/Gaming Aesthetic

### Modern & Clean
- **Inter** - Highly readable, excellent for UI
- **Work Sans** - Friendly and professional
- **DM Sans** - Clean and geometric

### Bold & Distinctive
- **Montserrat** - Strong personality, great for headers
- **Poppins** - Geometric and modern
- **Raleway** - Elegant and sophisticated

### Gaming/Tech Vibes
- **Exo 2** - Futuristic and technical
- **Rajdhani** - Bold and geometric
- **Orbitron** - Sci-fi aesthetic (use sparingly)

## Testing Your Font

After changing the font:

1. **Check all screens**: Visit every page to ensure readability
2. **Test responsive**: View on mobile, tablet, and desktop
3. **Verify weights**: Confirm bold and medium weights render correctly
4. **Check special characters**: Test with numbers, symbols, emojis

## Troubleshooting

### Font not loading?
- Check that the `@import` URL is correct
- Verify font weights are specified in the import
- Clear browser cache and reload

### Font looks wrong on some screens?
- Ensure all required font weights (400, 500, 600, 700) are imported
- Check that the font name in `--font-family` matches the import exactly

### Font conflicts with existing styles?
- Font sizes and weights are managed separately in `/src/styles/theme.css`
- The font family is the only thing controlled by `--font-family`

## Advanced: Variable Fonts

For even finer control, you can use variable fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

:root {
  --font-family: "Inter", sans-serif;
}
```

Variable fonts allow any weight between 100-900, giving you more flexibility with font-weight utilities.

## File Location

All font configuration is in: **`/src/styles/fonts.css`**

This file is imported first in `/src/styles/index.css`, ensuring the font loads before all other styles.
