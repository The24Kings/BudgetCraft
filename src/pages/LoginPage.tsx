import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import {
	collection,
	doc,
	getDoc,
	serverTimestamp,
	setDoc,
	Timestamp,
	updateDoc
} from "firebase/firestore";
import { IonButton, IonInput, IonItem, IonLabel, IonText } from "@ionic/react";
import categoriesData from "../categories.json";
import { auth, firestore } from "../utilities/FirebaseConfig";

const LoginPage: React.FC<{
	setUser: (user: any) => void;
	setErrorMessage: (msg: string) => void;
}> = ({ setUser, setErrorMessage }) => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [isRegistering, setIsRegistering] = useState<boolean>(false);
	const [errorMessage, setErrorMessageLocal] = useState<string>("");

	// Handle user registration
	const handleRegister = async () => {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// Create a document in Firestore for the new user
			const userRef = doc(collection(firestore, "users"), user.uid);
			await setDoc(userRef, {
				email: email,
				displayName: `${firstName} ${lastName}`,
				createdAt: Timestamp.now(),
				lastSignIn: null
			});

			// Create a "Settings" collection and "Categories" document for the user
			const settingsRef = doc(
				collection(firestore, `users/${user.uid}/settings`),
				"categories"
			);
			await setDoc(settingsRef, {
				categories: categoriesData,
				lastUpdated: Timestamp.now()
			});

			console.log("User  registered successfully and documents created");

			setEmail("");
			setPassword("");
			setFirstName("");
			setLastName("");
			setErrorMessageLocal("");
		} catch (error) {
			console.error("Registration Error:", error);
			setErrorMessageLocal(error.message);
		}
	};

	// Handle user sign in
	const handleSignIn = async () => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// Fetch user data from Firestore
			const userRef = doc(firestore, "users", user.uid);
			const userDoc = await getDoc(userRef);
			if (userDoc.exists()) {
				const userData = userDoc.data();
				setUser(userData);

				// Update last sign-in time
				await updateDoc(userRef, {
					lastSignIn: serverTimestamp()
				});
			} else {
				console.log("No such document!");
			}

			console.log("User  signed in successfully");
			setErrorMessageLocal("");

			// Clear input fields
			setEmail("");
			setPassword("");
		} catch (error) {
			console.error("Sign in Error:", error);
			setErrorMessageLocal(error.message);
		}
	};

	return (
		<div className="login-container">
			<h2>{isRegistering ? "Register" : "Sign In"}</h2>
			{errorMessage && <IonText className="error-message">{errorMessage}</IonText>}
			{isRegistering && (
				<>
					<IonItem>
						<IonLabel position="floating">First Name</IonLabel>
						<IonInput
							value={firstName}
							onIonChange={(e) => setFirstName(e.detail.value!)}
							required
						/>
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Last Name</IonLabel>
						<IonInput
							value={lastName}
							onIonChange={(e) => setLastName(e.detail.value!)}
							required
						/>
					</IonItem>
				</>
			)}
			<IonItem>
				<IonLabel position="floating">Email</IonLabel>
				<IonInput
					type="email"
					value={email}
					onIonChange={(e) => setEmail(e.detail.value!)}
					required
				/>
			</IonItem>
			<IonItem>
				<IonLabel position="floating">Password</IonLabel>
				<IonInput
					type="password"
					value={password}
					onIonChange={(e) => setPassword(e.detail.value!)}
					required
				/>
			</IonItem>
			<IonButton expand="full" onClick={isRegistering ? handleRegister : handleSignIn}>
				{isRegistering ? "Register" : "Sign In"}
			</IonButton>
			<IonButton expand="full" fill="clear" onClick={() => setIsRegistering(!isRegistering)}>
				{isRegistering
					? "Already have an account? Sign In"
					: "Don't have an account? Register"}
			</IonButton>
		</div>
	);
};

export default LoginPage;
