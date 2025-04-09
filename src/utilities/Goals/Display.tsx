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
		return (!onlyGoals && createdAtMonth === selectedMonth) || (onlyGoals && !goal.budgetItem);
	});

	/**
	 * Confirm delete custom subcategory
	 */
	const removeGoal = async (goalID: string) => {
		const isConfirmed = window.confirm( //FIXME: This doesn't work on mobile
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

			<IonModal ref={modalRef}>
				{filteredGoals.map((goal) => (
					<React.Fragment key={goal.id}>
						<IonHeader>
							<IonToolbar>
								<IonTitle className="ion-text-center">{goal.category}</IonTitle>
							</IonToolbar>
						</IonHeader>
						<IonContent>
							<div
								key={goal.id}
								hidden={modalRef.current?.getAttribute("goalId") !== goal.id}
							>
								<IonGrid>
									<IonRow>
										<IonCol>
											<IonLabel>
												<h2>Goal Details</h2>
												<p>
													<strong>Description:</strong>{" "}
													{subCategory(goal.category, goal.subCategoryID)}
												</p>
												<p>
													<strong>Target Date:</strong>{" "}
													{goal.targetDate.toDate().toLocaleDateString()}
												</p>
												<p>
													<strong>Goal Amount:</strong> ${goal.goal}
												</p>
												<p>
													<strong>Saved Amount:</strong> $
													{calculateSaved(goal.transactions)}
												</p>
												<p>
													<strong>Category:</strong> {goal.category}
												</p>
											</IonLabel>
										</IonCol>
									</IonRow>
								</IonGrid>
								<IonLabel>Attached Transactions</IonLabel>
								<div
									style={{
										overflowY: "auto",
										maxHeight: "90%",
										padding: "10px",
										marginTop: "10px"
									}}
								>
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
													<p>
														<strong>Description:</strong>{" "}
														{transaction.description ||
															"No description"}
													</p>
												</IonLabel>
											</IonItem>
										))
									) : (
										<IonLabel>
											<p>No transactions attached to this goal.</p>
										</IonLabel>
									)}
								</div>
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
				))}
			</IonModal>
		</React.Fragment>
	);
};

export default DisplayGoals;
