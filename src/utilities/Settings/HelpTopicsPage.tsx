import React from "react";
import {
	IonBackButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar
} from "@ionic/react";

const HelpTopicsPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/settings" />
					</IonButtons>
					<IonTitle>Help Topics</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<p>Page content goes here.</p>
			</IonContent>
		</IonPage>
	);
};

export default HelpTopicsPage;
