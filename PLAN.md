# Implementation Plan: eatMyPack UI Overhaul

## Context
The user has provided 24 specific UI/UX changes across 5 areas (Foods page, Home page, Pantry, Race Setup, Race Details). These range from simple icon swaps to new features (waystation foods, name modal, waystation display on plan page). The app uses React Native/Expo with file-based routing, Zustand state, and react-native-svg for illustrations.

## Original Requirements

### Foods page
1. Use the updated freeze-dried SVG (currently hand-coded in CategoryIcon.tsx)
2. Pantry icon should use pantry-icon.svg with 30% opacity if not selected, 100% if selected

### Home page
1. Update footer to use footer-background.svg, home-icon.svg, foods-icon.svg, settings-icon.svg
2. Free-scrolling pantry carousel with dots as progress indicators; clicking a dot snaps to those 3 cards
3. Pantry card shadow to left+bottom (currently left+top), 2px smaller
4. Pantry "See All" card: pantry SVG icon + "see all" below, centered vertically and horizontally
5. "+" buttons: slightly larger font, vertically centered, same color as button outline
6. Plans empty state: move "No plans yet" up into green section, leave "Add an adventure" where it is
7. Fix: clicking "+" or empty state navigates to race setup, but back goes to races page instead of home
8. Use arrow-icon SVG instead of ">" symbol

### Pantry
1. Only show pantry foods, with add-new-foods button at bottom navigating to foods page

### Race Setup
1. Remove "race" bar at top from all race screens
2. Fix hero-setup shifted to the right
3. Simple distance cards: 3 per row if they fit
4. Complex mode: no distance cards, just custom box
5. Waystation notes: full width under "notes" title
6. Add "packed foods" to waystations (navigate to foods page with pantry items on top)
7. "Name your plan" modal over race setup instead of its own page

### Race Details
1. Waystations show as colored bars across full page with minimal info, clickable for detail
2. Remove triangles in phase card images (clipPath rendering artifact)

---

## Phase 1: SVG Asset Components & Foundations (PARTIALLY DONE)
*Create reusable SVG components that later phases depend on.*

### 1A. Create icon wrapper components - DONE
**Files created:**
- `src/components/illustrations/FooterBackground.tsx` - wraps `assets/illustrations/footer-background.svg`
- `src/components/illustrations/HomeIcon.tsx` - wraps `assets/illustrations/home-icon.svg`
- `src/components/illustrations/FoodsIcon.tsx` - wraps `assets/illustrations/foods-icon.svg`
- `src/components/illustrations/SettingsIcon.tsx` - wraps `assets/illustrations/settings-icon.svg`
- `src/components/illustrations/ArrowIcon.tsx` - wraps `assets/illustrations/arrow-icon.svg`
- `src/components/illustrations/PantryIcon.tsx` - wraps `assets/illustrations/pantry-icon.svg`
- `src/components/illustrations/index.ts` - updated with barrel exports

### 1B. Fix CategoryIcon freeze-dried - PENDING
**File:** `src/components/illustrations/CategoryIcon.tsx`
- Import `FreezeDriedSvg from '../../../assets/freeze_dried.svg'`
- Replace hand-coded `FreezeDriedIcon` with SVG import
- Add `freeze_dried: FreezeDriedSvg` to `SVG_CATEGORY_MAP`

### 1C. Fix phase SVG triangle artifacts - PENDING
**Files:** `assets/illustrations/phase-early.svg`, `phase-mid.svg`, `phase-late.svg`
- Remove `<g clip-path="url(#clipX)">` wrapper (keep inner content)
- Remove `<defs>` section entirely
- Content stays within viewBox bounds, clipping unnecessary

---

## Phase 2: Home Page Changes - PENDING

### 2A. Update tab bar with SVG icons and footer background
**File:** `src/app/_layout.tsx`
- Replace emoji icons with SVG components (HomeIcon, FoodsIcon, SettingsIcon)
- Add footer-background.svg behind tab bar

### 2B. Replace ">" chevrons with arrow-icon SVG
**Files:** `src/app/index.tsx`, `src/components/home/PantryCarousel.tsx`
- Replace `<Text>{'>'}</Text>` with `<ArrowIcon />`

### 2C. Free-scrolling pantry carousel with tappable dots
**File:** `src/components/home/PantryCarousel.tsx`
- Remove `pagingEnabled`, add `snapToInterval={CARD_WIDTH + CARD_GAP}`
- Flat card layout (not grouped into pages)
- Tappable dots that scroll to card groups
- Add `useRef` for ScrollView programmatic scrolling

