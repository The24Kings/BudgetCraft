import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import { ellipse, triangle } from "ionicons/icons";
import {
    IonApp,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    setupIonicReact
} from "@ionic/react";
import DebugPage from "./pages/DebugPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage"; 
import { auth } from "./utilities/FirebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth"; 


import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
    const [user, setUser ] = useState<any>(null); 
    const [loading, setLoading] = useState<boolean>(true); 

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser (user); 
            setLoading(false); 
        });

        return () => unsubscribe(); 
    }, []);

    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <IonApp>
            <IonReactRouter>
                <IonTabs>
                    <IonRouterOutlet>
                        <Redirect exact path="/" to={user ? "/home" : "/login"} />

                        <Route path="/home" render={() => user ? <LandingPage /> : <Redirect to="/login" />} exact={true} />
                        <Route path="/debug" render={() => user ? <DebugPage /> : <Redirect to="/login" />} exact={true} />
                        <Route path="/login" render={() => <LoginPage setUser ={setUser } setErrorMessage={(msg) => console.error(msg)} />} exact={true} />
                    </IonRouterOutlet>

                    {user && ( // only shows the tab bar once the user signs in
                        <IonTabBar slot="bottom">
                            <IonTabButton tab="home" href="/home">
                                <IonIcon aria-hidden="true" icon={triangle} />
                                <IonLabel>Home</IonLabel>
                            </IonTabButton>
                            <IonTabButton tab="debug" href="/debug">
                                <IonIcon aria-hidden="true" icon={ellipse} />
                                <IonLabel>Debug</IonLabel>
                            </IonTabButton>
                        </IonTabBar>
                    )}
                </IonTabs>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;