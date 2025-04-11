import React, { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
	IonAvatar,
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonMenu,
	IonMenuToggle,
	IonPage,
	IonText,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import HomeContainer from "../components/HomeContainer";
import { exportUserDataJSON } from "../utilities/DataExport";
import { auth, firestore } from "../utilities/FirebaseConfig";
import MonthPicker from "../utilities/MonthPicker";
import "./HomePage.css";
import "../theme/variables.css";

const HomePage: React.FC<{ user: any }> = ({ user }) => {
	const [userData, setUserData] = useState<any>(null);
	const [month, setMonth] = useState(new Date().getMonth());
	const [year, setYear] = useState(new Date().getFullYear());

	useEffect(() => {
		const fetchUserData = async () => {
			if (!user) return;
			const userRef = doc(firestore, "users", user.uid);
			const userDoc = await getDoc(userRef);
			if (userDoc.exists()) {
				setUserData(userDoc.data());
			}
		};
		fetchUserData();
	}, [user]);

	return (
		<React.Fragment>
			<IonPage id="main-content">
				<IonHeader className="home-header">
					<IonToolbar className="home-toolbar">
						<MonthPicker
							month={month}
							year={year}
							setMonth={setMonth}
							setYear={setYear}
						/>
					</IonToolbar>
				</IonHeader>

				<IonContent className="home-content">
					{user ? (
						<HomeContainer userID={user.uid} />
					) : (
						<IonText className="ion-padding">Loading user data...</IonText>
					)}
				</IonContent>
			</IonPage>
		</React.Fragment>
	);
};

export default HomePage;
