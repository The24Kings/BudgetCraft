import React, { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { Category, EntryCategories } from "../utilities/Categories";
import { exportUserDataJSON } from "../utilities/DataExport";
import { auth, firestore } from "../utilities/FirebaseConfig";
import "../pages/SettingsPage.css";

const SettingsPage: React.FC<{ user: any; jsonData: any; categoryData: Category[] }> = ({
	user,
	jsonData,
	categoryData
}) => {
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

	const handleLogout = async () => {
		try {
			await signOut(auth);
			console.log("User signed out");
		} catch (error) {
			console.error("Logout Error:", error);
		}
	};

	const handleExportJSON = () => {
		if (user) {
			const categories: any[] = [];
			exportUserDataJSON(user.uid, categories);
		}
	};

	const userName = user?.displayName || user?.email?.split("@")[0] || "User";

	const modalCategoryRef = useRef<HTMLIonModalElement>(null);

	const showCategoryModal = () => {
		if (modalCategoryRef.current) {
			modalCategoryRef.current.present();
		}
	};

	// Focus management for accessibility
	useEffect(() => {
		const modalCategory = modalCategoryRef.current;
		if (!modalCategory) return;

		const handleModalWillPresent = () => {
			const routerOutlet = document.querySelector("ion-router-outlet");
			if (routerOutlet) {
				routerOutlet.setAttribute("inert", "true");
			}
		};

		const handleModalDidDismiss = () => {
			const routerOutlet = document.querySelector("ion-router-outlet");
			if (routerOutlet) {
				routerOutlet.removeAttribute("inert");
			}
		};

		modalCategory.addEventListener("ionModalWillPresent", handleModalWillPresent);
		modalCategory.addEventListener("ionModalDidDismiss", handleModalDidDismiss);

		return () => {
			modalCategory.removeEventListener("ionModalWillPresent", handleModalWillPresent);
			modalCategory.removeEventListener("ionModalDidDismiss", handleModalDidDismiss);
		};
	}, []);

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle className="page-title">Settings</IonTitle>
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