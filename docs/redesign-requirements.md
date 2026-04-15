# eatMyPack — Redesign Requirements

**Design brief:** Light, warm, playful but not childish. Sage greens + terracotta. Flush/integrated surfaces with very subtle warm shadows. New England alpine illustrations (Franconia Ridge, Presidential Range). Whimsical personality without being a cartoon app.

Reference: `docs/design-system.md` for all token values.

---

## 0. What's Changing (Dark → Light)

The existing codebase uses an AllTrails-inspired **dark** palette (`#1A1F16` backgrounds, `#4CAF50` primary). The entire visual language flips to light:

| Current | New |
|---|---|
| Dark forest background `#1A1F16` | Warm cream `#F4EFE6` |
| Bright green primary `#4CAF50` | Earthy sage `#7A9E6E` |
| No illustrations | 12 SVG scenes throughout |
| All-corners or no border radius | Asymmetric corners (see §3) |
| Flat dark surfaces | Warm-tinted subtle shadow system |
| System font | Nunito (headings) + DM Sans (body) |

---

## 1. Theme File Changes

### `src/theme/colors.ts` — full replacement

```ts
export const colors = {
  // Surfaces
  background:       '#F4EFE6',
  surface:          '#FAF7F2',
  surfaceElevated:  '#FFFFFF',
  card:             '#FAF7F2',

  // Brand — Sage Green
  primary:          '#7A9E6E',
  primaryDark:      '#4A6B3E',
  primaryLight:     '#C3D9B8',
  primarySubtle:    '#EBF3E6',
  primaryMuted:     '#8FA87A',

  // Accent — Terracotta
  accent:           '#C4623A',
  accentLight:      '#E8956D',
  accentSubtle:     '#F5E2D8',

  // Text
  textPrimary:      '#2C2118',
  textSecondary:    '#7A6855',
  textMuted:        '#B0A090',
  textInverse:      '#FAF7F2',

  // Borders
  border:           '#E0D5C5',
  borderLight:      '#EDE5D8',

  // Semantic
  warning:          '#E8A83A',
  error:            '#C4623A',
  success:          '#7A9E6E',
  info:             '#8BA0B4',

  // Nutrition data tokens
  calories:         '#C4623A',
  carbs:            '#7A9E6E',
  sodium:           '#A08B5E',

  // Gut rating
  gutExcellent:     '#4A6B3E',
  gutVeryGood:      '#7A9E6E',
  gutGood:          '#E8A83A',
  gutModerate:      '#E8956D',
  gutPoor:          '#C4623A',

  // Phase colors (used in accent bars + phase illustrations)
  phaseEarly:       '#E8A83A',   // dawn amber
  phaseMid:         '#7A9E6E',   // midday sage
  phaseLate:        '#C4623A',   // golden hour terracotta
  phaseNight:       '#2C3E50',   // deep navy
  phaseFinal:       '#9A8870',   // granite/stone

  // Food category chips
  chipGel:          '#C4623A',
  chipBar:          '#A08B5E',
  chipChew:         '#E8956D',
  chipDrink:        '#8BA0B4',
  chipRealFood:     '#7A9E6E',
  chipNutButter:    '#A08B5E',
  chipFreezeDried:  '#8FA87A',

  // Overlay
  overlay:          'rgba(44, 33, 24, 0.55)',

  white:            '#FFFFFF',
  black:            '#000000',
  transparent:      'transparent',
} as const;
```

### `src/theme/spacing.ts` — update to 8pt grid

```ts
export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  full: 9999,
} as const;
```

### `src/theme/typography.ts` — add Nunito + DM Sans

Install fonts first:
```bash
npx expo install @expo-google-fonts/nunito @expo-google-fonts/dm-sans expo-font
```

Then update font references in `_layout.tsx` using `useFonts`. The existing size/lineHeight scale is correct — only the `fontFamily` values change:
- All `h1`–`h4` and `label`: `fontFamily: 'Nunito_700Bold'` (or `600SemiBold` for h3/h4)
- All `body`, `caption`, `small`: `fontFamily: 'DMSans_400Regular'`
- `bodyBold`: `fontFamily: 'DMSans_500Medium'`
- `button`: `fontFamily: 'Nunito_600SemiBold'`
- Stat displays (calorie/carb numbers): `fontFamily: 'Nunito_700Bold'`

