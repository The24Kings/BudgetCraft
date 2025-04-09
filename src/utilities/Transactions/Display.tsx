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
import Transaction from "./Transaction";

interface DisplayTransactionsProps {
	transactions: Transaction[];
	categories: Category[];
    selectedMonth?: string;
}

const DisplayTransactions: React.FC<DisplayTransactionsProps> = ({ transactions, categories, selectedMonth="" }) => {
	//TODO: Allow the user to select which month they want to view
	// Group the transactions by month
	const groups = transactions
		.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
		.reduce(
			(groups, transaction) => {
				const month = transaction.date.toDate().toLocaleString("default", {
					month: "short",
					year: "numeric"
				});

				if (!groups[month]) {
					groups[month] = [];
				}

				groups[month].push(transaction);

				return groups;
			},
			{} as { [key: string]: Transaction[] }
		);

	/*
	 * Get the subcategory of a transaction from the name of the category and the index of the subcategory
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
				<div hidden={!(transactions.length === 0)}>
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
							{groups[month].map((transaction) => (
								<IonAccordion value={transaction.id} key={transaction.id}>
									<IonItem slot="header" button>
										<IonLabel>
											<IonNote>
												{transaction.category} -{" "}
												{subCategory(
													transaction.category,
													transaction.subCategoryID
												)}
											</IonNote>
											<IonGrid fixed={true} className="ion-no-padding ion-no-margin">
												<IonRow className="ion-text-left ion-padding-top">
													<IonCol>
														<h2>{transaction.title}</h2>
													</IonCol>
													<IonCol className="ion-text-right">
														{transaction.type === "Income" ? "+ " : "- "}
														${transaction.amount}
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
														{transaction.date
															.toDate()
															.toLocaleDateString()}
													</IonCol>
												</IonRow>
												<IonRow>
													<IonTextarea
														className="custom ion-no-padding"
														shape="round"
														readonly={true}
														value={transaction.description}
														placeholder="No description available."
													/>
												</IonRow>
												<IonRow>
													<IonCol className="ion-text-right ion-padding-vertical">
														<IonNote>{transaction.id}</IonNote>
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

export default DisplayTransactions;
