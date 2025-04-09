import { useEffect, useRef, useState } from "react";
import { collection, doc, getDocs, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { add } from "ionicons/icons";
import { v4 as uuidv4 } from "uuid";
import {
	IonButton,
	IonContent,
	IonDatetime,
	IonDatetimeButton,
	IonFab,
	IonFabButton,
	IonHeader,
	IonIcon,
	IonInput,
	IonItem,
	IonLabel,
	IonModal,
	IonSelect,
	IonSelectOption,
	IonTextarea,
	IonTitle,
	IonToolbar
} from "@ionic/react";
import { Category, EntryCategories } from "../Categories";
import { firestore } from "../FirebaseConfig";

//TODO: In the future this should probably be abstracted out into an object or a function that is called in the component
interface AddTransactionProps {
	categories: Category[];
	userID: string;
}

const AddTransactions: React.FC<AddTransactionProps> = ({ categories, userID }) => {
	const [type, setType] = useState("");
	const [category, setCategory] = useState("");
	const [subCategoryID, setSubCategoryID] = useState("");
	const [title, setTitle] = useState("");
	const [date, setDate] = useState(Timestamp.now());
	const [amount, setAmount] = useState(0.0);
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
			setAmount(parseFloat(value.substring(0, decimalIndex + 3)));
		} else {
			setAmount(parseFloat(value));
		}
	}

	/**
	 * Validate the input field
	 */
	const validateTitle = (event: Event) => {
		// Get the value from the input
		const value: string = (event.target as HTMLInputElement).value;

		// Scrub the input value and remove the extra spaces
		const filteredValue = value.replace(/[^a-zA-Z0-9\s\-\(\)_\/']+/g, "").replace(/\s+/g, " ");

		/**
		 * Update both the state and
		 * component to keep them in sync.
		 */
		setTitle(filteredValue);

		const inputCmp = input.current;

		if (inputCmp !== null) {
			inputCmp.value = filteredValue;
		}
	};

	/*
	 * Adds the transaction to the Firestore database.
	 */
	const handleAddTransaction = async () => {
		const transactionID = uuidv4();

		try {
			const docRef = collection(firestore, `users/${userID}/transactions/`);
			const transactionRef = doc(docRef, transactionID);

			await setDoc(transactionRef, {
				type: type,
				category: category,
				subCategoryID: subCategoryID,
				title: title,
				date: date,
				description: description,
				amount: amount
			});
		} catch (error) {
			console.error("Failed to add transaction...", error);
		} finally {
			console.log("Transaction added successfully with ID:", transactionID);

            // Check the goals and update them if they match the category and subcategory of the transaction
            const goalsRef = collection(firestore, `users/${userID}/budget`);
            
            // Query the goals collection to find matching goals
            const goalsSnapshot = await getDocs(goalsRef);

			const goals = goalsSnapshot.docs.map((doc) => {
				const data = doc.data() as { 
                    id: string;
                    category: string; 
                    subCategoryID: string; 
                    createdAt: Timestamp;
				    targetDate: Timestamp;
				    reminderDate: Timestamp | null;
                    type: string;
                    budgetItem: boolean;
                    recurring: boolean;
                    reminder: boolean;
                    goal: number;
                    description: string;
                    transactionIDs: string[] 
                };
				return {
					id: doc.id,
					...data
				};
			});

            // Update the transactionIDs of the goals that match the category and subcategory of the transaction
            goals.forEach(async (goal) => {
                if (goal.category === category && goal.subCategoryID === subCategoryID) {
                    await updateDoc(doc(goalsRef, goal.id), {
                        transactionIDs: [...goal.transactionIDs, transactionID]
                    });
                    console.log("Goal updated successfully with ID:", goal.id);
                }
            });

		}

		openForm();

		modalSubmitRef.current?.dismiss();
	};

	// Resets the form to its default values.
	const openForm = () => {
		setTitle("");
		setType("");
		setAmount(null);
		setCategory("");
		setSubCategoryID("");
		setDescription("");
		setDate(Timestamp.now());
	};

	return (
		<div className="container">
			<IonFab vertical="bottom" horizontal="end" slot="fixed">
				<IonFabButton id="add-transaction" onClick={() => { openForm(); modalStartRef.current?.present(); }}>
					<IonIcon icon={add} />
				</IonFabButton>
			</IonFab>

			{/* Add Transaction Popup */}
            <IonModal id="add-transact-modal" ref={modalStartRef}>
				<IonHeader>
					<IonToolbar>
						<IonTitle className="ion-text-center">New Transaction</IonTitle>
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
									setSubCategoryID(cat.Subcategories.find((subCat) => subCat.name === subCategory).id);
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

            <IonModal id="add-transact-modal" ref={modalSubmitRef}>
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
						<IonTitle className="ion-text-center">New Transaction</IonTitle>
						<IonButton
							fill="default"
							slot="end"
							disabled={!title || !amount || !category} // Disable the confirm button if any of the fields are empty
							onClick={handleAddTransaction}
						>
							Confirm
						</IonButton>
					</IonToolbar>
				</IonHeader>
				<IonContent>
					<div className="ion-padding-start ion-padding-end ion-margin-bottom ion-margin-top">
						<IonItem>
							<IonLabel>Title: </IonLabel>
							<IonInput
								value={title}
								onIonInput={(e) => validateTitle(e)}
								maxlength={20} // Prevents additional characters in UI
							/>
						</IonItem>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <IonDatetimeButton
                                className="ion-margin ion-justify-content-start"
                                datetime="datetime"
                            />
                        </div>
						<IonModal keepContentsMounted={true}>
							<IonDatetime
								id="datetime"
								onIonChange={(e) => {
									const selectedDate = new Date(e.detail.value as string);
									selectedDate.setMinutes(
										selectedDate.getMinutes() + selectedDate.getTimezoneOffset()
									); // Adjust for timezone offset
									setDate(Timestamp.fromDate(selectedDate));
								}}
								presentation="date"
							/>
						</IonModal>
						<IonItem id="transaction-amount">
							<IonLabel>Amount: </IonLabel>
							<IonInput
								type="number"
								value={amount}
								onIonInput={(e) => validateAmount(e.detail.value!)}
								maxlength={10} // Prevents additional characters in UI
							/>
						</IonItem>
					</div>
					<IonItem className="ion-padding-start ion-padding-end ion-margin-bottom ion-margin-top">
						<IonTextarea
							placeholder="Description (Optional)"
							value={description}
							rows={10}
							onIonInput={(e) => setDescription(e.detail.value!)} //TODO: Add validation for description
							maxlength={256} // Prevents additional characters in UI
						/>
					</IonItem>
				</IonContent>
			</IonModal>
		</div>
	);
};

export default AddTransactions;
