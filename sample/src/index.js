import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import './app.css';
import { FirebaseAppProvider } from '@protrex/react-firebase';
import 'firebase/performance';

const config = {
  apiKey: 'AIzaSyA23mJaViPGWM9_AT-KsMgGPpPQub4-kJY',
  authDomain: 'react-firebase-3a89f.firebaseapp.com',
  databaseURL: 'https://react-firebase-3a89f.firebaseio.com',
  projectId: 'react-firebase-3a89f',
  storageBucket: 'react-firebase-3a89f.appspot.com',
  messagingSenderId: '1084140470201',
  appId: '1:1084140470201:web:d2e6b40530dcea847f4068'
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FirebaseAppProvider firebaseConfig={config}>
      <App />
    </FirebaseAppProvider>
  </StrictMode>
); // https://reactjs.org/docs/strict-mode.html

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
