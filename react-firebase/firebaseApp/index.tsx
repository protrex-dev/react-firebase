import * as firebase from 'firebase/app';
import * as React from 'react';
import { FirebaseAppContext, useFirebaseApp } from './context';

// INVESTIGATE I don't like magic strings, can we have export this in js-sdk?
const DEFAULT_APP_NAME = '[DEFAULT]';

type Props = {
  firebaseApp?: firebase.app.App;
  firebaseConfig?: Object;
  appName?: string;
};

// The version number is substituted in as part of the build process
// See after.build.js for the substitution script
const version = '::__reactfirebaseversion__::';

const shallowEq = (a: Object, b: Object) => a == b || [...Object.keys(a), ...Object.keys(b)].every(key => a[key] == b[key]);

function FirebaseAppProvider(props: Props & { [key: string]: unknown }) {
  const { firebaseConfig, appName } = props;

  const firebaseApp: firebase.app.App =
    props.firebaseApp ||
    React.useMemo(() => {
      const existingApp = firebase.apps.find(app => app.name == (appName || DEFAULT_APP_NAME));
      if (existingApp) {
        if (shallowEq(existingApp.options, firebaseConfig)) {
          return existingApp;
        } else {
          throw `Does not match the options already provided to the ${appName || 'default'} firebase app instance, give this new instance a different appName.`;
        }
      } else {
        const reactVersion = React.version || 'unknown';
        firebase.registerVersion('react', reactVersion);
        firebase.registerVersion('react-firebase', version);
        return firebase.initializeApp(firebaseConfig, appName);
      }
    }, [firebaseConfig, appName]);

  return <FirebaseAppContext.Provider value={firebaseApp} {...props} />;
}

export * from './sdk';
export { FirebaseAppProvider, useFirebaseApp, version };
