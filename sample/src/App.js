import React from 'react';
import AuthButton from './Auth';
import FirestoreCounter from './Firestore';
import Storage from './Storage';
import RealtimeDatabase from './RealtimeDatabase';
import RemoteConfig from './RemoteConfig';
import { useFirebaseApp, preloadAuth, preloadFirestore, preloadDatabase, preloadStorage, preloadRemoteConfig } from '@protrex/react-firebase';

const Fire = () => (
  <span role="img" aria-label="Fire">
    🔥
  </span>
);

const Card = ({ title, children }) => {
  return (
    <div className="card">
      <h1>
        {title} <Fire />
      </h1>
      {children}
    </div>
  );
};

// Our components will lazy load the
// SDKs to decrease their bundle size.
// Since we know that, we can start
// fetching them now
const preloadSDKs = firebaseApp => {
  return Promise.all([
    preloadFirestore({
      firebaseApp,
      setup(firestore) {
        return firestore().enablePersistence();
      }
    }),
    preloadDatabase({ firebaseApp }),
    preloadStorage({
      firebaseApp,
      setup(storage) {
        return storage().setMaxUploadRetryTime(10000);
      }
    }),
    preloadAuth({ firebaseApp }),
    preloadRemoteConfig({
      firebaseApp,
      setup(remoteConfig) {
        remoteConfig().settings = {
          minimumFetchIntervalMillis: 10000,
          fetchTimeoutMillis: 10000
        };
        return remoteConfig().fetchAndActivate();
      }
    })
  ]);
};

const App = () => {
  const firebaseApp = useFirebaseApp();

  // Kick off fetches for SDKs and data that
  // we know our components will eventually need.
  //
  // This is OPTIONAL but encouraged as part of the render-as-you-fetch pattern
  // https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense
  preloadSDKs(firebaseApp);

  return (
    <>
      <h1>
        <Fire /> ReactFirebase Demo <Fire />
      </h1>
      <div className="container">
        <Card title="Authentication">
          <AuthButton />
        </Card>

        <Card title="Firestore">
          <FirestoreCounter />
        </Card>

        <Card title="Storage">
          <Storage />
        </Card>

        <Card title="Realtime Database">
          <RealtimeDatabase />
        </Card>

        <Card title="Remote Config">
          <RemoteConfig />
        </Card>
      </div>
    </>
  );
};

export default App;
