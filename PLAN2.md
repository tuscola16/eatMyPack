# Plan: Multi-Area UI Fix Pass

## Context
A prior session implemented a large UI overhaul (PLAN.md phases 1–5) but left gaps and introduced regressions across the home page, race plan view, pantry page, and race setup flow. This plan documents every outstanding issue, the root cause found in each file, and the exact fix required. It is organized by area matching the user's bug report.

---

## HOME PAGE

### H1 – Empty pantry uses wrong/outdated SVG
**File:** `src/components/illustrations/EmptyFoods.tsx`  
**Root cause:** The component imports `empty-foods.svg` (110×126px, small brown illustration). The user reports this is visually wrong — it is either the wrong asset or an older design.  
**Fix:** Check `assets/illustrations/` for an updated version. If a new asset is provided, update the import in `EmptyFoods.tsx`. If it must use the existing file, verify the rendered dimensions (currently `width={CONTENT_WIDTH} height={200}`) aren't distorting a small SVG — add `preserveAspectRatio` or center it in a smaller container.

### H2 – Footer tab bar not using `footer-background.svg`
**File:** `src/app/_layout.tsx`  
**Root cause:** `FooterBackground` is imported but never rendered. The Tabs component uses `tabBarStyle: { backgroundColor: colors.surface }` — a plain color, not the SVG.  
**Fix:** Add `tabBarBackground` to Tabs `screenOptions`:
```tsx
tabBarBackground: () => (
  <FooterBackground width={SCREEN_WIDTH} height={TAB_BAR_HEIGHT} />
),
```
Also set `tabBarStyle.backgroundColor: 'transparent'` so the SVG shows through. Measure the actual tab bar height (approx 60–80px + safe area) and size the SVG accordingly.

