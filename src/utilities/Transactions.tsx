import { useEffect, useRef, useState } from "react";
import { Category, parseJSON } from "./Categories";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { getApp } from "firebase/app";
import { v4 as uuidv4 } from "uuid";

import {
    IonButton,
    IonContent,
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
    IonTitle,
    IonToolbar
} from "@ionic/react";
import { add } from "ionicons/icons";

class Transaction {
    constructor(
        public id: string,
        public type: string,
        public category: string,
        public subCategory: string,
        public date: string,
        public description: string,
        public amount: string
    ) {}
}

interface TransactionProps {
    categories: Category[];
    json: Object;
}

const Transactions: React.FC<TransactionProps> = ({ categories, json }) => {
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    const [type, setType] = useState("");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    const date = new Date().toISOString().split("T")[0];
    const modal = useRef<HTMLIonModalElement>(null);

    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (type) {
            const parsedCategories = parseJSON(json); // Store parsed data
            console.log(
                "All Parsed Categories:",
                parsedCategories.map((cat) => ({ name: cat.Name, type: cat.Type }))
            );

            const filtered = parsedCategories.filter((cat) => {
                console.log(`Checking category: ${cat.Name}, Type: ${cat.Type}`);
                return (
                    (type.toLowerCase() === "expense" && cat.Type.toLowerCase() === "expenses") ||
                    (type.toLowerCase() === "income" && cat.Type.toLowerCase() === "income")
                );
            });

            console.log(`Filtered Categories for ${type}:`, filtered);
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories([]);
        }
    }, [type]);

    
    const selectedCategory = categories.find((cat) => cat.getCategory() === category);

    const isFormValid = type && category && subCategory && amount.match(/^\d+(\.\d{1,2})?$/);

    const handleCategorySelect = (categoryName: string) => {
        setCategory(categoryName);
        setStep(2);
    };

    const handleAddTransaction = () => {
        if (!isFormValid) return;

        const newTransaction = new Transaction(
            uuidv4(),
            type,
            category,
            subCategory,
            date,
            description,
            amount
        );

        console.log("Transaction added:", newTransaction);
        saveTransactionToDatabase(newTransaction);

        resetForm();
        setTimeout(() => {
            setShowModal(false);
            setStep(1);
        }, 100); // Small delay to prevent UI glitches
    };

    const resetForm = () => {
        setType("");
        setCategory("");
        setSubCategory("");
        setDescription("");
        setAmount("");
    };

    const saveTransactionToDatabase = async (transaction: Transaction) => {
        try {
            const db = getFirestore(getApp()); // Get Firestore instance
            const docRef = await addDoc(collection(db, "test-transaction"), {
                id: transaction.id,
                type: transaction.type,
                category: transaction.category,
                subCategory: transaction.subCategory,
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
                <IonFabButton
                    onClick={() => {
                        resetForm();
                        setStep(1);
                        setShowModal(true);
                    }}
                >
                    <IonIcon icon={add} />
                </IonFabButton>
            </IonFab>

            {/* Add Transaction Popup */ }
            < IonModal
                id = "custom-category-modal"
                isOpen = { showModal }
                onDidDismiss = {() => {
                    resetForm();
                    setStep(1);
                    setShowModal(false);
                }}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle className="ion-text-center">
                            {step === 1 ? "Select Type & Category" : "Enter Details"}
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding">
                    {step === 1 ? (
                        <>
                            <IonItem>
                                <IonLabel>Type</IonLabel>
                                <IonSelect
                                    value={type}
                                    onIonChange={(e) => {
                                        setType(e.detail.value);
                                        setCategory(""); // Reset category when type changes
                                        console.log("Selected Type:", e.detail.value);
                                    }}
                                >
                                    <IonSelectOption value="Income">Income</IonSelectOption>
                                    <IonSelectOption value="Expense">Expense</IonSelectOption>
                                </IonSelect>
                            </IonItem>

                            <IonItem>
                                <IonLabel>Category</IonLabel>
                                <IonSelect
                                    value={category}
                                    onIonChange={(e) => handleCategorySelect(e.detail.value)}
                                    disabled={!type || filteredCategories.length === 0}
                                >
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((cat) => (
                                            <IonSelectOption
                                                key={cat.getCategory()}
                                                value={cat.getCategory()}
                                            >
                                                {cat.getCategory()}
                                            </IonSelectOption>
                                        ))
                                    ) : (
                                        <IonSelectOption disabled>
                                            No Categories Available
                                        </IonSelectOption>
                                    )}
                                </IonSelect>
                            </IonItem>
                            <IonButton
                                expand="full"
                                color="danger"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </IonButton>
                        </>
                    ) : (
                        <>
                            <IonItem>
                                <IonLabel>Subcategory</IonLabel>
                                <IonSelect
                                    value={subCategory}
                                    onIonChange={(e) => setSubCategory(e.detail.value)}
                                >
                                    {selectedCategory?.getSubcategories().map((sub) => (
                                        <IonSelectOption key={sub.Name} value={sub.Name}>
                                            {sub.Name}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Amount: </IonLabel>
                                <IonInput
                                    type="number"
                                    value={amount}
                                    onIonInput={(e) => {
                                        let value = e.detail.value!;

                                        // Valid number format
                                        if (value) {
                                            // Remove any non-numeric characters except for decimal point
                                            value = value.replace(/[^0-9.]/g, "");

                                            // Restrict to two decimal places
                                            if (value.includes(".")) {
                                                const parts = value.split(".");
                                                if (parts[1]?.length > 2) {
                                                    value = `${parts[0]}.${parts[1].substring(0, 2)}`;
                                                }
                                            }

                                            // Make sure value is at least 0.01
                                            if (parseFloat(value) < 0.01) {
                                                value = "0.01";
                                            }
                                        }

                                        setAmount(value);
                                    }}
                                />
                            </IonItem>
                            <IonItem>
                                <IonLabel>Date: </IonLabel>
                                <IonInput value={date} disabled />
                            </IonItem>
                            <IonItem>
                                <IonLabel>Description: </IonLabel>
                                <IonInput
                                    value={description}
                                    onIonInput={(e) => {
                                        let inputValue = e.detail.value!;
                                        if (inputValue.length > 100) {
                                            inputValue = inputValue.substring(0, 100); // Trim input if over limit
                                        }
                                        setDescription(inputValue);
                                    }}
                                    maxlength={100} // Prevents additional characters in UI
                                />
                            </IonItem>
                            <IonButton
                                expand="full"
                                color="success"
                                onClick={handleAddTransaction}
                                disabled={!isFormValid}
                            >
                                Confirm
                            </IonButton>
                            <IonButton expand="full" onClick={() => setStep(1)}>
                                Back
                            </IonButton>
                        </>
                    )}
                </IonContent>
            </IonModal >
        </div>
    );
};

export default Transactions;