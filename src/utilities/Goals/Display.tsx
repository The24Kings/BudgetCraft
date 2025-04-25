import React, { useEffect, useRef, useState } from "react";
import { arrayUnion, collection, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { add } from "ionicons/icons";
import {
	IonButton,
	IonCol,
	IonContent,
	IonFab,
	IonFabButton,
	IonFooter,
	IonGrid,
	IonHeader,
	IonIcon,
	IonItem,
	IonItemDivider,
	IonItemGroup,
	IonLabel,
	IonModal,
	IonRow,
	IonTextarea,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { Category } from "../Categories";
import { firestore } from "../FirebaseConfig";
import Transaction from "../Transactions/Transaction";
import Goal from "./Goal";

interface DisplayGoalsProps {
	user: any;
	goals: Goal[];
	categories: Category[];
	transactions: Transaction[];
	selectedMonth?: number;
	onlyGoals?: boolean;
}

const DisplayGoals: React.FC<DisplayGoalsProps> = ({
	user,
	goals,
	categories,
	transactions,
	selectedMonth = 0,
	onlyGoals = false
}) => {
	const modalDetailsRef = useRef<HTMLIonModalElement>(null);
	const modalAddRef = useRef<HTMLIonModalElement>(null);

	const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
	const [description, setDescription] = useState<string>("");

	// Focus management for accessibility
	useEffect(() => {
		const modalDetails = modalDetailsRef.current;
		const modalAdd = modalAddRef.current;

		if (!modalDetails || !modalAdd) return;

		const handleModalWillPresent = () => {
			const routerOutlet = document.querySelector("ion-router-outlet");
			if (routerOutlet) {
				routerOutlet.setAttribute("inert", "true");
			}
		};

		const handleModalDidDismiss = () => {
			const routerOutlet = document.querySelector("ion-router-outlet");
			if (routerOutlet) {
				routerOutlet.removeAttribute("inert");
			}
		};

		modalDetails.addEventListener("ionModalWillPresent", handleModalWillPresent);
		modalDetails.addEventListener("ionModalDidDismiss", handleModalDidDismiss);
		modalAdd.addEventListener("ionModalWillPresent", handleModalWillPresent);
		modalAdd.addEventListener("ionModalDidDismiss", handleModalDidDismiss);

		return () => {
			modalDetails.removeEventListener("ionModalWillPresent", handleModalWillPresent);
			modalDetails.removeEventListener("ionModalDidDismiss", handleModalDidDismiss);
			modalAdd.removeEventListener("ionModalWillPresent", handleModalWillPresent);
			modalAdd.removeEventListener("ionModalDidDismiss", handleModalDidDismiss);
		};
	}, []);

	// Update description state when modal opens
	useEffect(() => {
		if (!currentGoalId) {
			setDescription("");
			return;
		}
		const goal = goals.find((g) => g.id === currentGoalId);
		if (goal) {
			setDescription(goal.description || "");
		}
	}, [currentGoalId, goals]);

	// Filter goals by month and recurring
	const filteredGoals = goals.filter((goal) => {
		const createdAtMonth = goal.createdAt.toDate();
		return (
			(!onlyGoals && selectedMonth === createdAtMonth.getMonth() && goal.budgetItem) ||
			(!onlyGoals && goal.recurring) ||
			(onlyGoals && !goal.budgetItem)
		);
	});

	const removeGoal = async (goalID: string) => {
		const isConfirmed = window.confirm(
			`Are you sure you want to delete the custom subcategory "${goalID}"?`
		);

		if (!isConfirmed) return;

		try {
			const goalRef = collection(firestore, `users/${user.uid}/budget`);
			const goalDoc = doc(goalRef, goalID);

			await deleteDoc(goalDoc);
			console.log("Goal deleted successfully");
		} catch (error) {
			console.error("Error deleting goal:", error);
		}
	};

	const subCategory = (category: String, id: string) => {
		if (!categories.length) {
			return;
		}

		const subCategory = categories
			.find((cat) => cat.name === category)
			.Subcategories.find((subCat) => subCat.id === id);

		return subCategory ? subCategory.name : "Uncategorized";
	};

	const calculateSaved = (transactions: Transaction[], withdrawals: Transaction[]): number => {
		return (
			transactions.reduce((total, transaction) => total + transaction.amount, 0) -
			withdrawals.reduce((total, transaction) => total + transaction.amount, 0)
		);
	};

	const onDetailsDismiss = () => {
		modalDetailsRef.current?.attributes.removeNamedItem("goalId");
		modalDetailsRef.current?.dismiss(null, "cancel");
		setCurrentGoalId(null);
		setDescription("");
	};

	const addTransaction = async (transaction: Transaction) => {
		const goalId = modalDetailsRef.current?.getAttribute("goalId") || "";
		const goalRef = doc(firestore, `users/${user.uid}/budget/${goalId}`);
		const goalDocSnapshot = await getDoc(goalRef);

		if (goalDocSnapshot.exists()) {
			const goalData = goalDocSnapshot.data();

			if (goalData.withdrawalIDs && goalData.withdrawalIDs.includes(transaction.id)) {
				alert("This transaction is already added to the goal.");
				return;
			}
		}

		await updateDoc(goalRef, {
			withdrawalIDs: arrayUnion(transaction.id)
		});

		modalAddRef.current?.dismiss(null, "cancel");
	};

	const filteredTransactions = (transactions: Transaction[]) => {
		return transactions.filter(
			(transaction) => transaction.date.toDate().getMonth() === selectedMonth
		);
	};

	const filteredWithdrawals = (withdrawals: Transaction[]) => {
		return withdrawals.filter(
			(withdrawal) => withdrawal.date.toDate().getMonth() === selectedMonth
		);
	};

	const saveDescription = async () => {
		if (!currentGoalId) return;
		const goalRef = doc(firestore, `users/${user.uid}/budget/${currentGoalId}`);
		try {
			await updateDoc(goalRef, { description });
			console.log("Description updated successfully");
		} catch (error) {
			console.error("Failed to update description:", error);
		}
	};

	return (
		<React.Fragment>
			<div className="goals">
				<div hidden={!(goals.length === 0)}>
					<h1>Loading...</h1>
				</div>

				<IonItemGroup>
					<IonItemDivider>
						<IonLabel>
							<IonGrid>
								<IonRow>
									<IonCol>Description</IonCol>
									<IonCol>Target</IonCol>
									<IonCol>Goal</IonCol>
									<IonCol>Saved</IonCol>
								</IonRow>
							</IonGrid>
						</IonLabel>
					</IonItemDivider>

					{filteredGoals.map((goal) => (
						<IonItem
							key={goal.id}
							button
							onClick={() => {
								modalDetailsRef.current?.present();
								modalDetailsRef.current?.setAttribute("goalId", goal.id);
								setCurrentGoalId(goal.id);
							}}
						>
							<IonLabel>
								<IonGrid>
									<IonRow>
										<IonCol>
											{goal.description ||
												subCategory(goal.category, goal.subCategoryID)}
										</IonCol>
										<IonCol>
											{goal.targetDate.toDate().toLocaleDateString()}
										</IonCol>
										<IonCol>${goal.goal}</IonCol>
										<IonCol>
											{calculateSaved(
												filteredTransactions(goal.transactions),
												filteredWithdrawals(goal.withdrawals)
											)}
										</IonCol>
									</IonRow>
								</IonGrid>
							</IonLabel>
						</IonItem>
					))}
				</IonItemGroup>
			</div>

			<IonModal ref={modalDetailsRef} onDidDismiss={onDetailsDismiss}>
				{filteredGoals.map(
					(goal) =>
						currentGoalId === goal.id && (
							<React.Fragment key={goal.id}>
								<IonHeader>
									<IonToolbar>
										<IonTitle className="ion-text-center">
											{subCategory(goal.category, goal.subCategoryID)}
										</IonTitle>
									</IonToolbar>
								</IonHeader>
								<IonContent className="ion-padding-horizontal">
									<div key={goal.id}>
										<IonFab vertical="bottom" horizontal="end" slot="fixed">
											<IonFabButton
												color="secondary"
												size="small"
												onClick={() => {
													modalAddRef.current?.present();
												}}
											>
												<IonIcon icon={add} />
											</IonFabButton>
										</IonFab>
										<IonTextarea
											className="custom ion-margin-vertical"
											shape="round"
											value={description}
											onIonInput={(e) => setDescription(e.detail.value!)}
										/>
										<div>
											<IonLabel>Transactions</IonLabel>
											<IonItemGroup
												className="ion-margin-vertical"
												style={{
													maxHeight: "190px",
													overflowY: "auto"
												}}
											>
												{filteredTransactions(goal.transactions).length >
												0 ? (
													filteredTransactions(goal.transactions).map(
														(transaction, index) => (
															<IonItem
																key={index}
																style={{ minWidth: "75%" }}
																color="light"
															>
																<IonLabel>
																	<p>
																		<strong>Title:</strong>{" "}
																		{transaction.title ||
																			"No title"}
																	</p>
																	<p>
																		<strong>Date:</strong>{" "}
																		{transaction.date
																			.toDate()
																			.toLocaleDateString()}
																	</p>
																	<p>
																		<strong>Amount:</strong> $
																		{transaction.amount}
																	</p>
																	<p
																		style={{
																			fontSize: "0.75em",
																			textAlign: "center"
																		}}
																	>
																		{transaction.id}
																	</p>
																</IonLabel>
															</IonItem>
														)
													)
												) : (
													<IonLabel>
														<p>
															No transactions attached to this goal.
														</p>
													</IonLabel>
												)}
											</IonItemGroup>
											<IonLabel>Withdrawals</IonLabel>
											<IonItemGroup
												className="ion-margin-top"
												style={{
													maxHeight: "190px",
													overflowY: "auto"
												}}
											>
												{filteredWithdrawals(goal.withdrawals).length >
												0 ? (
													filteredWithdrawals(goal.withdrawals).map(
														(withdrawal, index) => (
															<IonItem
																key={index}
																color="light"
																style={{ minWidth: "75%" }}
															>
																<IonLabel>
																	<p>
																		<strong>Title:</strong>{" "}
																		{withdrawal.title ||
																			"No title"}
																	</p>
																	<p>
																		<strong>Date:</strong>{" "}
																		{withdrawal.date
																			.toDate()
																			.toLocaleDateString()}
																	</p>
																	<p>
																		<strong>Amount:</strong> $
																		{withdrawal.amount}
																	</p>
																	<p
																		style={{
																			fontSize: "0.75em",
																			textAlign: "center"
																		}}
																	>
																		{withdrawal.id}
																	</p>
																</IonLabel>
															</IonItem>
														)
													)
												) : (
													<IonLabel>
														<p>No withdrawals attached to this goal.</p>
													</IonLabel>
												)}
											</IonItemGroup>
										</div>
									</div>
								</IonContent>
								<IonFooter>
									<IonButton
										slot="start"
										expand="block"
										color="primary"
										onClick={saveDescription}
									>
										Save Description
									</IonButton>
									<IonButton
										slot="end"
										shape="round"
										expand="block"
										color="danger"
										onClick={() => {
											removeGoal(goal.id);
											modalDetailsRef.current?.dismiss();
										}}
									>
										Delete Goal
									</IonButton>
								</IonFooter>
							</React.Fragment>
						)
				)}
			</IonModal>

			<IonModal
				ref={modalAddRef}
				onDidDismiss={() => modalAddRef.current?.dismiss(null, "cancel")}
			>
				<IonHeader>
					<IonToolbar>
						<IonButton
							slot="start"
							fill="default"
							color="secondary"
							onClick={() => modalAddRef.current?.dismiss(null, "cancel")}
						>
							Cancel
						</IonButton>
						<IonTitle className="ion-text-center" slot="start">
							Add Transaction
						</IonTitle>
						<IonButton
							slot="end"
							fill="default"
							color="primary"
							onClick={() => modalAddRef.current?.dismiss(null, "confirm")}
						>
							Save
						</IonButton>
					</IonToolbar>
				</IonHeader>
				<IonContent className="ion-padding">
					<IonItemGroup className="ion-padding">
						<IonItemDivider>
							<IonLabel>
								<strong>Available Transactions</strong>
							</IonLabel>
						</IonItemDivider>
						<div style={{ maxHeight: "30em", overflowY: "auto" }}>
							{transactions.map((transaction, index) => (
								<IonItem
									key={index}
									button
									onClick={() => addTransaction(transaction)}
								>
									<IonLabel>
										<p>
											<strong>Title:</strong>{" "}
											{transaction.title || "No title"}
										</p>
										<p>
											<strong>Date:</strong>{" "}
											{transaction.date.toDate().toLocaleDateString()}
										</p>
										<p>
											<strong>Amount:</strong> ${transaction.amount}
										</p>
										<p style={{ fontSize: "0.75em", textAlign: "center" }}>
											{transaction.id}
										</p>
									</IonLabel>
								</IonItem>
							))}
						</div>
					</IonItemGroup>
				</IonContent>
			</IonModal>
		</React.Fragment>
	);
};

export default DisplayGoals;
