import React, { useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import {
	IonAvatar,
	IonButton,
	IonContent,
	IonFooter,
	IonHeader,
	IonItemDivider,
	IonItemGroup,
	IonModal,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { Category, EntryCategories } from "../utilities/Categories";
import { exportUserDataJSON } from "../utilities/DataExport";
import { auth } from "../utilities/FirebaseConfig";

const SettingsPage: React.FC<{ user: any; jsonData: any; categoryData: Category[] }> = ({
	user,
	jsonData,
	categoryData
}) => {
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
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Settings</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<IonItemGroup
					style={{ display: "flex", alignItems: "center", justifyContent: "left" }}
				>
					<IonAvatar
						className="menu-avatar"
						style={{
							marginRight: "20px",
							width: "60px",
							height: "60px"
						}}
					>
						<img
							src={"https://ionicframework.com/docs/img/demos/avatar.svg"}
							alt="User Avatar"
						/>
					</IonAvatar>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<IonText>
							<h2>Welcome, {userName}!</h2>
						</IonText>
						<IonButton color="danger" onClick={handleLogout}>
							Logout
						</IonButton>
					</div>
				</IonItemGroup>

				<IonItemDivider />

				<IonItemGroup>
					<IonButton expand="full" color="primary" onClick={showCategoryModal}>
						<IonText>Edit Categories</IonText>
					</IonButton>
				</IonItemGroup>
			</IonContent>
			<IonFooter>
				<IonButton expand="full" color="primary" onClick={handleExportJSON}>
					Export Data
				</IonButton>
			</IonFooter>

			<IonModal
				ref={modalCategoryRef}
				isOpen={false}
				onDidDismiss={() => modalCategoryRef.current?.dismiss()}
			>
				<IonHeader>
					<IonToolbar>
						<IonTitle>Edit Categories</IonTitle>
						<IonButton
							fill="clear"
							slot="end"
							onClick={() => modalCategoryRef.current?.dismiss()}
						>
							Close
						</IonButton>
					</IonToolbar>
				</IonHeader>
				<IonContent className="ion-padding">
					<EntryCategories userID={user.uid} json={jsonData} categories={categoryData} />
				</IonContent>
			</IonModal>
		</IonPage>
	);
};

export default SettingsPage;
