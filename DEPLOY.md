# Deploy setup

## One-time setup

```bash
npm install
npm i -g eas-cli
eas login
eas init              # writes real projectId into app.json `extra.eas.projectId`
eas update:configure  # writes real updates URL into app.json
```

Replace the two `00000000-0000-0000-0000-000000000000` placeholders and the Sentry `organization` field in `app.json` with real values.

## Environment variables

Set these in `eas.json` per-profile or via `eas secret:create`:

- `EXPO_PUBLIC_SENTRY_DSN` — Sentry DSN (safe to expose, public by design).
- `SENTRY_AUTH_TOKEN` — only needed at build time for source-map upload; set as an EAS secret, not a public env var.

## Builds

```bash
eas build --profile development --platform ios    # dev client, simulator
eas build --profile preview --platform all        # internal testers (TestFlight / APK)
eas build --profile production --platform all     # store submission artifacts
```

## OTA updates

```bash
eas update --branch production --message "fix: typo"
```

`runtimeVersion.policy = "appVersion"` means each `expo.version` bump (e.g. 1.0.0 → 1.0.1) rolls its own update channel; bump native deps only on a new `version`.

## Submit

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

Requires App Store Connect / Play Console credentials configured via `eas credentials`.
