import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { initializeFirestore } from "firebase/firestore";

// Load environment variables
const firebaseConfig = {
	apiKey: import.meta.env.VITE_API_KEY || process.env.VITE_API_KEY,
	authDomain: import.meta.env.VITE_AUTH_DOMAIN || process.env.VITE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_PROJECT_ID || process.env.VITE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_STORAGE_BUCKET || process.env.VITE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || process.env.VITE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_APP_ID || process.env.VITE_APP_ID,
	measurementId: import.meta.env.VITE_MEASUREMENT_ID || process.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const firebase = app; // Firebase
export const firestore = initializeFirestore(app, {}); // Firestore
export const db = getDatabase(app); // Firestore
export const auth = getAuth(app); // Authentication
export const provider = new GoogleAuthProvider(); // Google Auth Provider
