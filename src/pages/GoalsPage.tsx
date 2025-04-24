import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import "./GoalsPage.css";
import { Category } from "../utilities/Categories";
import AddGoal from "../utilities/Goals/Add";
import DisplayGoals from "../utilities/Goals/Display";
import Goal from "../utilities/Goals/Goal";
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
					<IonTitle className="goals-title">Goals</IonTitle>
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
