import React, { useRef } from "react";
import { arrayUnion, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { add } from "ionicons/icons";
import { IonButton, IonButtons, IonCol, IonContent, IonFab, IonFabButton, IonFooter, IonGrid, IonHeader, IonIcon, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonModal, IonRow, IonTitle, IonToolbar } from "@ionic/react";
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
		const createdAtMonth = goal.createdAt
			.toDate();
		return (
			((!onlyGoals && selectedMonth === createdAtMonth.getMonth() && goal.budgetItem) ||
            (!onlyGoals && goal.recurring)) || (onlyGoals && !goal.budgetItem)
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
			// Update the Firebase database for user categories
			const goalRef = collection(firestore, `users/${user.uid}/budget`);
			const goalDoc = doc(goalRef, goalID);

			await deleteDoc(goalDoc);
			console.log("Goal deleted successfully");
		} catch (error) {
			console.error("Error deleting goal:", error);
		}
	};

	/*
	 * Get the subcategory of a goal from the name of the category and the index of the subcategory
	 */
	const subCategory = (category: String, id: string) => {
		if (!categories.length) {
			return;
		}

		const subCategory = categories
			.find((cat) => cat.name === category)
			.Subcategories.find((subCat) => subCat.id === id);

		return subCategory ? subCategory.name : "Uncategorized";
	};

	const calculateSaved = (transactions: Transaction[]): number =>
		transactions.reduce((total, transaction) => total + transaction.amount, 0);

    const onDetailsDismiss = () => {
        modalDetailsRef.current?.attributes.removeNamedItem("goalId");
        modalDetailsRef.current?.dismiss(null, "cancel");
    }

    const addTransaction = async (transaction: Transaction) => {
        const goalId = modalDetailsRef.current?.getAttribute("goalId") || "";
        const goalRef = doc(firestore, `users/${user.uid}/budget/${goalId}`);

        await updateDoc(goalRef, {
            withdrawalIDs: arrayUnion(transaction.id)
        });

        modalAddRef.current?.dismiss(null, "cancel");
    }

	return (
		<React.Fragment>
			<div className="goals">
				<div hidden={!(goals.length === 0)}>
					<h1>Loading...</h1>
				</div>

				{/* Group the transactions by month */}
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

					{/* Display the transactions */}
					{filteredGoals.map((goal) => (
						<IonItem
							key={goal.id}
							button
							onClick={() => {
								modalDetailsRef.current?.present();
								modalDetailsRef.current?.setAttribute("goalId", goal.id);
							}}
						>
							<IonLabel>
								<IonGrid>
									<IonRow>
										<IonCol>
											{subCategory(goal.category, goal.subCategoryID)}
										</IonCol>
										<IonCol>
											{goal.targetDate.toDate().toLocaleDateString()}
										</IonCol>
										<IonCol>${goal.goal}</IonCol>
										<IonCol>${calculateSaved(goal.transactions)}</IonCol>
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
						modalDetailsRef.current?.getAttribute("goalId") === goal.id && (
							<React.Fragment key={goal.id}>
								<IonHeader>
									<IonToolbar>
										<IonTitle className="ion-text-center">
											{subCategory(goal.category, goal.subCategoryID)}
										</IonTitle>
									</IonToolbar>
								</IonHeader>
								<IonContent className="ion-padding">
									<div key={goal.id}>
										<IonItemGroup className="ion-margin-bottom">
											<IonItem>
												<IonLabel>
													<strong>Saved:</strong> $
													{calculateSaved(goal.transactions)} / $
													{goal.goal}
												</IonLabel>
											</IonItem>
											<IonItem>
												<IonLabel>
													<strong>Remaining:</strong> $
													{goal.goal - calculateSaved(goal.transactions) <
													0
														? 0
														: goal.goal -
															calculateSaved(goal.transactions)}
												</IonLabel>
											</IonItem>
											<IonItem>
												<IonLabel>
													<strong>Description:</strong>{" "}
													{goal.description || "No description"}
												</IonLabel>
											</IonItem>
										</IonItemGroup>
										<IonItemGroup>
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
											<div style={{ maxHeight: "200px", overflowY: "auto" }}>
												{goal.transactions.length > 0 ? (
													goal.transactions.map((transaction, index) => (
														<IonItem key={index}>
															<IonLabel>
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
													))
												) : (
													<IonLabel>
														<p>
															No transactions attached to this goal.
														</p>
													</IonLabel>
												)}
											</div>
										</IonItemGroup>
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
						<IonTitle className="ion-text-center" slot="start">Add Transaction</IonTitle>
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
                                <IonItem key={index} button onClick={() => addTransaction(transaction)}>
                                    <IonLabel>
                                        <p>
                                            <strong>Title:</strong> {transaction.title || "No title"}
                                        </p>
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {transaction.date
                                                .toDate()
                                                .toLocaleDateString()}
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