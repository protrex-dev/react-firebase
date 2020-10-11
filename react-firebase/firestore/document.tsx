import * as React from 'react';
import { firestore } from 'firebase/app';
import {useEntity} from '../core/entity';

/**
 * Suscribe to a Firestore Document
 *
 * @param ref - Reference to the document you want to listen to
 */
export function useFirestoreDocument(ref: firestore.DocumentReference): firestore.DocumentSnapshot {
  const entity = useEntity<firestore.DocumentSnapshot>(ref.path, {
    type: 'firestore.document',

    get: ref.get.bind(ref),
    subscribe: ref.onSnapshot.bind(ref),
  });

  const [snapshot, setSnapshot] = React.useState<firestore.DocumentSnapshot>(entity.get());

  React.useEffect(() => {
    return entity.on(snapshot => {
      setSnapshot(snapshot);
    });
  }, [entity]);

  return snapshot;
}
