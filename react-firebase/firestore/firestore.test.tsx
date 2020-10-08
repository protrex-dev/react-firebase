import { render, waitForElement, cleanup, act } from '@testing-library/react';

import { app } from 'firebase/app';
import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';
// @ts-ignore
import * as firebase from '@firebase/rules-unit-testing';
import { useFirestoreCollection, useFirestoreDocument } from '.';
import { FirebaseAppProvider, preloadFirestore, useFirestore } from '../firebaseApp';

describe('Firestore', () => {
  let app: import('firebase').app.App;

  beforeAll(async () => {
    app = firebase.initializeTestApp({
      projectId: '12345',
      databaseName: 'my-database',
      auth: { uid: 'alice' }
    }) as import('firebase').app.App;
    // TODO(davideast): Wait for rc and analytics to get included in test app
  });

  afterEach(async () => {
    cleanup();
    await firebase.clearFirestoreData({ projectId: '12345' });
  });

  test('sanity check - emulator is running', () => {
    // IF THIS TEST FAILS, MAKE SURE YOU'RE RUNNING THESE TESTS BY DOING:
    // yarn test

    return app
      .firestore()
      .collection('test')
      .add({ a: 'hello' });
  });

  describe('useFirestore', () => {
    it('awaits the preloadFirestore setup', async () => {
      const firebaseApp = firebase.initializeTestApp({
        projectId: '123456',
        databaseName: 'my-database',
        auth: { uid: 'alice' }
      });

      let firestore: firebase.firestore.Firestore;
      let preloadResolved = false;
      let preloadResolve: (v?: unknown) => void;

      preloadFirestore({
        // @ts-ignore: TODO: use the regular JS SDK instead of @firebase/testing
        firebaseApp,
        setup: () => {
          return new Promise(resolve => (preloadResolve = resolve));
        }
      }).then(() => (preloadResolved = true));

      const Firestore = () => {
        // @ts-ignore: TODO: use the regular JS SDK instead of @firebase/testing
        const firestore = useFirestore(firebaseApp);
        return <div data-testid="success"></div>;
      };

      const { getByTestId } = render(
        <FirebaseAppProvider firebaseApp={firebaseApp as app.App}>
          <React.Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
            <Firestore />
          </React.Suspense>
        </FirebaseAppProvider>
      );

      await waitForElement(() => getByTestId('fallback'));
      expect(preloadResolved).toEqual(false);

      await waitForElement(() => getByTestId('success'), { timeout: 2000 })
        .then(() => fail('expected throw'))
        .catch(() => {});
      expect(preloadResolved).toEqual(false);

      preloadResolve();

      await waitForElement(() => getByTestId('success'));
      expect(preloadResolved).toEqual(true);
    });
  });

  describe('useFirestoreDocument', () => {
    it('can get a Firestore document [TEST REQUIRES EMULATOR]', async () => {
      const mockData = { a: 'hello' };

      const ref = app
        .firestore()
        .collection('testDoc')
        .doc('test1');

      await ref.set(mockData);

      const ReadFirestoreDoc = () => {
        const snapshot = useFirestoreDocument(ref).get();

        return <h1 data-testid="readSuccess">{snapshot.data().a}</h1>;
      };

      const { getByTestId } = render(
        <FirebaseAppProvider firebaseApp={app}>
          <React.Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
            <ReadFirestoreDoc />
          </React.Suspense>
        </FirebaseAppProvider>
      );

      await waitForElement(() => getByTestId('readSuccess'));

      expect(getByTestId('readSuccess')).toContainHTML(mockData.a);
    });
  });

  describe('useFirestoreCollection', () => {
    it('can get a Firestore collection [TEST REQUIRES EMULATOR]', async () => {
      const mockData1 = { a: 'hello' };
      const mockData2 = { a: 'goodbye' };

      const ref = app.firestore().collection('testCollection');

      await act(() => ref.add(mockData1));
      await act(() => ref.add(mockData2));

      const ReadFirestoreCollection = () => {
        const snapshot = useFirestoreCollection(ref).get();

        return (
          <ul data-testid="readSuccess">
            {snapshot.docs.map(doc => (
              <li key={doc.id} data-testid="listItem">
                doc.data().a
              </li>
            ))}
          </ul>
        );
      };
      const { getAllByTestId } = render(
        <FirebaseAppProvider firebaseApp={app}>
          <React.Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
            <ReadFirestoreCollection />
          </React.Suspense>
        </FirebaseAppProvider>
      );

      await waitForElement(() => getAllByTestId('listItem'));

      expect(getAllByTestId('listItem').length).toEqual(2);
    });

    it('Returns different data for different queries on the same path [TEST REQUIRES EMULATOR]', async () => {
      const mockData1 = { a: 'hello' };
      const mockData2 = { a: 'goodbye' };

      const ref = app.firestore().collection('testCollection');
      const filteredRef = ref.where('a', '==', 'hello');

      await act(() => ref.add(mockData1));
      await act(() => ref.add(mockData2));

      const ReadFirestoreCollection = () => {
        const list = useFirestoreCollection(ref).get().docs;
        const filteredList = useFirestoreCollection(filteredRef).get().docs;

        // filteredList's length should be 1 since we only added one value that matches its query
        expect(filteredList.length).toEqual(1);

        // the full list should be bigger than the filtered list
        expect(list.length).toBeGreaterThan(filteredList.length);

        return <h1 data-testid="rendered">Hello</h1>;
      };

      const { getByTestId } = render(
        <FirebaseAppProvider firebaseApp={app}>
          <React.Suspense fallback={<h1 data-testid="fallback">Fallback</h1>}>
            <ReadFirestoreCollection />
          </React.Suspense>
        </FirebaseAppProvider>
      );

      await waitForElement(() => getByTestId('rendered'));
    });
  });
});
