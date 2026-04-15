# eatMyPack — Enhancements

## ~~1. Firebase Auth~~ ✅
- ~~Add Firebase project and configure `firebase.js` with Auth + Firestore/RTDB~~
- ~~Sign-up / sign-in screens (email + Google OAuth)~~
- ~~Protect routes behind auth gate~~
- ~~Sync saved plans, pantry, and preferences to the cloud per user~~
- ~~Guest mode fallback (local-only, prompt to sign up to sync)~~

## ~~2. Pack Volume Constraint~~ ✅
- ~~Add `max_volume_ml` field to `RaceConfig`~~
- ~~Add volume data to `FoodItem` (estimated ml per serving)~~
- ~~Update `packAlgorithm` greedy fill to respect a volume budget alongside calorie targets~~
- ~~Show volume usage in `PackSummary` (used / limit)~~
- ~~Allow user to input pack volume on the race setup screen (e.g., vest liter capacity)~~

## ~~3. Pantry & Category Preferences~~ ✅
- ~~**Pantry:** let users mark foods they own — persisted list separate from per-plan pinning~~
  - ~~Pantry screen accessible from Foods tab or Settings~~
  - ~~"Build from pantry" toggle on race setup that auto-pins pantry items~~
  - ~~Distinguish pantry (long-lived, "I have these") from pinning (per-plan, "use only these")~~
- ~~**Category preferences:** saved defaults for preferred/excluded categories~~
  - ~~Settings screen toggles (e.g., "I never use gels", "prefer real food")~~
  - ~~Feed into `scoringEngine` as weight boosts / hard filters before pack generation~~
  - ~~Persist via user profile (Firebase) or AsyncStorage~~

## 4. Manual Input Mode (Skip Wizard)
- Alternative to the distance-based wizard: user directly provides:
  - Calories per hour
  - Total hours
  - Pack size (volume in ml or L)
  - Weight limit (grams)
- Build a `RaceConfig`-equivalent from these raw inputs (bypass `raceDefaults` lookup)
- Single-phase or let user optionally split into custom phase blocks
- Entry point: "Advanced" or "Custom Input" button on home / race setup screen
- Reuses the same `packAlgorithm` pipeline — just different config source

## 5. Upgrade to firebase V12
- refactor to use latest firebase

## 6. Race Start Time & Real-Clock Phase Schedule
- Add `startTime` (HH:MM) to `RaceConfig`
- `phaseCalculator.ts` computes absolute clock times per phase from start time + duration offsets
- Plan view (`plan.tsx`) shows real clock times ("Phase 1: 5:00 AM – 9:00 AM") instead of relative hours
- Race setup screen (`setup.tsx`) gets a start time picker

## 7. Aid Station Mapping
- Let user input race aid station names + arrival distances (or times) on the setup screen
- Map each generated phase to its nearest aid station checkpoint
- Plan view shows "Cunningham Gulch AS — mile 42" as a header for the relevant phase
- Changes: `RaceConfig` type, `setup.tsx` form, `plan.tsx` display, `phaseCalculator.ts`

## 8. Drop Bag Planning
- User marks certain aid stations as "drop bag accessible" (built on top of item 7)
- Drop bag phases unlock heavier/bulkier foods (freeze-dried meals, larger quantities) in the pack algorithm
- `packAlgorithm.ts` gets a separate drop-bag weight/volume budget
- Plan view: two-section layout per drop-bag phase (carried pack vs. drop bag)

## 9. Elevation Gain → Calorie Adjustment
- Add total elevation gain (ft or m) input to `RaceConfig` on the setup screen
- `phaseCalculator.ts` applies a ~100 cal / 1,000 ft uphill adjustment to per-phase calorie targets
- Eliminates under-fueling on mountain courses where flat-course defaults are too low

## 10. Export / Share Plan
- "Export" button on the plan screen
- Options: share as image (`react-native-view-shot` + `expo-sharing`), export JSON, or copy a shareable Firebase link
- Practical for sharing with crew at race check-in or printing a paper backup

## 11. Per-Phase Hydration Targets
- Add sweat rate input to race setup (ml/hr, or light/moderate/heavy presets)
- `phaseCalculator.ts` outputs fluid ml and additional sodium mg per phase alongside food targets
- Plan view displays hydration targets (drink X oz, take Y electrolyte tabs) per phase header

## 12. Crew Notes per Phase
- Inline editable text note per phase on the plan screen ("Remind crew to have warm broth at mile 62")
- Add `crewNote?: string` to `PackPhase` type
- Persist via Zustand store + cloud sync
- Notes visible on the exported plan (item 10)
