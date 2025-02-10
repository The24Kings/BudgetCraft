import React from 'react';
import { IonButton } from '@ionic/react';

import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

import { EntryCategories, DataValidation, parseJSON } from '../utilities/Categories';
import jsonData from '../categories.json';

import './Container.css';

interface ContainerProps {
    name: string;
}

const DebugContainer: React.FC<ContainerProps> = ({ name }) => {
    /**
    *  Function to test Firebase connection
    */
    const testFirebaseConnection = async () => {
        try {
            const docRef = await addDoc(collection(firestore, 'testCollection'), {
                testField: 'Hello Firebase!',
                timestamp: new Date().toISOString(),
            });
            console.log('Document written with ID:', docRef.id);
            alert(`Document written with ID: ${docRef.id}`);
        } catch (error: any) {
            const errorMessage = error?.message || 'An unknown error occurred';
            console.error('Error adding document:', error);
            alert(`Error: ${errorMessage}`);
        }
    };

    // Button click handler
    const handleButtonClick = () => {
        console.log('Sending Data to Firebase...');
        testFirebaseConnection();
    };

    // Parse the categories from the JSON file
    var data = parseJSON(jsonData); // Mutable JSON data

    return (
        <div className="container">
            {/* Button with a click handler */}
            <IonButton size="large" color="danger" onClick={handleButtonClick}>
                Send Data
            </IonButton>

            {/* Display the data validation */}
            <DataValidation categories={data}/>

            {/* Display the categories */}
            <EntryCategories categories={data} />
        </div>
    );
};

export default DebugContainer;
