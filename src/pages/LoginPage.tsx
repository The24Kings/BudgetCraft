import React, { useState } from "react";
import { useHistory } from "react-router";
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
import { eye, eyeOff } from "ionicons/icons";
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, IonToast } from "@ionic/react";
import categoriesData from "../categories.json";
import { auth, firestore } from "../utilities/FirebaseConfig";

const LoginPage: React.FC<{
	setUser: (user: any) => void;
	setErrorMessage: (msg: string) => void;
}> = ({ setUser }) => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [isRegistering, setIsRegistering] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
	const [toastMessage, setToastMessage] = useState<string>("");
	const [showToast, setShowToast] = useState<boolean>(false);
	const history = useHistory();

	const showErrorToast = (message: string) => {
		setToastMessage(message);
		setShowToast(true);
	};

	// Clear toast when user types
	const handleInputChange = () => {
		if (showToast) setShowToast(false);
	};

	// Handle user registration
	const handleRegister = async () => {
		if (!firstName || !lastName || !email || !password || !confirmPassword) {
			showErrorToast("Please fill in all fields.");
			return;
		}

		if (password !== confirmPassword) {
			showErrorToast("Passwords do not match!");
			return;
		}

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

			console.log("User registered successfully and documents created");

			setEmail("");
			setPassword("");
			setConfirmPassword("");
			setFirstName("");
			setLastName("");

			history.push("/home");
		} catch (error: any) {
			if (error.code === "auth/email-already-in-use") {
				showErrorToast("Email already registered.");
			} else if (error.code === "auth/password-does-not-meet-requirements") {
				showErrorToast(
					"Password must be at least 8 characters and include an uppercase letter, a number, and a special character."
				);
			} else {
				showErrorToast("Registration Error. Please try again.");
			}
		}
	};

	// Handle user sign-in
	const handleSignIn = async () => {
		if (!email || !password) {
			showErrorToast("Please fill in all fields.");
			return;
		}

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
			}

			console.log("User signed in successfully");

			// After successful sign-in, clear inputs and navigate
			setEmail("");
			setPassword("");

			history.push("/home");
		} catch (error: any) {
			if (error.code === "auth/invalid-credential" || error.code === "auth/invalid-email") {
				showErrorToast("Incorrect email or password.");
			} else {
				showErrorToast("Sign-in Error. Please try again.");
			}
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (isRegistering) {
				handleRegister();
			} else {
				handleSignIn();
			}
		}
	};

	return (
		<div className="login-container">
			<h2>{isRegistering ? "Register" : "Sign In"}</h2>

			<IonToast
				isOpen={showToast}
				onDidDismiss={() => setShowToast(false)}
				message={toastMessage}
				duration={0}
				position="top"
			/>

			{isRegistering && (
				<>
					<IonItem>
						<IonLabel position="floating">First Name</IonLabel>
						<IonInput
							value={firstName}
							onIonChange={(e) => setFirstName(e.detail.value!)}
							onIonInput={handleInputChange}
							required
						/>
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Last Name</IonLabel>
						<IonInput
							value={lastName}
							onIonChange={(e) => setLastName(e.detail.value!)}
							onIonInput={handleInputChange}
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
					onIonInput={handleInputChange}
					required
				/>
			</IonItem>

			<IonItem>
				<IonLabel position="floating">Password</IonLabel>
				<IonInput
					type={showPassword ? "text" : "password"}
					value={password}
					onIonChange={(e) => setPassword(e.detail.value!)}
					onIonInput={handleInputChange}
					onKeyUp={handleKeyPress}
					required
				/>
				<IonButton
					slot="end"
					fill="clear"
					onClick={() => setShowPassword(!showPassword)}
					style={{ padding: "0.75rem", alignSelf: "center" }}
				>
					<IonIcon icon={showPassword ? eyeOff : eye} style={{ fontSize: "1.5rem" }} />
				</IonButton>
			</IonItem>

			{isRegistering && (
				<IonItem>
					<IonLabel position="floating">Confirm Password</IonLabel>
					<IonInput
						type={showConfirmPassword ? "text" : "password"}
						value={confirmPassword}
						onIonChange={(e) => setConfirmPassword(e.detail.value!)}
						onIonInput={handleInputChange}
						onKeyUp={handleKeyPress}
						required
					/>
					<IonButton
						slot="end"
						fill="clear"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						style={{ padding: "0.75rem", alignSelf: "center" }}
					>
						<IonIcon
							icon={showConfirmPassword ? eyeOff : eye}
							style={{ fontSize: "1.5rem" }}
						/>
					</IonButton>
				</IonItem>
			)}

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
