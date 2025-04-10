import { useEffect, useRef, useState } from "react";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { add } from "ionicons/icons";
import { v4 as uuidv4 } from "uuid";
import { IonButton, IonContent, IonDatetime, IonDatetimeButton, IonFab, IonFabButton, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToggle, IonToolbar } from "@ionic/react";
import { Category, EntryCategories } from "../Categories";
import { firestore } from "../FirebaseConfig";


interface AddTransactionProps {
	categories: Category[];
	userID: string;
    onlyGoals?: boolean; // Optional prop to filter goals
}

const AddGoal: React.FC<AddTransactionProps> = ({ categories, userID, onlyGoals = false }) => {
	const [type, setType] = useState("");
	const [category, setCategory] = useState("");
	const [subCategoryID, setSubCategoryID] = useState("");
	const [targetDate, setTargetDate] = useState(Timestamp.now());
	const [recurring, setRecuring] = useState(false);
	const [reminder, setReminder] = useState(false);
	const [remindDate, setRemindDate] = useState(Timestamp.now());
	const [goal, setGoal] = useState(0.0);
	const [description, setDescription] = useState("");

	const modalStartRef = useRef<HTMLIonModalElement>(null);
	const modalSubmitRef = useRef<HTMLIonModalElement>(null);
	const input = useRef<HTMLIonInputElement>(null);

	const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

	useEffect(() => {
		if (!type) {
			setFilteredCategories([]);
			return;
		}

		// Filter categories based on selected type
		const filtered = categories.filter((cat) => {
			return cat.getType() === type;
		});

		setFilteredCategories(filtered);
	}, [type]);

	/*
	 * Validates the amount input to ensure it is a valid number. Only allows up to 2 decimal places.
	 */
	function validateAmount(value: string) {
		const decimalIndex = value.indexOf(".");

		if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
			setGoal(parseFloat(value.substring(0, decimalIndex + 3)));
		} else {
			setGoal(parseFloat(value));
		}
	}

	/*
	 * Adds the transaction to the Firestore database.
	 */
	const handleAddGoal = async () => {
		const goalID = uuidv4();

		try {
			const docRef = collection(firestore, `users/${userID}/budget/`);
			const goalRef = doc(docRef, goalID);

			await setDoc(goalRef, {
				createdAt: Timestamp.now(),
				targetDate: targetDate,
				reminderDate: reminder ? remindDate : null,
				type: type,
				category: category,
				subCategoryID: subCategoryID,
                budgetItem: onlyGoals ? false : true,
				recurring: recurring,
				reminder: reminder,
				goal: goal,
				description: description,
				transactionIDs: [], // Initialize with an empty array; Fill as new transactions are added
			});
		} catch (error) {
			console.error("Failed to add goal...", error);
		} finally {
			console.log("Goal added successfully with ID:", goalID);
		}

		openForm();

		modalSubmitRef.current?.dismiss();
	};

	// Resets the form to its default values.
	const openForm = () => {
		setType("");
		setCategory("");
		setSubCategoryID("");
		setTargetDate(Timestamp.now());
		setRecuring(false);
		setReminder(false);
		setRemindDate(Timestamp.now());
		setGoal(0.0);
		setDescription("");
	};

	return (
		<div className="container">
			<IonFab vertical="bottom" horizontal="end" slot="fixed">
				<IonFabButton
					id="add-goal"
					onClick={() => {
						openForm();
						modalStartRef.current?.present();
					}}
				>
					<IonIcon icon={add} />
				</IonFabButton>
			</IonFab>

			{/* Add Transaction Popup */}
			<IonModal id="add-goal-modal" ref={modalStartRef}>
				<IonHeader>
					<IonToolbar>
						<IonTitle className="ion-text-center">
							New {onlyGoals ? "Goal" : "Budget"}
						</IonTitle>
					</IonToolbar>
				</IonHeader>

				<IonContent className="ion-padding">
					<IonItem className="ion-margin-bottom">
						<IonSelect
							placeholder="Select Type"
							value={type}
							onIonChange={(e) => {
								setType(e.detail.value);
								setCategory(""); // Reset category when type changes
							}}
						>
							{/* Get Each Type (Unique) as options */}
							{[...new Set(categories.map((category) => category.getType()))].map(
								(type) => (
									<IonSelectOption key={type} value={type}>
										{type}
									</IonSelectOption>
								)
							)}
						</IonSelect>
					</IonItem>

					<EntryCategories
						disableHeader={true}
						categories={filteredCategories}
						hideDelete={true} // Hide the delete button on custom subcategories when selecting subcategories for transactions
						onSelect={(category, subCategory) => {
							setCategory(category);

							categories.forEach((cat) => {
								if (cat.name === category) {
									setSubCategoryID(
										cat.Subcategories.find(
											(subCat) => subCat.name === subCategory
										).id
									);
								}
							});

							// Close and open the next modal
							modalStartRef.current?.dismiss();
							setTimeout(() => {
								modalSubmitRef.current?.present();
							}, 200); // Small delay to prevent UI glitches
						}}
					/>
				</IonContent>
			</IonModal>

			<IonModal id="add-goal-modal" ref={modalSubmitRef}>
				<IonHeader>
					<IonToolbar>
						<IonButton
							fill="default"
							slot="start"
							onClick={() => {
								modalSubmitRef.current?.dismiss();

								setTimeout(() => {
									modalStartRef.current?.present();
								}, 200); // Small delay to prevent UI glitches
							}}
						>
							Back
						</IonButton>
						<IonTitle className="ion-text-center">
							New {onlyGoals ? "Goal" : "Budget"}
						</IonTitle>
						<IonButton
							fill="default"
							slot="end"
							disabled={!goal || !category} // Disable the confirm button if any of the fields are empty
							onClick={handleAddGoal}
						>
							Confirm
						</IonButton>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					<div className="ion-padding-start ion-padding-end ion-margin-bottom ion-margin-top">
						<IonItem>
							{!onlyGoals && (
								<IonToggle
									className="ion-padding-end"
									justify="start"
									labelPlacement="stacked"
									enableOnOffLabels
									checked={recurring}
									onIonChange={(e) => setRecuring(e.detail.checked)}
								>
									Recurring
								</IonToggle>
							)}
							<IonToggle
								className="ion-padding-end"
								justify="end"
								labelPlacement="stacked"
								enableOnOffLabels
								checked={reminder}
								onIonChange={(e) => setReminder(e.detail.checked)}
							>
								Reminder
							</IonToggle>
						</IonItem>
						{!recurring && (
							<IonItem>
								<IonLabel>Target: </IonLabel>
								<IonDatetimeButton
									className="ion-margin"
									datetime="target-datetime"
								/>
							</IonItem>
						)}
						{reminder && (
							<IonItem>
								<IonLabel>Reminder: </IonLabel>
								<IonDatetimeButton
									className="ion-margin"
									datetime="reminder-datetime"
								/>
							</IonItem>
						)}
						<IonModal keepContentsMounted={true}>
							<IonDatetime
								id="target-datetime"
								onIonChange={(e) => {
									const selectedDate = new Date(e.detail.value as string);
									selectedDate.setMinutes(
										selectedDate.getMinutes() + selectedDate.getTimezoneOffset()
									); // Adjust for timezone offset
									setTargetDate(Timestamp.fromDate(selectedDate));
								}}
								presentation="date"
							/>
						</IonModal>
						<IonModal keepContentsMounted={true}>
							<IonDatetime
								id="reminder-datetime"
								onIonChange={(e) => {
									const selectedDate = new Date(e.detail.value as string);
									selectedDate.setMinutes(
										selectedDate.getMinutes() + selectedDate.getTimezoneOffset()
									); // Adjust for timezone offset
									setRemindDate(Timestamp.fromDate(selectedDate));
								}}
								presentation="date"
							/>
						</IonModal>
						<IonItem id="transaction-amount">
							<IonLabel>Target: </IonLabel>
							<IonInput
								type="number"
								value={goal}
								onIonInput={(e) => validateAmount(e.detail.value!)}
								maxlength={10} // Prevents additional characters in UI
							/>
						</IonItem>
					</div>
					<IonItem className="ion-padding-start ion-padding-end ion-margin-bottom ion-margin-top">
						<IonTextarea
							placeholder="Description (Optional)"
							value={description}
							rows={6}
							onIonInput={(e) => setDescription(e.detail.value!)} //TODO: Add validation for description
							maxlength={128} // Prevents additional characters in UI
						/>
					</IonItem>
				</IonContent>
			</IonModal>
		</div>
	);
};

export default AddGoal;