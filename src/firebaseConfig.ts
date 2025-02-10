import { FirebaseApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Load environment variables 
const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECT_ID,
  storageBucket: process.env.VITE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_ID,
  measurementId: process.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;

try {
  console.log('Initializing Firebase...');
  app = initializeApp(firebaseConfig);

  console.log('Firebase initialized successfully!');
} catch (error: any) {
  console.error('Error initializing Firebase:', error);
}

// Export Firebase services 
export const firestore = getFirestore(app); // Firestore database
export const auth = getAuth(app);    // Authentication
