import React, { useState } from "react";
import { chevronDownOutline, chevronForwardOutline } from "ionicons/icons";
import {
	IonCol,
	IonGrid,
	IonIcon,
	IonItem,
	IonItemDivider,
	IonItemGroup,
	IonLabel,
	IonNote,
	IonRow,
	IonAccordion,
	IonAccordionGroup,
	IonTextarea
} from "@ionic/react";
import { Category } from "../Categories";
import Transaction from "./Transaction";

interface DisplayTransactionsProps {
	transactions: Transaction[];
	categories: Category[];
}

const DisplayTransactions: React.FC<DisplayTransactionsProps> = ({ transactions, categories }) => {
	const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

	//TODO: Allow the user to select which month they want to view
	// Group the transactions by month
	const groups = transactions
		.sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime())
		.reduce(
			(groups, transaction) => {
				const month = transaction.date.toDate().toLocaleString("default", {
					month: "long",
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
	const subCategory = (category: String, index: number) => {
		const subCategory = categories.find((cat) => cat.name === category)?.Subcategories[index];

		return subCategory ? subCategory.name : "Uncategorized";
	};

	const toggleAccordion = (transactionId: string) => {
		if (expandedTransactionId === transactionId) {
			setExpandedTransactionId(null);
		} else {
			setExpandedTransactionId(transactionId);
		}
	};

	return (
		<React.Fragment>
			<div className="transactions">
				<div hidden={!(transactions.length === 0)}>
					<h1>Loading...</h1>
				</div>

				{/* Group the transactions by month */}
				{Object.keys(groups).map((month) => (
					<IonItemGroup key={month}>
						<IonItemDivider>
							<IonLabel>{month}</IonLabel>
						</IonItemDivider>

						{/* Display the transactions */}
						<IonAccordionGroup>
							{groups[month].map((transaction) => (
								<IonAccordion value={transaction.id} key={transaction.id}>
									<IonItem
										slot="header"
										button
									>
										<IonLabel>
											<IonNote>
												{transaction.category} -{" "}
												{subCategory(
													transaction.category,
													transaction.subCategoryIndex
												)}
											</IonNote>
											<IonGrid fixed={true} className="ion-no-padding">
												<IonRow className="ion-text-left ion-padding-top">
													<IonCol>
														<h2>{transaction.title}</h2>
													</IonCol>
													<IonCol className="ion-text-right">
														{transaction.type === "Income" ? "+" : "-"} $
														{transaction.amount}
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
						</IonAccordionGroup>
					</IonItemGroup>
				))}
			</div>
		</React.Fragment>
	);
};

export default DisplayTransactions;
