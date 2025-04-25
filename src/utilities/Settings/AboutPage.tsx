import React from "react";
import {
	IonBackButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import "../../pages/SettingsPage.css";

const AboutPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/settings" />
					</IonButtons>
					<IonTitle>About</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className="ion-padding">
				<div className="settings-container" style={{ padding: "20px" }}>
					<IonText color="dark">
						<p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
							<strong>BudgetCraft</strong> is a free, personal finance management app,
							developed by the team <strong>Riley &amp; Associates</strong>{" "}
							headquartered in Lewiston, Idaho. Send comments or questions to{" "}
							<a href="mailto:info@budgetcraft.com">info@budgetcraft.com</a>.
						</p>

						<p style={{ marginTop: "20px", fontSize: "0.9rem", color: "#666" }}>
							&copy; 2025 BudgetCraft
						</p>
					</IonText>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default AboutPage;
