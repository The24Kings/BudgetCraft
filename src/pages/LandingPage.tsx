import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';

import Container from '../components/Container';

import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Landing Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Landing Page</IonTitle>
          </IonToolbar>
        </IonHeader>
        <Container name="Landing Page" />
      </IonContent>
    </IonPage>
  );
}

export default LandingPage;
