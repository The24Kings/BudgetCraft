import React, { useState } from "react";
import {
	IonAlert,
	IonBackButton,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { Category } from "../Categories";
import { exportUserDataJSON } from "../DataExport";

interface ExportUserDataPageProps {
	user: any;
	categoryData: Category[];
}

const ExportUserDataPage: React.FC<ExportUserDataPageProps> = ({ user, categoryData }) => {
	const [showAlert, setShowAlert] = useState(false);

	const handleExport = async () => {
		setShowAlert(false);
		await exportUserDataJSON(user.uid, categoryData);
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/settings" />
					</IonButtons>
					<IonTitle>Export User Data</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent
				className="ion-padding"
				style={{ "--background": "var(--ion-color-navy-blue-tint)" }}
			>
				<IonButton
					expand="block"
					className="export-button"
					onClick={() => setShowAlert(true)}
				>
					Export User Data
				</IonButton>

				<IonAlert
					isOpen={showAlert}
					onDidDismiss={() => setShowAlert(false)}
					header="Confirm Download"
					message="Do you want to download all of your user data as a JSON file?"
					buttons={[
						{
							text: "Cancel",
							role: "cancel",
							cssClass: "alert-button-cancel"
						},
						{
							text: "Okay",
							handler: handleExport
						}
					]}
				/>
			</IonContent>
		</IonPage>
	);
};

export default ExportUserDataPage;
