# My Pantry — Homepage Section Requirements

**Reference design:** `assets/my_pantry.png`

## Overview

Redesign the "My Pantry" section on the homepage (`src/app/index.tsx`) from the current minimal horizontal scroll (80x96 cards with emoji icon, name, calories) to a richer paginated carousel with detailed nutrition cards matching the mockup.

---

## Section Header

- **Layout:** Single row containing the title, chevron, and add button.
- **Title:** "My pantry" with a `>` chevron. Tapping navigates to `/settings/pantry`.
- **"+" button:** Square with rounded corners, thin border (`#CAAC86`), dark brown `+` symbol (`#553924`). Tapping navigates to the Foods tab (`/database`) to browse and add items.
- **"+" button visibility:** Hidden when the pantry is empty. Only shown when there is at least one pantry item.

---

## Pantry Cards

### Layout

- Paginated horizontal carousel that **snaps to pages**.
- **4 cards per page**, sized to fill the screen width with equal spacing.
- Match approximate proportions from the mockup (cards are significantly taller than the current 80x96).

### Card Styling

- **Background:** `#F3EBE0` (warm cream)
- **Border:** `#CAAC86` (warm tan), visible border matching the mockup weight
- **Rounded corners:** Match existing `borderRadius` tokens

### Card Content (top to bottom)

1. **Category icon** — SVG `CategoryIcon` component (`src/components/illustrations/CategoryIcon.tsx`). No emojis anywhere.
2. **Food name** — Max **2 lines**, truncated with ellipsis. Shows only `name` (not brand).
3. **Calories** — e.g., "100 cal". Use existing `typography.bodyBold`.
4. **Macro table** — Four rows:
   - **Carbs** — label, gram value right-aligned, percentage highlight bar
   - **Protein** — label, gram value right-aligned, percentage highlight bar
   - **Fat** — label, gram value right-aligned, percentage highlight bar
   - **Sodium** — label, mg value right-aligned, **no percentage bar** (sodium has no calorie contribution)
5. **Cal/oz badge** — Pill-shaped badge at the bottom showing `cal_per_oz` from the food data (e.g., "89 cal/oz"). Always cal/oz for MVP.

### Macro Percentage Highlight Bars

Each macro row (carbs, protein, fat) has a **solid background bar** indicating what percentage of total calories that macro contributes.

- **Calculation:**
  - Carbs: `(carbs_g * 4) / calories * 100`%
  - Protein: `(protein_g * 4) / calories * 100`%
  - Fat: `(fat_g * 9) / calories * 100`%
- **Bar spans** the label+value portion of the row (not full card width), with small padding on each end.
- **Bar color:** `#FAD7A1` (warm caramel) — same color for all three macros.
- **Bar is solid**, not semi-transparent.

### Cal/oz Badge Styling

- **Background:** `#FAD7A1` (same warm caramel as macro bars)
- **Text color:** `#553924` (dark brown)
- **Shape:** Pill / fully rounded

### Card Tap Behavior

Tapping a card navigates to the food detail screen: `/database/[id]`.

---

## Pagination

### Item Limits

- Maximum **11 food items** displayed in the carousel.
- If the pantry contains **more than 11 items**, the 12th card slot (last position on page 3) becomes a **"See all" card** instead of a food item.

### Page Structure

| Pantry items | Pages | Cards per page |
|---|---|---|
| 1-3 | 1 | 1-3 cards, no dots |
| 4 | 2 | 4 + 0 (but shows 2 dots) |
| 4-7 | 2 | 4 + remainder, 2 dots |
| 8-11 | 3 | 4 + 4 + remainder, 3 dots |
| 12+ | 3 | 4 + 4 + 3 items + "See all", 3 dots |

### "See all" Card

- Same height and width as food cards.
- "See all" text centered vertically and horizontally.
- Navigates to `/settings/pantry`.

### Dot Indicators

- Centered horizontally below the carousel with spacing.
- **Active dot:** Filled in (solid).
- **Inactive dots:** Outlined only, matching the line weight visible in the mockup.
- **Maximum 3 dots** regardless of content.
- **Dot visibility rules:**
  - 1-3 items: **no dots** (single page)
  - 4-7 items: **2 dots**
  - 8+ items: **3 dots**

---

## Empty State

- Displayed when `pantryFoodIds` is empty.
- Uses the existing empty state SVG illustration (`EmptyPlans` or equivalent) with text overlaid on top of it.
- Text: "Pantry is empty" title + "Add foods from the Foods tab to restrict your pack to what you own" subtitle.
- **The entire empty state card is tappable** — navigates to the Foods tab (`/database`).
- The `+` header button is **not shown** when empty.

---

## New Theme Colors

Add the following to `src/theme/colors.ts`:

```ts
// Pantry card palette (from mockup)
pantryCardBg:      '#F3EBE0',   // warm cream card background
pantryCardBorder:  '#CAAC86',   // warm tan card border
pantryHighlight:   '#FAD7A1',   // macro bar & cal/oz badge background
pantryBrown:       '#553924',   // dark brown text for badge & + button
```

---

## Data & State

- **Source:** `pantryFoodIds` from Zustand store, resolved against `FOODS` array.
- **No new store fields needed.** Existing `pantryFoodIds`, `togglePantryFood`, and `clearPantry` are sufficient.
- **No pantry management on the homepage.** Adding/removing items happens only on the Foods tab and `/settings/pantry`.

---

## Component Structure (suggested)

- `PantryCarousel` — New component handling pagination, snap scrolling, dot indicators, and the "See all" card.
- `PantryCard` — Individual food card with icon, name, calories, macro table, and cal/oz badge.
- Both used only within the homepage `index.tsx`.

---

## Files to Modify

| File | Change |
|---|---|
| `src/app/index.tsx` | Replace current pantry `ScrollView` + `pantryCard` with new `PantryCarousel` component |
| `src/theme/colors.ts` | Add 4 new pantry color tokens |
| New: `src/components/home/PantryCarousel.tsx` | Paginated carousel with snap, dots, and "See all" |
| New: `src/components/home/PantryCard.tsx` | Rich nutrition card matching mockup |

---

## Out of Scope

- Pantry item management (add/remove) from the homepage
- Brand display on cards
- Cal/g toggle (metric) — MVP is cal/oz only
- Food images/thumbnails — using SVG category icons
- Animations beyond snap scrolling
