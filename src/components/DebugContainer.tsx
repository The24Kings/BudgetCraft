import React from "react";
import { IonButton } from "@ionic/react";

import { DataValidation, EntryCategories, parseJSON } from "../utilities/Categories";
import { testFirebaseConnection } from "../utilities/Firebase";

import "./Container.css";
import jsonData from "../categories.json";

interface ContainerProps {
	name: string;
}

const DebugContainer: React.FC<ContainerProps> = ({ name }) => {
	// Button click handler
	const handleButtonClick = () => {
		console.log("Sending Data to Firebase...");
		testFirebaseConnection();
	};

	// Parse the categories from the JSON file
	var data = parseJSON(jsonData); // Mutable JSON data

	return (
		<div className="container">
			{/* Button with a click handler */}
			<IonButton className="database-test" size="large" color="danger" onClick={handleButtonClick}>
				Send Data
			</IonButton>

			{/* Display the data validation */}
			<DataValidation categories={data} />

			{/* Display the categories */}
			<EntryCategories categories={data} />
		</div>
	);
};

export default DebugContainer;
