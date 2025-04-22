import React, { useRef } from "react";
import {
	arrayUnion,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	query,
	updateDoc
} from "firebase/firestore";
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

	// Filter goals by month and recurring
	const filteredGoals = goals.filter((goal) => {
		const createdAtMonth = goal.createdAt.toDate();
		return (
			(!onlyGoals && selectedMonth === createdAtMonth.getMonth() && goal.budgetItem) ||
			(!onlyGoals && goal.recurring) ||
			(onlyGoals && !goal.budgetItem)
		);
	});

	/**
	 * Confirm delete custom subcategory
	 */
	const removeGoal = async (goalID: string) => {
		const isConfirmed = window.confirm(
			//FIXME: This doesn't work on mobile
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
		if (!categories.length) return;

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
	};

	const addTransaction = async (transaction: Transaction) => {
		const goalId = modalDetailsRef.current?.getAttribute("goalId") || "";
		const goalRef = doc(firestore, `users/${user.uid}/budget/${goalId}`);
		const goalDocSnapshot = await getDoc(goalRef);

		// Check if the transaction ID is already added
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

	return (
		<React.Fragment>
			<div className="goals">
				<div hidden={!(goals.length === 0)}>
					<h1>Loading...</h1>
				</div>

				{/* Single Header Row for Labels */}
				<IonGrid className="budget-label-row">
					<IonRow>
						<IonCol className="budget-col-description">
							<span className="budget-label">Description</span>
						</IonCol>
						<IonCol className="budget-col-target">
							<span className="budget-label">Target</span>
						</IonCol>
						<IonCol className="budget-col-saved-goal">
							<span className="budget-label">Saved / Goal</span>
						</IonCol>
					</IonRow>
				</IonGrid>

				{/* Each Budget Item */}
				<IonItemGroup>
					{filteredGoals.map((goal) => (
						<div key={goal.id} className="budget-item-wrapper">
							<IonItem
								button
								className="budget-card"
								onClick={() => {
									modalDetailsRef.current?.present();
									modalDetailsRef.current?.setAttribute("goalId", goal.id);
								}}
							>
								<IonGrid style={{ width: "100%" }}>
									<IonRow className="budget-row">
										<IonCol className="budget-col-description">
											<IonLabel className="budget-value">
												{subCategory(goal.category, goal.subCategoryID) ||
													"Uncategorized"}
											</IonLabel>
										</IonCol>
										<IonCol className="budget-col-target">
											<p className="budget-value">
												{goal.targetDate.toDate().toLocaleDateString()}
											</p>
										</IonCol>
										<IonCol className="budget-col-saved-goal">
											<p className="budget-value">
												$
												{calculateSaved(
													goal.transactions,
													goal.withdrawals
												)}{" "}
												/ ${goal.goal}
											</p>
										</IonCol>
									</IonRow>
								</IonGrid>
							</IonItem>
						</div>
					))}
				</IonItemGroup>
			</div>

			<IonModal id="goal-details-modal" ref={modalDetailsRef} onDidDismiss={onDetailsDismiss}>
				{filteredGoals.map(
					(goal) =>
						modalDetailsRef.current?.getAttribute("goalId") === goal.id && (
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
										<IonFabButton
											className="fab-add-transaction"
											size="small"
											onClick={() => {
												modalAddRef.current?.present();
											}}
										>
											<IonIcon icon={add} />
										</IonFabButton>
										<IonTextarea
											className="custom ion-margin-vertical"
											shape="round"
											value={goal.description || "No description"}
											readonly={true}
										/>
										<div>
											<React.Fragment>
												<IonLabel>Transactions</IonLabel>
												<IonItemGroup
													className="ion-margin-vertical"
													style={{
														maxHeight: "190px",
														overflowY: "auto"
													}}
												>
													{goal.transactions.length > 0 ? (
														goal.transactions.map(
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
																			<strong>Amount:</strong>{" "}
																			${transaction.amount}
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
																No transactions attached to this
																goal.
															</p>
														</IonLabel>
													)}
												</IonItemGroup>
											</React.Fragment>
											<React.Fragment>
												<IonLabel>Withdrawals</IonLabel>
												<IonItemGroup
													className="ion-margin-top"
													style={{
														maxHeight: "190px",
														overflowY: "auto"
													}}
												>
													{goal.withdrawals.length > 0 ? (
														goal.withdrawals.map(
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
																			<strong>Amount:</strong>{" "}
																			${withdrawal.amount}
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
															<p>
																No withdrawals attached to this
																goal.
															</p>
														</IonLabel>
													)}
												</IonItemGroup>
											</React.Fragment>
										</div>
									</div>
								</IonContent>
								<IonFooter>
									<IonButton
										slot="end"
										shape="round"
										expand="full"
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
				id="add-goal-modal"
				ref={modalAddRef}
				onDidDismiss={() => modalAddRef.current?.dismiss(null, "cancel")}
			>
				<IonHeader>
					<IonToolbar>
						<IonButton
							slot="start"
							fill="clear"
							color="light"
							onClick={() => modalAddRef.current?.dismiss(null, "cancel")}
						>
							Cancel
						</IonButton>

						<IonTitle className="ion-text-center">Add Transaction</IonTitle>

						<IonButton
							slot="end"
							fill="clear"
							color="light"
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
						<div>
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
							))}
						</div>
					</IonItemGroup>
				</IonContent>
			</IonModal>
		</React.Fragment>
	);
};

export default DisplayGoals;
