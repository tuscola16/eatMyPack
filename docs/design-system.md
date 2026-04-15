# eatMyPack Design System

Inspired by nature-forward mobile apps with warm, organic aesthetics. The overall feel is **trail-worn warmth** — approachable, a little playful, grounded in the outdoors. Light backgrounds with sage and terracotta, flush surfaces, and illustrated personality.

---

## 1. Color Palette

### Base Surfaces
| Token | Hex | Usage |
|---|---|---|
| `background` | `#F4EFE6` | App background (warm cream) |
| `surface` | `#FAF7F2` | Cards, sections (lighter cream) |
| `surfaceElevated` | `#FFFFFF` | Modals, drawers, floating elements |
| `border` | `#E0D5C5` | Dividers, input borders |

### Brand — Sage Green
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#7A9E6E` | Primary actions, selected state, icons |
| `primaryDark` | `#4A6B3E` | Pressed state, strong emphasis |
| `primaryLight` | `#C3D9B8` | Backgrounds for selected chips, badges |
| `primarySubtle` | `#EBF3E6` | Tinted surface backgrounds |

### Accent — Terracotta
| Token | Hex | Usage |
|---|---|---|
| `accent` | `#C4623A` | Warnings, calories, high-urgency data |
| `accentLight` | `#E8956D` | Secondary accent, icons |
| `accentSubtle` | `#F5E2D8` | Alert backgrounds |

### Typography Colors
| Token | Hex | Usage |
|---|---|---|
| `textPrimary` | `#2C2118` | Headings, body |
| `textSecondary` | `#7A6855` | Labels, captions |
| `textMuted` | `#B0A090` | Placeholders, disabled |
| `textInverse` | `#FAF7F2` | Text on dark/primary fills |

### Data / Nutrition
| Token | Hex | Usage |
|---|---|---|
| `calories` | `#C4623A` | Calorie counts (terracotta) |
| `carbs` | `#7A9E6E` | Carb targets (sage) |
| `sodium` | `#A08B5E` | Sodium (warm gold-brown) |

---

## 2. Typography

### Font Stack
Expo Google Fonts recommended. Fallback to system fonts.

| Role | Font | Weight | Size |
|---|---|---|---|
| Display | **Nunito** | 800 ExtraBold | 32–40px |
| Heading 1 | **Nunito** | 700 Bold | 24px |
| Heading 2 | **Nunito** | 700 Bold | 20px |
| Heading 3 | **Nunito** | 600 SemiBold | 17px |
| Body | **DM Sans** | 400 Regular | 15px |
| Body Strong | **DM Sans** | 500 Medium | 15px |
| Caption | **DM Sans** | 400 Regular | 12px |
| Label / Tag | **Nunito** | 600 SemiBold | 12px |
| Stat / Number | **Nunito** | 700 Bold | 22px |

**Rationale:** Nunito's rounded letterforms read as friendly and approachable without being childish. DM Sans is clean and readable for data-dense nutrition content.

### Line Height
- Display: 1.1
- Headings: 1.2
- Body: 1.5
- Captions: 1.4

---

## 3. Spacing

8pt grid throughout.

| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Icon gap, tight inline |
| `sm` | 8px | Inner padding small |
| `md` | 16px | Default padding, gap |
| `lg` | 24px | Section padding |
| `xl` | 32px | Screen top padding, hero spacing |
| `xxl` | 48px | Illustration breathing room |

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | 8px | Small chips, tags, inputs |
| `md` | 16px | Cards, list rows |
| `lg` | 24px | Phase cards, modals |
| `xl` | 32px | Hero surface, large panels |
| `full` | 999px | Pill buttons, avatar circles |

---

## 5. Shadows & Elevation

Surfaces are **flush-integrated** — no harsh lifts. Shadows are warm-tinted, subtle.

```js
// Shadow tokens (React Native)
shadowColor: '#2C2118'

shadow.none  = { shadowOpacity: 0 }
shadow.sm    = { shadowOffset: {width:0, height:1}, shadowOpacity: 0.06, shadowRadius: 3,  elevation: 1 }
shadow.md    = { shadowOffset: {width:0, height:2}, shadowOpacity: 0.08, shadowRadius: 8,  elevation: 3 }
shadow.lg    = { shadowOffset: {width:0, height:4}, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6 }
```

Cards sit on the same warm cream background with `shadow.sm` — they feel like paper resting on paper, not floating.

---

## 6. Components

### Cards
- Background: `surface` (`#FAF7F2`)
- Border radius: `md` (16px)
- Shadow: `shadow.sm`
- Padding: `md` (16px)
- No explicit border — shadow + slight color difference creates separation

### Buttons

**Primary** (sage green pill)
```
background: primary (#7A9E6E)
text: textInverse
borderRadius: full
paddingHorizontal: 24px
paddingVertical: 14px
font: Nunito 700, 15px
```

**Secondary** (outlined)
```
background: transparent
border: 1.5px solid primary
text: primary
borderRadius: full
```

**Destructive / Warning**
```
background: accent (#C4623A)
text: textInverse
borderRadius: full
```

**Ghost**
```
background: transparent
text: textSecondary
no border
```

### Chips (distance selector, filters)
- Unselected: `border: 1.5px solid border`, background `surface`, text `textSecondary`
- Selected: background `primaryLight`, border `primary`, text `primaryDark`, font weight 600
- Border radius: `sm` (8px)
- Padding: 6px 14px

### Inputs
- Background: `surface`
- Border: `1.5px solid border`
- Border radius: `md` (16px)
- Focus border: `primary`
- Padding: 14px 16px
- Font: DM Sans 15px, `textPrimary`

