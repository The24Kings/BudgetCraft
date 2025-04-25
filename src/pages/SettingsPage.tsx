import React from "react";
import {
	IonButton,
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

const SettingsPage: React.FC<{ user: any }> = ({ user }) => {
	const userName = user?.displayName || user?.email?.split("@")[0] || "User";

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle className="ion-text-center">Settings</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className="settings-content">
				{/* User Name Header */}
				<IonText className="settings-username">
					<h2>{userName}</h2>
				</IonText>

				{/* Container 1 */}
				<div className="settings-container">
					<IonList lines="none">
						<IonItem
							button
							detail={true}
							routerLink="/settings/personal"
							className="settings-item"
						>
							<IonLabel>Edit Personal Info</IonLabel>
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

				{/* Container 2 */}
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
