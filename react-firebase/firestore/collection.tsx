import * as React from 'react';
import { firestore } from 'firebase/app';
import {useEntity} from '../core/entity';
import {useCacheMemo} from "../core/cache";

/**
 * Subscribe to a Firestore Collection
 *
 * @param query - Reference to the collection you want to listen to
 */
export function useFirestoreCollection(query: firestore.Query): firestore.QuerySnapshot {
  const [id, uniqueQuery] = useCacheMemo(query, {
    type: 'firestore.query',

    isEqual: (a, b) => a.isEqual(b)
  });

  const entity = useEntity<firestore.QuerySnapshot>(id, {
    type: 'firestore.collection',

    get: uniqueQuery.get.bind(uniqueQuery),
    subscribe: uniqueQuery.onSnapshot.bind(uniqueQuery)
  });

  const [snapshot, setSnapshot] = React.useState<firestore.QuerySnapshot>(entity.get());

  React.useEffect(() => {
    return entity.on(snapshot => {
      setSnapshot(snapshot);
    });
  }, [entity]);

  return snapshot;
}
