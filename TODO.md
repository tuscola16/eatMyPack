# eatMyPack — TODO

---

## 🚀 App Store Launch Checklist

> Legend: **[Claude]** = I can do this | **[You]** = requires your action | **[Together]** = you provide inputs, I implement

### Blocking — must be done before submission

- [ ] **[You]** Register Apple Developer Program ($99/yr) at developer.apple.com
- [ ] **[You]** Register Google Play Console ($25 one-time) at play.google.com/console
- [ ] **[You]** Create app listings in App Store Connect and Play Console (name, bundle IDs already set: `com.eatmypack.app`)
- [x] **[Together]** Fix Google OAuth placeholder client IDs — real iOS + Android client IDs set, `GoogleService-Info.plist` and `google-services.json` wired into `app.json`
- [ ] **[Together]** Host a Privacy Policy (required by both stores)
  - I can draft the full text; you post it at any URL (GitHub Pages, Notion, your own site)
  - Add the URL to your App Store Connect / Play Console listing
- [ ] **[Claude]** Verify `assets/icon.png` is ≥ 1024×1024 px (Expo scales down; too-small icon fails the build)
  - *Tool needed: ImageMagick (`magick identify`) or I can check via Expo build output*
- [x] **[Together]** Sentry DSN + auth token set in `.env.local`; run `eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value <dsn>` before first cloud build
- [ ] **[Claude]** Run EAS production build once credentials are set: `eas build --profile production --platform all`
  - *Requires: EAS CLI logged in on your machine (`eas whoami`)*
- [ ] **[Together]** Write app store metadata (description, keywords, category, support URL)
  - I can draft all copy; you paste it into App Store Connect and Play Console
- [ ] **[Claude]** Generate app store screenshots using the Expo web preview
  - *Tool needed: Claude Preview (available in this session)*
  - Required sizes: iOS 6.7" (1290×2796) and 5.5" (1242×2208); Android phone (1080×1920 min)
- [ ] **[You]** Submit via `eas submit --profile production --platform ios` / `android` once build artifacts are ready

### Pre-launch polish (do before or shortly after launch)

- [ ] **[Together]** Upgrade Firebase JS SDK to v12 (see item 5 below) — Firebase v11 works fine but v12 is cleaner; this is safe to do before or after launch
- [ ] **[Claude]** Audit all interactive elements for accessibility labels (`accessibilityLabel`, `accessibilityRole`) — Apple review team flags missing labels
  - *No tools needed beyond code reading + editing*
- [ ] **[Claude]** Confirm `eas.json` production profile `autoIncrement: true` is working — do a dry-run build to verify version bump
- [ ] **[You]** Set up TestFlight (iOS) and Internal Testing track (Android) to smoke-test the production build on a real device before public release

---

## Completed ✅

- ~~1. Firebase Auth~~ — sign-up/sign-in, Google OAuth (web), route protection, cloud sync, guest mode
- ~~2. Pack Volume Constraint~~ — `max_volume_ml` in RaceConfig, volume data on FoodItem, algorithm enforcement, UI display
- ~~3. Pantry & Category Preferences~~ — pantry screen, "build from pantry" toggle, category preference weights in scoring engine

---

## Feature Backlog

### 4. Manual Input Mode (Skip Wizard)
- Alternative to the distance-based wizard: user directly provides calories/hr, total hours, pack volume, weight limit
- Build a `RaceConfig`-equivalent from raw inputs (bypass `raceDefaults` lookup)
- Single-phase or let user optionally split into custom phase blocks
- Entry point: "Advanced" or "Custom Input" button on home / race setup screen
- Reuses the same `packAlgorithm` pipeline — just different config source

### 5. Upgrade to Firebase v12
- Refactor all Firebase imports from compat → modular SDK
- Update `src/services/firebase.ts` initialization
- Remove `firebase/compat/*` imports throughout

### 6. Race Start Time & Real-Clock Phase Schedule
- Add `startTime` (HH:MM) to `RaceConfig`
- `phaseCalculator.ts` computes absolute clock times per phase from start time + duration offsets
- Plan view shows real clock times ("Phase 1: 5:00 AM – 9:00 AM") instead of relative hours
- Race setup screen gets a start time picker

### 7. Aid Station Mapping
- Let user input race aid station names + arrival distances (or times) on the setup screen
- Map each generated phase to its nearest aid station checkpoint
- Plan view shows "Cunningham Gulch AS — mile 42" as a header for the relevant phase

### 8. Drop Bag Planning
- User marks certain aid stations as "drop bag accessible" (builds on item 7)
- Drop bag phases unlock heavier/bulkier foods in the pack algorithm
- `packAlgorithm.ts` gets a separate drop-bag weight/volume budget
- Plan view: two-section layout per drop-bag phase (carried pack vs. drop bag)

### 9. Elevation Gain → Calorie Adjustment
- Add total elevation gain (ft or m) input to `RaceConfig`
- `phaseCalculator.ts` applies ~100 cal / 1,000 ft uphill adjustment to per-phase calorie targets

### 10. Export / Share Plan
- "Export" button on the plan screen
- Options: share as image (`react-native-view-shot` + `expo-sharing`), export JSON, or shareable Firebase link

### 11. Per-Phase Hydration Targets
- Add sweat rate input to race setup (ml/hr, or light/moderate/heavy presets)
- `phaseCalculator.ts` outputs fluid ml + additional sodium per phase
- Plan view displays hydration targets per phase header

### 12. Crew Notes per Phase
- Inline editable text note per phase on the plan screen
- Add `crewNote?: string` to `PackPhase` type
- Persist via Zustand store + cloud sync; visible on exported plan
