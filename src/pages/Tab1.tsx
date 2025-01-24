import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig'; 


const Tab1: React.FC = () => {
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 1 page" />

        {/* Button with a click handler */}
        <IonButton size="large" color="danger" onClick={handleButtonClick}>
          Send Data
        </IonButton>
      </IonContent>
    </IonPage>
  );
}

export default Tab1;
