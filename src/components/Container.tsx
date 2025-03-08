import React, { useEffect, useState } from "react";
import { collection, getDocs, query, limit, QuerySnapshot, DocumentData, orderBy } from "firebase/firestore";
import jsonData from "../categories.json";
import { Category, parseJSON } from "../utilities/Categories";
import { firestore } from "../utilities/FirebaseConfig";
import DisplayTransactions from "../utilities/Transactions/Display";
import Transaction from "../utilities/Transactions/Transaction";
import "./Container.css";
import AddTransactions from "../utilities/Transactions/Add";
import { IonButton, IonLabel } from "@ionic/react";

interface ContainerProps {
	userID: string;
}

const Container: React.FC<ContainerProps> = ({ userID }) => {
	const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [transactionData, setTransactionData] = useState<Transaction[]>([]);
    const [totalLoaded, setTotalLoaded] = useState(10);


	// Load the transactions from Firebase
	useEffect(() => {
		const fetchTransactions = async () => {
			let querySnapshot: QuerySnapshot<DocumentData>;

			try {
                console.log("Fetching transactions...");

                querySnapshot = await getDocs(
                    query(collection(firestore, `users/${userID}/transactions`), orderBy("date", "desc"), limit(totalLoaded))
                );
			} catch (error) {
				console.error("Failed to fetch transactions...");
			} finally {
                console.log("Transactions fetched successfully:", querySnapshot.docs.length);

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
            }
		};

		const interval = setInterval(() => {
			fetchTransactions();
		}, 1000);

		return () => clearInterval(interval);
    }, [totalLoaded]);

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

            {/* Load More */}
            <IonButton
                onClick={() => {
                    setTotalLoaded(totalLoaded + 10);

                    console.log("Loading more transactions...", totalLoaded);
                }}
            >
                <IonLabel>Load More</IonLabel>
            </IonButton>
		</div>
	);
};

export default Container;
