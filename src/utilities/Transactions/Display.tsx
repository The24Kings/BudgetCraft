import React from "react";
import {
    IonItem,
    IonList,
    IonLabel,
    IonTitle,
    IonNote,
    IonContent,
    IonItemGroup,
    IonGrid,
    IonCol,
    IonItemDivider,
    IonRow,
    IonIcon,
} from "@ionic/react";

import Transaction from "./Transaction";
import { addCircle, removeCircle } from "ionicons/icons";

interface DisplayTransactionsProps {
    transactions: Transaction[];
}

const DisplayTransactions: React.FC<DisplayTransactionsProps> = ({ transactions }) => {
    // Group the transactions by month
    const groups = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .reduce((groups, transaction) => {
            const month = new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' });

            if (!groups[month]) {
                groups[month] = [];
            }

            groups[month].push(transaction);

            return groups;
        }, {} as { [key: string]: Transaction[] })
    
    return (
        <React.Fragment>
            <div className="transactions">
                <div hidden={!(transactions.length === 0)}><h1>Loading...</h1></div>

                {/* TODO: Group by month */}
                {Object.keys(groups).map((month) => (
                    <IonItemGroup key={month}>
                        <IonItemDivider>
                            <IonLabel>{month}</IonLabel>
                        </IonItemDivider>
                        {groups[month].map((transaction) => (
                            <div key={transaction.id}>
                                <IonItem button detail={true}>
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
                                                    {transaction.type === "Income" ? "+" : "-"} ${transaction.amount}
                                                </IonCol>
                                            </IonRow>
                                        </IonGrid>
                                    </IonLabel>
                                </IonItem>
                            </div>
                        ))}
                    </IonItemGroup>
                ))}
            </div>
        </React.Fragment>
    );
};

export default DisplayTransactions;