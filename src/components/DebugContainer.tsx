import React, { useEffect, useState } from "react";
import { IonButton } from "@ionic/react";
import Transactions from "../utilities/Transactions";
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
            <Transactions categories={data} json={jsonData}/>

            {/* Display the data validation */}
            <DataValidation categories={data} />

            {/* Display the categories */}
            <EntryCategories categories={data} json={jsonData} />
		</div>
	);
};

export default DebugContainer;
