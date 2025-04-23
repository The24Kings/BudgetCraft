import React, { useState } from "react";
import { IonAccordion, IonAccordionGroup, IonAlert, IonButton, IonCol, IonGrid, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonNote, IonRow, IonTextarea } from "@ionic/react";
import { Category } from "../Categories";
import EditTransaction from "./EditTransaction";
import Transaction from "./Transaction";


interface DisplayTransactionsProps {
	transactions: Transaction[];
	categories: Category[];
	userID: string;
	hideDivider?: boolean;
}

const DisplayTransactions: React.FC<DisplayTransactionsProps> = ({
	transactions,
	categories,
	userID,
	hideDivider
}) => {
	const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
	const [transactionList, setTransactionList] = useState<Transaction[]>(transactions);

	React.useEffect(() => {
		setTransactionList(transactions);
	}, [transactions]);

	const groups = transactionList
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

	const subCategory = (category: String, id: string) => {
		const subCategory = categories
			.find((cat) => cat.name === category)
			.Subcategories.find((subCat) => subCat.id === id);

		return subCategory ? subCategory.name : "Uncategorized";
	};

	return (
		<>
			<div className="transactions">
				<div hidden={!(transactionList.length === 0)}>
					<h1>Loading...</h1>
				</div>

				<IonAccordionGroup>
					{Object.keys(groups).map((month) => (
						<IonItemGroup key={month}>
							{!hideDivider && (
								<IonItemDivider>
									<IonLabel>{month}</IonLabel>
								</IonItemDivider>
							)}

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
											<IonGrid
												fixed={true}
												className="ion-no-padding ion-no-margin"
											>
												<IonRow className="ion-text-left ion-padding-top">
													<IonCol>
														<h2>{transaction.title}</h2>
													</IonCol>
													<IonCol className="ion-text-right">
														{transaction.type === "Income"
															? "+ "
															: "- "}
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
													<IonCol className="ion-align-self-center ion-padding-vertical">
														{transaction.date
															.toDate()
															.toLocaleDateString()}
													</IonCol>
													<IonCol className="ion-align-self-center ion-text-right ion-padding-vertical">
														<IonButton
															size="small"
															color="fab"
															className="add-transaction-button"
															onClick={() =>
																setEditingTransaction(transaction)
															}
														>
															Edit
														</IonButton>
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

			{editingTransaction && (
				<EditTransaction
					categories={categories}
					userID={userID}
					transaction={editingTransaction}
					onClose={() => setEditingTransaction(null)}
					onUpdate={() => setEditingTransaction(null)}
				/>
			)}
		</>
	);
};

export default DisplayTransactions;