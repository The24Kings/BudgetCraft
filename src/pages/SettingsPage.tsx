import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import {
	IonContent,
	IonHeader,
	IonItem,
	IonLabel,
	IonList,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { firestore } from "../utilities/FirebaseConfig";
import "../pages/SettingsPage.css";

const SettingsPage: React.FC<{ user: any }> = ({ user }) => {
	const [displayName, setDisplayName] = useState("User");

	useEffect(() => {
		if (!user) return;

		const fetchDisplayName = async () => {
			try {
				const userRef = doc(firestore, "users", user.uid);
				const userSnap = await getDoc(userRef);
				if (userSnap.exists() && userSnap.data().displayName) {
					setDisplayName(userSnap.data().displayName);
				} else {
					setDisplayName(user.email?.split("@")[0] || "User");
				}
			} catch (err) {
				console.error("Failed to fetch display name from Firestore:", err);
				setDisplayName(user.email?.split("@")[0] || "User");
			}
		};

		fetchDisplayName();
	}, [user]);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle className="ion-text-center">Settings</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className="settings-content">
				{/* Display Firestore Display Name */}
				<IonText className="settings-username">
					<h2>{displayName}</h2>
				</IonText>

				{/* Main Settings Options */}
				<div className="settings-container">
					<IonList lines="none">
						<IonItem
							button
							detail={true}
							routerLink="/settings/account"
							className="settings-item"
						>
							<IonLabel>Account</IonLabel>
						</IonItem>
						<IonItem
							button
							detail={true}
							routerLink="/settings/notifications"
							className="settings-item"
						>
							<IonLabel>Notification Settings</IonLabel>
						</IonItem>
						<IonItem
							button
							detail={true}
							routerLink="/settings/export"
							className="settings-item"
						>
							<IonLabel>Export User Data</IonLabel>
						</IonItem>
						<IonItem
							button
							detail={true}
							routerLink="/settings/edit-categories"
							className="settings-item"
						>
							<IonLabel>Edit Categories</IonLabel>
						</IonItem>
					</IonList>
				</div>

				{/* Secondary Options */}
				<div className="settings-container">
					<IonList lines="none">
						<IonItem
							button
							detail={true}
							routerLink="/settings/help"
							className="settings-item"
						>
							<IonLabel>Help Topics</IonLabel>
						</IonItem>
						<IonItem
							button
							detail={true}
							routerLink="/settings/about"
							className="settings-item"
						>
							<IonLabel>About</IonLabel>
						</IonItem>
					</IonList>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default SettingsPage;
