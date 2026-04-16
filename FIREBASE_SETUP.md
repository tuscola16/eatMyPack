# eatMyPack — Firebase Backend Setup

## Project Overview

**eatMyPack** is a React Native (Expo SDK 54) app for ultra/trail runners to plan race nutrition. The client is fully built and uses the **Firebase JS SDK v11**. This document specifies everything needed to configure the Firebase backend so the client can connect.

## What to Create

1. A Firebase project
2. Authentication with Email/Password and Google providers
3. A Firestore database with security rules
4. A registered Web app (the JS SDK uses web config in React Native)

---

## Step 1: Create the Firebase Project

- **Project name:** `eatmypack`
- **Google Analytics:** Optional (not required by the app)

## Step 2: Enable Authentication

Go to **Authentication > Sign-in method** and enable these providers:

### Email/Password
- Enable **Email/Password** (not Email link)

### Google
- Enable **Google** sign-in
- Set the **project support email**
- After enabling, note the **Web client ID** — the app needs it for `expo-auth-session`

### OAuth Consent Screen (Google Cloud Console)
- **App name:** eatMyPack
- **User support email:** (your email)
- **Scopes:** `email`, `profile`, `openid`
- **Authorized domains:** Add the Expo auth proxy domain: `auth.expo.io`
- **Publishing status:** Testing (add test users), or External for production

### OAuth Credentials Needed by the Client
The app uses `expo-auth-session` for Google OAuth. Create or locate these OAuth 2.0 client IDs in **Google Cloud Console > APIs & Credentials > OAuth 2.0 Client IDs**:

| Client ID Purpose | Type | Redirect URI |
|---|---|---|
| Expo Go / Development | Web application | `https://auth.expo.io/@YOUR_EXPO_USERNAME/eatmypack` |
| iOS standalone | iOS | Bundle ID: `com.eatmypack.app` |
| Android standalone | Android | Package: `com.eatmypack.app` + SHA-1 fingerprint |

## Step 3: Create Firestore Database

- Go to **Firestore Database > Create database**
- **Location:** Choose the region closest to your users (e.g., `us-central1` or `us-east1`)
- **Start in production mode** (we'll set rules below)

### Firestore Schema

The app stores all user data under a `users/{uid}` document path. There are two data types:

```
users/
  {uid}/
    savedPlans/          ← subcollection
      {planId}/          ← one document per saved plan
        id: string
        created_at: string (ISO 8601)
        race_config: {
          distance: "50K" | "50mi" | "100K" | "100mi" | "200mi" | "custom"
          custom_distance_km?: number
          expected_duration_hours: number
          conditions: "hot" | "moderate" | "cool"
        }
        phases: [                          ← array of PackPhase
          {
            phase: {                       ← RacePhase
              type: "early" | "mid" | "late" | "night" | "final_push"
              label: string
              start_hour: number
              end_hour: number
              duration_hours: number
              cal_per_hour_target: number
              carb_per_hour_target_g: number
              sodium_per_hour_target_mg: number
              total_cal_target: number
              total_carb_target_g: number
              preferred_categories: string[]
              min_gut_rating: string
              notes: string
            }
            entries: [                     ← array of PackEntry
              {
                food: {                    ← FoodItem (embedded)
                  id: string
                  name: string
                  brand: string
                  category: string
                  serving_size_g: number
                  serving_size_oz: number
                  calories: number
                  cal_per_g: number
                  cal_per_oz: number
                  carbs_g: number
                  protein_g: number
                  fat_g: number
                  sodium_mg: number
                  caffeine_mg: number
                  gut_friendliness: string
                  best_for: string[]
                  label_accuracy_note: string | null
                  is_caffeinated: boolean
                }
                servings: number
                total_calories: number
                total_weight_g: number
                total_carbs_g: number
                total_sodium_mg: number
                assigned_phase: string
              }
            ]
            total_calories: number
            total_carbs_g: number
            total_sodium_mg: number
            total_weight_g: number
            target_met_pct: number
          }
        ]
        total_calories: number
        total_weight_g: number
        total_items: number
        rejected_food_ids: string[]
        pinned_food_ids: string[]
        updatedAt: Timestamp (server)      ← added by client on write
    preferences/          ← single document (not a subcollection)
      pinnedFoodIds: string[]
      updatedAt: Timestamp (server)
```

### Key Points About the Data
- **Plan documents can be large** — each plan embeds full `FoodItem` objects inside entries. A single plan with 5 phases and 30 food entries is roughly 20-40 KB. This is well within Firestore's 1 MB document limit.
- **`updatedAt`** is written by the client using `serverTimestamp()` on every write. It is stripped on read.
- **Plan IDs** are UUIDs generated client-side via `expo-crypto`.
- **No server-side aggregation is needed** — all computation happens on-device.

## Step 4: Firestore Security Rules

Deploy these security rules. They enforce that users can only read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Step 5: Register a Web App

Go to **Project Settings > General > Your apps > Add app > Web**.

- **App nickname:** eatMyPack Client
- Do NOT enable Firebase Hosting (not needed)

After registering, copy the `firebaseConfig` object. The client needs these values in `src/services/firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

## Step 6: Firestore Indexes

No composite indexes are required. The app only performs these queries:
- `getDocs(collection(db, 'users', uid, 'savedPlans'))` — full collection read, no filters
- `getDoc(doc(db, 'users', uid, 'preferences'))` — single document read

Both are served by default indexes.

---

## Client Operations Summary

These are the exact Firestore operations the client performs. No Cloud Functions or server-side logic is needed.

| Operation | Firestore Call | When |
|---|---|---|
| Save plan | `setDoc(users/{uid}/savedPlans/{planId}, plan)` | User saves a pack plan |
| Delete plan | `deleteDoc(users/{uid}/savedPlans/{planId})` | User deletes a saved plan |
| Fetch all plans | `getDocs(users/{uid}/savedPlans)` | On sync / sign-in |
| Save preferences | `setDoc(users/{uid}/preferences, data, {merge: true})` | Pinned foods change |
| Fetch preferences | `getDoc(users/{uid}/preferences)` | On sync / sign-in |

## Checklist

- [ ] Firebase project created (`eatmypack`)
- [ ] Email/Password auth enabled
- [ ] Google auth enabled + OAuth consent screen configured
- [ ] OAuth client IDs created (Web / iOS / Android)
- [ ] Firestore database created in production mode
- [ ] Firestore security rules deployed (user-scoped access only)
- [ ] Web app registered, `firebaseConfig` values copied to client
- [ ] OAuth client IDs copied to client `useAuth.ts`
