import React, { useState } from "react";
import {
	IonAccordion,
	IonAccordionGroup,
	IonCol,
	IonGrid,
	IonIcon,
	IonItem,
	IonItemDivider,
	IonItemGroup,
	IonLabel,
	IonNote,
	IonRow,
	IonTextarea
} from "@ionic/react";
import { Category } from "../Categories";
import Goal from "./Goal";

interface DisplayTransactionsProps {
	goals: Goal[];
	categories: Category[];
}

const DisplayGoals: React.FC<DisplayTransactionsProps> = ({ goals, categories }) => {
	//TODO: Allow the user to select which month they want to view
	// Group the transactions by month
	const groups = goals
		.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
		.reduce(
			(groups, goal) => {
				const month = goal.createdAt.toDate().toLocaleString("default", {
					month: "long",
					year: "numeric"
				});

				if (!groups[month]) {
					groups[month] = [];
				}

				groups[month].push(goal);

				return groups;
			},
			{} as { [key: string]: Goal[] }
		);

	/*
	 * Get the subcategory of a goal from the name of the category and the index of the subcategory
	 */
	const subCategory = (category: String, id: string) => {
		const subCategory = categories
			.find((cat) => cat.name === category)
			.Subcategories.find((subCat) => subCat.id === id);

		return subCategory ? subCategory.name : "Uncategorized";
	};

	return (
		<React.Fragment>
			<div className="transactions">
				<div hidden={!(goals.length === 0)}>
					<h1>Loading...</h1>
				</div>

				{/* Group the transactions by month */}
				<IonAccordionGroup>
					{Object.keys(groups).map((month) => (
						<IonItemGroup key={month}>
							<IonItemDivider>
								<IonLabel>{month}</IonLabel>
							</IonItemDivider>

							{/* Display the transactions */}
							{groups[month].map((goal) => (
								<IonAccordion value={goal.id} key={goal.id}>
									<IonItem slot="header" button>
										<IonLabel>
											<IonGrid
												fixed={true}
												className="ion-no-padding ion-no-margin"
											>
												<IonRow className="ion-text-left ion-padding-top">
													<IonCol>
														<h2>
															{subCategory(goal.category, goal.subCategoryID)}
														</h2>
													</IonCol>
												</IonRow>
											</IonGrid>
										</IonLabel>
									</IonItem>
									<div className="accordion-content" slot="content">
										<IonItem color="light">
											<IonGrid fixed={true} className="ion-no-padding">
												<IonRow>
													<IonCol className="ion-padding-vertical">
														{goal.createdAt
															.toDate()
															.toLocaleDateString()}
													</IonCol>
												</IonRow>
												<IonRow>
													<IonTextarea
														className="custom ion-no-padding"
														shape="round"
														readonly={true}
														value={goal.description}
														placeholder="No description available."
													/>
												</IonRow>
												<IonRow>
													<IonCol className="ion-text-right ion-padding-vertical">
														<IonNote>{goal.id}</IonNote>
													</IonCol>
												</IonRow>
											</IonGrid>
										</IonItem>
									</div>
								</IonAccordion>
							))}
						</IonItemGroup>
					))}
				</IonAccordionGroup>
			</div>
		</React.Fragment>
	);
};

export default DisplayGoals;
