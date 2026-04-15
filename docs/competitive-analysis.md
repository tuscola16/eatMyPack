# eatMyPack — Competitive Analysis

*Research conducted: April 2026*

## Summary Finding

No app on the market does exactly what eatMyPack does. The closest competitors either:
- (a) plan race logistics without a curated food scoring/selection engine, or
- (b) track daily training nutrition without a race-day pack-generation algorithm.

eatMyPack's combination of food scoring by gut rating + category fit + phase type + variety, generating a phase-broken-down physical food pack, occupies a clear gap in the market.

---

## Category 1: Direct Competitors — Ultra/Trail-Specific Race Nutrition Planning

### 1. Race Ultra
- **Platform:** iOS + Android (free 7-day trial, then paid subscription)
- **Key Features:** Pre-race checkpoint planning, crew communication (chat), gear list packing (with nutrition included), live pace forecasting during race, mandatory gear checklists, drop bag organization
- **Unique:** Strong crew coordination and live race tracking. The most full-featured ultra-specific logistics app.
- **Weaknesses:** Nutrition planning is list-management oriented, not algorithm-generated. No food scoring, no phase-based calorie/carb/sodium targets, no food database. Focuses on logistics, not nutrition science.

### 2. Ultra Planner (ultra-planner.vercel.app)
- **Platform:** Web only (free)
- **Key Features:** Input distance, elevation, time goal, start time, calorie/fluid/sodium rates; outputs an aid-station-by-aid-station spreadsheet with per-segment targets; exports to .xlsx
- **Unique:** Free, fast, spreadsheet-style output, handles crew access/drop bags/cutoffs
- **Weaknesses:** No food database. No food scoring or assignment. User manually translates calorie targets into actual food items. Essentially a calculator, not a planner.

### 3. Näak Nutrition Calculator (naak.com/pages/nutrition-calculator)
- **Platform:** Web only (free)
- **Key Features:** Inputs race distance, elevation gain, sweat rate, gut tolerance; outputs per-aid-station calorie targets for Näak products; carb/hydration breakdown
- **Unique:** Considers elevation-adjusted calorie burn and gut tolerance rating as inputs; aid-station granularity
- **Weaknesses:** Entirely locked to Näak product line. Functions as a branded product calculator, not a general-purpose food pack builder.

### 4. TrailPlanner (trail-planner.vercel.app)
- **Platform:** Web only (free)
- **Key Features:** Aid station timing, hourly carb/water/sodium estimates, pacing targets, printable plan
- **Unique:** Exportable, printable plan specifically for trail race aid station timing
- **Weaknesses:** No food database, no food assignment/scoring. Produces targets only.

### 5. Route Fuel (routefuel.co)
- **Platform:** Web only (pricing not publicly disclosed)
- **Key Features:** GPX file upload, weather-adjusted fueling, aid station segmentation, bottle strategy (carb vs. electrolyte splits), crew notes, product-specific guidance
- **Unique:** "Beyond grams per hour" — produces genuinely race-usable plans with product logistics and crew handoff language. Weather and terrain integrated.
- **Weaknesses:** No mobile app, no food database for custom food. Designed by a coach, pricing opaque.

### 6. Trail Flow Nutrition Spreadsheet (trailflow.run)
- **Platform:** Web/Google Sheets (free template)
- **Key Features:** Two-tab system — food nutritional database (user-built) and race scorecard; tracks calories, carbs, protein, sodium vs. per-hour targets; supports drop bag planning
- **Unique:** Fully customizable, free
- **Weaknesses:** No automated food scoring, no phase-based assignment, completely manual. Not an app.

---

## Category 2: Adjacent Competitors — General Endurance Nutrition Apps

### 7. Precision Fuel & Hydration Planner (precisionhydration.com/planner)
- **Platform:** Web only (free); official IRONMAN and UTMB partner
- **Key Features:** Inputs race duration, intensity, weather, sweat sodium (from optional lab test); outputs hourly carb + fluid + sodium targets; covers 143,000+ athlete profiles; pre-race carb-loading schedules
- **Unique:** Industry-leading sweat sodium science; trusted by UTMB CCC winner Hayden Hawks; UTMB partnership gives it trail ultra credibility
- **Weaknesses:** Outputs targets only — no food assignment, no food database, no pack generation. No mobile app.

