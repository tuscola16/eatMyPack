import { useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser,
  GoogleAuthProvider,
  signInWithCredential,
  type User,
} from 'firebase/auth';
import { getDocs, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/services/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
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

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const uid = currentUser.uid;
    const plansSnap = await getDocs(collection(db, 'users', uid, 'savedPlans'));
    await Promise.all([
      ...plansSnap.docs.map((d) => deleteDoc(d.ref)),
      deleteDoc(doc(db, 'users', uid, 'preferences')),
    ]);
    await deleteUser(currentUser);
  };

  return { signIn, signUp, signOut, deleteAccount };
}

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return {
    promptGoogleSignIn: () => promptAsync(),
    ready: !!request,
  };
}
