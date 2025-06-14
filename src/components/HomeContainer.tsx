import React, { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from "firebase/firestore";
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
	transactionData: Transaction[];
	month: number;
	year: number;
}

const HomeContainer: React.FC<ContainerProps> = ({ userID, transactionData, month, year }) => {
	const [categoryData, setCategoryData] = useState<Category[]>([]);

	// Filter states for the FilterButton component
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [filterType, setFilterType] = useState<string>("All");
	const [minAmount, setMinAmount] = useState<number | null>(null);
	const [maxAmount, setMaxAmount] = useState<number | null>(null);
	const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
	const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

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

		const matchedMonth = new Date(tx.date.seconds * 1000).getMonth() === month;
		const matchedYear = new Date(tx.date.seconds * 1000).getFullYear() === year;

		return (
			matchesSearch &&
			matchesType &&
			matchesMin &&
			matchesMax &&
			matchesDate &&
			matchedMonth &&
			matchedYear
		);
	});

	// Resets all filter fields to their default values
	const clearFilters = () => {
		setFilterType("All");
		setMinAmount(null);
		setMaxAmount(null);
		setStartDate("");
		setEndDate("");
	};

	useEffect(() => {
		clearFilters();
		console.log("Filters cleared");
	}, [month]);

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
					clearFilters={clearFilters}
				/>
			</div>

			{/* Display the transactions */}
			<DisplayTransactions
				categories={categoryData}
				transactions={filteredTransactions}
				userID={userID}
				hideDivider
			/>

			{/* Add Transactions */}
			<AddTransactions categories={categoryData} userID={userID} />
		</div>
	);
};

export default HomeContainer;
