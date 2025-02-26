import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "./FirebaseConfig";

// Google Sign-In function
export const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, provider);
		return result.user; // Returns user details
	} catch (error) {
		console.error("Google Sign-In Error:", error);
		throw error;
	}
};

// Logout function
export const logout = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error("Logout Error:", error);
		throw error;
	}
};
