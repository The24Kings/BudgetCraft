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
import { filter } from "ionicons/icons";
import {
	IonButton,
	IonIcon,
	IonInput,
	IonLabel,
	IonModal,
	IonSelect,
	IonSelectOption
} from "@ionic/react";
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
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [filterType, setFilterType] = useState<string>("All");
	const [minAmount, setMinAmount] = useState<number | null>(null);
	const [maxAmount, setMaxAmount] = useState<number | null>(null);
	const [filterDate, setFilterDate] = useState<string>("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);

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
						data.subCategoryID,
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
				if (a.type !== b.type) {
					if (a.type === "Income") return -1;
					if (b.type === "Income") return 1;
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

	// Filter transactions before rendering
	const filteredTransactions = transactionData.filter((tx) => {
		const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesType = filterType === "All" || tx.type === filterType;
		const matchesMin = minAmount === null || tx.amount >= minAmount;
		const matchesMax = maxAmount === null || tx.amount <= maxAmount;
		const matchesDate =
			!filterDate ||
			new Date(tx.date.seconds * 1000).toISOString().split("T")[0] === filterDate;

		return matchesSearch && matchesType && matchesMin && matchesMax && matchesDate;
	});

	return (
		<div className="container">
			{/* Search Bar with Filter Button */}
			<div className="search-bar">
				<IonInput
					className="search-input"
					placeholder="Search transactions..."
					value={searchTerm}
					onIonInput={(e) => setSearchTerm(e.detail.value ?? "")}
					clearInput
				/>
				<IonButton fill="clear" onClick={() => setIsFilterOpen(true)}>
					<IonIcon icon={filter} />
				</IonButton>
			</div>

			{/* Filter Modal */}
			<IonModal isOpen={isFilterOpen} onDidDismiss={() => setIsFilterOpen(false)}>
				<div className="filter-modal">
					<h2>Filters</h2>

					<IonSelect
						value={filterType}
						placeholder="Type"
						onIonChange={(e) => setFilterType(e.detail.value)}
					>
						<IonSelectOption value="All">All</IonSelectOption>
						<IonSelectOption value="Income">Income</IonSelectOption>
						<IonSelectOption value="Expense">Expense</IonSelectOption>
					</IonSelect>

					<IonInput
						type="number"
						placeholder="Min Amount"
						value={minAmount ?? ""}
						onIonChange={(e) =>
							setMinAmount(e.detail.value ? parseFloat(e.detail.value) : null)
						}
					/>

					<IonInput
						type="number"
						placeholder="Max Amount"
						value={maxAmount ?? ""}
						onIonChange={(e) =>
							setMaxAmount(e.detail.value ? parseFloat(e.detail.value) : null)
						}
					/>

					<IonInput
						type="date"
						placeholder="Filter by Date"
						value={filterDate}
						onIonChange={(e) => setFilterDate(e.detail.value!)}
					/>

					<IonButton onClick={() => setIsFilterOpen(false)}>Close</IonButton>
				</div>
			</IonModal>

			{/* Display the transactions */}
			<DisplayTransactions categories={categoryData} transactions={filteredTransactions} />

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
