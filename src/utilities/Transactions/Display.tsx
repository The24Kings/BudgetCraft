import React from "react";
import {
    IonItem,
    IonList,
    IonLabel,
    IonTitle,
    IonNote,
    IonContent,
    IonItemGroup,
} from "@ionic/react";

import Transaction from "./Transaction";

interface DisplayTransactionsProps {
    transactions: Transaction[];
}

const DisplayTransactions: React.FC<DisplayTransactionsProps> = ({ transactions }) => {
    return (
        <React.Fragment>
            <div className="container">
                <div hidden={!(transactions.length === 0)}><h1>Loading...</h1></div>

                {/* TODO: Group by month */}
                <IonItemGroup>
                    {transactions.map((transaction) => (
                        <div className="ion-padding-top" key={transaction.id}>
                            <IonItem button={true} detail={true}>
                                <IonLabel>
                                    <h2>{transaction.title}</h2>
                                    <p>{transaction.amount}</p>
                                    <IonNote>{new Date(transaction.date).toLocaleDateString()}</IonNote>
                                </IonLabel>
                            </IonItem>
                        </div>
                    ))}
                </IonItemGroup>
            </div>
        </React.Fragment>
    );
};

export default DisplayTransactions;