import React, { useEffect, useState } from "react";
import { IonButton } from "@ionic/react";
import { Category, DataValidation, EntryCategories, parseJSON } from "../utilities/Categories";
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

	// Button click handler
	const handleButtonClick = async () => {
		console.log("Sending Data to Firebase...");

		await addDocument("testCollection", {
			testField: "Hello Firebase!",
			timestamp: new Date().toISOString()
		});
	};

	// Load the JSON data
	useEffect(() => {
		const fetchJSON = async () => {
			const settingsRef = collection(firestore, `users/${userID}/settings`);
			const categoriesRef = doc(settingsRef, "categories");
			const categoriesSnapshot = await getDoc(categoriesRef);

			// Order the categories by type in descending order
			const categories = categoriesSnapshot.data().categories;
			const orderedCategories = parseJSON(categories).sort((a: Category, b: Category) => {
				if (a.type !== b.type) {
					if (a.type === "Income") return -1;
					if (b.type === "Income") return 1;
				}

				if (a.name !== b.name) {
					return a.name.localeCompare(b.name);
				}
			});

			setJSONData(categories);
			setData(orderedCategories);
		};

		const interval = setInterval(() => {
			fetchJSON();
		}, 500);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="container">
			<IonButton
				className="database-test"
				size="large"
				color="danger"
				onClick={handleButtonClick}
			>
				Send Data
			</IonButton>
            
			{/* Add new transactions */}
			<AddTransactions categories={data} userID="test-user" />

			{/* Display the data validation */}
			<DataValidation categories={data} />
            
			{/* Display the categories */}
			<EntryCategories categories={data} json={jsonData} userID="test-user" />
		</div>
	);
};

export default DebugContainer;
