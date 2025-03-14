import React, { useEffect, useState } from "react";
import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut
} from "firebase/auth";
import {
	collection,
	doc,
	getDoc,
	serverTimestamp,
	setDoc,
	Timestamp,
	updateDoc
} from "firebase/firestore";
import {
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonImg,
	IonInput,
	IonItem,
	IonLabel,
	IonMenu,
	IonMenuButton,
	IonMenuToggle,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import categoriesData from "../categories.json";
import Container from "../components/Container";
import { auth, firestore } from "../utilities/FirebaseConfig";

const LandingPage: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [firstName, setFirstName] = useState<string>("");
	const [lastName, setLastName] = useState<string>("");
	const [isRegistering, setIsRegistering] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [userData, setUserData] = useState<any>(null);

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
            }); // Fill with data from categories.json

			console.log("User  registered successfully and documents created");

			// Clear input fields
			setEmail("");
			setPassword("");
			setFirstName("");
			setLastName("");
		} catch (error) {
			console.error("Registration Error:", error);
			setErrorMessage(error.message);
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
				setUserData(userData);

				await updateDoc(userRef, {
					lastSignIn: serverTimestamp() // Update last sign-in time
				});
			} else {
				console.log("No such document!");
			}

			console.log("User  signed in successfully");
			setUser(user);
			setErrorMessage("");

			setEmail("");
			setPassword("");
		} catch (error) {
			console.error("Sign in Error:", error);
			setErrorMessage(error.message);
		}
	};

	// Handle user logout
	const handleLogout = async () => {
		await signOut(auth)
			.finally(() => {
				console.log("User  signed out");
				setUser(null);
				setUserData(null);
				setFirstName("");
				setLastName("");
			})
			.catch((error) => {
				console.error("Logout Error:", error);
			});
	};

	// Check if user is signed in
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				console.log("User  signed in using Auth Change Listener");
				setUser(user);
				// Fetch user data from Firestore
				const fetchUserData = async (uid: string) => {
					const userRef = doc(firestore, "users", uid);
					const userDoc = await getDoc(userRef);
					if (userDoc.exists()) {
						const userData = userDoc.data();
						setUserData(userData);
					} else {
						console.log("No such document!");
					}
				};
				fetchUserData(user.uid);
			} else {
				console.log("No user signed in");
				setUser(null);
				setUserData(null);
				setFirstName("");
				setLastName("");
			}
		});
		return () => unsubscribe();
	}, []);

	return (
		<React.Fragment>
			<IonMenu contentId="main-content">
				<IonHeader>
					<IonToolbar>
						<IonTitle>User Settings</IonTitle>
					</IonToolbar>
				</IonHeader>
				{user && (
					<IonContent className="ion-padding">
						<IonText className="center-text">
							<h2>Welcome, {userData?.displayName}!</h2>
						</IonText>
						<IonImg src={user.photoURL} alt="User  Avatar" className="user-avatar" />
						<IonButton onClick={handleLogout}>Logout</IonButton>{" "}
						{/*TODO figure out how to store image, maybe an default user avatar */}
					</IonContent>
				)}
			</IonMenu>

			<IonPage id="main-content">
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="end">
							{user ? (
								<IonMenuToggle>
									<IonImg
										src={user.photoURL}
										alt="User  Profile"
										className="menu-avatar"
										style={{ cursor: "pointer" }}
									/>
								</IonMenuToggle>
							) : null}
						</IonButtons>
						<IonTitle>Landing Page</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					{!user ? (
						<div className="login-container">
							<h2>{isRegistering ? "Register" : "Sign In"}</h2>
							{errorMessage && <p className="error-message">{errorMessage}</p>}
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
							<IonButton
								expand="full"
								onClick={isRegistering ? handleRegister : handleSignIn}
							>
								{isRegistering ? "Register" : "Sign In"}
							</IonButton>
							<IonButton
								expand="full"
								fill="clear"
								onClick={() => setIsRegistering(!isRegistering)}
							>
								{isRegistering
									? "Already have an account? Sign In"
									: "Don't have an account? Register"}
							</IonButton>
						</div>
					) : (
						<Container userID={user.uid} />
					)}
				</IonContent>
			</IonPage>
		</React.Fragment>
	);
};

export default LandingPage;