### H3 – Arrow icons too large; not enough gap from section title
**Files:** `src/app/index.tsx`, `src/components/home/PantryCarousel.tsx`  
**Root cause:** Arrow icons rendered at `width=7, height=14` in section headers. Gap between title text and arrow relies on default row layout with no explicit spacing.  
**Fix:**
- Reduce size to `width=5, height=10` (or similar)
- Wrap title + arrow in a `View` with `gap: spacing.sm` (or add `marginLeft: spacing.sm` to the arrow icon's wrapper)

### H4 – "See all" card: icon + text not vertically centered
**File:** `src/components/home/PantryCarousel.tsx`  
**Root cause:** `seeAllCard` has `alignItems: 'center'` and `justifyContent: 'center'` but the card content may not be stretching to fill the card height correctly (e.g., if the card wraps content without a fixed height forcing the flex container to fill).  
**Fix:** Ensure `seeAllCard` has `flex: 1` or a fixed `height: CARD_HEIGHT`. The icon and "See all" text inside should be in a `flexDirection: 'column'` View (default) with `alignItems: 'center'` and `justifyContent: 'center'`. Remove any top/bottom margins or padding from icon/text that would shift the group off-center.

### H5 – Pantry icon in "see all" card too small
**File:** `src/components/home/PantryCarousel.tsx`  
**Root cause:** `<PantryIcon width={40} height={40} />` is the current size.  
**Fix:** Increase to `width={52} height={52}` (or `48×48`) in the see-all card.

### H6 – Sodium "mg" wraps when value is 3 digits
**File:** `src/components/home/PantryCard.tsx`  
**Root cause:** The label is already "Na+" but the value renders as `{food.sodium_mg} mg` (with a space), so "150 mg" can line-wrap inside a narrow card column.  
**Fix:** Remove the space: render `{food.sodium_mg}mg` so there is no break opportunity between value and unit.

### H7 – Card title height inconsistent: 1-line vs 2-line titles misalign content below
**File:** `src/components/home/PantryCard.tsx`  
**Root cause:** `nameContainer` uses `minHeight: 44` — a 1-line title allocates less than 44px actual height unless content fills it. Other items shift up when the title is short.  
**Fix:** Change `minHeight: 44` to `height: 44` (exact fixed height). With `numberOfLines={2}` and `justifyContent: 'center'`, all cards will have identical space reserved for the title regardless of line count.

---

## RACE PLAN PAGE

### R1 – Race header still appears
**Files:** `src/app/race/plan.tsx`, `src/app/race/plans.tsx`  
**Root cause:** The null-plan early-return path in `plan.tsx` (lines ~150–167) renders a `<Stack.Screen>` with `title: 'Pack Plan'`, `headerStyle`, etc., but does NOT set `headerShown: false`. Providing header styling options causes React Navigation to re-enable the header despite the layout-level default.  
**Fix:**
- In `plan.tsx` null-plan `Stack.Screen`: add `headerShown: false` alongside the existing options
- Audit `plans.tsx` for the same pattern and add `headerShown: false` if missing

### R2 – Delete (plan page) and data clear (settings) don't work on web
**Files:** `src/app/race/plan.tsx`, `src/app/settings/index.tsx`  
**Root cause:** Both use `Alert.alert()`, which is not available on web (no-op in the browser).  
**Fix:** Add a platform check. On web use `window.confirm()`:
```tsx
import { Platform } from 'react-native';

const confirmDelete = (message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
  } else {
    Alert.alert('Confirm', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);
  }
};
```
Apply this helper in `plan.tsx` `handleDelete` and in `settings/index.tsx` wherever `Alert.alert` is used for destructive actions (clear pantry, clear data, etc.).

### R3 – Waystation bar should be full-width, no rail, colored background
**File:** `src/app/race/plan.tsx` — `WaystationBar` component and `waystationBar` style  
**Root cause:** Currently styled as a flex row with `borderLeftWidth: 4` (the "rail"), `borderRadius`, and `paddingHorizontal: spacing.md`. The plan body adds `padding: spacing.lg` so the bar is inset from screen edges.  
**Fix:**
- Remove `borderLeftWidth` and `borderRadius` from `waystationBar` style
- Add `backgroundColor: '#d9d3c7'`
- Extend to full screen width by adding `marginHorizontal: -spacing.lg` (negative margin to cancel the parent body padding)
- Remove `borderColor` prop — no outline, no drop shadow
- Add `paddingVertical: spacing.sm` and `paddingHorizontal: spacing.lg` so text is inset but background bleeds to edges

### R4 – "Don't have" swipe not working on web
**File:** `src/components/common/SwipeableRow.tsx`  
**Root cause:** `react-native-gesture-handler`'s `Swipeable` component has no web support. On web, swipe gestures are silently ignored.  
**Fix:** Add a web-only fallback. Use `Platform.OS === 'web'` to conditionally render a visible "✕" / "Don't have" button instead of wrapping in `Swipeable`:
```tsx
if (Platform.OS === 'web') {
  return (
    <View style={styles.rowWithButton}>
      {children}
      <Pressable style={styles.rejectBtn} onPress={onSwipeLeft}>
        <Text style={styles.rejectBtnText}>✕</Text>
      </Pressable>
    </View>
  );
}
// existing Swipeable for native
```

### R5 – "Edit" saves a brand new race instead of updating the existing one
**Files:** `src/app/race/plan.tsx`, `src/app/race/setup.tsx`, `src/components/race/RaceForm.tsx`  
**Root cause:** `handleRegenerate` in `plan.tsx` navigates to `/race/setup` without passing the existing plan ID. `setup.tsx`'s `handleSubmit` calls `generatePack()` (creates a new plan with a new UUID) then `savePlan()`. Even though `savePlan` upserts by ID, the new plan has a fresh ID, so a second plan is created.  
**Fix:**
1. Pass `existingPlanId` and `existingPlanName` params when navigating to setup for an edit:
   ```tsx
   router.push({
     pathname: '/race/setup',
     params: { mode: ..., existingPlanId: plan.id, planName: plan.name },
   });
   ```
2. In `setup.tsx`, read `existingPlanId` and `planName` from `useLocalSearchParams`
3. When `existingPlanId` is present:
   - Pre-populate `planName` in RaceForm (skip name modal / don't prompt for a new name)
   - In `handleSubmit`, reuse the existing ID: `{ ...generatedPlan, id: existingPlanId, name: existingPlanName }`
4. In `RaceForm.tsx`, add an `initialPlanName` prop; when provided, skip `showNameModal` and call `onSubmit` directly

---

## PANTRY FULL PAGE

### P1 – Tapping a food in the pantry doesn't navigate to food detail
**File:** `src/app/settings/pantry.tsx`  
**Root cause:** `FoodList` is rendered without an `onPressFood` callback. `FoodList` uses this prop to make items tappable; without it, items render but presses are silently ignored.  
**Fix:** Add `onPressFood` to the FoodList call:
```tsx
import { useRouter } from 'expo-router';
const router = useRouter();
// ...
<FoodList
  foods={pantryFoods}
  pantryIds={pantryFoodIds}
  onTogglePantry={togglePantryFood}
  onPressFood={(food) => router.push({ pathname: '/database/[id]', params: { id: food.id } })}
  emptyMessage="..."
/>
```

### P2 – Pantry should be its own standalone page, not nested in Settings
**Files:** `src/app/settings/pantry.tsx` → move to `src/app/pantry.tsx`, `src/app/settings/index.tsx`, `src/app/_layout.tsx`  
**Root cause:** Pantry lives at `/settings/pantry`. `PantryCarousel` "see all" already navigates to `/pantry` (top-level route that doesn't exist). Settings links to `/settings/pantry`. There is no dedicated `/pantry` tab.  
**Fix:**
1. Create `src/app/pantry.tsx` — a standalone screen (copy content from `settings/pantry.tsx`, but add its own `Stack.Screen` with `headerShown: false` and a custom back button). The route `/pantry` will now resolve.
2. Remove the pantry link from `settings/index.tsx` (the "My Pantry" row navigating to `/settings/pantry`)
3. Move "Clear Pantry" from its current location into the Data section of `settings/index.tsx` (where "Clear Plans" and other destructive actions live)
4. `src/app/settings/pantry.tsx` can be deleted once the standalone route exists
5. No new tab needed — the pantry is accessed from the home page carousel "see all" (already navigates to `/pantry`) and is reachable from Settings data section for destructive action only

---

## RACE SETUP

### S1 – "Add Waystation" places new waystation at top instead of bottom
**File:** `src/components/race/WaystationEditor.tsx`  
**Root cause:** `addWaystation` pushes a waystation with `marker_value: 0` then immediately sorts all waystations by `marker_value`, placing the new one at index 0 (top).  
**Fix:** Remove the sort from `addWaystation`. Only sort in `updateWaystation` (already done there). The new waystation with default value 0 will appear at the bottom of the list. When the user updates its marker value, `updateWaystation` re-sorts. This matches the expected UX: "add to bottom, re-arrange once done editing."
```tsx
const addWaystation = () => {
  const ws: Waystation = { id: generateId(), type: 'aid_station', marker_type: 'hour', marker_value: 0, notes: '' };
  onChange([...waystations, ws]); // no sort here
};
```

### S2 – No way to add specific foods to a waystation
**File:** `src/components/race/WaystationEditor.tsx`, `src/app/database/index.tsx`, `src/store/useStore.ts`  
**Root cause:** The `Waystation` type has a `foods?: string[]` field but `WaystationEditor` has no UI to populate it. This was called out in the original plan (4F) but never implemented.  
**Fix:**
1. Add a "Packed Foods" section to each waystation card in `WaystationEditor`. Show chips/rows for each selected food ID (resolved to food name from `FOODS`).
2. Add an "Add foods →" button that navigates to the database screen in a "waystation food selection" mode.
3. To support selection mode in `src/app/database/index.tsx`: read a `waystationId` param from `useLocalSearchParams`. When present, render food rows with checkboxes instead of pantry toggles, and show a "Done" header button that navigates back and passes selected IDs.
4. To pass selected IDs back, store them temporarily: either via a dedicated Zustand key (`pendingWaystationFoods: string[]`) or via route params on return.
5. `WaystationEditor` reads the returned foods and calls `updateWaystation(ws.id, { foods: [...] })`.

### S3 – Create and Cancel buttons have too much vertical padding
**File:** `src/components/race/RaceForm.tsx`  
**Root cause:** `modalCancelButton.paddingVertical` is `spacing.md`; `submitButton.paddingVertical` is `spacing.lg`.  
**Fix:** Reduce both to `spacing.sm`:
- `modalCancelButton`: `paddingVertical: spacing.sm`
- `submitButton` (modal variant): `paddingVertical: spacing.sm`

### S4 – Tapping "Create" doesn't dismiss the name modal
**File:** `src/components/race/RaceForm.tsx`  
**Root cause:** `handleSubmit` in RaceForm calls `onSubmit(config, planName)` which triggers `router.push(...)` in the parent, but never calls `setShowNameModal(false)`. If navigation is asynchronous or fails, the modal stays visible.  
**Fix:** Call `setShowNameModal(false)` at the start of `handleSubmit`, before `onSubmit`:
```tsx
const handleSubmit = () => {
  // ... validation ...
  setShowNameModal(false);
  onSubmit(buildConfig(), planName);
};
```

---

## Key Files

| File | Changes |
|------|---------|
| `src/components/illustrations/EmptyFoods.tsx` | Verify/fix SVG asset (H1) |
| `src/app/_layout.tsx` | `tabBarBackground` + transparent tab bar (H2) |
| `src/app/index.tsx` | Arrow size + spacing (H3) |
| `src/components/home/PantryCarousel.tsx` | Arrow size + spacing (H3), see-all centering (H4), icon size (H5) |
| `src/components/home/PantryCard.tsx` | `sodium_mg` no space before mg (H6), `height: 44` for title (H7) |
| `src/app/race/plan.tsx` | `headerShown: false` null-plan case (R1), web delete confirm (R2), waystation bar style (R3), swipe fallback (R4), edit passes plan ID (R5) |
| `src/app/race/plans.tsx` | `headerShown: false` audit (R1) |
| `src/app/settings/index.tsx` | Web confirm (R2), remove pantry link, add clear pantry to data section (P2) |
| `src/components/common/SwipeableRow.tsx` | Web fallback button (R4) |
| `src/app/race/setup.tsx` | Accept `existingPlanId` + `planName` params, skip name modal (R5) |
| `src/components/race/RaceForm.tsx` | `initialPlanName` prop, skip modal if editing, modal dismiss on Create (S3, S4) |
| `src/app/settings/pantry.tsx` | Add `onPressFood` (P1), then delete after P2 |
| `src/app/pantry.tsx` | New standalone pantry screen (P2) |
| `src/components/race/WaystationEditor.tsx` | No sort on add (S1), packed foods UI (S2) |
| `src/app/database/index.tsx` | Waystation selection mode (S2) |
| `src/store/useStore.ts` | `pendingWaystationFoods` key if needed (S2) |

---

## Verification
- **Home page:** Launch web preview on port 8082, mobile viewport. Set pantry data via localStorage → confirm carousel renders with correct SVG, footer background, arrow sizing, see-all centering. Clear pantry → confirm empty state SVG matches design.
- **Race plan:** Open a saved plan → confirm no header bar. On web, tap Delete → confirm `window.confirm` dialog appears. Check waystations render as full-width tan bars. Try swiping a food on web → confirm ✕ button appears instead.
- **Edit flow:** From a saved plan, tap Edit → Re-generate → change a setting → Create → confirm the same plan is updated (not a second entry added to home page plans list).
- **Pantry page:** Navigate to `/pantry` via home carousel "see all" → confirm it loads as standalone page (no settings nesting). Tap a food → confirm navigation to food detail. In Settings, confirm "Clear Pantry" button is in the data section.
- **Race setup:** Add two waystations → confirm second one appends to bottom. Set a waystation's marker value and confirm re-ordering only happens on edit. Tap "Add foods" in a waystation → confirm navigation to foods page in selection mode and return populates the waystation.
