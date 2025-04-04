import React, { useEffect, useState } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import { onAuthStateChanged } from "firebase/auth";
import { bulb, construct, home, settings, wallet } from "ionicons/icons";
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
import BudgetPage from "./pages/BudgetPage";
import GoalsPage from "./pages/GoalsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ToolsPage from "./pages/ToolsPage";
import { auth } from "./utilities/FirebaseConfig";
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
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	if (loading) return <div>Loading...</div>;

	return (
		<IonApp>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
						<Redirect exact path="/" to={user ? "/home" : "/login"} />

						<Route
							path="/home"
							render={() => (user ? <HomePage /> : <Redirect to="/login" />)}
							exact
						/>
						<Route
							path="/budget"
							render={() => (user ? <BudgetPage /> : <Redirect to="/login" />)}
							exact
						/>
						<Route
							path="/goals"
							render={() => (user ? <GoalsPage /> : <Redirect to="/login" />)}
							exact
						/>
						<Route
							path="/tools"
							render={() => (user ? <ToolsPage /> : <Redirect to="/login" />)}
							exact
						/>
						<Route
							path="/settings"
							render={() => (user ? <SettingsPage /> : <Redirect to="/login" />)}
							exact
						/>
						<Route
							path="/login"
							render={() => (
								<LoginPage
									setUser={setUser}
									setErrorMessage={(msg) => console.error(msg)}
								/>
							)}
							exact
						/>
					</IonRouterOutlet>

					{user && (
						<IonTabBar slot="bottom">
							<IonTabButton tab="home" href="/home">
								<IonIcon icon={home} />
								<IonLabel>Home</IonLabel>
							</IonTabButton>
							<IonTabButton tab="budget" href="/budget">
								<IonIcon icon={wallet} />
								<IonLabel>Budget</IonLabel>
							</IonTabButton>
							<IonTabButton tab="goals" href="/goals">
								<IonIcon icon={bulb} />
								<IonLabel>Goals</IonLabel>
							</IonTabButton>
							<IonTabButton tab="tools" href="/tools">
								<IonIcon icon={construct} />
								<IonLabel>Tools</IonLabel>
							</IonTabButton>
							<IonTabButton tab="settings" href="/settings">
								<IonIcon icon={settings} />
								<IonLabel>Settings</IonLabel>
							</IonTabButton>
						</IonTabBar>
					)}
				</IonTabs>
			</IonReactRouter>
		</IonApp>
	);
};

export default App;
