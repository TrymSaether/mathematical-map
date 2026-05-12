# Color System Guide

This document describes the centralized color system for the topology map application.

## Overview

The color system is organized into a single source of truth in [`src/lib/colors.ts`](../lib/colors.ts) to ensure consistency across the entire application. Colors are used in three contexts:

1. **TypeScript/React components** - Using hex colors and helper functions
2. **CSS/Tailwind** - Using Tailwind's color palette and CSS variables
3. **React Flow canvas** - Using rgba colors with dynamic opacity

## Color Organization

### Base Palette (`palette`)

The foundational color definitions:

```typescript
export const palette = {
  cyan: "#5ce1ff", // Primary accent
  violet: "#a78bff", // Secondary accent
  gold: "#ffd58a", // Tertiary accent
  rose: "#ff8fb1", // Alternative accent
  mint: "#7af3c4", // Alternative accent
  orange: "#ffb86c", // Alternative accent
};
```

### Node Kind Colors (`nodeKindColors`)

Colors assigned to different concept types:

- **Definition** → Cyan (`#5ce1ff`)
- **Theorem** → Violet (`#a78bff`)
- **Lemma** → Mint (`#7af3c4`)
- **Example** → Gold (`#ffd58a`)
- **Proposition** → Rose (`#ff8fb1`)
- **Corollary** → Orange (`#ffb86c`)

### Relation Colors (`relationColors`)

Colors for dependency relationships:

- **Statement** → Cyan (`#5ce1ff`)
- **Proof** → Violet (`#a78bff`)
- **Illustration** → Gold (`#ffd58a`)

### UI Colors

- **Background** (`bg.*`) - Surface colors for panels and backgrounds
- **Stroke** (`stroke.*`) - Border and outline colors
- **Canvas** (`canvas.*`) - Graph visualization colors
- **Text** (`text.*`) - Text color definitions
- **Glows** (`glows.*`) - Shadow and glow effects

## Using Colors in Components

### In React/TypeScript

```typescript
import { nodeKindColors, palette, rgbaFromHex } from "../lib/colors";

// Direct color use
const buttonColor = nodeKindColors.definition; // "#5ce1ff"

// Dynamic rgba
const transparentColor = rgbaFromHex(palette.cyan, 0.5); // "rgba(92, 225, 255, 0.5)"

// CSS variable reference
const cssVar = getCSSVar("c", 0.8); // "rgba(var(--c),0.8)"
```

### In CSS/Tailwind

Colors are available through Tailwind's extend config in [`tailwind.config.js`](../../tailwind.config.js):

```jsx
<div className="border-accent-cyan bg-accent-cyan/10 shadow-glow-cyan">
  {/* Uses extended Tailwind colors and shadows */}
</div>
```

### CSS Custom Properties

The `--c` CSS variable stores RGB values (without #) for dynamic opacity:

```css
.kind-definition {
  --c: 92, 225, 255;
} /* palette.cyan */
```

This enables flexible rgba usage in CSS:

```css
border-[rgba(var(--c),0.55)]  /* 55% opacity */
background: rgba(var(--c),0.08)  /* 8% opacity */
shadow: 0 10px 30px -12px rgba(var(--c),0.45)  /* 45% opacity */
```

## Color Utilities

### `hexToRgb(hex: string): [number, number, number]`

Convert hex color to RGB array:

```typescript
hexToRgb("#5ce1ff"); // [92, 225, 255]
```

### `hexToRgbString(hex: string): string`

Convert hex color to RGB string (for CSS custom properties):

```typescript
hexToRgbString("#5ce1ff"); // "92, 225, 255"
```

### `rgbaFromHex(hex: string, opacity: number): string`

Generate rgba color string:

```typescript
rgbaFromHex("#5ce1ff", 0.5); // "rgba(92, 225, 255, 0.5)"
```

### `getCSSVar(varName: string, opacity?: number): string`

Reference CSS custom property with opacity:

```typescript
getCSSVar("c", 0.5); // "rgba(var(--c),0.5)"
```

## File Structure

```
src/
├── lib/
│   └── colors.ts          # Central color definitions & utilities
├── types.ts               # Uses relationColors from colors.ts
├── index.css              # CSS custom properties for node kinds
└── components/
    ├── GraphCanvas.tsx    # Uses nodeKindColors & canvas colors
    ├── TopoNode.tsx       # Uses CSS custom property --c
    └── Sidebar.tsx        # Uses RELATION_COLOR & palette
```

## Maintaining the Color System

### Adding a New Color

1. Add to `palette` in `colors.ts`:

   ```typescript
   export const palette = {
     cyan: "#5ce1ff",
     newColor: "#aabbcc", // Add here
   };
   ```

2. Add RGB version to `paletteRGB`:

   ```typescript
   export const paletteRGB = {
     cyan: "92, 225, 255",
     newColor: "170, 187, 204", // Add here
   };
   ```

3. Use in semantic color groups (e.g., `nodeKindColors`)

4. If it's a node kind, add CSS class to `index.css`:
   ```css
   .kind-newtype {
     --c: 170, 187, 204;
   }
   ```

### Changing a Color

1. Update both hex and RGB values in `colors.ts`
2. The CSS will automatically update since it references the variables
3. All components using these colors will reflect the change

### Verifying Colors Match

Use the utility functions to ensure hex and RGB values stay in sync:

```typescript
const hex = palette.cyan; // "#5ce1ff"
const rgb = hexToRgbString(hex); // Should match paletteRGB.cyan
```

## Color Accessibility

Current palette uses vibrant accent colors on dark backgrounds (WCAG AAA compliant for text). The system supports light mode through `html:not(.dark)` CSS overrides in `index.css`.

## References

- Tailwind Config: [`tailwind.config.js`](../../tailwind.config.js)
- CSS Variables: [`src/index.css`](../index.css)
- Color Definitions: [`src/lib/colors.ts`](../lib/colors.ts)
- Type Definitions: [`src/types.ts`](../types.ts)
