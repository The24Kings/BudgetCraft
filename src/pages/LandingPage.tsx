import React, { useEffect, useState } from "react";
import {    
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonImg,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonPage,
    IonText,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import Container from "../components/Container";
import "./LandingPage.css";
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../utilities/FirebaseConfig";

const LandingPage: React.FC = () => {
    const [user, setUser] = useState<any>(null);

    const handleSignIn = async () => {
        await signInWithPopup(auth, provider)
            .catch((error) => {
                console.error("Sign in Error:", error);
            });

    };

    const handleLogout = async () => {
        await signOut(auth)
            .finally(() => {
                console.log("User signed out");

                setUser(null);
            })
            .catch((error) => {
                console.error("Logout Error:", error);
            });
    };

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log("User Signed in using Auth Change Listener");

                setPersistence(auth, browserLocalPersistence);

                console.log("User Info:", user);

                setUser(user);

                //TODO: Create Firebase document for user if it doesn't exist
            } else {
                console.log("No user signed in");

                setUser(null);
            }
        });
    }, []);

    return (
        <React.Fragment>
            {/* Side Menu */}
            <IonMenu contentId="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>User Settings</IonTitle>
                    </IonToolbar>
                </IonHeader>
                {user && (
                    <IonContent className="ion-padding">
                            <IonText className="center-text">
                                <h2>Welcome, {user.displayName}!</h2>
                            </IonText>
                            <IonImg src={user.photoURL} alt="User Avatar" className="user-avatar" /> {/*TODO: Make the image a cirlce with CSS rather than the square*/}
                            <IonButton expand="full" color="danger" onClick={handleLogout}>
                                Logout
                            </IonButton>
                    </IonContent>
                )}
            </IonMenu>

            {/* Main Page Content */}
            <IonPage id="main-content">
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Landing Page</IonTitle>
                        <IonButtons slot="end">
                            {user ? (
                                // Use a button that calls IonMenuButton functionality
                                <IonMenuToggle id="profile-menu-button">
                                    <IonImg
                                        src={user.photoURL} //TODO: Find a way to cache the image so it doesn't have to be downloaded every time
                                        alt="User Profile"
                                        className="menu-avatar"
                                    />
                                </IonMenuToggle>
                            ) : (
                                <IonMenuButton />
                            )}
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    {!user ? (
                        <div className="login-container">
                            <div className="login-text">
                                <IonText>
                                    <h2>Welcome to BudgetCraft!</h2>
                                    <p>Please sign in to continue</p>
                                </IonText>
                            </div>
                            <IonButton expand="full" onClick={handleSignIn}>
                                Sign in with Google
                            </IonButton>
                        </div>
                    ) : (
                        <Container name="Landing Page" />
                    )}
                </IonContent>
            </IonPage>
        </React.Fragment>
    );
}

export default LandingPage;
