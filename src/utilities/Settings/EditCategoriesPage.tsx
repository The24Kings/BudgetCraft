import React, { useState } from "react";
import {
	IonBackButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonItem,
	IonPage,
	IonSelect,
	IonSelectOption,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { Category, EntryCategories } from "../Categories";
import "../../pages/SettingsPage.css";

const EditCategoriesPage: React.FC<{ user: any; jsonData: any; categoryData: Category[] }> = ({
	user,
	jsonData,
	categoryData
}) => {
	const [typeFilter, setTypeFilter] = useState("Income");

	const filteredCategories = categoryData.filter((cat) => cat.getType() === typeFilter);

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
			<IonContent className="ion-padding edit-categories-page">
				{/* Dropdown to choose type */}
				<IonItem className="edit-categories-ion-item-select ion-margin-bottom">
					<IonSelect
						placeholder="Select Type"
						value={typeFilter}
						onIonChange={(e) => setTypeFilter(e.detail.value)}
						className="edit-categories-ion-select"
					>
						<IonSelectOption value="Income">Income</IonSelectOption>
						<IonSelectOption value="Expenses">Expenses</IonSelectOption>
					</IonSelect>
				</IonItem>
				{/* Only show the filtered categories */}
				<EntryCategories
					userID={user.uid}
					json={jsonData}
					categories={filteredCategories}
				/>
			</IonContent>
		</IonPage>
	);
};

export default EditCategoriesPage;
