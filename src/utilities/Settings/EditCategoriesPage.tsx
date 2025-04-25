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
import { Category, EntryCategories } from "../Categories";

const EditCategoriesPage: React.FC<{ user: any; jsonData: any; categoryData: Category[] }> = ({
	user,
	jsonData,
	categoryData
}) => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/settings" />
					</IonButtons>
					<IonTitle>Edit Categories</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<EntryCategories userID={user.uid} json={jsonData} categories={categoryData} />
			</IonContent>
		</IonPage>
	);
};

export default EditCategoriesPage;
