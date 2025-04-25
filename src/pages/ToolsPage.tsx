import React from "react";
import { constructOutline } from "ionicons/icons";
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import "../pages/ToolsPage.css";

const ToolsPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle className="tools-title">Tools</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className="tools-content" fullscreen>
				<div className="tools-coming-soon-wrapper">
					<IonIcon icon={constructOutline} className="tools-icon" />
					<h2>Coming Soon</h2>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default ToolsPage;