---

## 2. Shadow System

Add a `shadows.ts` to `src/theme/`:

```ts
import { ViewStyle } from 'react-native';

const shadowColor = '#2C2118';

export const shadows = {
  none: {} as ViewStyle,
  sm: {
    shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  } as ViewStyle,
  md: {
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
  lg: {
    shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  } as ViewStyle,
} as const;
```

Export from `src/theme/index.ts`.

**Usage rule:** Cards use `shadow.sm`. Modals/drawers use `shadow.lg`. Phase cards use `shadow.md`. The cycling-app-style "slight shadow" the user liked = `shadow.sm` on a cream-on-cream surface.

---

## 3. Illustration Integration

All 12 SVGs are in `assets/illustrations/`. Use `react-native-svg` to render them as components, or use `<Image>` with `require()` if SVG rendering is slow.

### Clip path note

9 of the 12 SVGs have clip paths baked in. **Do not apply `borderRadius` or `overflow: hidden` on the container** — the SVG's internal `<clipPath>` handles it. Applying both will double-round or cause rendering artifacts.

### Illustration → Screen Map

#### `hero-trail.svg` — Home screen header
```tsx
// src/app/index.tsx
// Dimensions: 390×340pt, bottom corners rounded (baked in SVG)
// Render full-width, flush with top of screen, behind status bar
<HeroTrail width={screenWidth} height={screenWidth * (340/390)} />
// Overlay: distance chips row sits at y≈290, over the foreground
```

#### `hero-setup.svg` — Race Setup header
```tsx
// src/app/race/setup.tsx
// Dimensions: 390×200pt, bottom corners rounded (baked in SVG)
// Sits below safe area top, above the form
<HeroSetup width={screenWidth} height={screenWidth * (200/390)} />
```

#### `hero-plan.svg` — Plan View header
```tsx
// src/app/race/plan.tsx
// Dimensions: 390×160pt, bottom corners rounded (baked in SVG)
// Compact banner, above summary stat strip
<HeroPlan width={screenWidth} height={screenWidth * (160/390)} />
```

#### `onboarding-runner.svg` — First launch / onboarding
```tsx
// Full screen 390×780pt, no clip needed
// src/app/auth/ (or a dedicated onboarding screen)
// Runner crests Franconia Ridge at sunrise — draws the user in
<OnboardingRunner width={screenWidth} height={screenWidth * (780/390)} />
```

#### `settings-header.svg` — Settings screen
```tsx
// src/app/settings/index.tsx
// Dimensions: 390×140pt, bottom corners rounded (baked in SVG)
// Topo-line pattern, very subtle, almost decorative
<SettingsHeader width={screenWidth} height={screenWidth * (140/390)} />
```

#### Phase card illustrations (5 files) — Plan view phase cards
```tsx
// src/components/PhaseCard.tsx (or wherever phase cards are rendered)
// Each 160×100pt with top-right corner rounded (baked in SVG)
// Positioned: absolute, top: 0, right: 0 inside each phase card
// Phase → illustration mapping:
const phaseIllustration = {
  early:      require('@/assets/illustrations/phase-early.svg'),
  mid:        require('@/assets/illustrations/phase-mid.svg'),
  late:       require('@/assets/illustrations/phase-late.svg'),
  night:      require('@/assets/illustrations/phase-night.svg'),
  final_push: require('@/assets/illustrations/phase-final.svg'),
};
// Size inside card: width=160, height=100 (exact — no scaling)
// The card itself: borderRadius: 24 (matching illustration bottom-left corner)
```

#### `empty-plans.svg` — Empty state, saved plans
```tsx
// Trigger: plans list has length 0
// Center in screen: width=240, height=240
// Add below: body text "No plans yet" + primary CTA button
<EmptyPlans width={240} height={240} />
```

#### `empty-foods.svg` — Empty state, food browser
```tsx
// Trigger: food list filtered to 0 results
// Center below filter chips: width=180, height=180
// Add below: body text + "Clear filters" ghost button
<EmptyFoods width={180} height={180} />
```

---

## 4. Component Specifications

### Screen background
```ts
backgroundColor: colors.background  // #F4EFE6
```
Apply to every `<SafeAreaView>` and `<ScrollView>` root.

