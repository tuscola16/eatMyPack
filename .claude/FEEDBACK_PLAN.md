# eatmypack: Full Feedback Batch

## Context
Comprehensive feedback pass covering Firebase foods migration, core algorithm/navigation bugs, waystation enhancements, UI polish, and new food items. User priority: Firebase migration first.

---

## Implementation Order

### Phase 0 — Type Changes (foundational, do first)

**`src/types/race.ts`** ✅ DONE
- Added `WaystationFoodEntry { foodId, qty }`
- Added `migrateWaystationFoods()` helper
- Added `name?: string` to `Waystation`
- Changed `foods?: string[]` → `foods?: WaystationFoodEntry[]`

**`src/types/preferences.ts`** ✅ DONE
- Added `TimeFormat = '12h' | '24h'`
- Added `timeFormat: TimeFormat` to `UserPreferences` (default `'12h'`)

**`src/store/useStore.ts`** 🔄 PARTIAL — imports added, body changes pending
- Add imports: `WaystationFoodEntry` from `../types/race`, `FOODS as LOCAL_FOODS` from `../data/foods` ✅
- Change `pendingWaystationFoods.foodIds: string[]` → `foods: WaystationFoodEntry[]` ⬜
- Update `togglePendingWaystationFood` to add `{foodId, qty:1}` / remove by foodId ⬜
- Add `foods: FoodItem[]` slice initialized to `LOCAL_FOODS` + `setFoods` action ⬜

---

### Phase 1 — Bug Fixes ⬜ ALL PENDING

#### 1-A. Reject-Item Creates Duplicate Plan
**`src/hooks/usePackBuilder.ts` — `rejectItem` (lines 50-56)**

After `rejectAndRebuild`, preserve original plan identity (same as `rebuildFromConfig` does):
```ts
const rebuilt = rejectAndRebuild(currentPlan, foodId, FOODS, getPackOptions());
const newPlan = {
  ...rebuilt,
  id: currentPlan.id,
  name: currentPlan.name,
  created_at: currentPlan.created_at,
  race_date: currentPlan.race_date,
  start_time: currentPlan.start_time,
};
setCurrentPlan(newPlan);
```
The `setTimeout` save in `plan.tsx:134` stays; it now works correctly because ID is stable.

#### 1-B. Delete Navigation Goes to Wrong Screen
Root cause: `router.back()` traverses a deep navigation stack that may include waystation-detail.

**`src/app/index.tsx`** — add `source: 'home'` param to plan card press (line 112)
**`src/app/race/plans.tsx`** — add `source: 'plans'` param to plan card press (line 41)
**`src/app/race/plan.tsx`**
- Read `source` from `useLocalSearchParams`
- In `handleDelete` (line 115) and `‹ Back` button (line 236): replace `router.back()` with:
  ```ts
  source === 'plans' ? router.replace('/race/plans') : router.replace('/')
  ```

#### 1-C. Volume Display 5.3/3.0L on Multi-Refill Races
Root cause: `plan.total_volume_ml` is cumulative across ALL pack refills. With 2 refills of a 3L pack, total can be 6L+ — not an algorithm bug, just a display issue.

**`src/components/race/PackSummary.tsx`**
- Detect multi-refill: `const hasRefills = waystations.some(ws => ws.type === 'pack_refill' || ws.type === 'both')`
- Add local helper `computeMaxFillVolume(plan)`: groups phases by refill boundaries, returns highest single-fill total
- When `hasRefills`: use `maxFillVolume` for the bar, change label to `"Volume (per fill)"`
- When not multi-refill: existing behavior unchanged

#### 1-D. Custom Distance Miles Shows "km"
**`src/components/race/PackSummary.tsx` lines 106-110**
```ts
const distanceLabel = (() => {
  if (plan.race_config.distance !== 'custom') return plan.race_config.distance;
  const km = plan.race_config.custom_distance_km;
  if (km == null) return '?';
  return plan.race_config.distance_unit === 'mi'
    ? `${Math.round(km / 1.609344)}mi`
    : `${km}km`;
})();
```

---

### Phase 2 — UI Polish ⬜ ALL PENDING

**`src/app/index.tsx`** — "No plans yet" 8px down: add `paddingTop: 8` to `emptyTitleOverlay` style (line 311)

**`src/components/home/PantryCarousel.tsx` line 116** — change subtext to `"Add foods to restrict your pack"`

