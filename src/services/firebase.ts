import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyArUMT0bpexCDWj6IM18qtA8O7gJjI6Zfw",
  authDomain: "eatmypack.firebaseapp.com",
  projectId: "eatmypack",
  storageBucket: "eatmypack.firebasestorage.app",
  messagingSenderId: "755816808702",
  appId: "1:755816808702:web:17444f13179a950082e5af",
  measurementId: "G-WLHXCS59DD"
};

const app = initializeApp(firebaseConfig);

// Use browser persistence on web, AsyncStorage on native
const persistence = Platform.OS === 'web'
  ? browserLocalPersistence
  : getReactNativePersistence(AsyncStorage);

export const auth = initializeAuth(app, { persistence });

export const db = getFirestore(app);
