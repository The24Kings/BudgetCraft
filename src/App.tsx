import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, DocumentData, getDoc, getDocs, onSnapshot, orderBy, query, QuerySnapshot, where } from "firebase/firestore";
import { bulb, construct, home, settings, wallet } from "ionicons/icons";
import { IonApp, IonAvatar, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToolbar, setupIonicReact } from "@ionic/react";
import BudgetPage from "./pages/BudgetPage";
import GoalsPage from "./pages/GoalsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ToolsPage from "./pages/ToolsPage";
import { auth, firestore } from "./utilities/FirebaseConfig";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";
import { Category, parseJSON } from "./utilities/Categories";
import Goal from "./utilities/Goals/Goal";
import Transaction from "./utilities/Transactions/Transaction";


setupIonicReact();

const App: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);
    const [jsonData, setJSONData] = useState<any>(null);
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [goalData, setGoalData] = useState<Goal[]>([]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

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
	}, [user]);

	useEffect(() => {
        if (!user) return;

		const fetchGoals = async () => {
			let querySnapshot: QuerySnapshot<DocumentData>;

			try {
				querySnapshot = await getDocs(
					query(
						collection(firestore, `users/${user.uid}/budget`),
						orderBy("createdAt", "desc")
					)
				);
			} catch (error) {
				console.error("Failed to fetch transactions...");
			} finally {
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

		const unsubscribe = onSnapshot(collection(firestore, `users/${user.uid}/budget`), () => {
			console.log("Fetching goals...");
			fetchGoals();
		});

		return () => unsubscribe();
	}, [user]);

	// Get each transaction associated with the Goal
	useEffect(() => {
        if (!user) return;

		const fetchTransactions = async () => {
			const transactionsRef = collection(firestore, `users/${user.uid}/transactions`);

			for (const goal of goalData) {
				if (goal.transactionIDs.length == 0) {
					console.log(`No transactions for this goal ${goal.id}`);
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
	}, [user, goalData]);

	if (loading) return <div>Loading...</div>;

	return (
		<IonApp>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
						<Route exact path="/" render={() => <Redirect to="/home" />} />
						<Route
							path="/home"
							render={() => {
								return user ? <HomePage user={user} /> : <Redirect to="/login" />;
							}}
							exact
						/>
						<Route
							path="/budget"
							render={() => {
								return user ? <BudgetPage user={user} goalData={goalData} categoryData={categoryData} /> : <Redirect to="/login" />;
							}}
							exact
						/>
						<Route
							path="/goals"
							render={() => {
								return user ? (
									<GoalsPage
										user={user}
										goalData={goalData}
										categoryData={categoryData}
									/>
								) : (
									<Redirect to="/login" />
								);
							}}
							exact
						/>
						<Route
							path="/tools"
							render={() => {
								return user ? <ToolsPage /> : <Redirect to="/login" />;
							}}
							exact
						/>
						<Route
							path="/settings"
							render={() => {
								return user ? <SettingsPage /> : <Redirect to="/login" />;
							}}
							exact
						/>
						<Route
							path="/login"
							render={() => {
								return (
									<LoginPage
										setUser={setUser}
										setErrorMessage={(msg) => console.error(msg)}
									/>
								);
							}}
							exact
						/>
					</IonRouterOutlet>

					{user && (
						<IonTabBar slot="bottom">
							<IonTabButton tab="home" href="/home">
								<IonIcon icon={home} />
								<IonLabel>Home</IonLabel>
							</IonTabButton>
							<IonTabButton tab="budget" href="/budget">
								<IonIcon icon={wallet} />
								<IonLabel>Budget</IonLabel>
							</IonTabButton>
							<IonTabButton tab="goals" href="/goals">
								<IonIcon icon={bulb} />
								<IonLabel>Goals</IonLabel>
							</IonTabButton>
							<IonTabButton tab="tools" href="/tools">
								<IonIcon icon={construct} />
								<IonLabel>Tools</IonLabel>
							</IonTabButton>
							<IonTabButton tab="settings" href="/settings">
								<IonIcon icon={settings} />
								<IonLabel>Settings</IonLabel>
							</IonTabButton>
						</IonTabBar>
					)}
				</IonTabs>
			</IonReactRouter>
		</IonApp>
	);
};

export default App;