import { create } from "zustand";
import { firestore } from "../utilities/FirebaseConfig";
import { addDoc, getDocs, collection, setDoc, doc } from "firebase/firestore";

// Courtesy of https://github.com/Shailendra1703/fb/
interface FirestoreState {
    documents: any[];
    isLoading: boolean;
    error: string | null;
    addDocument: (collectionName: string, data: any) => Promise<void>;
    getDocuments: (collectionName: string) => Promise<void>;
    setDocument: (collectionName: string, data: any) => Promise<void>;
}

const useFirestoreStore = create<FirestoreState>((set) => ({
    documents: [],
    isLoading: false,
    error: null,

    addDocument: async (collectionName: string, data: any) => {
        set({ isLoading: true, error: null });

        try {
            const docRef = await addDoc(collection(firestore, collectionName), data);

            set((state) => ({
                documents: [...state.documents, { id: docRef.id, ...data }],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    getDocuments: async (collectionName: string) => {
        set({ isLoading: true, error: null });
        
        try {
            const querySnapshot = await getDocs(collection(firestore, collectionName));
            const docs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            set({ documents: docs, isLoading: false });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    setDocument: async (collectionName: string, data: any) => {
        set({ isLoading: true, error: null });

        try {
            await setDoc(doc(firestore, collectionName, data.id), data);

            set((state) => ({
                documents: state.documents.map((doc) =>
                    doc.id === data.id ? { ...doc, ...data } : doc
                ),
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },
}));

export default useFirestoreStore;