import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
	IonAvatar,
	IonButton,
	IonButtons,
	IonContent,
	IonFooter,
	IonHeader,
	IonMenu,
	IonMenuToggle,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import Container from "../components/Container";
import { exportUserDataJSON } from "../utilities/DataExport";
import { auth, firestore } from "../utilities/FirebaseConfig";
import LoginPage from "./LoginPage";

const LandingPage: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const [userData, setUserData] = useState<any>(null);

	// Handle user logout
	const handleLogout = async () => {
		await signOut(auth)
			.finally(() => {
				console.log("User  signed out");
				setUser(null);
				setUserData(null);
			})
			.catch((error) => {
				console.error("Logout Error:", error);
			});
	};

	// Handle user data export
	const handleExportJSON = () => {
		if (user) {
			const categories = [];
			exportUserDataJSON(user.uid, categories);
		} else {
			console.warn("No user logged in, cannot export.");
		}
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
						<IonAvatar className="menu-avatar" style={{ justifySelf: "center" }}>
							<img
								src={
									user.photoURL
										? user.photoURL
										: "https://ionicframework.com/docs/img/demos/avatar.svg"
								}
								alt="User  Avatar"
							/>
						</IonAvatar>
						<IonText className="center-text">
							<h2>Welcome, {userData?.displayName}!</h2>
						</IonText>
						<IonButton onClick={handleLogout}>Logout</IonButton>
					</IonContent>
				)}
                <IonFooter>
                    <IonButton expand="full" color="secondary" onClick={handleExportJSON}>
                        Export JSON
                    </IonButton>
                </IonFooter>
			</IonMenu>

			<IonPage id="main-content">
				<IonHeader>
					<IonToolbar>
						<IonButtons slot="end">
							{user ? (
								<IonMenuToggle>
									<IonAvatar
										className="user-avatar"
										style={{ cursor: "pointer" }}
									>
										<img
											src={
												user.photoURL
													? user.photoURL
													: "https://ionicframework.com/docs/img/demos/avatar.svg"
											}
											alt="User  Avatar"
										/>
									</IonAvatar>
								</IonMenuToggle>
							) : null}
						</IonButtons>
						<IonTitle>Landing Page</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					{!user ? (
						<LoginPage
							setUser={setUser}
							setErrorMessage={(msg) => console.error(msg)}
						/>
					) : (
						<Container userID={user.uid} />
					)}
				</IonContent>
			</IonPage>
		</React.Fragment>
	);
};

export default LandingPage;
