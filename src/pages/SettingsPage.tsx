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
						<IonItem button detail={true} routerLink="/settings/personal">
							<IonLabel>Edit Personal Info</IonLabel>
						</IonItem>
						<IonItem button detail={true} routerLink="/settings/notifications">
							<IonLabel>Notification Settings</IonLabel>
						</IonItem>
						<IonItem button detail={true} routerLink="/settings/export">
							<IonLabel>Export User Data</IonLabel>
						</IonItem>
						<IonItem button detail={true} routerLink="/settings/edit-categories">
							<IonLabel>Edit Categories</IonLabel>
						</IonItem>
					</IonList>
				</div>

				{/* Container 2 */}
				<div className="settings-container">
					<IonList lines="none">
						<IonItem button detail={true} routerLink="/settings/help">
							<IonLabel>Help Topics</IonLabel>
						</IonItem>
						<IonItem button detail={true} routerLink="/settings/about">
							<IonLabel>About</IonLabel>
						</IonItem>
					</IonList>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default SettingsPage;
