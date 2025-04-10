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
import Container from "../components/HomeContainer";
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

	const handleLogout = async () => {
		try {
			await signOut(auth);
			console.log("User signed out");
		} catch (error) {
			console.error("Logout Error:", error);
		}
	};

	const handleExportJSON = () => {
		if (user) {
			const categories: any[] = [];
			exportUserDataJSON(user.uid, categories);
		}
	};

	return (
		<React.Fragment>
			<IonMenu contentId="main-content">
				<IonHeader>
					<IonToolbar>
						<IonTitle>User Settings</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonContent className="ion-padding">
					<IonAvatar className="menu-avatar">
						<img
							src={
								user?.photoURL ??
								"https://ionicframework.com/docs/img/demos/avatar.svg"
							}
							alt="User Avatar"
						/>
					</IonAvatar>
					<IonText className="center-text">
						<h2>Welcome, {userData?.displayName}!</h2>
					</IonText>
					<IonButton onClick={handleLogout}>Logout</IonButton>
					<IonButton expand="full" color="secondary" onClick={handleExportJSON}>
						Export JSON
					</IonButton>
				</IonContent>
			</IonMenu>

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
						<Container userID={user.uid} />
					) : (
						<IonText className="ion-padding">Loading user data...</IonText>
					)}
				</IonContent>
			</IonPage>
		</React.Fragment>
	);
};

export default HomePage;