### Phase Cards (plan view)
- Larger radius: `lg` (24px)
- Left edge accent bar (4px wide, `primary` or phase color)
- Shadow: `shadow.md`
- Header: Nunito 700 phase name + illustrated icon

### Tab Bar
- Background: `surface`
- Active icon: `primary`
- Inactive: `textMuted`
- No heavy border — rely on `shadow.sm` above the bar
- Label font: DM Sans 11px

### Progress / Nutrition Bars
- Track background: `primarySubtle` or `accentSubtle`
- Fill: respective token (`carbs`, `calories`, `sodium`)
- Height: 6px
- Border radius: `full`

---

## 7. Illustration System

All illustrations should share the same style: **flat with soft gradient fills, slightly loose/hand-made curves, warm color palette, nature-forward subjects.** Think Daynest + the outdoor cycling app — not cartoon-childish, but with charm.

### Style Rules
- No black outlines — use slightly darker fills for depth
- Warm color palette (use colors from the design system palette)
- Soft gradients allowed (sage-to-primaryDark, cream-to-peach)
- Characters are simple silhouettes with minimal facial detail
- Nature elements: mountains, trees, trails, sky gradients

### Required Illustrations

#### Screens
| Illustration | Screen | Description |
|---|---|---|
| `hero-trail` | Home | Trail runner mid-stride on a winding mountain path, trees in background, warm dawn sky. Landscape orientation, fills top ~40% of home screen. |
| `hero-setup` | Race Setup | Stylized mountain range silhouette with a pack/backpack in foreground. Header visual. |
| `hero-plan` | Plan (top) | Small runner figure at the start of a trail with distance markers ahead. Compact, banner-style. |

#### Empty States
| Illustration | Trigger | Description |
|---|---|---|
| `empty-plans` | No saved plans | A backpack resting on a boulder, mountains in the distance. Friendly, inviting. |
| `empty-foods` | No foods match filter | A small bowl with a question mark stem growing from it. Playful. |

#### Phase Icons (used in phase card headers — small, ~48×48pt)
| Illustration | Phase | Description |
|---|---|---|
| `phase-early` | Early | Sunrise over a ridgeline, warm orange-gold sky |
| `phase-mid` | Mid | Sun high over a forested trail |
| `phase-late` | Late | Afternoon golden light, long shadow on trail |
| `phase-night` | Night | Crescent moon, stars, headlamp beam on trail |
| `phase-final` | Final Push | Summit cross or finish flag, triumphant |

#### Food Category Icons (illustrated icon style, ~32×32pt)
| Illustration | Category |
|---|---|
| `food-gel` | Gel packet, squeezed shape |
| `food-bar` | Chunky bar with bite taken out |
| `food-chew` | Small gummy block cluster |
| `food-drink` | Bottle with swirl inside |
| `food-real` | Fork + small sandwich |
| `food-nut-butter` | Jar with drizzle |
| `food-freeze-dried` | Foil pouch, mountain logo |

#### Onboarding / Settings
| Illustration | Screen | Description |
|---|---|---|
| `onboarding-runner` | First launch | Runner with pack, looking at trail ahead. Full screen, portrait. |
| `settings-gear` | Settings | Small runner figure adjusting pack straps. Header accent, compact. |

---

## 8. Iconography

Use **Phosphor Icons** (available via `phosphor-react-native`) — stroke weight `regular` or `light`. They have an organic, slightly rounded feel that pairs well with Nunito.

- Tab icons: 24px, `regular` weight
- In-card icons: 20px
- Inline/label icons: 16px

---

## 9. Motion & Interactions

- **Press feedback:** Scale to 0.97, duration 100ms (React Native `Pressable` with `Animated`)
- **Card entrance:** Fade + translateY(8px → 0), stagger 60ms between list items
- **Phase card expand:** Smooth height animation, 250ms ease-out
- **Nutrition bars:** Fill animates on mount, 400ms ease-out
- **Tab switch:** Immediate, no crossfade (native feel)
- **No heavy parallax or physics** — keep it snappy and legible

---

## 10. Screen-Level Layout Patterns

### Home
```
[StatusBar transparent]
[Illustration: hero-trail — full bleed, rounded bottom corners]
  [Distance chips row — horizontally scrollable]
[Section header: "Your Plans"]
[Plan cards list — flush cards with shadow.sm]
[FAB: "+ New Plan" — primary pill button, fixed bottom right]
```

### Race Setup
```
[Back button]
[Illustration: hero-setup — compact banner]
[Form sections as grouped flush cards]
[Primary CTA at bottom — full width pill]
```

### Plan View
```
[Back + Plan title]
[Illustration: hero-plan — compact banner]
[Summary row: total cal / carbs / sodium — 3-column stat strip]
[Phase cards — scrollable list, each with phase icon + nutrition breakdown]
[Reject/swap action on each food item]
```

### Food Browser
```
[Search bar — rounded, top]
[Filter chips — horizontal scroll]
[Food list — flush rows with food category icon]
```

---

## 11. Dark Mode

Not in scope for initial redesign. If added later, use:
- Background: `#1C1A15` (very dark warm brown)
- Surface: `#252219`
- Keep primary and accent as-is (they read well on dark)
- Increase shadow opacity slightly

---

## Implementation Notes

- **Theme file:** Replace `src/theme/` tokens with values from this document
- **Fonts:** Install via `expo-google-fonts` (`@expo-google-fonts/nunito`, `@expo-google-fonts/dm-sans`)
- **Icons:** `npm install phosphor-react-native` (peer dep: `react-native-svg`)
- **Illustrations:** SVG preferred (scalable, themeable). PNG fallback at 2x/3x for complex scenes.
- **Illustration format:** Provide as SVG components or PNG assets in `assets/illustrations/`
