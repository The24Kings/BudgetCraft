import React from "react";
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
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";
/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";
/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const DEBUG = process.env.NODE_ENV === "development";

console.log("DEBUG:", DEBUG);

const App: React.FC = () => {
	return (
		<IonApp>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
						<Redirect exact path="/" to="/home" />

						{/* Different tabs for the app */}
						<Route path="/home" render={() => <LandingPage />} exact={true} />
						{DEBUG && <Route path="/debug" render={() => <DebugPage />} exact={true} />}
					</IonRouterOutlet>

					{/* Only show the tab bar if we are in development mode */}
					{DEBUG && (
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
