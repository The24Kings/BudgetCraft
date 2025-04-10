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
import { IonButton, IonLabel } from "@ionic/react";
import { Category, parseJSON } from "../utilities/Categories";
import FilterButton from "../utilities/FilterButton";
import { firestore } from "../utilities/FirebaseConfig";
import IncomePieChart from "../utilities/IncomePieChart";
import AddTransactions from "../utilities/Transactions/Add";
import DisplayTransactions from "../utilities/Transactions/Display";
import Transaction from "../utilities/Transactions/Transaction";

interface ContainerProps {
	userID: string;
	onTransactionsChange?: (transactions: Transaction[]) => void;
}

const HomeContainer: React.FC<ContainerProps> = ({ userID, onTransactionsChange }) => {
	const [jsonData, setJSONData] = useState<any>(null);
	const [categoryData, setCategoryData] = useState<Category[]>([]);
	const [transactionData, setTransactionData] = useState<Transaction[]>([]);
	const [totalLoaded, setTotalLoaded] = useState(10);
	const [actualTotalLoaded, setActualTotalLoaded] = useState(10);

	// Filter states for the FilterButton component
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [filterType, setFilterType] = useState<string>("All");
	const [minAmount, setMinAmount] = useState<number | null>(null);
	const [maxAmount, setMaxAmount] = useState<number | null>(null);
	const [filterDate, setFilterDate] = useState<string>("");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	// Load the transactions from Firebase
	//TODO: Change to only load more when the button is clicked, fetch a slice of the data from previous point to new point, add to a list of transactions
	useEffect(() => {
		const fetchTransactions = async () => {
			try {
				const querySnapshot = await getDocs(
					query(
						collection(firestore, `users/${userID}/transactions`),
						orderBy("date", "desc"),
						limit(totalLoaded)
					)
				);

				setActualTotalLoaded(querySnapshot.docs.length);

				// Parse the documents into Transaction objects
				const transactionData = querySnapshot.docs.map((doc) => {
					const data = doc.data();
					return new Transaction(
						doc.id,
						data.type,
						data.category,
						data.subCategoryID,
						data.title,
						data.date,
						data.description,
						data.amount
					);
				});

				setTransactionData(transactionData);
				if (onTransactionsChange) {
					onTransactionsChange(transactionData);
				}
			} catch (error) {
				console.error("Failed to fetch transactions:", error);
			}
		};

		const interval = setInterval(fetchTransactions, 1000);
		return () => clearInterval(interval);
	}, [totalLoaded, userID, onTransactionsChange]);

	// Load categories
	useEffect(() => {
		const fetchJSON = async () => {
			try {
				const categoriesRef = doc(firestore, `users/${userID}/settings/categories`);
				const categoriesSnapshot = await getDoc(categoriesRef);
				if (categoriesSnapshot.exists()) {
					const categories = parseJSON(categoriesSnapshot.data().categories).sort(
						(a: Category, b: Category) => {
							if (a.type !== b.type) return a.type === "Income" ? -1 : 1;
							return a.name.localeCompare(b.name);
						}
					);
					setCategoryData(categories);
				}
			} catch (error) {
				console.error("Failed to fetch categories:", error);
			}
		};

		const interval = setInterval(fetchJSON, 500);
		return () => clearInterval(interval);
	}, [userID]);

	// Filter transactions before rendering
	const filteredTransactions = transactionData.filter((tx) => {
		const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesType = filterType === "All" || tx.type === filterType;
		const matchesMin = minAmount === null || tx.amount >= minAmount;
		const matchesMax = maxAmount === null || tx.amount <= maxAmount;
		const txDateStr = new Date(tx.date.seconds * 1000).toISOString().split("T")[0];
		const matchesDate =
			(!startDate || txDateStr >= startDate) && (!endDate || txDateStr <= endDate);

		return matchesSearch && matchesType && matchesMin && matchesMax && matchesDate;
	});

	return (
		<div className="container">
			{/* Income Pie Chart */}
			<IncomePieChart transactions={filteredTransactions} />

			{/* Search Bar + Filter */}
			<div className="sticky-search">
				<FilterButton
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
					filterType={filterType}
					setFilterType={setFilterType}
					minAmount={minAmount}
					setMinAmount={setMinAmount}
					maxAmount={maxAmount}
					setMaxAmount={setMaxAmount}
					startDate={startDate}
					setStartDate={setStartDate}
					endDate={endDate}
					setEndDate={setEndDate}
					filterDate={filterDate}
					setFilterDate={setFilterDate}
				/>
			</div>

			{/* Display the transactions */}
			<DisplayTransactions categories={categoryData} transactions={filteredTransactions} />

			{/* Add Transactions */}
			<AddTransactions categories={categoryData} userID={userID} />

			{/* Load More Button */}
			<IonButton
				className="action-button"
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

export default HomeContainer;
