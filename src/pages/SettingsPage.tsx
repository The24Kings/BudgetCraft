import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const SettingsPage: React.FC = () => {
	return (
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Settings</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<h2>This is the Settings Page</h2>
				<p>You’ll manage your account, export data, and set preferences here.</p>
			</IonContent>
		</IonPage>
	);
};

export default SettingsPage;
