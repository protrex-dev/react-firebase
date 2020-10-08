import * as React from 'react';
import { firestore } from 'firebase/app';
import Entity, { EntityOptions } from '../core/entity';

const _collections = globalThis['__react-firebase_collections'] || (globalThis['__react-firebase_collections'] = new Map());
const _queries: Array<firestore.Query> = globalThis['__react-firebase_queries'] || (globalThis['__react-firebase_queries'] = []);

function getUniqueIdForFirestoreQuery(query: firestore.Query) {
  const index = _queries.findIndex(cachedQuery => cachedQuery.isEqual(query));

  if (index > -1) {
    return index;
  }

  return _queries.push(query) - 1;
}

function getQuery(query: firestore.Query) {
  return _queries[getUniqueIdForFirestoreQuery(query)];
}

function getCollection(query: firestore.Query) {
  let collection = _collections.get(query);

  if (!collection) {
    _collections.set(query, (collection = new FirestoreCollection(query)));
  }

  return collection;
}

export class FirestoreCollection extends Entity<firestore.QuerySnapshot> {
  query: firestore.Query;

  constructor(query: firestore.Query, options?: EntityOptions<firestore.QuerySnapshot>) {
    super({
      get: query.get.bind(query),
      subscribe: query.onSnapshot.bind(query),
      ...options
    });

    this.query = query;
  }

  get snapshot(): firestore.QuerySnapshot {
    return this.value;
  }

  copyWith(options: EntityOptions<firestore.QuerySnapshot>) {
    return new FirestoreCollection(this.query, options);
  }

  dispose() {
    super.dispose();

    // Remove from cache
    _collections.delete(this.query);
  }
}

/**
 * Subscribe to a Firestore Collection
 *
 * @param query - Reference to the collection you want to listen to
 */
export function useFirestoreCollection(query: firestore.Query): FirestoreCollection {
  if (!query) {
    return null;
  }

  // Retrieve cached query
  query = getQuery(query);

  // Create hook
  const [collection, setCollection] = React.useState<FirestoreCollection>(getCollection(query));

  React.useEffect(() => {
    const collection = getCollection(query);

    // Update collection
    setCollection(collection);

    // Subscribe to changes
    return collection.effect(collection => {
      // Update collection
      setCollection(collection);
    });
  }, [query]);

  return collection;
}