### 2D. Fix pantry card shadow direction
**File:** `src/components/home/PantryCard.tsx`
- Change `shadowLayer` from `top:0,left:0` to `bottom:0,left:0`
- Card margin from `marginTop:6,marginLeft:6` to `marginBottom:4,marginLeft:4`
- Reduce offset from 6px to 4px

### 2E. Pantry "See All" card with icon
**File:** `src/components/home/PantryCarousel.tsx`
- Add `<PantryIcon />` above "See all" text in see_all card

### 2F. Fix "+" button styling
**Files:** `src/app/index.tsx`, `src/components/home/PantryCarousel.tsx`
- Increase font from 18→22, color to match `pantryCardBorder`, proper lineHeight

### 2G. Fix plans empty state positioning
**File:** `src/app/index.tsx`
- Move "No plans yet" up into green illustration area
- Keep "Add an adventure" at bottom

### 2H. Fix back navigation from race setup
**File:** `src/app/race/setup.tsx`
- Add explicit back handler to navigate to home (`/`)

---

## Phase 3: Pantry Page Overhaul - PENDING

### 3A. Filter pantry to only show owned foods
**File:** `src/app/settings/pantry.tsx`
- Show only `pantryFoodIds` foods
- Add "Add new foods" button at bottom → `/database`

### 3B. Pantry icon with opacity on foods page
**File:** `src/app/database/index.tsx` or FoodFilterBar
- Replace pantry toggle with PantryIcon SVG, 30% opacity when unselected

---

## Phase 4: Race Setup Changes - PENDING

### 4A. Remove race header bar
**File:** `src/app/race/_layout.tsx`
- Add `headerShown: false` to Stack screenOptions

### 4B. Fix hero-setup positioning
**File:** `src/app/race/setup.tsx` or SVG
- Add `alignItems: 'center'` to heroContainer or fix SVG viewBox

### 4C. Fix distance cards - 3 per row
**File:** `src/components/race/RaceForm.tsx`
- Fix grid: `flexWrap: 'wrap'`, card width = `(containerWidth - 2*gap) / 3`

### 4D. Complex mode - only custom distance
**File:** `src/components/race/RaceForm.tsx`
- Hide preset distance cards in complex mode, show only custom input
- Auto-set distance to 'custom'

### 4E. Fix waystation notes layout
**File:** `src/components/race/WaystationEditor.tsx`
- Notes TextInput full width under "Notes" label

### 4F. Add packed foods to waystations
**Files:** `src/components/race/WaystationEditor.tsx`, `src/app/database/index.tsx`, `src/store/useStore.ts`
- Add "Packed Foods" section to waystation card
- "Add foods" navigates to foods page with pantry items on top
- Auto-calculate calories from selected foods

### 4G. Name your plan modal
**File:** `src/components/race/RaceForm.tsx`
- Replace name step with Modal overlay
- Modal: text input + "Create Plan" button + cancel

---

## Phase 5: Race Details Changes - PENDING

### 5A. Display waystations in plan view
**File:** `src/app/race/plan.tsx`
- Insert waystation bars between phase sections at correct time positions
- Full-width colored bars with minimal waystation info
- Tappable → new waystation detail screen

**New file:** `src/app/race/waystation-detail.tsx`
- Full waystation details: type, position, notes, packed foods, calories

---

## Key Files Summary

| File | Changes |
|------|---------|
| `src/components/illustrations/CategoryIcon.tsx` | Use freeze_dried.svg import |
| `src/components/illustrations/index.ts` | Add new icon exports (DONE) |
| `src/app/_layout.tsx` | SVG tab icons + footer background |
| `src/app/index.tsx` | Arrow icons, "+" buttons, empty state, back nav |
| `src/components/home/PantryCarousel.tsx` | Free scroll, dots, see-all icon, arrow icon |
| `src/components/home/PantryCard.tsx` | Shadow direction fix |
| `src/app/settings/pantry.tsx` | Filter to pantry-only foods |
| `src/app/database/index.tsx` | Pantry icon opacity, waystation food selection mode |
| `src/app/race/_layout.tsx` | Hide header |
| `src/app/race/setup.tsx` | Hero positioning, back navigation |
| `src/components/race/RaceForm.tsx` | Distance cards, complex mode, name modal |
| `src/components/race/WaystationEditor.tsx` | Notes layout, packed foods |
| `src/app/race/plan.tsx` | Waystation bars display |
| `assets/illustrations/phase-early.svg` | Remove clipPath |
| `assets/illustrations/phase-mid.svg` | Remove clipPath |
| `assets/illustrations/phase-late.svg` | Remove clipPath |

**New files:**
- 6 icon wrapper components in `src/components/illustrations/` (DONE)
- `src/app/race/waystation-detail.tsx` — waystation detail screen
