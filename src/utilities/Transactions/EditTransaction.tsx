import { useEffect, useRef, useState } from "react";
import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { chevronDown, chevronUp } from "ionicons/icons";
import {
	IonButton,
	IonContent,
	IonDatetime,
	IonDatetimeButton,
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
import "../Transactions/editTransactionModal.css";

interface EditTransactionProps {
	categories: Category[];
	userID: string;
	transaction: {
		id: string;
		type: string;
		category: string;
		subCategoryID: string;
		title: string;
		date: Timestamp;
		amount: number;
		description: string;
	};
	onClose: () => void;
	onUpdate: () => void;
}

const EditTransaction: React.FC<EditTransactionProps> = ({
	categories,
	userID,
	transaction,
	onClose,
	onUpdate
}) => {
	const [type, setType] = useState(transaction.type);
	const [category, setCategory] = useState(transaction.category);
	const [subCategoryID, setSubCategoryID] = useState(transaction.subCategoryID);
	const [title, setTitle] = useState(transaction.title);
	const [date, setDate] = useState(transaction.date);
	const [amount, setAmount] = useState(transaction.amount);
	const [description, setDescription] = useState(transaction.description);

	const [showCategoryEdit, setShowCategoryEdit] = useState(false);

	const input = useRef<HTMLIonInputElement>(null);

	const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

	useEffect(() => {
		if (!type) {
			setFilteredCategories([]);
			return;
		}

		const filtered = categories.filter((cat) => cat.getType() === type);
		setFilteredCategories(filtered);
	}, [type, categories]);

	const validateAmount = (value: string) => {
		const decimalIndex = value.indexOf(".");
		if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
			setAmount(parseFloat(value.substring(0, decimalIndex + 3)));
		} else {
			setAmount(parseFloat(value));
		}
	};

	const validateTitle = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;
		const filteredValue = value.replace(/[^a-zA-Z0-9\s\-\(\)_\/']+/g, "").replace(/\s+/g, " ");
		setTitle(filteredValue);
		if (input.current) {
			input.current.value = filteredValue;
		}
	};

	const handleUpdateTransaction = async () => {
		try {
			const transactionRef = doc(firestore, `users/${userID}/transactions/${transaction.id}`);
			await updateDoc(transactionRef, {
				type,
				category,
				subCategoryID,
				title,
				date,
				description,
				amount
			});
			onUpdate();
			onClose();
		} catch (error) {
			console.error("Failed to update transaction...", error);
		}
	};

	return (
		<IonModal isOpen={true} onDidDismiss={onClose} className="edit-transaction-modal">
			<IonHeader>
				<IonToolbar className="edit-transaction-header">
					<IonButton
						color="fab"
						slot="start"
						onClick={onClose}
						className="add-transaction-button"
					>
						Cancel
					</IonButton>
					<IonTitle className="ion-text-center">Edit Transaction</IonTitle>
					<IonButton
						color="fab"
						slot="end"
						disabled={!title || !amount || !category}
						onClick={handleUpdateTransaction}
						className="add-transaction-button"
					>
						Save
					</IonButton>
				</IonToolbar>
			</IonHeader>

			<IonContent className="ion-padding">
				<IonItem>
					<IonLabel>Type: </IonLabel>
					<IonInput value={type} readonly />
				</IonItem>

				<IonItem>
					<IonLabel>Category: </IonLabel>
					<IonInput value={category} readonly />
					<IonButton
						size="small"
						color="fab"
						className="add-transaction-button"
						onClick={() => setShowCategoryEdit(!showCategoryEdit)}
					>
						<IonIcon icon={showCategoryEdit ? chevronUp : chevronDown} />
					</IonButton>
				</IonItem>

				{showCategoryEdit && (
					<>
						{/* Removed IonSelect for type to prevent changing expense/income */}
						<EntryCategories
							disableHeader={true}
							categories={filteredCategories}
							hideDelete={true}
							onSelect={(category, subCategory) => {
								setCategory(category);
								categories.forEach((cat) => {
									if (cat.name === category) {
										setSubCategoryID(
											cat.Subcategories.find(
												(subCat) => subCat.name === subCategory
											)?.id || ""
										);
									}
								});
							}}
						/>
					</>
				)}

				<IonItem>
					<IonLabel>Title: </IonLabel>
					<IonInput value={title} onIonInput={validateTitle} maxlength={20} ref={input} />
				</IonItem>

				<IonItem lines="none" className="date-picker-item">
					<div className="date-picker-inline">
						<IonLabel>Date:</IonLabel>
						<IonDatetimeButton datetime="datetime" />
					</div>
				</IonItem>
				<IonModal keepContentsMounted={true}>
					<IonDatetime
						id="datetime"
						onIonChange={(e) => {
							const selectedDate = new Date(e.detail.value as string);
							selectedDate.setMinutes(
								selectedDate.getMinutes() + selectedDate.getTimezoneOffset()
							);
							setDate(Timestamp.fromDate(selectedDate));
						}}
						presentation="date"
						value={
							typeof date === "object" && "toDate" in date
								? date.toDate().toISOString()
								: ""
						}
					/>
				</IonModal>

				<IonItem id="transaction-amount">
					<IonLabel>Amount: </IonLabel>
					<IonInput
						type="number"
						value={amount}
						onIonInput={(e) => validateAmount(e.detail.value!)}
						maxlength={10}
					/>
				</IonItem>

				<IonItem className="ion-padding-start ion-padding-end ion-margin-bottom ion-margin-top">
					<IonTextarea
						placeholder="Description (Optional)"
						value={description}
						rows={10}
						onIonInput={(e) => setDescription(e.detail.value!)}
						maxlength={256}
					/>
				</IonItem>
			</IonContent>
		</IonModal>
	);
};

export default EditTransaction;
