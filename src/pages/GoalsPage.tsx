import React, { useEffect } from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import AddGoal from "../utilities/Goals/Add";
import { collection, doc, DocumentData, getDoc, getDocs, limit, orderBy, query, QuerySnapshot } from "firebase/firestore";
import { firestore } from "../utilities/FirebaseConfig";
import { Category, parseJSON } from "../utilities/Categories";
import DisplayGoals from "../utilities/Goals/Display";
import Goal from "../utilities/Goals/Goal";
import Transaction from "../utilities/Transactions/Transaction";

const GoalsPage: React.FC<{user: any}> = ({ user }) => {
    const [jsonData, setJSONData] = React.useState<any>(null);
    const [categoryData, setCategoryData] = React.useState<any[]>([]);
    const [transactionData, setTransactionData] = React.useState<any[]>([]);
    const [goalData, setGoalData] = React.useState<any[]>([]);
    const [totalLoaded, setTotalLoaded] = React.useState(10);
    const [actualTotalLoaded, setActualTotalLoaded] = React.useState(10);

    // Load the JSON data
    useEffect(() => {
        if (!user) return;
        const fetchJSON = async () => {
            const settingsRef = collection(firestore, `users/${user.uid}/settings`);
            const categoriesRef = doc(settingsRef, "categories");
            const categoriesSnapshot = await getDoc(categoriesRef);

            // Order the categories by type in descending order
            const categories = categoriesSnapshot.data().categories;
            const orderedCategories = parseJSON(categories).sort((a: Category, b: Category) => {
                if (a.type !== b.type) {
                    if (a.type === "Income") return -1;
                    if (b.type === "Income") return 1;
                }

                if (a.name !== b.name) {
                    return a.name.localeCompare(b.name);
                }
            });

            setJSONData(categories);
            setCategoryData(orderedCategories);
        };

        const interval = setInterval(() => {
            fetchJSON();
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchTransactions = async () => {
            let querySnapshot: QuerySnapshot<DocumentData>;

            try {
                querySnapshot = await getDocs(
                    query(
                        collection(firestore, `users/${user.uid}/transactions`),
                        orderBy("date", "desc"),
                        limit(totalLoaded)
                    )
                );
            } catch (error) {
                console.error("Failed to fetch transactions...");
            } finally {
                setActualTotalLoaded(querySnapshot.docs.length);

                // Parse the documents into Transaction objects
                const transactionData = await Promise.all(
                    querySnapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data();

                        const transactions = await Promise.all(
                            data.transactions.map(async (transactionID: string) => {
                                const transactionDoc = await getDoc(
                                    doc(firestore, `users/${user.uid}/transactions`, transactionID)
                                );
                                const transactionData = transactionDoc.data();
                                return new Transaction(
                                    transactionDoc.id,
                                    transactionData.type,
                                    transactionData.category,
                                    transactionData.subCategoryID,
                                    transactionData.title,
                                    transactionData.date,
                                    transactionData.description,
                                    transactionData.amount
                                );
                            })
                        );
        
                        return new Goal(
                            docSnapshot.id,
                            data.type,
                            data.category,
                            data.subCategoryID,
                            data.goal,
                            data.recurring,
                            data.reminder,
                            data.createdAt,
                            data.targetDate,
                            data.reminderDate,
                            data.description,
                            transactions
                        );
                    })
                );

                setTransactionData(transactionData);
            }
        };

        const interval = setInterval(() => {
            fetchTransactions();
        }, 1000);

        return () => clearInterval(interval);
    }, [totalLoaded, actualTotalLoaded]);

	return (
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Goals</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
                <DisplayGoals goals={goalData} categories={categoryData} />
                <AddGoal categories={categoryData} userID={user.uid} />
				<h2>This is the Goals Page</h2>
				<p>You’ll set and track savings or budgeting goals here.</p>
			</IonContent>
		</IonPage>
	);
};

export default GoalsPage;
