# EventGo Design System

## Overview
This document outlines the comprehensive design system implemented across the EventGo application for consistent, professional styling.

## Core Principles

### 1. **Consistency**
- All components use shared CSS variables
- Unified spacing, colors, and typography
- Predictable interaction patterns

### 2. **Maintainability**
- Centralized design tokens in `index.css`
- Component library in `components.css`
- Easy to update globally

### 3. **Accessibility**
- Proper color contrast
- Clear focus states
- Semantic HTML structure

## Design Tokens

### Colors

#### Background Colors
- `--color-bg-primary: #0f172a` - Main background
- `--color-bg-secondary: #1e293b` - Secondary background
- `--color-bg-tertiary: #334155` - Tertiary elements

#### Surface Colors (Cards, Panels)
- `--color-surface: rgba(30, 41, 59, 0.8)` - Default card background
- `--color-surface-hover` - Hover state
- `--color-surface-glass` - Glassmorphic elements

#### Text Colors
- `--color-text-primary: #f1f5f9` - Primary text
- `--color-text-secondary: #cbd5e1` - Secondary text
- `--color-text-tertiary: #94a3b8` - Tertiary text
- `--color-text-muted: #64748b` - Muted text

#### Brand Colors
- `--color-primary: #6366f1` - Primary brand color
- `--color-secondary: #7c3aed` - Secondary brand color
- `--color-accent: #3b82f6` - Accent color

#### Status Colors
- `--color-success: #10b981` - Success states
- `--color-warning: #f59e0b` - Warning states
- `--color-error: #ef4444` - Error states
- `--color-info: #3b82f6` - Info states

### Spacing Scale
```css
--space-xs: 0.25rem    /* 4px */
--space-sm: 0.5rem     /* 8px */
--space-md: 1rem       /* 16px */
--space-lg: 1.5rem     /* 24px */
--space-xl: 2rem       /* 32px */
--space-2xl: 3rem      /* 48px */
```

### Border Radius
```css
--radius-sm: 6px
--radius-md: 10px
--radius-lg: 14px
--radius-xl: 18px
--radius-full: 9999px
```

### Shadows
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1)
--shadow-md: 0 8px 24px rgba(0, 0, 0, 0.25)
--shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.4)
--shadow-xl: 0 24px 64px rgba(0, 0, 0, 0.5)
```

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

## Component Library

### Buttons

#### Usage
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-ghost">Ghost Button</button>
<button class="btn btn-danger">Danger Button</button>
```

#### Sizes
- `btn-sm` - Small button
- `btn` - Default size
- `btn-lg` - Large button
- `btn-full` - Full width button

#### Variants
- `btn-primary` - Primary action (gradient)
- `btn-secondary` - Secondary action
- `btn-ghost` - Minimal style
- `btn-success` - Success action
- `btn-danger` - Destructive action
- `btn-warning` - Warning action

### Cards

#### Usage
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <p class="card-subtitle">Card subtitle</p>
  </div>
  <div class="card-body">
    Card content goes here
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

#### Variants
- `card` - Default card
- `card-sm` - Compact padding
- `card-lg` - Large padding
- `card-flat` - No shadow

### Form Controls

#### Usage
```html
<div class="form-group">
  <label class="form-label form-label-required">Email</label>
  <input type="email" class="form-input" placeholder="Enter email">
  <span class="form-hint">We'll never share your email</span>
</div>
```

#### Classes
- `form-group` - Form field container
- `form-label` - Label styling
- `form-label-required` - Shows asterisk
- `form-input` - Text input
- `form-textarea` - Textarea
- `form-select` - Select dropdown
- `form-error` - Error message
- `form-hint` - Help text

### Badges

```html
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-info">Info</span>
```

### Alerts

```html
<div class="alert alert-success">Operation successful!</div>
<div class="alert alert-error">An error occurred</div>
<div class="alert alert-warning">Warning message</div>
<div class="alert alert-info">Informational message</div>
```

### Loading Spinner

```html
<span class="spinner"></span>
<span class="spinner spinner-sm"></span>
<span class="spinner spinner-lg"></span>
```

## Utility Classes

### Spacing
```css
.mt-sm, .mt-md, .mt-lg, .mt-xl  /* Margin top */
.mb-sm, .mb-md, .mb-lg, .mb-xl  /* Margin bottom */
.p-sm, .p-md, .p-lg, .p-xl      /* Padding */
```

