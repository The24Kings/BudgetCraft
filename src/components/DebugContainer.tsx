import React, { useEffect, useState } from "react";
import { IonButton } from "@ionic/react";
import AddTransactions from "../utilities/Transactions/Add";
import { Category, DataValidation, EntryCategories, parseJSON } from "../utilities/Categories";
import useFirestoreStore from "../utilities/Firebase";
import "./DebugContainer.css";
import jsonData from "../categories.json";

interface ContainerProps {
	name: string;
}

const DebugContainer: React.FC<ContainerProps> = () => {
	const { addDocument } = useFirestoreStore();
	let [data, setData] = useState<Category[]>([]);
	
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
		const interval = setInterval(() => {
			setData(parseJSON(jsonData));
		}, 100);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="container">
            <IonButton className="database-test" size="large" color="danger" onClick={handleButtonClick}>
                Send Data
            </IonButton>

            {/* Add new transactions */}
            <AddTransactions categories={data} userID="test-user"/> {/* TODO: Change to use the actual userID */}

            {/* Display the data validation */}
            <DataValidation categories={data} />

            {/* Display the categories */}
            <EntryCategories categories={data} json={jsonData} userID="test-user" />
		</div>
	);
};

export default DebugContainer;
