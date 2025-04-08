import React from "react";
import { IonCol, IonGrid, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonRow } from "@ionic/react";
import { Category } from "../Categories";
import Transaction from "../Transactions/Transaction";
import Goal from "./Goal";


interface DisplayGoalsProps {
	goals: Goal[];
	categories: Category[];
    selectedMonth: string;
}

const DisplayGoals: React.FC<DisplayGoalsProps> = ({ goals, categories, selectedMonth }) => {
	//TODO: Allow the user to select which month they want to view
	//  Filter goals by month and recurring
    const filteredGoals = 
        goals.filter(goal => {
            const createdAtMonth = goal.createdAt.toDate().toLocaleString('default', { month: 'short'});
            return createdAtMonth === selectedMonth || goal.recurring;
        })

	/*
	 * Get the subcategory of a goal from the name of the category and the index of the subcategory
	 */
	const subCategory = (category: String, id: string) => {
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
										<IonCol>{subCategory(goal.category, goal.subCategoryID)}</IonCol>
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
		</React.Fragment>
	);
};

export default DisplayGoals;