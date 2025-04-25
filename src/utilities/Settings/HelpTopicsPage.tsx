import React from "react";
import {
	IonAccordion,
	IonAccordionGroup,
	IonBackButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonItem,
	IonLabel,
	IonPage,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import "../../pages/SettingsPage.css";

const HelpTopicsPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/settings" />
					</IonButtons>
					<IonTitle>Help Topics</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className="ion-padding">
				<div className="settings-container">
					<IonAccordionGroup expand="inset" className="help-accordion-group">
						{[
							{
								q: "How do I add a new income or expense subcategory?",
								a: "Go to the Add Transaction page. Under Category selection, click 'Add Subcategory' and type your new subcategory."
							},
							{
								q: "How do I edit a transaction?",
								a: "On the Home page, tap the transaction you want to edit, then choose 'Edit' and update your information."
							},
							{
								q: "How do I set a savings goal?",
								a: "On the Goals page, tap 'Add Goal' and enter the description, target amount, and optionally a deadline."
							},
							{
								q: "How do I turn on notifications?",
								a: "Go to Settings → Notification Settings. Toggle on the reminders or alerts you want to receive."
							},
							{
								q: "Can I change my user name and user ID?",
								a: "You can change your display name in Settings → Edit Personal Info. Your user ID (email login) cannot be changed."
							},
							{
								q: "How do I change my password?",
								a: "Go to Settings → Edit Personal Info → Change Password. You will receive a reset email."
							},
							{
								q: "How does BudgetCraft use my personal data?",
								a: "Your personal data is securely stored and only used for improving your BudgetCraft experience. It is never sold."
							}
						].map((item, index) => (
							<IonAccordion key={index} value={`q${index}`}>
								<IonItem
									slot="header"
									className="settings-item help-accordion-header"
								>
									<IonLabel>{item.q}</IonLabel>
								</IonItem>
								<div className="ion-padding" slot="content">
									{item.a}
								</div>
							</IonAccordion>
						))}
					</IonAccordionGroup>
				</div>
			</IonContent>
		</IonPage>
	);
};

export default HelpTopicsPage;
