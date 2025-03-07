import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import jsonData from "../categories.json";
import { Category, parseJSON } from "../utilities/Categories";
import { firestore } from "../utilities/FirebaseConfig";
import DisplayTransactions from "../utilities/Transactions/Display";
import Transaction from "../utilities/Transactions/Transaction";
import "./Container.css";
import AddTransactions from "../utilities/Transactions/Add";

interface ContainerProps {
	userID: string;
}

const Container: React.FC<ContainerProps> = ({ userID }) => {
	let [categoryData, setCategoryData] = useState<Category[]>([]);
	let [transactionData, setTransactionData] = useState<Transaction[]>([]);

	// Load the transactions from Firebase
	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				//await getDocuments(`users/${userID}/transactions`);
				const querySnapshot = await getDocs(
					collection(firestore, `users/${userID}/transactions`)
				);

				console.log("Fetching transactions...");

				// Parse the documents into Transaction objects
				const transactionData = querySnapshot.docs.map((doc) => {
					const data = doc.data();

					return new Transaction(
						doc.id,
						data.type,
						data.category,
						data.subCategory,
						data.title,
						data.date,
						data.description,
						data.amount
					);
				});

				setTransactionData(transactionData);
			} catch (error) {
				console.error("Failed to fetch transactions...");
			}
		};

		const interval = setInterval(() => {
			fetchTransactions();
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Load the JSON data
	useEffect(() => {
		const interval = setInterval(() => {
			setCategoryData(parseJSON(jsonData));
		}, 100);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="container">
			{/* Display the transactions */}
			<DisplayTransactions transactions={transactionData} />

			{/* Add Transactions */}
			<AddTransactions categories={categoryData} userID={userID} />
		</div>
	);
};

export default Container;
