---
name: Serene Vet
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf1'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fa'
  on-surface: '#111c2c'
  on-surface-variant: '#404941'
  inverse-surface: '#263142'
  inverse-on-surface: '#ebf1ff'
  outline: '#707971'
  outline-variant: '#c0c9bf'
  surface-tint: '#2d6a44'
  primary: '#2d6a44'
  on-primary: '#ffffff'
  primary-container: '#98d8aa'
  on-primary-container: '#22603b'
  inverse-primary: '#95d5a7'
  secondary: '#356572'
  on-secondary: '#ffffff'
  secondary-container: '#b7e7f7'
  on-secondary-container: '#3a6977'
  tertiary: '#5c5f61'
  on-tertiary: '#ffffff'
  tertiary-container: '#c7cacc'
  on-tertiary-container: '#525557'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f1c2'
  primary-fixed-dim: '#95d5a7'
  on-primary-fixed: '#00210e'
  on-primary-fixed-variant: '#10512e'
  secondary-fixed: '#baeafa'
  secondary-fixed-dim: '#9ecede'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#1a4d5a'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f9f9ff'
  on-background: '#111c2c'
  surface-variant: '#d8e3fa'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-margin: 20px
  gutter: 16px
---

## Brand & Style

The brand personality focuses on empathy, precision, and tranquility. This design system is built to reassure pet owners through a clinical yet warm digital environment. The target audience includes modern pet parents who value transparency, ease of use, and professional care.

The design style is **Minimalist-Modern** with a focus on tactile softness. It utilizes generous white space to reduce cognitive load—crucial during high-stress medical situations—and employs elegant, soft-edged UI components that feel approachable. The aesthetic response should be one of immediate calm, cleanliness, and competence.

## Colors

The palette is rooted in medical wellness and natural tranquility. 
- **Pastel Green (Primary):** Used for primary actions, health indicators, and success states. It represents vitality and recovery.
- **Soft Celeste (Secondary):** Used for supportive elements, background accents, and secondary information. It evokes trust and the calming nature of clear skies.
- **White & Off-White:** The primary canvas color, ensuring a "sterile" and professional clinic feel without being harsh.
- **Neutral Slate:** Used for text and icons to maintain high legibility while appearing softer than pure black.

## Typography

This design system utilizes a dual-font approach to balance character with utility. **Manrope** is used for headlines to provide a refined, modern, and slightly geometric warmth. **Inter** is the workhorse for body copy and UI labels, selected for its exceptional readability on mobile screens and medical data tables. Hierarchy is established through clear scale shifts and purposeful use of weight rather than decorative styles.

## Layout & Spacing

Following a **mobile-first, fluid grid philosophy**, the system prioritizes vertical rhythm and thumb-friendly touch targets. The layout relies on a 4px baseline grid. On mobile devices, a single-column layout is standard with 20px side margins. As the viewport expands, the layout transitions to a 12-column grid. Large "breathable" margins are mandatory to prevent the UI from feeling cluttered or "urgent," reinforcing the calm brand identity.

## Elevation & Depth

Visual hierarchy is achieved through **Ambient Shadows** and **Tonal Layering**. Surfaces do not "float" high above the background; instead, they sit just above it with extremely soft, diffused shadows (Blur: 20px-40px, Opacity: 4-8%) tinted with a hint of the secondary Celeste color. This prevents the "dirty" look of grey shadows on white. 

Secondary information is placed on subtly tinted Pastel Green or Celeste containers with no shadow, creating a clear distinction between interactive "lifted" cards and static "inset" information blocks.

## Shapes

The shape language is consistently **Rounded**. By avoiding sharp corners, the interface feels safer and more friendly—an essential psychological cue for pet care. Standard buttons and input fields use a 0.5rem radius, while larger content cards and image containers utilize 1rem to 1.5rem radii. This soft geometry mimics the organic shapes found in nature and the friendly silhouettes of animals.

## Components

### Buttons & Interaction
- **Primary Button:** Solid Pastel Green with white text, using a subtle lift-on-hover shadow.
- **Secondary Button:** Ghost style with a Celeste border and text.
- **Tertiary/Text Button:** Simple Inter SemiBold with an arrow icon for "Read More" actions.

### Cards & Containers
- **Health Cards:** White background, soft shadow, 1rem corner radius. Use for pet profiles or appointment summaries.
- **Alert/Notice Cards:** Flat, non-elevated containers with a 5% opacity Pastel Green fill to denote wellness tips or status updates.

### Inputs & Forms
- **Fields:** Subtle 1px border in light grey, transitioning to Pastel Green on focus. Labels are always persistent (top-aligned) for accessibility.
- **Selection:** Checkboxes and Radio buttons use the primary green color when active, with high-contrast white interiors.

### Lists & Navigation
- **Mobile Navigation:** A fixed bottom bar with modern, thin-stroke pet icons (dog, cat, medical cross, calendar). 
- **Lists:** Clean rows separated by 1px light Celeste dividers, providing ample vertical padding (16px) for easy tapping.

### Specialized Components
- **Pet Status Badges:** Small pill-shaped chips with low-saturation backgrounds (e.g., "Recovering", "Healthy", "Upcoming").
- **Treatment Timeline:** A vertical track using the secondary Celeste color to guide the user through a pet's medical history.