import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";

const ToolsPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Tools</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<h2>This is the Tools Page</h2>
				<p>
					Here’s where you’ll include financial tools like calculators or category
					editors.
				</p>
			</IonContent>
		</IonPage>
	);
};

export default ToolsPage;
