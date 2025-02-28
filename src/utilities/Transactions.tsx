import { useEffect, useRef, useState } from "react";
import { getApp } from "firebase/app";
import { addDoc, collection, getFirestore } from "firebase/firestore";
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
import { Category, EntryCategories, parseJSON } from "./Categories";

class Transaction {
	constructor(
		public id: string,
		public type: string,
		public category: string,
		public subCategory: string,
		public title: string,
		public date: string,
		public description: string,
		public amount: number
	) {}
}

interface TransactionProps {
	categories: Category[];
}

const Transactions: React.FC<TransactionProps> = ({ categories }) => {
	const [type, setType] = useState("");
	const [category, setCategory] = useState("");
	const [subCategory, setSubCategory] = useState("");
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toISOString());
    const [amount, setAmount] = useState(0.0);
	const [description, setDescription] = useState("");

	const modalStartRef = useRef<HTMLIonModalElement>(null);
	const modalSubmitRef = useRef<HTMLIonModalElement>(null);

	const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

	useEffect(() => {
		if (!type) {
			console.log("No Type selected. Resetting Categories.");
			setFilteredCategories([]);

			return;
		}

		console.log("Filtering Categories for:", type);

		// Filter categories based on selected type
		const filtered = categories.filter((cat) => {
			return cat.getType() === type;
		});

		console.log(`Filtered Categories for ${type}:`, filtered);

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

	const handleAddTransaction = () => {
		const newTransaction = new Transaction(
			uuidv4(),
			type,
			category,
			subCategory,
			title,
			date,
			description,
			amount
		);

		console.log("Transaction added:", newTransaction);
		saveTransactionToDatabase(newTransaction);

		resetForm();

		modalSubmitRef.current?.dismiss();
	};

	const resetForm = () => {
        setDate(new Date().toISOString());
        setTitle("");
		setType("");
		setCategory("");
		setSubCategory("");
		setDescription("");
		setAmount(null);
	};

	const saveTransactionToDatabase = async (transaction: Transaction) => {
		try {
			const db = getFirestore(getApp()); // Get Firestore instance
			const docRef = await addDoc(collection(db, "test-transaction"), {
				id: transaction.id,
				type: transaction.type,
				category: transaction.category,
				subCategory: transaction.subCategory,
				title: transaction.title,
				date: transaction.date,
				description: transaction.description,
				amount: transaction.amount
			});

			console.log("Transaction successfully saved to Firestore with ID:", docRef.id);
		} catch (error) {
			console.error("Error saving transaction to Firestore:", error);
		}
	};

	return (
		<div className="container">
			<IonFab className="add-tansaction" vertical="bottom" horizontal="end" slot="fixed">
				<IonFabButton id="add-transaction" onClick={() => resetForm()}>
					<IonIcon icon={add} />
				</IonFabButton>
			</IonFab>

			{/* Add Transaction Popup */}
			<IonModal id="custom-category-modal" ref={modalStartRef} trigger="add-transaction">
				<IonHeader>
					<IonToolbar>
						<IonTitle className="ion-text-center">New Transaction</IonTitle>
					</IonToolbar>
				</IonHeader>

				<IonContent className="ion-padding">
                    <IonItem className="ion-margin-bottom ion-padding-start ion-padding-end">
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
						onSelect={(category, subCategory) => {
							setCategory(category);
							setSubCategory(subCategory);

							// Close and open the next modal
							modalStartRef.current?.dismiss();
							setTimeout(() => {
								modalSubmitRef.current?.present();
							}, 200); // Small delay to prevent UI glitches
						}}
					/>
				</IonContent>
			</IonModal>

			<IonModal id="custom-category-modal" ref={modalSubmitRef}>
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
							disabled={!title || !amount || !category || !subCategory}
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
                                onIonInput={(e) => {
                                    setTitle(e.detail.value!);
                                }}
                                maxlength={20} // Prevents additional characters in UI
                            />
                        </IonItem>
                        <IonDatetimeButton className="ion-margin ion-justify-content-start" datetime="datetime"></IonDatetimeButton>
                        <IonModal keepContentsMounted={true}>
                            <IonDatetime
                                id="datetime"
                                value={date}
                                onIonChange={(e) => {
                                    setDate(Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value!);
                                }}
                                presentation="date-time"
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
							rows={6}
							onIonInput={(e) => setDescription(e.detail.value!)}
							maxlength={100} // Prevents additional characters in UI
						/>
					</IonItem>
				</IonContent>
			</IonModal>
		</div>
	);
};

/*


*/

export default Transactions;