### Layout
```css
.flex                    /* Display flex */
.flex-col               /* Flex direction column */
.items-center           /* Align items center */
.justify-between        /* Space between */
.gap-sm, .gap-md        /* Gap spacing */
```

### Grid
```css
.grid                   /* Display grid */
.grid-cols-2            /* 2 columns */
.grid-cols-3            /* 3 columns */
.grid-cols-4            /* 4 columns */
```

### Text
```css
.text-xs, .text-sm, .text-base, .text-lg, .text-xl  /* Font sizes */
.text-primary, .text-secondary, .text-tertiary      /* Text colors */
.text-success, .text-error, .text-warning           /* Status colors */
.text-center, .text-left, .text-right               /* Alignment */
.font-bold, .font-semibold, .font-medium            /* Font weight */
```

### Width
```css
.w-full                 /* Width 100% */
.w-auto                 /* Width auto */
```

### Container
```css
.container              /* Max 1400px container */
.container-sm           /* Max 800px */
.container-lg           /* Max 1920px */
```

## File Structure

```
frontend/src/
├── index.css                 # Design system tokens
├── App.css                   # Root app styles
├── main.jsx                  # Imports index.css + components.css
└── styles/
    ├── components.css        # Reusable UI components
    ├── header.css           # Header navigation
    ├── events.css           # Events listing page
    ├── event_details.css    # Event detail page
    ├── auth.css             # Login/register pages
    ├── dashboard.css        # Dashboard layout
    ├── profile.css          # Profile pages
    └── organizer.css        # Organizer-specific pages
```

## Best Practices

### 1. Use Design Tokens
❌ **Don't:**
```css
.my-element {
  background: #1e293b;
  padding: 16px;
  border-radius: 10px;
}
```

✅ **Do:**
```css
.my-element {
  background: var(--color-surface);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
```

### 2. Use Component Classes
❌ **Don't:**
```html
<button style="background: linear-gradient(90deg, #60a5fa, #7c3aed); padding: 10px 20px;">
  Click Me
</button>
```

✅ **Do:**
```html
<button class="btn btn-primary">
  Click Me
</button>
```

### 3. Use Utility Classes for Layout
❌ **Don't:**
```html
<div style="display: flex; gap: 16px; align-items: center;">
  Content
</div>
```

✅ **Do:**
```html
<div class="flex gap-md items-center">
  Content
</div>
```

## Theme Variants

### Dark Theme (Default)
- Background: Dark blue gradients
- Cards: Glassmorphic with blur
- Text: Light colors

### Organizer Theme
- Background: White
- Cards: Same glassmorphic style (contrast adjusted)
- Accent: Purple gradients
- Applied via `body.organizer-bg` class

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px)  { /* Small tablets */ }
@media (min-width: 768px)  { /* Tablets */ }
@media (min-width: 1024px) { /* Laptops */ }
@media (min-width: 1280px) { /* Desktops */ }
```

### Guidelines
- All spacing scales proportionally
- Cards stack on mobile (grid → single column)
- Text sizes reduce on smaller screens
- Touch targets min 44px × 44px

## Accessibility

### Focus States
- All interactive elements have visible focus states
- Uses `--color-border-focus` with ring effect
- Never remove outlines without replacement

### Color Contrast
- Text meets WCAG AA standards
- Primary text on dark bg: 15:1 ratio
- Secondary text: 7:1 ratio

### Semantic HTML
- Use proper heading hierarchy (h1 → h6)
- Form labels associated with inputs
- Buttons for actions, links for navigation

## Migration Guide

### Converting Existing Components

1. **Replace hardcoded colors:**
   ```css
   /* Before */
   background: #1e293b;
   
   /* After */
   background: var(--color-surface);
   ```

2. **Replace spacing:**
   ```css
   /* Before */
   padding: 16px;
   margin-top: 24px;
   
   /* After */
   padding: var(--space-md);
   margin-top: var(--space-lg);
   ```

3. **Replace border radius:**
   ```css
   /* Before */
   border-radius: 10px;
   
   /* After */
   border-radius: var(--radius-md);
   ```

4. **Use component classes:**
   ```html
   <!-- Before -->
   <button style="...">Click</button>
   
   <!-- After -->
   <button class="btn btn-primary">Click</button>
   ```

## Support

For questions or suggestions about the design system:
1. Check this documentation
2. Review `components.css` for available classes
3. Inspect existing pages for usage examples

---

**Last Updated:** November 23, 2025
**Version:** 1.0.0
