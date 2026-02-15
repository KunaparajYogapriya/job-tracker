# KodNest Premium Build System

**Design System Specification**

A premium SaaS design system for B2C product companies. Calm, intentional, coherent, confident.

---

## Design Philosophy

- **Calm** — No visual noise. No gradients, glassmorphism, neon colors, or animation excess.
- **Intentional** — Every decision serves the product. No decorative elements.
- **Coherent** — One mind designed it. No visual drift between pages.
- **Confident** — Large type, generous whitespace, clear hierarchy.

**Avoid:** Flashy, loud, playful, hackathon-style aesthetics.

---

## Color System

**Maximum 4 colors across the entire system.**

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#F7F6F3` | Page background, off-white |
| Primary Text | `#111111` | Body copy, headings |
| Accent | `#8B0000` | Primary actions, links, focus, warnings |
| Success | `#4A6B4A` | Success states, confirmations |

**Rules:**
- No gradients.
- No neon or saturated colors.
- Borders: `rgba(17, 17, 17, 0.12)` for subtle separation.

---

## Typography

### Fonts
- **Headings:** Serif (Libre Baskerville / Georgia)
- **Body:** Sans-serif (Source Sans 3 / system fallback)

### Scale
- **H1:** 2.5rem, line-height 1.2, letter-spacing -0.02em
- **H2:** 2rem, line-height 1.25
- **H3:** 1.5rem, line-height 1.3
- **Body:** 16–18px (1.0625rem), line-height 1.6–1.8
- **Small:** 0.9375rem, line-height 1.5

### Rules
- Text blocks: **max-width 720px**
- Generous spacing between sections
- No decorative fonts, no random sizes

---

## Spacing System

**Strict scale. No exceptions.**

| Token | Value |
|-------|-------|
| `--space-xs` | 8px |
| `--space-sm` | 16px |
| `--space-md` | 24px |
| `--space-lg` | 40px |
| `--space-xl` | 64px |

**Never use:** 13px, 27px, or any value outside this scale.

---

## Global Layout Structure

Every page follows this structure, in order:

```
[Top Bar]
     ↓
[Context Header]
     ↓
[Primary Workspace] + [Secondary Panel]  (side by side)
     ↓
[Proof Footer]
```

### Top Bar
- **Left:** Project name
- **Center:** Progress indicator (Step X / Y)
- **Right:** Status badge (Not Started / In Progress / Shipped)
- Height: 56px
- Border-bottom for separation

### Context Header
- Large serif headline
- One-line subtext
- Clear purpose, no hype language

### Primary Workspace (70% width)
- Main product interaction area
- Clean cards, predictable components
- No crowding

### Secondary Panel (30% width)
- Step explanation (short)
- Copyable prompt box
- Buttons: Copy, Build in Lovable, It Worked, Error, Add Screenshot
- Calm styling

### Proof Footer (persistent)
- Checklist style: □ UI Built □ Logic Working □ Test Passed □ Deployed
- Each checkbox requires user proof input

---

## Component Rules

### Buttons
- **Primary:** Solid deep red (#8B0000), white text
- **Secondary:** Outlined, transparent background, border
- Same hover effect everywhere
- Border radius: 6px
- Min height: 44px

### Inputs
- Clean borders, no heavy shadows
- Clear focus state (border-color → accent)
- Height: 44px
- Padding: 0 16px

### Cards
- Subtle border (1px solid)
- No drop shadows
- Balanced padding (24px)
- Border radius: 6px

### Status Badges
- Neutral, Success, Warning variants
- Inline-flex, compact
- Match border and text to semantic color

---

## Interaction Rules

- **Transitions:** 150–200ms
- **Easing:** ease-in-out
- **No bounce, no parallax**
- Applied per-component, not globally

---

## Error & Empty States

### Errors
- Explain what went wrong
- Explain how to fix it
- Never blame the user

### Empty States
- Provide next action
- Never feel dead
- Clear, actionable copy

---

## File Structure

```
kodnest-design-system/
├── tokens.css      — Design tokens (CSS custom properties)
├── base.css        — Base styles, typography, components, layout
├── SPECIFICATION.md — This document
└── README.md       — Quick reference
```

---

## Usage

1. Import `tokens.css` before `base.css`
2. Use layout classes for page structure
3. Use component classes for UI elements
4. Reference tokens for custom components

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
```
