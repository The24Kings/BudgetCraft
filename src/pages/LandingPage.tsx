import React, { useState } from "react";
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
import { logout, signInWithGoogle } from "../utilities/AuthService";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
    const [user, setUser] = useState<any>(null);

    //TODO: Look into cookies to make login persistant between sessions
    const handleSignIn = async () => {
        try {
            const userData = await signInWithGoogle();
            setUser(userData);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

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
