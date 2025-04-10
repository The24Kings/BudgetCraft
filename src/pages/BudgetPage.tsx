import React from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import "./BudgetPage.css";
import { Category } from "../utilities/Categories";
import AddGoal from "../utilities/Goals/Add";
import DisplayGoals from "../utilities/Goals/Display";
import Goal from "../utilities/Goals/Goal";
import MonthPicker from "../utilities/MonthPicker";

interface BudgetPageProps {
	user: any;
	goalData: Goal[];
	categoryData: Category[];
}

const BudgetPage: React.FC<BudgetPageProps> = ({ user, goalData, categoryData }) => {
	const [month, setMonth] = React.useState<number>(new Date().getMonth() + 1);
	const [year, setYear] = React.useState<number>(new Date().getFullYear());

	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];

	return (
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<MonthPicker month={month} year={year} setMonth={setMonth} setYear={setYear} />
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">DEBUG</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					<div className="container">
						<DisplayGoals
							user={user}
							goals={goalData}
							categories={categoryData}
							selectedMonth={monthNames[month]}
						/>
						<AddGoal categories={categoryData} userID={user.uid} />
					</div>
				</IonContent>
			</IonContent>
		</IonPage>
	);
};

export default BudgetPage;
