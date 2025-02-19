import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Load environment variables
const firebaseConfig = {
	apiKey: process.env.VITE_API_KEY,
	authDomain: process.env.VITE_AUTH_DOMAIN,
	projectId: process.env.VITE_PROJECT_ID,
	storageBucket: process.env.VITE_STORAGE_BUCKET,
	messagingSenderId: process.env.VITE_MESSAGING_SENDER_ID,
	appId: process.env.VITE_APP_ID,
	measurementId: process.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app = (getApps().length === 0) ? initializeApp(firebaseConfig) : getApp();
console.log(app.options.apiKey === firebaseConfig.apiKey ? "Firebase Initialized!" : "Firebase Initialization Failed!");

// Export Firebase services
export const firestore = getFirestore(app); // Firestore database
export const auth = getAuth(app); // Authentication
