# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**eatMyPack** is a React Native (Expo SDK 54) app for ultra/trail runners to plan race nutrition. Users configure a race (distance, duration, conditions), and the app generates a food pack plan broken into time-based phases with calorie, carb, and sodium targets.

## Commands

```bash
npm start          # Expo dev server (interactive menu)
npm run android    # Start on Android emulator/device
npm run ios        # Start on iOS simulator/device
npm run web        # Start web version (Metro bundler)
npx expo start -c  # Start with cache cleared
```

No test runner or linter is currently configured.

## Architecture

**Stack:** React Native 0.81 + Expo 54 (New Architecture) + Expo Router 6 (file-based routing) + Zustand 5 + expo-sqlite + TypeScript (strict)

**Path alias:** `@/*` maps to `src/*` (configured in tsconfig.json)

### Routing (Expo Router)

All routes live in `src/app/`. The root layout (`src/app/_layout.tsx`) is a tab navigator with three visible tabs (Home, Foods, Settings) and a hidden `race` group for the plan flow:

- `/` — Home: quick-start distance chips, saved plans list
- `/database` — Food browser with filters; `/database/[id]` for food detail
- `/settings` — User preferences
- `/race/setup` — Race config form (distance, duration, conditions)
- `/race/plan` — Generated pack plan view

### Core Domain: Pack Algorithm

The pack-building pipeline in `src/services/`:

1. **phaseCalculator** — Splits race duration into phases (early/mid/late/night/final_push) with per-hour calorie, carb, and sodium targets. Phase patterns vary by duration (<8h, <14h, <36h, 200mi cycling).
2. **scoringEngine** — Scores each food for a given phase based on category fit, gut rating, best-for tags, and variety.
3. **quantityCalculator** — Determines how many servings of a food to assign (partial fill logic).
4. **packAlgorithm** (`buildPack`) — Greedy phase-fill loop: score foods, pick top, fill, repeat. Then balances caffeine across phases. Supports food pinning (restrict to user's foods) and rejection (swap out disliked items via `rejectAndRebuild`).

### State Management

- **Zustand store** (`src/store/useStore.ts`) — Holds food filters, race config, current/saved plans, pinned/rejected food IDs.
- **useLocalStorage hook** — Persists Zustand state to AsyncStorage on changes.
- **usePackBuilder hook** — Wraps `buildPack`/`rejectAndRebuild` with store integration.

### Data

- `src/data/foods.ts` — Static food database (FoodItem[]) with nutritional data for gels, bars, chews, drink mixes, real food, nut butters, freeze-dried meals.
- `src/data/raceDefaults.ts` — Per-distance nutrition targets, condition adjustments, phase templates.

### Types

All domain types in `src/types/`: `FoodItem`, `RaceConfig`, `RacePhase`, `PackPlan`, `PackPhase`, `PackEntry`. Key enums: `FoodCategory` (7 values), `GutRating` (5 levels), `PhaseType` (5 phases), `RaceDistance` (50K/50mi/100K/100mi/200mi/custom).

### Theme

`src/theme/` exports `colors`, `typography`, `spacing`, `borderRadius`. Dark theme with earth tones (background `#1A1F16`, primary `#A8C686`). All components use `StyleSheet.create` with theme tokens — no styling library.