**`src/app/_layout.tsx`** — footer changes:
- Add `tabBarShowLabel: false` to `screenOptions`
- Add `tabBarIconStyle: { marginTop: 8 }` to push icons down
- Remove `tabBarLabelStyle` block (lines 77-80)

**`src/app/settings/index.tsx` line 384** — settings title: change `color: colors.textInverse` → `color: colors.textPrimary`; remove text shadow properties (lines 385-387)

---

### Phase 3 — Waystation Enhancements ⬜ ALL PENDING

#### 3-A. Waystation Naming
**`src/app/race/waystation-detail.tsx`**
- Add `TextInput` card for `name` (optional, max 50 chars) — insert before "Type" card
- `name` does NOT trigger repack

**`src/app/race/plan.tsx` — `WaystationBar` (line 65)**
- Show `waystation.name ?? label` instead of always `label`

#### 3-B. Food Picker Navigation Fix (Critical)
Root cause: `openFoodPicker` calls `router.push('/database')` which switches tabs. `router.back()` from the database tab does not return to `waystation-detail` (different stack).

**Create: `src/app/race/food-picker.tsx`**
- New Stack route within the `race` group (so `router.back()` pops to `waystation-detail`)
- Always in selection mode
- Pantry items sorted to top (see 3-C)
- Pantry-only filter toggle in header
- Done/Cancel buttons commit/clear `pendingWaystationFoods` then `router.back()`

**`src/app/race/waystation-detail.tsx` — `openFoodPicker` (line 180)**
- Change `router.push('/database')` → `router.push('/race/food-picker')`

#### 3-C. Pantry Items to Top + Filter (inside food-picker.tsx)
```ts
const sortedFoods = useMemo(() => {
  const pantry = foods.filter((f) => pantryFoodIds.includes(f.id));
  const rest = foods.filter((f) => !pantryFoodIds.includes(f.id));
  return pantryOnly ? pantry : [...pantry, ...rest];
}, [foods, pantryFoodIds, pantryOnly]);
```

#### 3-D. Back Button on Waystation Error State
- In error state (waystation not found), change `router.back()` to:
  `router.replace({ pathname: '/race/plan', params: { id: planId ?? '' } })`

#### 3-E. Waystation Food Quantities
**`src/app/race/waystation-detail.tsx`**
- Call `migrateWaystationFoods(edited.foods)` to get `WaystationFoodEntry[]`
- Show food chips with inline `+`/`−` qty buttons and `×qty` label
- Add `incrementQty(foodId)` / `decrementQty(foodId)` handlers (remove at qty 0)
- Update calorie calc: `qty * food.calories`

**`src/hooks/useLocalStorage.ts` — `loadPlans`**
- After JSON.parse, call `migrateWaystationFoods` on each waystation's `foods` field

**`src/services/cloudSync.ts` — `fetchPlans`**
- Same migration on each waystation's `foods` field

---

### Phase 4 — Race Plan Enhancements ⬜ ALL PENDING

#### 4-A. Wall-Clock Time on Segments
**New: `src/utils/timeUtils.ts`**
```ts
export function formatWallClockTime(
  startTime: string,   // "HH:MM"
  offsetHours: number,
  format: '12h' | '24h',
): string {
  const [startH, startM] = startTime.split(':').map(Number);
  const totalMinutes = startH * 60 + startM + Math.round(offsetHours * 60);
  const dayOffset = Math.floor(totalMinutes / 1440);
  const minutesInDay = totalMinutes % 1440;
  const h = Math.floor(minutesInDay / 60);
  const m = minutesInDay % 60;
  const dayLabel = dayOffset > 0 ? ` Day ${dayOffset + 1}` : '';
  if (format === '24h') {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}${dayLabel}`;
  }
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}${dayLabel}`;
}
```

**`src/components/race/PhaseBanner.tsx`**
- Add optional `startTime?: string` and `timeFormat?: '12h'|'24h'` props
- When `startTime` provided: show start time instead of hour range (line 38: `timeRange`)

**`src/app/race/plan.tsx` — `WaystationBar`**
- When `plan.start_time` exists: show `formatWallClockTime(plan.start_time, hour, timeFormat)` instead of "Hour X"
- Pass `startTime` and `timeFormat` to `PhaseBanner`

#### 4-B. 12/24hr Setting
**`src/app/settings/index.tsx`**
- Import `TimeFormat` from `@/types/preferences`
- Add segmented control for `timeFormat` after Caffeine row (same pattern)

