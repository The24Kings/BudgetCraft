import { firestore } from "../utilities/FirebaseConfig";
import { addDoc, collection } from "firebase/firestore";

const testFirebaseConnection = async () => {
    try {
        const docRef = await addDoc(collection(firestore, "testCollection"), {
            testField: "Hello Firebase!",
            timestamp: new Date().toISOString()
        });

        console.log("Document written with ID:", docRef.id);
        alert(`Document written with ID: ${docRef.id}`);

        return docRef.id;
    } catch (error: any) {
        const errorMessage = error?.message || "An unknown error occurred";
        
        console.error("Error adding document:", error);
        alert(`Error: ${errorMessage}`);

        return null;
    }
};

export { testFirebaseConnection };