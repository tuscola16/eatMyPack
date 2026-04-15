// Firebase Auth types for React Native
// getReactNativePersistence is exported from the RN bundle (dist/rn/index.js)
// but not from the default TS declarations. Metro resolves it at runtime
// via the "react-native" field in @firebase/auth/package.json.
import 'firebase/auth';
import type AsyncStorage from '@react-native-async-storage/async-storage';

declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: typeof AsyncStorage
  ): Persistence;
}