### Cards (general)
```ts
{
  backgroundColor: colors.surface,    // #FAF7F2
  borderRadius:    borderRadius.md,   // 16
  padding:         spacing.md,        // 16
  ...shadows.sm,
}
```
No explicit `borderColor` — shadow + slight color difference creates the edge.

### Phase Cards (plan view)
```ts
{
  backgroundColor: colors.surface,
  borderRadius:    borderRadius.lg,   // 24 — matches SVG illustration corner
  padding:         spacing.md,
  overflow:        'hidden',          // clips illustration to card corner
  ...shadows.md,
}
// Left accent bar:
{
  position:        'absolute',
  left:            0, top: 0, bottom: 0,
  width:           4,
  backgroundColor: phaseColor,        // from colors.phaseEarly etc.
  borderTopLeftRadius:    borderRadius.lg,
  borderBottomLeftRadius: borderRadius.lg,
}
// Illustration (top-right corner):
{
  position: 'absolute',
  top:      0,
  right:    0,
  // No borderRadius — clip path is baked into SVG
}
```

### Chips (distance selector, food filters)
```ts
// Unselected:
{
  backgroundColor: colors.surface,
  borderWidth:     1.5,
  borderColor:     colors.border,
  borderRadius:    borderRadius.sm,   // 8
  paddingHorizontal: 14,
  paddingVertical:   6,
  color:           colors.textSecondary,
}
// Selected:
{
  backgroundColor: colors.primaryLight,
  borderColor:     colors.primary,
  color:           colors.primaryDark,
  fontWeight:      '600',
}
```

### Primary Button
```ts
{
  backgroundColor:  colors.primary,
  borderRadius:     borderRadius.full,
  paddingHorizontal: 24,
  paddingVertical:   14,
  // Font: Nunito_700Bold, 16px, textInverse
}
// Pressed state: scale(0.97), 100ms
```

### Inputs
```ts
{
  backgroundColor: colors.surface,
  borderWidth:     1.5,
  borderColor:     colors.border,
  borderRadius:    borderRadius.md,   // 16
  paddingHorizontal: 16,
  paddingVertical:   14,
  // Focus: borderColor → colors.primary
}
```

### Tab Bar
```ts
{
  backgroundColor: colors.surface,
  ...shadows.sm,   // shadow above the bar (elevation on Android, shadow on iOS)
  borderTopWidth:  0,  // no harsh line — let shadow do the work
}
// Active icon/label: colors.primary
// Inactive: colors.textMuted
```

### Nutrition Progress Bars
```ts
// Track:
{ backgroundColor: colors.primarySubtle, height: 6, borderRadius: borderRadius.full }
// Carbs fill:
{ backgroundColor: colors.carbs }
// Calories fill:
{ backgroundColor: colors.calories }
// Sodium fill:
{ backgroundColor: colors.sodium }
// Animate fill width on mount: 400ms ease-out
```

---

## 5. Header / Navigation Bar

Remove the dark header background. Use transparent headers with `tintColor: colors.textPrimary`.

```ts
// _layout.tsx Stack.Screen options:
{
  headerTransparent:    true,
  headerBlurEffect:     'light',        // iOS blur
  headerStyle:          { backgroundColor: 'transparent' },
  headerTintColor:      colors.textPrimary,
  headerTitleStyle:     { fontFamily: 'Nunito_700Bold', color: colors.textPrimary },
  headerShadowVisible:  false,
}
```

On screens with a hero illustration (home, setup, plan), the illustration bleeds under the transparent header — the scene reads as continuous from the status bar down.

---

## 6. Motion & Micro-interactions

| Interaction | Spec |
|---|---|
| Button/card press | Scale 0.97, 100ms, `ease-in-out` |
| List item entrance | `opacity: 0→1` + `translateY: 12→0`, stagger 50ms per item |
| Phase card expand | Height animated 250ms `ease-out` |
| Nutrition bar fill | Width animated on mount, 400ms `ease-out`, delay = index × 80ms |
| Tab switch | Immediate — no crossfade |
| Hero illustration fade-in | Opacity 0→1 on screen mount, 300ms |

Use React Native `Animated` API or `react-native-reanimated` (if already installed).

