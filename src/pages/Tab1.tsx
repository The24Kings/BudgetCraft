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

function Tab1() {
  const handleButtonClick = () => {
    console.log('Data Sent!');
    alert('Data Sent!');
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
