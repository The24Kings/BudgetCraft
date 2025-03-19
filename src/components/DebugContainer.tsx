import React, { useEffect, useState } from "react";
import { IonButton } from "@ionic/react";
import jsonData from "../categories.json";
import { Category, DataValidation, EntryCategories, parseJSON } from "../utilities/Categories";
import { exportUserDataJSON } from "../utilities/DataExport";
import useFirestoreStore from "../utilities/Firebase";
import AddTransactions from "../utilities/Transactions/Add";
import "./DebugContainer.css";
import { collection, doc, getDoc } from "firebase/firestore";
import { firestore } from "../utilities/FirebaseConfig";

interface ContainerProps {
	userID: string;
}

const DebugContainer: React.FC<ContainerProps> = ({ userID }) => {
	const { addDocument } = useFirestoreStore();
	const [jsonData, setJSONData] = useState<any>(null);
	const [data, setData] = useState<Category[]>([]);

	// ✅ Export event handler with categories
	const handleExportJSON = () => {
		if (userID && data.length > 0) {
			exportUserDataJSON(userID, data);
		} else {
			console.warn("No user or categories available, cannot export.");
		}
	};

	// ✅ Load and store categories from Firestore
	useEffect(() => {
		const fetchJSON = async () => {
			try {
				const settingsRef = collection(firestore, `users/${userID}/settings`);
				const categoriesRef = doc(settingsRef, "categories");
				const categoriesSnapshot = await getDoc(categoriesRef);

				if (categoriesSnapshot.exists()) {
					const categories = categoriesSnapshot.data().categories;

					// Parse and order categories
					const orderedCategories = parseJSON(categories).sort(
						(a: Category, b: Category) => {
							if (a.type !== b.type) {
								return a.type === "Income" ? -1 : 1;
							}
							return a.name.localeCompare(b.name);
						}
					);

					setJSONData(categories);
					setData(orderedCategories);
				}
			} catch (error) {
				console.error("Error fetching categories:", error);
			}
		};

		fetchJSON();

		const interval = setInterval(fetchJSON, 500);
		return () => clearInterval(interval); // ✅ Cleanup on unmount
	}, [userID]);

	return (
		<div className="container">
			{/* Export button */}
			<IonButton
				className="export-button"
				size="large"
				color="secondary"
				onClick={handleExportJSON}
			>
				Export JSON
			</IonButton>

			{/* Add new transactions */}
			<AddTransactions categories={data} userID={userID} />

			{/* Display the data validation */}
			<DataValidation categories={data} />

			{/* Display the categories */}
			<EntryCategories categories={data} json={jsonData} userID={userID} />
		</div>
	);
};

export default DebugContainer;
