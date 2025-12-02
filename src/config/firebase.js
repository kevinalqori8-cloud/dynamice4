// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"

import {getAuth, GoogleAuthProvider} from 'firebase/auth'

const firebaseConfig = {
apiKey: "AIzaSyABufCm2ZINz4IFmVSlWBOGiot4Vn4HInI",
  authDomain: "dynamic-a3cf7.firebaseapp.com",
  projectId: "dynamic-a3cf7",
  storageBucket: "dynamic-a3cf7.firebasestorage.app",
  messagingSenderId: "892120588624",
  appId: "1:892120588624:web:4f20bea0b17dea59334c55",
  measurementId: "G-2YHL9CRWWD"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
