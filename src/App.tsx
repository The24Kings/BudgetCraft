import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import { onAuthStateChanged } from "firebase/auth";
import {
	collection,
	doc,
	getDocs,
	onSnapshot,
	orderBy,
	query,
	QuerySnapshot,
	where
} from "firebase/firestore";
import { bulb, construct, home, settings, wallet } from "ionicons/icons";
import {
	IonApp,
	IonIcon,
	IonLabel,
	IonRouterOutlet,
	IonTabBar,
	IonTabButton,
	IonTabs,
	setupIonicReact
} from "@ionic/react";
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
import "./theme/variables.css";
import categoriesJson from "./categories.json";
import { Category, parseJSON } from "./utilities/Categories";
import Goal from "./utilities/Goals/Goal";
import AboutPage from "./utilities/Settings/AboutPage";
import AccountPage from "./utilities/Settings/AccountPage";
import EditCategoriesPage from "./utilities/Settings/EditCategoriesPage";
import ExportUserDataPage from "./utilities/Settings/ExportUserDataPage";
import HelpTopicsPage from "./utilities/Settings/HelpTopicsPage";
import NotificationSettingsPage from "./utilities/Settings/NotificationSettingsPage";
import Transaction from "./utilities/Transactions/Transaction";

setupIonicReact();

const App: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [goalData, setGoalData] = useState<Goal[]>([]);
	const [transactionData, setTransactionData] = useState<Transaction[]>([]);
	const [categoryData, setCategoryData] = useState<Category[]>([]);
	const [userCategoriesJson, setUserCategoriesJson] = useState<any>(null);

	useEffect(() => {
		document.body.classList.remove("dark");

		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	useEffect(() => {
		// Load static categories JSON initially
		const parsedCategories = parseJSON(categoriesJson);
		setCategoryData(parsedCategories);
		setUserCategoriesJson(categoriesJson);
	}, []);

	useEffect(() => {
		if (!user || !user.uid) return;

		// Listen to user categories in Firestore settings
		const settingsDocRef = doc(firestore, `users/${user.uid}/settings/categories`);

		const unsubscribe = onSnapshot(settingsDocRef, (docSnap) => {
			if (docSnap.exists()) {
				const data = docSnap.data();
				if (data && data.categories) {
					try {
						const userCategories = parseJSON(data.categories);
						setCategoryData(userCategories);
						setUserCategoriesJson(data.categories);
					} catch (error) {
						console.error("Failed to parse user categories from Firestore:", error);
					}
				}
			} else {
				// If no user categories in Firestore, fallback to static categories
				const parsedCategories = parseJSON(categoriesJson);
				setCategoryData(parsedCategories);
				setUserCategoriesJson(categoriesJson);
			}
		});

		return () => unsubscribe();
	}, [user]);

	useEffect(() => {
		if (!user || !user.uid) return;

		const fetchGoals = async () => {
			let querySnapshot: QuerySnapshot;

			try {
				querySnapshot = await getDocs(
					query(
						collection(firestore, `users/${user.uid}/budget`),
						orderBy("createdAt", "desc")
					)
				);
			} catch (error) {
				console.error("Failed to fetch goals:", error);
				return;
			}

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
					data.transactionIDs,
					data.withdrawalIDs,
					[]
				);
			});

			console.log("Fetched goals:", goals);

			setGoalData(goals);
		};

		const unsubscribe = onSnapshot(collection(firestore, `users/${user.uid}/budget`), () => {
			fetchGoals();
		});

		return () => unsubscribe();
	}, [user]);

	useEffect(() => {
		if (!user || !user.uid) return;

		const fetchTransactions = async () => {
			const transactionsRef = collection(firestore, `users/${user.uid}/transactions`);

			for (const goal of goalData) {
				if (goal.transactionIDs.length === 0) {
					console.log("No transactions for goal:", goal.id);
					continue;
				}

				const transactionsSnapshot = await getDocs(
					query(
						transactionsRef,
						orderBy("date", "desc"),
						where("__name__", "in", goal.transactionIDs)
					)
				);

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

				if (goal.withdrawalIDs.length === 0) {
					console.log("No withdrawals for goal:", goal.id);
					continue;
				}

				const withdrawalsSnapshot = await getDocs(
					query(
						transactionsRef,
						orderBy("date", "desc"),
						where("__name__", "in", goal.withdrawalIDs)
					)
				);

				const withdrawals = withdrawalsSnapshot.docs.map((doc) => {
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

				goal.withdrawals = withdrawals;
			}
		};

		fetchTransactions();
	}, [user, goalData]);

	useEffect(() => {
		if (!user || !user.uid) return;

		const transactionsRef = collection(firestore, `users/${user.uid}/transactions`);
		const q = query(transactionsRef, orderBy("date", "desc"));

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const transactions = querySnapshot.docs.map((doc) => {
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
				setTransactionData(transactions);
			},
			(error) => {
				console.error("Failed to fetch transactions:", error);
			}
		);

		return () => unsubscribe();
	}, [user]);

	if (loading) return <div>Loading...</div>;

	return (
		<IonApp style={{flexDirection: "column-reverse"}}>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
						<Route exact path="/" render={() => <Redirect to="/home" />} />
						<Route
							path="/home"
							render={() =>
								user ? (
									<HomePage
										key={user.uid}
										user={user}
										transactionData={transactionData}
									/>
								) : (
									<Redirect to="/login" />
								)
							}
							exact
						/>
						<Route
							path="/budget"
							render={() =>
								user ? (
									<BudgetPage
										user={user}
										goalData={goalData}
										categoryData={categoryData}
										transactionData={transactionData}
									/>
								) : (
									<Redirect to="/login" />
								)
							}
							exact
						/>
						<Route
							path="/goals"
							render={() =>
								user ? (
									<GoalsPage
										user={user}
										goalData={goalData}
										categoryData={categoryData}
										transactionData={transactionData}
									/>
								) : (
									<Redirect to="/login" />
								)
							}
							exact
						/>
						<Route
							path="/tools"
							render={() => (user ? <ToolsPage /> : <Redirect to="/login" />)}
							exact
						/>
						<Route
							path="/settings"
							render={() =>
								user ? (
									<SettingsPage
										user={user}
										jsonData={userCategoriesJson}
										categoryData={categoryData}
									/>
								) : (
									<Redirect to="/login" />
								)
							}
							exact
						/>
						<Route
							path="/settings/export"
							render={() =>
								user ? (
									<ExportUserDataPage user={user} categoryData={categoryData} />
								) : (
									<Redirect to="/login" />
								)
							}
						/>
						<Route
							path="/settings/account"
							render={() => (user ? <AccountPage /> : <Redirect to="/login" />)}
						/>
						<Route
							path="/settings/notifications"
							render={() =>
								user ? <NotificationSettingsPage /> : <Redirect to="/login" />
							}
						/>
						<Route
							path="/settings/edit-categories"
							render={() =>
								user ? (
									<EditCategoriesPage
										user={user}
										jsonData={userCategoriesJson}
										categoryData={categoryData}
									/>
								) : (
									<Redirect to="/login" />
								)
							}
						/>
						<Route
							path="/settings/help"
							render={() => (user ? <HelpTopicsPage /> : <Redirect to="/login" />)}
						/>
						<Route
							path="/settings/about"
							render={() => (user ? <AboutPage /> : <Redirect to="/login" />)}
						/>
						<Route
							path="/login"
							render={() => (
								<LoginPage
									setUser={setUser}
									setErrorMessage={(msg) => console.error(msg)}
								/>
							)}
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
