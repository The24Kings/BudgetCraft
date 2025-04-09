import React from "react";
import {
    IonButton,
	IonCol,
	IonGrid,
	IonIcon,
	IonItem,
	IonItemDivider,
	IonItemGroup,
	IonLabel,
	IonRow
} from "@ionic/react";
import { Category } from "../Categories";
import Transaction from "../Transactions/Transaction";
import Goal from "./Goal";
import { close } from "ionicons/icons";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { firestore } from "../FirebaseConfig";

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
        const isConfirmed = window.confirm(
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
						<IonItem key={goal.id} button>
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
                                        <IonCol size="auto">
                                            <IonButton fill="clear" color="danger" onClick={() => removeGoal(goal.id)}>
                                                <IonIcon icon={close} />
                                            </IonButton>
                                        </IonCol>
									</IonRow>
								</IonGrid>
							</IonLabel>
						</IonItem>
					))}
				</IonItemGroup>
			</div>
		</React.Fragment>
	);
};

export default DisplayGoals;