### 8. Fuelin (fuelin.com)
- **Platform:** iOS + Android (4.7 stars, 65,000+ downloads)
- **Pricing:** $29/mo or $119/yr (Autopilot); $99/mo or $399/yr (Copilot with coach)
- **Key Features:** Daily macro targets color-coded by training load (Red/Yellow/Green carb days), AI food logging, integration with TrainingPeaks/Strava/Garmin/TriDot, sweat rate tracker
- **Unique:** Expert-built by accredited sports dietitians; endorsed by Jan Frodeno and Daniela Ryf; adaptive to daily training load
- **Weaknesses:** No race-day food pack generation. Ultra/trail running is a secondary use case. Primarily a daily macro coach, not a race-day fueling tool. Expensive, no free tier.

### 9. MAVR (mavr.app)
- **Platform:** iOS only
- **Key Features:** Live glycogen projection, during-workout fueling alerts, AI voice/text meal logging, 4M+ food database, dynamic daily macro adjustment, race planner with carb-loading and gel timing; integrates with Strava/TrainingPeaks/Intervals.icu/Runna/Apple Health/Garmin/Coros/WHOOP/Oura
- **Unique:** Daily recalculation based on actual training; glycogen visualization; AI coach "Kai"; strong integrations ecosystem
- **Weaknesses:** iOS only. No specific ultra/trail features despite endurance focus.

### 10. EatMyRide (eatmyride.com)
- **Platform:** iOS + Android (subscription, free + paid tiers)
- **Key Features:** Syncs Strava/TrainingPeaks routes, calculates per-workout nutrition plan, Garmin sync for real-time mid-workout alerts, sweat rate testing, personal metabolism modeling
- **Unique:** Real-time Garmin notifications during rides/runs; sophisticated personal metabolism modeling
- **Weaknesses:** Primarily cycling-focused. Running and triathlon are secondary. Ultra running support is not mentioned. Limited pre-loaded food options.

### 11. endur8 (endur8.com)
- **Platform:** iOS; Free basic tier; £8.49/quarter or £24.99/year for full features
- **Key Features:** Route upload + real-time nutrition timing alerts, push notifications during activity, carb intake target calculation by elevation and pace
- **Unique:** Real-time push notifications timed to route progress; minimal battery drain for long days
- **Weaknesses:** Appears aging (launched 2017, limited recent coverage). Cycling-oriented. No food database browsing or pack planning.