---

### Phase 5 — Firebase Foods Migration ⬜ ALL PENDING

#### 5-A. New service: `src/services/foodsService.ts`
```ts
const CACHE_KEY = '@eatmypack:foods_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function fetchFoods(): Promise<FoodItem[]> {
  // 1. Check AsyncStorage cache (TTL 24h) → return if fresh
  // 2. Fetch Firestore collection('foods') → cache + return if non-empty
  // 3. Fallback: return LOCAL_FOODS from src/data/foods.ts
}
```

#### 5-B. New hook: `src/hooks/useFoods.ts`
```ts
export function useFoods() {
  const setFoods = useStore((s) => s.setFoods);
  useEffect(() => { fetchFoods().then(setFoods); }, []);
}
```
Call from `src/app/_layout.tsx` alongside `useLocalStorage()` and `useAuth()`.

#### 5-C. Update callers of `FOODS` static import
- `src/hooks/usePackBuilder.ts` — replace `FOODS` with `useStore.getState().foods`
- `src/app/race/waystation-detail.tsx` line 15 — replace `FOODS.find(...)` with store foods
- `src/components/home/PantryCarousel.tsx` line 17 — replace `FOODS` with store foods

#### 5-D. Pantry sync to Firebase
Check `useCloudSync.ts` — confirm `pantryFoodIds` syncs via `uploadPreferences`. If not already:
```ts
// cloudSync.ts
export async function uploadPantry(uid: string, pantryFoodIds: string[]): Promise<void>
export async function fetchPantry(uid: string): Promise<string[]>
```

#### 5-E. Firestore Security Rules (Firebase Console — not app code)
```
match /foods/{foodId} {
  allow read: if true;
  allow write: if false;
}
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

#### 5-F. Seed script: `scripts/seedFoods.ts`
One-off Node.js admin script using Firebase Admin SDK. Uploads `FoodItem[]` to `foods/{item.id}`.

---

### Phase 6 — 30 New Thru-Hiker Foods ⬜ PENDING

Add to `src/data/foods.ts` under `// Grocery / Resupply` comment.

