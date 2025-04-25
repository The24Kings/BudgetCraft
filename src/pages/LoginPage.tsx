import React, { useRef, useState } from "react";
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
import {
	IonButton,
	IonContent,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonPage,
	IonToast,
	IonToolbar
} from "@ionic/react";
import logo from "../../resources/BudgetCraftLogo2.png";
import categoriesData from "../categories.json";
import { auth, firestore } from "../utilities/FirebaseConfig";
import "./LoginPage.css";

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
	const [isValid, setIsValid] = useState<boolean | undefined>(undefined);
	const [isTouched, setIsTouched] = useState<boolean>(false);

	const input = useRef<HTMLIonInputElement>(null);

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

		if (isValid === false) {
			showErrorToast("Invalid email.");
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

			// Clear input fields
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

		if (isValid === false) {
			showErrorToast("Invalid email.");
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

	const validateEmail = (email: string) => {
		return email.match(
			/^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
		);
	};

	const validate = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;

		setIsValid(undefined);

		const isValidEmail = validateEmail(value);

		handleInputChange();

		if (isValidEmail) {
			setIsValid(true);
			setEmail(value);
		} else {
			setIsValid(false);
			setEmail(value);
		}
	};

	const markTouched = () => {
		setIsTouched(true);
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar className="login-toolbar">
					<div className="logo-wrapper">
						<img src={logo} alt="BudgetCraft Logo" className="login-logo" />
					</div>
				</IonToolbar>
			</IonHeader>

			<IonContent className="login-container" fullscreen>
				<h2>{isRegistering ? "Register" : "Sign In"}</h2>

				<IonToast
					isOpen={showToast}
					onDidDismiss={() => setShowToast(false)}
					message={toastMessage}
					duration={0}
					position="top"
				/>

				<div className="login-form-wrapper">
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
							className={`${isValid && "ion-valid"} ${isValid === false && "ion-invalid"} ${isTouched && "ion-touched"}`}
							type="email"
							errorText="Invalid email format"
							onIonBlur={() => markTouched()}
							value={email}
							onIonInput={(e) => validate(e)}
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
							<IonIcon
								icon={showPassword ? eyeOff : eye}
								style={{ fontSize: "1.5rem", color: "var(--ion-color-navy-blue)" }}
							/>
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

					<IonButton
						expand="block"
						onClick={isRegistering ? handleRegister : handleSignIn}
					>
						{isRegistering ? "Register" : "Sign In"}
					</IonButton>

					<IonButton
						expand="block"
						fill="clear"
						onClick={() => setIsRegistering(!isRegistering)}
					>
						{isRegistering
							? "Already have an account? Sign In"
							: "Don't have an account? Register"}
					</IonButton>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default LoginPage;
