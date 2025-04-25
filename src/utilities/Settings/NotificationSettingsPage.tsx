import React, { useState } from "react";
import {
	IonBackButton,
	IonButton,
	IonButtons,
	IonCheckbox,
	IonContent,
	IonHeader,
	IonIcon,
	IonItem,
	IonLabel,
	IonModal,
	IonPage,
	IonTitle,
	IonToggle,
	IonToolbar
} from "@ionic/react";
import "../../pages/SettingsPage.css";
import { chevronBack } from "ionicons/icons";

const NotificationSettingsPage: React.FC = () => {
	const [showRemindersModal, setShowRemindersModal] = useState(false);
	const [showAlertsModal, setShowAlertsModal] = useState(false);

	// Reminder toggles
	const [remindBills, setRemindBills] = useState(false);
	const [remindGoals, setRemindGoals] = useState(false);
	const [remindBillOptions, setRemindBillOptions] = useState<string[]>([]);
	const [remindGoalOptions, setRemindGoalOptions] = useState<string[]>([]);

	// Alert toggles
	const [lowFunds, setLowFunds] = useState(false);
	const [largeTransactions, setLargeTransactions] = useState(false);
	const [meetGoals, setMeetGoals] = useState(false);
	const [lowFundsOptions, setLowFundsOptions] = useState<string[]>([]);
	const [largeTransactionOptions, setLargeTransactionOptions] = useState<string[]>([]);

	const toggleSelect = (value: string, selected: string[], setter: (v: string[]) => void) => {
		if (selected.includes(value)) {
			setter(selected.filter((item) => item !== value));
		} else {
			setter([...selected, value]);
		}
	};

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton defaultHref="/settings" />
					</IonButtons>
					<IonTitle>Notification Settings</IonTitle>
				</IonToolbar>
			</IonHeader>

			<IonContent className="ion-padding">
				<div className="settings-container">
					<IonItem
						button
						detail={true}
						className="settings-item"
						onClick={() => setShowRemindersModal(true)}
					>
						<IonLabel>Reminders</IonLabel>
					</IonItem>

					<IonItem
						button
						detail={true}
						className="settings-item"
						onClick={() => setShowAlertsModal(true)}
					>
						<IonLabel>Alerts</IonLabel>
					</IonItem>
				</div>

				{/* Reminders Modal */}
				<IonModal
					isOpen={showRemindersModal}
					onDidDismiss={() => setShowRemindersModal(false)}
				>
					<IonHeader>
						<IonToolbar>
							<IonButtons slot="start">
								<IonButton
									fill="clear"
									onClick={() => setShowRemindersModal(false)}
								>
									<IonIcon icon={chevronBack} slot="icon-only" />
								</IonButton>
							</IonButtons>
							<IonTitle>Reminders</IonTitle>
						</IonToolbar>
					</IonHeader>
					<IonContent className="ion-padding">
						<p>
							These settings are global. You must enable reminders in each individual
							budget item you wish to receive notifications for.
						</p>

						<IonItem className="toggle-mint">
							<IonLabel>Remind me to pay my bills:</IonLabel>
							<IonToggle
								checked={remindBills}
								onIonChange={(e) => setRemindBills(e.detail.checked)}
							/>
						</IonItem>

						{remindBills && (
							<>
								<IonItem>
									<IonLabel>Send email reminder:</IonLabel>
								</IonItem>
								{[
									"1 day before due date",
									"3 days before due date",
									"1 week before due date"
								].map((option) => (
									<IonItem key={option}>
										<IonCheckbox
											className="checkbox-mint"
											checked={remindBillOptions.includes(option)}
											onIonChange={() =>
												toggleSelect(
													option,
													remindBillOptions,
													setRemindBillOptions
												)
											}
										/>
										<IonLabel className="ion-padding-start">{option}</IonLabel>
									</IonItem>
								))}
							</>
						)}

						<IonItem className="toggle-mint">
							<IonLabel>Remind me to save for my goals:</IonLabel>
							<IonToggle
								checked={remindGoals}
								onIonChange={(e) => setRemindGoals(e.detail.checked)}
							/>
						</IonItem>

						{remindGoals && (
							<>
								<IonItem>
									<IonLabel>Send email reminder:</IonLabel>
								</IonItem>
								{["Monthly on the 1st day of the month", "Weekly on Fridays"].map(
									(option) => (
										<IonItem key={option}>
											<IonCheckbox
												className="checkbox-mint"
												checked={remindGoalOptions.includes(option)}
												onIonChange={() =>
													toggleSelect(
														option,
														remindGoalOptions,
														setRemindGoalOptions
													)
												}
											/>
											<IonLabel className="ion-padding-start">
												{option}
											</IonLabel>
										</IonItem>
									)
								)}
							</>
						)}
					</IonContent>
				</IonModal>

				{/* Alerts Modal */}
				<IonModal isOpen={showAlertsModal} onDidDismiss={() => setShowAlertsModal(false)}>
					<IonHeader>
						<IonToolbar>
							<IonButtons slot="start">
								<IonButton fill="clear" onClick={() => setShowAlertsModal(false)}>
									<IonIcon icon={chevronBack} slot="icon-only" />
								</IonButton>
							</IonButtons>
							<IonTitle>Alerts</IonTitle>
						</IonToolbar>
					</IonHeader>
					<IonContent className="ion-padding">
						<p>
							These settings are global. You must enable reminders in each individual
							budget item you wish to receive notifications for.
						</p>

						<IonItem className="toggle-mint">
							<IonLabel>Notify me when funds are low:</IonLabel>
							<IonToggle
								checked={lowFunds}
								onIonChange={(e) => setLowFunds(e.detail.checked)}
							/>
						</IonItem>

						{lowFunds && (
							<>
								<IonItem>
									<IonLabel>Send email reminder when:</IonLabel>
								</IonItem>
								{[
									"A budget item has negative funds",
									"A budget item has 10% remaining funds",
									"A budget has 20% remaining funds"
								].map((option) => (
									<IonItem key={option}>
										<IonCheckbox
											className="checkbox-mint"
											checked={lowFundsOptions.includes(option)}
											onIonChange={() =>
												toggleSelect(
													option,
													lowFundsOptions,
													setLowFundsOptions
												)
											}
										/>
										<IonLabel className="ion-padding-start">{option}</IonLabel>
									</IonItem>
								))}
							</>
						)}

						<IonItem className="toggle-mint">
							<IonLabel>
								Notify me when I enter unusually large transactions:
							</IonLabel>
							<IonToggle
								checked={largeTransactions}
								onIonChange={(e) => setLargeTransactions(e.detail.checked)}
							/>
						</IonItem>

						{largeTransactions && (
							<>
								<IonItem>
									<IonLabel>Send email reminder when:</IonLabel>
								</IonItem>
								{[
									"An income transaction exceeds $9999",
									"An expense transaction exceeds $5000"
								].map((option) => (
									<IonItem key={option}>
										<IonCheckbox
											className="checkbox-mint"
											checked={largeTransactionOptions.includes(option)}
											onIonChange={() =>
												toggleSelect(
													option,
													largeTransactionOptions,
													setLargeTransactionOptions
												)
											}
										/>
										<IonLabel className="ion-padding-start">{option}</IonLabel>
									</IonItem>
								))}
							</>
						)}

						<IonItem className="toggle-mint">
							<IonLabel>Notify me when I meet a goal:</IonLabel>
							<IonToggle
								checked={meetGoals}
								onIonChange={(e) => setMeetGoals(e.detail.checked)}
							/>
						</IonItem>
					</IonContent>
				</IonModal>
			</IonContent>
		</IonPage>
	);
};

export default NotificationSettingsPage;