| id | name | brand | cal | carbs | prot | fat | sodium | serving_g | vol_ml | gut |
|---|---|---|---|---|---|---|---|---|---|---|
| `snickers-fun-size` | Snickers (fun size) | Mars | 80 | 10 | 1 | 4 | 50 | 17 | 20 | good |
| `reeses-pb-cup` | Reese's PB Cup (2-pack) | Hershey | 210 | 24 | 5 | 12 | 140 | 42 | 50 | good |
| `gummy-bears` | Gummy Bears | Haribo | 90 | 21 | 2 | 0 | 10 | 30 | 35 | moderate |
| `swedish-fish` | Swedish Fish | Mondelez | 140 | 35 | 0 | 0 | 45 | 45 | 55 | moderate |
| `twizzlers-3` | Twizzlers (3 pcs) | Hershey | 80 | 18 | 1 | 0 | 95 | 34 | 40 | moderate |
| `pretzels-1oz` | Pretzels (1 oz) | Rold Gold | 110 | 23 | 3 | 0 | 450 | 28 | 40 | good |
| `goldfish-snack` | Goldfish Crackers | Pepperidge Farm | 140 | 20 | 3 | 5 | 230 | 30 | 40 | good |
| `pringles-1oz` | Pringles Mini (1 oz) | Kellogg's | 150 | 15 | 1 | 9 | 150 | 28 | 38 | good |
| `ritz-crackers` | Ritz Crackers (8 pcs) | Nabisco | 80 | 10 | 1 | 4 | 105 | 16 | 25 | good |
| `oreo-3pcs` | Oreos (3 cookies) | Nabisco | 160 | 25 | 1 | 7 | 135 | 34 | 45 | good |
| `pop-tart` | Pop-Tart (1 pastry) | Kellogg's | 200 | 38 | 2 | 5 | 200 | 52 | 65 | good |
| `rice-krispie-treat` | Rice Krispies Treat | Kellogg's | 90 | 18 | 1 | 2 | 105 | 22 | 30 | good |
| `fig-newtons` | Fig Newtons (2 pcs) | Nabisco | 110 | 22 | 1 | 2 | 100 | 31 | 40 | good |
| `plain-rice-cakes-2` | Plain Rice Cakes (2) | Quaker | 70 | 14 | 2 | 0 | 60 | 18 | 25 | excellent |
| `instant-oatmeal` | Instant Oatmeal Packet | Quaker | 150 | 27 | 4 | 3 | 75 | 43 | 60 | very_good |
| `granola-bar` | Granola Bar | Kind | 200 | 24 | 6 | 9 | 125 | 50 | 65 | good |
| `small-flour-tortilla` | Flour Tortilla (6") | Mission | 90 | 14 | 2 | 2 | 220 | 28 | 35 | very_good |
| `banana` | Banana (medium) | generic | 105 | 27 | 1 | 0 | 1 | 118 | 130 | excellent |
| `medjool-dates` | Medjool Dates (4 pcs) | generic | 140 | 37 | 1 | 0 | 0 | 56 | 65 | good |
| `raisins-snack` | Raisins (mini box) | Sun-Maid | 90 | 22 | 1 | 0 | 5 | 28 | 35 | good |
| `dried-mango-1oz` | Dried Mango (1 oz) | generic | 100 | 25 | 1 | 0 | 25 | 28 | 35 | good |
| `dried-apricots` | Dried Apricots (4 pcs) | generic | 70 | 18 | 1 | 0 | 3 | 28 | 35 | good |
| `peanut-butter-packet` | Peanut Butter Packet | Justin's | 190 | 7 | 7 | 16 | 65 | 32 | 35 | good |
| `almond-butter-packet` | Almond Butter Packet | Justin's | 190 | 7 | 7 | 16 | 60 | 32 | 35 | good |
| `sunflower-seeds-1oz` | Sunflower Seeds (1 oz) | David | 170 | 5 | 6 | 15 | 125 | 28 | 40 | good |
| `mixed-nuts-1oz` | Mixed Nuts (1 oz) | Planters | 170 | 6 | 5 | 15 | 95 | 28 | 38 | good |
| `tuna-packet` | Tuna Packet | StarKist | 70 | 0 | 16 | 0 | 210 | 74 | 80 | very_good |
| `beef-jerky-1oz` | Beef Jerky (1 oz) | Jack Link's | 80 | 5 | 9 | 2 | 590 | 28 | 38 | very_good |
| `spam-single` | Spam Single Serve | Hormel | 180 | 2 | 7 | 16 | 790 | 56 | 65 | moderate |
| `applesauce-pouch` | Applesauce Pouch | Mott's | 60 | 15 | 0 | 0 | 0 | 90 | 95 | excellent |

For each: `cal_per_g = cal/serving_g`, `cal_per_oz = cal/(serving_g/28.35)`, `serving_size_oz = serving_g/28.35`. Set `caffeine_mg: 0`, `is_caffeinated: false`, `label_accuracy_note: null`. Assign `best_for` tags based on macros.

---

## Backward Compatibility

| Change | Risk | Migration |
|---|---|---|
| `Waystation.foods` type change | Low | `migrateWaystationFoods()` in `useLocalStorage.loadPlans` + `cloudSync.fetchPlans` |
| `Waystation.name` added | None | Optional; deserializes as `undefined` |
| `UserPreferences.timeFormat` added | None | `DEFAULT_USER_PREFERENCES` fallback = `'12h'` |
| `pendingWaystationFoods.foods` change | None | Ephemeral; never persisted |
| `FOODS` → Firestore | Low | Store initializes with `LOCAL_FOODS`; Firestore augments async |

---

## Verification

1. **Reject flow**: reject a food from plan → only 1 plan in saved list, same ID, pack updates in place
2. **Delete navigation**: from homepage → delete → lands on home; from plans page → delete → lands on plans
3. **Volume**: 3L pack with 2 refill waystations → bar shows per-fill max ≤ 3L, labeled "per fill"
4. **Custom miles**: custom 50mi race → summary shows "50mi", not "80km"
5. **Food picker**: tap "Add foods" in waystation → see food list in race stack → Done → back to waystation (not foods tab)
6. **Qty**: add 2 Gu Roctane to waystation → shows "Gu Roctane ×2" → calorie total reflects qty
7. **Time display**: race with 6:00 AM start → segment shows "6:00 AM – 10:30 AM"; day 2 segment shows "Day 2, 2:30 AM"
8. **New foods**: 127 total foods in Firestore, app shows all after cache refresh
9. **Footer**: icons only (no labels), shifted down 8px
10. **Settings title**: dark text readable against header background
