import React, { useEffect, useState } from "react";
import { IonButton } from "@ionic/react";

import { Category, AddCategory, DataValidation, EntryCategories, parseJSON } from "../utilities/Categories";
import { testFirebaseConnection } from "../utilities/Firebase";

import "./Container.css";
import jsonData from "../categories.json";

interface ContainerProps {
	name: string;
}

const DebugContainer: React.FC<ContainerProps> = ({ name }) => {
	var [data, setData] = useState<Category[]>([]);

	// Button click handler
	const handleButtonClick = () => {
		console.log("Sending Data to Firebase...");
		testFirebaseConnection();
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
			{/* Button with a click handler */}
			<IonButton className="database-test" size="large" color="danger" onClick={handleButtonClick}>
				Send Data
			</IonButton>

			<AddCategory categories={data} json={jsonData} />

			{/* Display the data validation */}
			<DataValidation categories={data} />

			{/* Display the categories */}
			<EntryCategories categories={data} />
		</div>
	);
};

export default DebugContainer;
