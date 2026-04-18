import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!DSN) return;

  Sentry.init({
    dsn: DSN,
    enableInExpoDevelopment: false,
    debug: __DEV__,
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    environment: __DEV__
      ? 'development'
      : (Constants.expoConfig?.extra?.releaseChannel ?? 'production'),
  });
}

export { Sentry };