### 12. CORE Nutrition Planning (fuelthecore.com)
- **Platform:** Web (free + premium tiers)
- **Key Features:** 1,000+ product database, weather forecast integration, per-race product availability (knows what's offered on specific race courses), carb + fluid targets, printable pace bands
- **Unique:** Knows specific race course aid station offerings; guided by research scientists (Jeukendrup); strong scientific basis
- **Weaknesses:** Primarily triathlon-focused. No mobile app. Trail/ultra running is not a primary design target. No food scoring algorithm.

### 13. 42Cal Fuel Planner (42cal.com/tools/fuel-planner)
- **Platform:** Web only (free)
- **Key Features:** Inputs duration, effort level, weather, gut training level, preferred fuel type; outputs carb/fluid/sodium targets + timed schedule; includes carb-loading plan
- **Unique:** Free, quick, science-based calculator with gut training level as explicit input variable
- **Weaknesses:** Marathon-focused (max ~3-4 hours implied). No ultra-distance protocols. No food database or food assignment.

### 14. RunRacePlanner (runraceplanner.com)
- **Platform:** Web only (free)
- **Key Features:** GPX/FIT/KML upload, elevation profile analysis, normalized load calculation, pace optimization, carb consumption calculation, gel/nutrition point distribution, glycogen depot modeling, CSV export, 60-day shareable links
- **Unique:** Route-terrain-aware carb distribution; free; built for ultra and marathon; GPX-native
- **Weaknesses:** No food database. No food scoring or pack generation. Requires GPS file.

---

## Feature Comparison Matrix

| Feature | eatMyPack | Race Ultra | Fuelin | MAVR | PF&H Planner | Route Fuel | Ultra Planner | Näak Calc | EatMyRide |
|---|---|---|---|---|---|---|---|---|---|
| Ultra/trail-specific | **Yes** | Yes | Partial | Partial | Yes | Yes | Yes | Yes | No |
| Mobile app | **iOS+Android** | iOS+Android | iOS+Android | iOS only | No | No | No | No | iOS+Android |
| Generates food pack plan | **Yes** | No | No | No | No | Partial | No | No | No |
| Curated food database | **Yes** | No | General | 4M+ gen | No | No | No | No | Limited |
| Food scoring algorithm | **Yes** | No | No | No | No | No | No | No | No |
| Phase-based time plans | **Yes** | No | No | No | No | Partial | Partial | No | No |
| Gut rating as input | **Yes** | No | No | No | No | No | No | Yes | Partial |
| Calorie + carb + sodium | **Yes** | No | Partial | Partial | Yes | Yes | Yes | Yes | Partial |
| Aid station planning | Partial | Yes | No | No | No | Yes | Yes | Yes | No |
| Crew coordination | No | Yes | No | No | No | Yes | No | No | No |
| Daily training nutrition | No | No | Yes | Yes | No | No | No | No | Yes |
| Training platform sync | No | No | Yes | Yes | No | No | No | No | Yes |
| Real-time race alerts | No | Yes | No | Partial | No | No | No | No | Yes |
| Weather integration | No | No | No | No | Partial | Yes | No | Yes | No |
| Free tier available | Yes | 7-day trial | No | Trial | Yes | Unknown | Yes | Yes | Yes |
| Offline capable | **Yes (RN)** | Yes | No | No | No | No | No | No | No |

---

## Key Competitive Gaps eatMyPack Fills

1. **Food pack generation algorithm** — No competitor generates a specific list of food items (with servings/quantities) to pack. Competitors output targets (g carb/hr) and stop there. eatMyPack closes the loop from target to actual food items in a bag.

2. **Gut rating as a food-level attribute** — Competitors that consider gut tolerance do so as a race-level input. eatMyPack attaches gut rating to individual food items, enabling item-level selection optimization.

3. **Food variety scoring across a long race** — No competitor addresses taste/texture fatigue across an ultra. eatMyPack's variety scoring for 24h+ events is unique.

4. **Phase-type-specific food category weighting** — The early/mid/late/night/final_push phase structure with different food category scoring patterns is not found in any competitor.

5. **Native mobile app for ultra-specific nutrition** — Fuelin and EatMyRide have strong mobile apps but are daily training tools, not race-day food pack builders.

6. **Offline-capable on mobile** — As a React Native app, eatMyPack can function offline during a race. Web-only tools fail without connectivity.

---

## Competitive Threats to Watch

- **Precision Fuel & Hydration** — Brand recognition in the ultra world (UTMB partnership), growing planner tool. If they add a food database and pack builder, their existing audience is massive.
- **Route Fuel** — Closest in philosophy (practical race-usable plans), but web-only and coach-centric. A mobile version with a food database would be a real competitor.
- **Race Ultra** — Strong ultra-specific mobile presence and crew features. Adding a nutrition algorithm would create a full-stack competitor.
- **MAVR** — Well-funded AI-first nutrition app expanding into endurance. Their 4M+ food database + integrations make them formidable if they add race-pack-generation features.

---

## Sources

- [Ultra Planner](https://ultra-planner.vercel.app/)
- [RACE Ultra - App Store](https://apps.apple.com/us/app/race-ultra/id6502156959)
- [RACE Ultra - About](https://raceultra.com/about-race-ultra.html)
- [Route Fuel](https://routefuel.co/)
- [Fuelin](https://fuelin.com/)
- [Fuelin Pricing](https://fuelin.com/pricing)
- [MAVR App](https://www.mavr.app/)
- [MAVR vs Fuelin Comparison](https://www.mavr.app/blog/mavr-vs-fuelin-best-nutrition-app-endurance-athletes-2025)
- [CORE Nutrition Planning](https://www.fuelthecore.com/)
- [42Cal Fuel Planner](https://www.42cal.com/tools/fuel-planner)
- [Precision Fuel & Hydration](https://www.precisionhydration.com/us/en/)
- [PF&H Fuel & Hydration Planner](https://www.precisionhydration.com/planner/)
- [Näak Nutrition Calculator](https://www.naak.com/pages/nutrition-calculator)
- [TrailPlanner](https://trail-planner.vercel.app/)
- [EatMyRide](https://www.eatmyride.com/)
- [endur8](https://www.endur8.com/)
- [Trail Flow Nutrition Spreadsheet](https://trailflow.run/spreadsheet/nutrition-scorecard-spreadsheet-dial-your-race-nutirition/)
- [RunRacePlanner](https://runraceplanner.com/en/race-planner)
