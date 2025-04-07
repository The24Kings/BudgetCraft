import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import DebugContainer from "../components/DebugContainer";
import "./BudgetPage.css";

const DebugPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar></IonToolbar>
			</IonHeader>
			<IonContent>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">DEBUG</IonTitle>
					</IonToolbar>
				</IonHeader>
				<DebugContainer userID="test-user" />
			</IonContent>
		</IonPage>
	);
};

export default DebugPage;
