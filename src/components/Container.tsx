import React, { useEffect, useState } from "react";
import {
	collection,
	doc,
	DocumentData,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	QuerySnapshot
} from "firebase/firestore";
import { Category, parseJSON } from "../utilities/Categories";
import { firestore } from "../utilities/FirebaseConfig";
import DisplayTransactions from "../utilities/Transactions/Display";
import Transaction from "../utilities/Transactions/Transaction";
import "./Container.css";
import { IonButton, IonLabel } from "@ionic/react";
import AddTransactions from "../utilities/Transactions/Add";

interface ContainerProps {
	userID: string;
}

const Container: React.FC<ContainerProps> = ({ userID }) => {
	const intialLoad = 10;

	const [jsonData, setJSONData] = useState<any>(null);
	const [categoryData, setCategoryData] = useState<Category[]>([]);
	const [transactionData, setTransactionData] = useState<Transaction[]>([]);
	const [totalLoaded, setTotalLoaded] = useState(intialLoad);
	const [actualTotalLoaded, setActualTotalLoaded] = useState(intialLoad);

	// Load the transactions from Firebase
	//TODO: Change to only load more when the button is clicked, fetch a slice of the data from previous point to new point, add to a list of transactions
	useEffect(() => {
		const fetchTransactions = async () => {
			let querySnapshot: QuerySnapshot<DocumentData>;

			try {
				querySnapshot = await getDocs(
					query(
						collection(firestore, `users/${userID}/transactions`),
						orderBy("date", "desc"),
						limit(totalLoaded)
					)
				);
			} catch (error) {
				console.error("Failed to fetch transactions...");
			} finally {
				setActualTotalLoaded(querySnapshot.docs.length);

				// Parse the documents into Transaction objects
				const transactionData = querySnapshot.docs.map((doc) => {
					const data = doc.data();

					return new Transaction(
						doc.id,
						data.type,
						data.category,
						data.subCategoryIndex,
						data.title,
						data.date,
						data.description,
						data.amount
					);
				});

				setTransactionData(transactionData);
			}
		};

		const interval = setInterval(() => {
			fetchTransactions();
		}, 1000);

		return () => clearInterval(interval);
	}, [totalLoaded, actualTotalLoaded]);

	// Load the JSON data
	useEffect(() => {
		const fetchJSON = async () => {
			const settingsRef = collection(firestore, `users/${userID}/settings`);
			const categoriesRef = doc(settingsRef, "categories");
			const categoriesSnapshot = await getDoc(categoriesRef);

			// Order the categories by type in descending order
			const categories = categoriesSnapshot.data().categories;
			const orderedCategories = parseJSON(categories).sort((a: Category, b: Category) => {
				if (a.Type !== b.Type) {
					if (a.Type === "Income") return -1;
					if (b.Type === "Income") return 1;
				}

				if (a.name !== b.name) {
					return a.name.localeCompare(b.name);
				}
			});

			setJSONData(categories);
			setCategoryData(orderedCategories);
		};

		const interval = setInterval(() => {
			fetchJSON();
		}, 500);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="container">
			{/* Display the transactions */}
			<DisplayTransactions transactions={transactionData} categories={categoryData} />

			{/* Add Transactions */}
			<AddTransactions categories={categoryData} userID={userID} />

			{/* Load More */}
			<IonButton
				onClick={() => {
					// If we actually loaded all possible transactions, then we can load more
					if (actualTotalLoaded === totalLoaded) {
						setTotalLoaded(totalLoaded + 10);
					}
				}}
			>
				<IonLabel>Load More</IonLabel>
			</IonButton>
		</div>
	);
};

export default Container;
