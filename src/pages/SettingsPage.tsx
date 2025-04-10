import React from "react";
import {
	IonAvatar,
	IonButton,
	IonContent,
	IonHeader,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar
} from "@ionic/react";

const SettingsPage: React.FC = () => {
	return (
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Settings</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<IonAvatar className="menu-avatar">
					<img
						src={"https://ionicframework.com/docs/img/demos/avatar.svg"}
						alt="User Avatar"
					/>
				</IonAvatar>
				<IonText className="center-text">
					<h2>Welcome!</h2>
				</IonText>
				<IonButton>Logout</IonButton>
				<IonButton expand="full" color="secondary">
					Export JSON
				</IonButton>
				<h2>This is the Settings Page</h2>
				<p>You’ll manage your account, export data, and set preferences here.</p>
			</IonContent>
		</IonPage>
	);
};

export default SettingsPage;
