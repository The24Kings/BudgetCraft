import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Category } from "../utilities/Categories";
import Goal from "../utilities/Goals/Goal";
import "./HomePage.css";
import AddGoal from "../utilities/Goals/Add";
import DisplayGoals from "../utilities/Goals/Display";
import Transaction from "../utilities/Transactions/Transaction";

interface GoalsPageProps {
	user: any;
	goalData: Goal[];
	categoryData: Category[];
    transactionData: Transaction[];
}

const GoalsPage: React.FC<GoalsPageProps> = ({ user, goalData, categoryData, transactionData }) => {
	return (
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Goals</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<div className="container">
					<DisplayGoals
						user={user}
						goals={goalData}
						categories={categoryData}
						transactions={transactionData}
						onlyGoals
					/>
					<AddGoal categories={categoryData} userID={user.uid} onlyGoals />
				</div>
			</IonContent>
		</IonPage>
	);
};

export default GoalsPage;