---

## 7. Implementation Priority Order

Work in this sequence to get visual payoff fastest:

1. **Theme tokens** — replace `colors.ts`, `spacing.ts`. Everything shifts immediately.
2. **Fonts** — install Nunito + DM Sans, wire into `_layout.tsx`. Personality arrives.
3. **Screen backgrounds + card surfaces** — apply `colors.background` / `colors.surface`. App feels light.
4. **Home screen** — add `hero-trail.svg` + distance chip reskin. Biggest visible impact.
5. **Phase cards** — add phase illustrations + accent bars. Plan view transforms.
6. **Buttons, chips, inputs** — pill radius, sage fills, correct weights.
7. **Tab bar** — transparent/surface, shadow above.
8. **Empty states** — add `empty-plans.svg`, `empty-foods.svg`.
9. **Setup + Settings headers** — `hero-setup.svg`, `settings-header.svg`.
10. **Motion** — press feedback, list entrances, bar animations.
11. **Fonts (expo-google-fonts)** — only after all layout is stable.
12. **Onboarding** — `onboarding-runner.svg` full screen scene.

---

## 8. Illustration Style Rules (for future additions)

If new illustrations are needed, follow these rules for consistency:

- **New England ridgelines** as the default landscape reference: Franconia Ridge (Lafayette, Lincoln, Haystack profile), Presidential Range (Washington, Adams, Monroe, Eisenhower)
- **Above treeline:** rocky/granite, lighter gray-brown (`#C8B898`), sparse tundra
- **Treeline:** dense pointed spruce-fir silhouette (`#4A6640`), slightly irregular heights
- **Sky:** always graduated warm — dawn (`#D87A30→#F5F0E8`), day (`#C8DCC8→#F5F0E8`), golden hour (`#C4623A→#F5C870`), night (`#1E2A3A` solid)
- **Trail:** terracotta `#C4623A`, 4–5pt stroke, sinuous not straight
- **Runner:** silhouette only, dark warm brown `#3A2E22`, forward lean, pack on back
- **No black outlines** anywhere — use darker fills for shadow/depth
- **Clip paths:** bake into SVG, do not rely on container `borderRadius`

### Artboard sizes reference
| File | Size (pt) | Clip |
|---|---|---|
| `hero-trail` | 390×340 | bottom corners r=24 |
| `hero-setup` | 390×200 | bottom corners r=24 |
| `hero-plan` | 390×160 | bottom corners r=24 |
| `onboarding-runner` | 390×780 | none |
| `settings-header` | 390×140 | bottom corners r=24 |
| `phase-early/mid/late/night/final` | 160×100 | top-right r=16 |
| `empty-plans` | 240×240 | none |
| `empty-foods` | 180×180 | none |

---

## 9. Accessibility Checklist

- [ ] Text contrast ≥ 4.5:1 on all backgrounds (`#2C2118` on `#F4EFE6` = 12.5:1 ✓)
- [ ] Touch targets ≥ 44×44pt (chips, icons, tab items)
- [ ] All illustrations have `accessibilityLabel` or `accessibilityElementsHidden={true}`
- [ ] Color is not the only indicator (icons + labels alongside color chips)
- [ ] Focus states visible on all interactive elements
- [ ] Nutrition data readable at system Large Text size

---

## 10. Files to Touch

| File | Change |
|---|---|
| `src/theme/colors.ts` | Full replacement (see §1) |
| `src/theme/spacing.ts` | Update values + add borderRadius (see §1) |
| `src/theme/typography.ts` | Add fontFamily values |
| `src/theme/shadows.ts` | New file (see §2) |
| `src/theme/index.ts` | Export `shadows` |
| `src/app/_layout.tsx` | Load fonts, update header styles |
| `src/app/index.tsx` | Add hero-trail, reskin distance chips |
| `src/app/race/setup.tsx` | Add hero-setup |
| `src/app/race/plan.tsx` | Add hero-plan, reskin phase cards |
| `src/app/database/index.tsx` | Reskin filter chips, add empty-foods |
| `src/app/settings/index.tsx` | Add settings-header |
| `src/components/PhaseCard.tsx` | Phase illustrations + accent bars |
| All StyleSheet.create calls | Replace hardcoded colors with theme tokens |
