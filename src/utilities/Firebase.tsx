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

//TODO: Change this to push JSON to database if the user hasnt already done so, if they have, update the existing document
//FIXME: Causes a 400 error when trying to push the JSON to Firebase
/**
 * Push the categories to Firebase
 */
const pushCategoriesToFirebase = async (json: Object) => {
    try {
        const docData = {
            user_id: "testUser", //TODO: Change this to the actual user ID using Firebase Auth
            categories: json,
            timestamp: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(firestore, "user-categories"), docData);

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

export { testFirebaseConnection, pushCategoriesToFirebase };