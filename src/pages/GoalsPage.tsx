import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const GoalsPage: React.FC = () => {
	return (
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Goals</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<h2>This is the Goals Page</h2>
				<p>You’ll set and track savings or budgeting goals here.</p>
			</IonContent>
		</IonPage>
	);
};

export default GoalsPage;
