import React, { useEffect } from "react";
import { collection, doc, DocumentData, getDoc, getDocs, limit, onSnapshot, orderBy, query, QuerySnapshot, where } from "firebase/firestore";
import { IonContent, IonHeader, IonPage, IonToolbar } from "@ionic/react";
import { Category, parseJSON } from "../utilities/Categories";
import { firestore } from "../utilities/FirebaseConfig";
import Goal from "../utilities/Goals/Goal";
import "../components/HomeContainer.css";
import AddGoal from "../utilities/Goals/Add";
import DisplayGoals from "../utilities/Goals/Display";
import MonthPicker from "../utilities/MonthPicker";
import Transaction from "../utilities/Transactions/Transaction";


const GoalsPage: React.FC<{ user: any }> = ({ user }) => {
	const [jsonData, setJSONData] = React.useState<any>(null);
	const [categoryData, setCategoryData] = React.useState<any[]>([]);
	const [goalData, setGoalData] = React.useState<any[]>([]);
	const [totalLoaded, setTotalLoaded] = React.useState(10);
	const [actualTotalLoaded, setActualTotalLoaded] = React.useState(10);

    const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];

	// Load the JSON data
	useEffect(() => {
		if (!user) return;
		const fetchJSON = async () => {
			const settingsRef = collection(firestore, `users/${user.uid}/settings`);
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

	useEffect(() => {
		const fetchGoals = async () => {
			let querySnapshot: QuerySnapshot<DocumentData>;

			try {
				querySnapshot = await getDocs(
					query(
						collection(firestore, `users/${user.uid}/budget`),
						orderBy("createdAt", "desc"),
						limit(totalLoaded)
					)
				);
			} catch (error) {
				console.error("Failed to fetch transactions...");
			} finally {
				setActualTotalLoaded(querySnapshot.docs.length);

				// Parse the documents into Transaction objects
				const goals = querySnapshot.docs.map((doc) => {
					const data = doc.data();

					return new Goal(
						doc.id,
						data.type,
						data.category,
						data.subCategoryID,
						data.goal,
                        data.budgetItem,
						data.recurring,
						data.reminder,
						data.createdAt,
						data.targetDate,
						data.reminderDate,
						data.description,
						data.transactionIDs, // Later when displaying the transactions, we will need to fetch them from the database: https://stackoverflow.com/questions/47876754/query-firestore-database-for-document-id
						[] // Transactions related to this goal
					);
				});

				setGoalData(goals);
			}
		};

        fetchGoals();

		const unsubscribe = onSnapshot(collection(firestore, `users/${user.uid}/budget`), () => {
            fetchGoals();
        });

        return () => unsubscribe();
	}, [totalLoaded, actualTotalLoaded]);

	// Get each transaction associated with the Goal
	useEffect(() => {
		const fetchTransactions = async () => {
			const transactionsRef = collection(firestore, `users/${user.uid}/transactions`);

			for (const goal of goalData) {
				if (goal.transactionIDs.length == 0) {
					continue;
				}

				const transactionsSnapshot = await getDocs(
					query(
						transactionsRef,
						orderBy("date", "desc"),
						where("__name__", "in", goal.transactionIDs)
					)
				);

				// Parse the documents into Transaction objects
				const transactions = transactionsSnapshot.docs.map((doc) => {
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

				goal.transactions = transactions;
			}
		};

        fetchTransactions();
	}, [goalData]);

	return (
		<IonPage id="main-content">
			<IonContent>
				<div className="container">
					<DisplayGoals
						goals={goalData}
						categories={categoryData}
                        onlyGoals
					/>
					<AddGoal categories={categoryData} userID={user.uid} onlyGoals />
				</div>
			</IonContent>
		</IonPage>
	);
};

export default GoalsPage;