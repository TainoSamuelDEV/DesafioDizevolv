---
name: Phoenix Flow
colors:
  surface: '#ffffff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e1e7ff'
  surface-container-highest: '#dae2fc'
  on-surface: '#131b2e'
  on-surface-variant: '#434654'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#1b55d0'
  primary: '#003594'
  on-primary: '#ffffff'
  primary-container: '#004ac6'
  on-primary-container: '#b8c8ff'
  inverse-primary: '#b4c5ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#2f3f54'
  on-tertiary: '#ffffff'
  tertiary-container: '#46566c'
  on-tertiary-container: '#bacbe5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e1e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e2'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f8fafc'
  on-background: '#131b2e'
  surface-variant: '#dae2fc'
  status-error: '#ba1a1a'
  status-success: '#46566c'
  status-warning: '#b4c5ff'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 2rem
  stack-gap: 0.75rem
  column-width: 320px
  column-gutter: 1.5rem
  card-padding: 1rem
  sidebar-width: 256px
---

## Brand & Style

**Phoenix Flow** is an enterprise-grade productivity aesthetic that balances high-velocity engineering needs with executive-level clarity. The brand personality is **Systematic, Velocity-Oriented, and Trustworthy**.

The design style is **Corporate Modern with a "Glass-Subtle" influence**. It utilizes a clean, systematic layout inspired by modern SaaS platforms (like Linear or Asana), characterized by a restricted color palette, high-quality typography, and purposeful use of whitespace. The interface prioritizes functional density without sacrificing legibility, employing a "soft-functional" approach where utility is wrapped in approachable, rounded containers.

## Colors
The palette is built on a "Fidelity Blue" foundation, symbolizing reliability and professional focus.

- **Primary:** A deep, authoritative blue used for brand elements, active states, and primary actions.
- **Surface & Background:** The interface uses a tiered neutral system. The main background is a cool-toned slate white (`#f8fafc`), while interactive surfaces and cards use pure white to pop against the subtle grey-blue containers.
- **Functional Accents:** High-contrast error reds and tertiary slate tones are used sparingly for status indicators (bugs, high priority) to ensure "information scent" is maintained without overwhelming the user.
- **Overlays:** Utilize 80% opacity with `backdrop-blur-md` for headers to maintain context while scrolling through dense data.

## Typography
We use **Inter** exclusively to lean into its utilitarian, highly-legible characteristics. 

The hierarchy is built on a tight scale:
- **Headlines:** Use semi-bold weights and slight negative letter-spacing to create a "locked-in" professional look.
- **Body Text:** Standardizes on 14px for maximum information density in dashboards, while 13px is used for secondary metadata.
- **Labels:** Meta-information (tags, priorities) uses all-caps bold styling at 11px to differentiate functional data from narrative content.
- **Scalability:** For mobile, `headline-lg` should scale down to 20px, while body sizes remain constant to ensure accessibility.

## Layout & Spacing
The system utilizes a **Fixed-Width Column Grid** for Kanban views and a **Fluid Content Area** for standard dashboards.

- **Sidebar:** A fixed 256px vertical navigation provides the primary anchor.
- **Horizontal Rhythm:** Columns are fixed at 320px width with 24px (1.5rem) gutters to prevent text lines from becoming too long and unreadable.
- **Vertical Rhythm:** A base 4px/8px grid is used. Cards within columns use a 12px (0.75rem) stack gap.
- **Mobile Adaptivity:** On tablets, columns transition to a single-column scroll or a 2-column grid. On mobile, the sidebar collapses into a hamburger menu, and internal padding reduces from 2rem to 1rem.

## Elevation & Depth
Depth is created through **Tonal Layering** rather than aggressive shadowing. 

- **Level 0 (Background):** `#f8fafc` — The base canvas.
- **Level 1 (Containers):** `#eaedff` — Used for column backgrounds to group content.
- **Level 2 (Cards/Primary Surface):** Pure `#ffffff` with a `card-shadow` (0px 1px 3px rgba(0,0,0,0.05)). This subtle shadow provides enough lift to indicate interactability without looking "heavy."
- **Level 3 (Interaction):** On hover or drag, cards scale to 1.02 and transition to a deeper shadow (shadow-xl) to simulate physical pick-up.
- **Navigation:** The TopBar uses a `backdrop-blur-md` (80% opacity) to signify its position as a fixed overlay above the scrolling content.

## Shapes
The shape language is **"Modern Soft"**.

- **Primary Actions & Cards:** Use a 12px (0.75rem) radius (`rounded-xl` in the variable context) to appear friendly and modern.
- **Small Elements:** Icons, tags, and small buttons use a 4px-6px radius to maintain a precise, technical feel.
- **Avatars & Search Bars:** Use full `pill-shaped` rounding to provide a visual break from the predominantly rectangular grid.
- **State Feedback:** Hover states on list items should use a 8px (0.5rem) radius to match the container's inner padding flow.

## Components

- **Buttons:** 
  - *Primary:* Filled with `primary-container`, high-contrast text, 10px vertical padding. 
  - *Ghost:* No border, primary text color, becomes tinted on hover.
- **Kanban Cards:** 1px border (`outline-variant`) with white background. Must include a clear vertical stack: Tag -> Title -> Description -> Metadata footer.
- **Status Chips:** Small, 11px bold text. Use 10% opacity of the status color for the background and 100% for the text (e.g., Error text on light-red background).
- **Navigation Items:** 8px padding, 12px gap between icon and text. Active states use a "Tonal Lift" (light blue background and bold primary text).
- **Input Fields:** Search bars should be pill-shaped, borderless, and use `surface-container-low` for the background to recede into the header.
- **Progress Bars:** Minimalist 6px height, using a primary/neutral-grey pairing to indicate completion percentage without visual noise.