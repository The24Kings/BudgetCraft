import React from "react";
import { signOut } from "firebase/auth";
import { IonAvatar, IonButton, IonContent, IonFooter, IonHeader, IonItemDivider, IonPage, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { exportUserDataJSON } from "../utilities/DataExport";
import { auth } from "../utilities/FirebaseConfig";


const SettingsPage: React.FC<{user: any}> = ({ user }) => {
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

    const userName = user?.displayName || (user?.email?.split("@")[0]) || "User";

	return (
		<IonPage id="main-content">
			<IonHeader>
				<IonToolbar>
					<IonTitle>Settings</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent className="ion-padding">
				<div style={{ display: "flex", alignItems: "center", justifyContent: "left" }}>
                    <IonAvatar
                        className="menu-avatar"
                        style={{
                            marginRight: "20px",
                            width: "60px",
                            height: "60px",
                        }}
                    >
                        <img
                            src={"https://ionicframework.com/docs/img/demos/avatar.svg"}
                            alt="User Avatar"
                        />
                    </IonAvatar>
					<div style={{ display: "flex", flexDirection: "column" }}>
						<IonText>
							<h2>Welcome, {userName}!</h2>
						</IonText>
						<IonButton onClick={handleLogout}>Logout</IonButton>
					</div>
				</div>
                <IonItemDivider/>
				<h2>This is the Settings Page</h2>
				<p>You’ll manage your account, export data, and set preferences here.</p>
			</IonContent>
			<IonFooter>
				<IonButton expand="full" color="secondary" onClick={handleExportJSON}>
					Export Data
				</IonButton>
			</IonFooter>
		</IonPage>
	);
};

export default SettingsPage;