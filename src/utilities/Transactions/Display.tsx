import React, { useState } from "react";
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
	IonTextarea
} from "@ionic/react";
import Transaction from "./Transaction";
import { chevronDownOutline, chevronForwardOutline, chevronUpOutline } from "ionicons/icons";

interface DisplayTransactionsProps {
	transactions: Transaction[];
}

const DisplayTransactions: React.FC<DisplayTransactionsProps> = ({ transactions }) => {
	const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

	// Group the transactions by month
	const groups = transactions
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.reduce(
			(groups, transaction) => {
				const month = new Date(transaction.date).toLocaleString("default", {
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
						{groups[month].map((transaction) => (
                            <div key={transaction.id}>
                                <IonItem
                                    button
                                    detail={false}
                                    onClick={() => {
                                        toggleAccordion(transaction.id);
                                    }}
                                    id={transaction.id}
                                >
                                    <IonLabel>
                                        <IonNote>
                                            {transaction.category} - {transaction.subCategory}
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
                                    {expandedTransactionId === transaction.id ? (
                                        <IonIcon size="small" icon={chevronDownOutline} />
                                    ) : (
                                        <IonIcon size="small" icon={chevronForwardOutline} />
                                    )}
                                </IonItem>
								{expandedTransactionId === transaction.id && (
                                    <div className="accordion-content">
                                        <IonItem color="light">
                                            <IonGrid fixed={true} className="ion-no-padding">
                                                <IonRow>
                                                    <IonCol className="ion-padding-vertical">
                                                        {new Date(
                                                            transaction.date
                                                        ).toLocaleDateString()}
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
								)}
							</div>
						))}
					</IonItemGroup>
				))}
			</div>
		</React.Fragment>
	);
};

export default DisplayTransactions;
