import * as React from 'react';
import * as firebase from 'firebase';

type FirebaseAppContextValue = firebase.app.App;

export const FirebaseAppContext = React.createContext<FirebaseAppContextValue | undefined>(undefined);

export function useFirebaseApp() {
  const firebaseApp = React.useContext(FirebaseAppContext);

  if (!firebaseApp) {
    throw new Error('Cannot call useFirebaseApp unless your component is within a FirebaseAppProvider');
  }

  return firebaseApp;
}
