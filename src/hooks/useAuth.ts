import { useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
  type User,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { auth } from '@/services/firebase';
import { useStore } from '@/store/useStore';
import { AuthUser } from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

function mapUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function useAuth() {
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? mapUser(firebaseUser) : null);
    });
    return unsubscribe;
  }, []);

  const signIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUp = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signOut = () => firebaseSignOut(auth);

  return { signIn, signUp, signOut };
}

export function useGoogleAuth() {
  // Google auth requires platform-specific client IDs; only webClientId is configured so far.
  // On native platforms this would crash, so we skip the auth request entirely.
  const isWeb = Platform.OS === 'web';

  const [request, response, promptAsync] = Google.useAuthRequest(
    isWeb
      ? {
          webClientId: '755816808702-oqa3od92i32ongg1dhob62tj70tmmjku.apps.googleusercontent.com',
          // Add iosClientId and androidClientId later for standalone builds
        }
      : ({} as any),
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return {
    promptGoogleSignIn: isWeb ? () => promptAsync() : undefined,
    ready: isWeb && !!request,
  };
}
