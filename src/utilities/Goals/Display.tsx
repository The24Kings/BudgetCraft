import React, { useRef } from "react";
import { collection, deleteDoc, doc } from "firebase/firestore";
import {
	IonButton,
	IonCol,
	IonContent,
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
	selectedMonth?: string;
	onlyGoals?: boolean;
}

const DisplayGoals: React.FC<DisplayGoalsProps> = ({
	user,
	goals,
	categories,
	selectedMonth = "",
	onlyGoals = false
}) => {
	const modalRef = useRef<HTMLIonModalElement>(null);

	// Filter goals by month and recurring
	const filteredGoals = goals.filter((goal) => {
		const createdAtMonth = goal.createdAt
			.toDate()
			.toLocaleString("default", { month: "short" });
		return (
			(!onlyGoals && selectedMonth === createdAtMonth && goal.budgetItem) ||
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

	const calculateSaved = (transactions: Transaction[]): number =>
		transactions.reduce((total, transaction) => total + transaction.amount, 0);

	const onDismiss = () => {
		modalRef.current?.attributes.removeNamedItem("goalId");
		modalRef.current?.dismiss(null, "cancel");
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

					{/* ✅ Budget Items with matched HomePage style */}
					{filteredGoals.map((goal) => (
						<IonItem
							key={goal.id}
							className="budget-item"
							button
							onClick={() => {
								modalRef.current?.present();
								modalRef.current?.setAttribute("goalId", goal.id);
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

			<IonModal ref={modalRef} onDidDismiss={onDismiss}>
				{filteredGoals.map(
					(goal) =>
						modalRef.current?.getAttribute("goalId") === goal.id && (
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
										shape="round"
										expand="full"
										color="danger"
										onClick={() => {
											removeGoal(goal.id);
											modalRef.current?.dismiss();
										}}
									>
										Delete Goal
									</IonButton>
								</IonFooter>
							</React.Fragment>
						)
				)}
			</IonModal>
		</React.Fragment>
	);
};

export default DisplayGoals;
