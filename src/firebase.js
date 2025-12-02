import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyABufCm2ZINz4IFmVSlWBOGiot4Vn4HInI",
  authDomain: "dynamic-a3cf7.firebaseapp.com",
  projectId: "dynamic-a3cf7",
  storageBucket: "dynamic-a3cf7.firebasestorage.app",
  messagingSenderId: "892120588624",
  appId: "1:892120588624:web:4f20bea0b17dea59334c55",
  measurementId: "G-2YHL9CRWWD"

};

// Initialize Firebase dengan error handling
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Jika sudah diinisialisasi, gunakan app yang ada
  app = initializeApp(firebaseConfig, 'secondary');
}

// Initialize services dengan null check
let db, storage, auth, database;

try {
  db = getFirestore(app);
  console.log('Firestore initialized');
} catch (error) {
  console.error('Firestore initialization error:', error);
  db = null;
}

try {
  storage = getStorage(app);
  console.log('Storage initialized');
} catch (error) {
  console.error('Storage initialization error:', error);
  storage = null;
}

try {
  auth = getAuth(app);
  console.log('Auth initialized');
} catch (error) {
  console.error('Auth initialization error:', error);
  auth = null;
}

try {
  database = getDatabase(app);
  console.log('Realtime Database initialized');
} catch (error) {
  console.error('Database initialization error:', error);
  database = null;
}

// Development environment setup
if (import.meta.env.DEV) {
  try {
    // Connect to emulators in development
    if (db) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('Connected to Firestore emulator');
    }
    if (storage) {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Connected to Storage emulator');
    }
    if (auth) {
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('Connected to Auth emulator');
    }
    if (database) {
      connectDatabaseEmulator(database, 'localhost', 9000);
      console.log('Connected to Database emulator');
    }
  } catch (error) {
    console.warn('Emulator connection failed:', error);
  }
}

// Export dengan null safety
export { db, storage, auth, database };
export default app;

