import 'firebase/performance';
import React, { useState, SuspenseList, useTransition } from 'react';
import { AuthCheck, SuspenseWithPerf, useFirestoreCollection, useFirestoreDocument, useFirestore } from '@protrex/react-firebase';

const Counter = props => {
  const firestore = useFirestore;

  const serverIncrement = firestore.FieldValue.increment;

  const ref = firestore().doc('count/counter');

  const increment = amountToIncrement => {
    ref.update({
      value: serverIncrement(amountToIncrement)
    });
  };

  const snapshot = useFirestoreDocument(ref).get();

  return (
    <>
      <button onClick={() => increment(-1)}>-</button>
      <span>{snapshot.data().value}</span>
      <button onClick={() => increment(1)}>+</button>
    </>
  );
};

const StaticValue = props => {
  const firestore = useFirestore();

  const ref = firestore.doc('count/counter');

  const snapshot = useFirestoreDocument(ref).get();

  return <span>{snapshot.data().value}</span>;
};

const AnimalEntry = ({ saveAnimal }) => {
  const [text, setText] = useState('');
  const [disabled, setDisabled] = useState(false);

  const onSave = () => {
    setDisabled(true);
    saveAnimal(text).then(() => {
      setText('');
      setDisabled(false);
    });
  };

  return (
    <>
      <input value={text} disabled={disabled} placeholder="Iguana" onChange={({ target }) => setText(target.value)} />
      <button onClick={onSave} disabled={disabled || text.length < 3}>
        Add new animal
      </button>
    </>
  );
};

const List = ({ query, removeAnimal }) => {
  const snapshot = useFirestoreCollection(query).get();

  return (
    <ul>
      {snapshot.docs.map(doc => (
        <li key={doc.id}>
          {doc.data().commonName} <button onClick={() => removeAnimal(doc.id)}>X</button>
        </li>
      ))}
    </ul>
  );
};

const FavoriteAnimals = props => {
  const firestore = useFirestore();
  const baseRef = firestore.collection('animals');
  const [isAscending, setIsAscending] = useState(true);
  const query = baseRef.orderBy('commonName', isAscending ? 'asc' : 'desc');
  const [startTransition, isPending] = useTransition({
    timeoutMs: 1000
  });

  const toggleSort = () => {
    startTransition(() => {
      setIsAscending(!isAscending);
    });
  };

  const addNewAnimal = commonName =>
    baseRef.add({
      commonName
    });

  const removeAnimal = id => baseRef.doc(id).delete();

  return (
    <>
      <AnimalEntry saveAnimal={addNewAnimal} />
      <br />
      <button onClick={toggleSort} disabled={isPending}>
        Sort {isAscending ? '^' : 'v'}
      </button>
      <React.Suspense fallback="loading...">
        <List query={query} removeAnimal={removeAnimal} />
      </React.Suspense>
    </>
  );
};

const SuspenseWrapper = props => {
  return (
    <SuspenseWithPerf fallback="loading..." traceId="firestore-demo-root">
      <AuthCheck fallback="sign in to use Firestore">
        <SuspenseList revealOrder="together">
          <h3>Sample Doc Listener</h3>
          <SuspenseWithPerf fallback="connecting to Firestore..." traceId="firestore-demo-doc">
            <Counter />
          </SuspenseWithPerf>
          <h3>Sample One-time Get</h3>
          <SuspenseWithPerf fallback="connecting to Firestore..." traceId="firestore-demo-doc">
            <StaticValue />
          </SuspenseWithPerf>

          <h3>Sample Collection Listener</h3>
          <SuspenseWithPerf fallback="connecting to Firestore..." traceId="firestore-demo-collection">
            <FavoriteAnimals />
          </SuspenseWithPerf>
        </SuspenseList>
      </AuthCheck>
    </SuspenseWithPerf>
  );
};

export default SuspenseWrapper;
