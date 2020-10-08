import * as React from 'react';
import { firestore } from 'firebase/app';
import Entity, { EntityOptions } from '../core/entity';

const _documents = globalThis['__react-firebase_documents'] || (globalThis['__react-firebase_documents'] = new Map());

function getDocument(ref: firestore.DocumentReference) {
  let document = _documents.get(ref.path);

  if (!document) {
    _documents.set(ref.path, (document = new FirestoreDocument(ref)));
  }

  return document;
}

export class FirestoreDocument extends Entity<firestore.DocumentSnapshot> {
  ref: firestore.DocumentReference;

  constructor(ref: firestore.DocumentReference, options?: EntityOptions<firestore.DocumentSnapshot>) {
    super({
      get: ref.get.bind(ref),
      subscribe: ref.onSnapshot.bind(ref),
      ...options
    });

    this.ref = ref;
  }

  get snapshot(): firestore.DocumentSnapshot {
    return this.value;
  }

  copyWith(options: EntityOptions<firestore.DocumentSnapshot>) {
    return new FirestoreDocument(this.ref, options);
  }

  dispose() {
    super.dispose();

    // Remove from cache
    _documents.delete(this.ref);
  }
}

/**
 * Suscribe to a Firestore Document
 *
 * @param ref - Reference to the document you want to listen to
 */
export function useFirestoreDocument(ref: firestore.DocumentReference): FirestoreDocument {
  if (!ref) {
    return null;
  }

  // Create hook
  const [document, setDocument] = React.useState<FirestoreDocument>(getDocument(ref));

  React.useEffect(() => {
    const document = getDocument(ref);

    // Update document
    setDocument(document);

    // Subscribe to changes
    return document.effect(document => {
      // Update document
      setDocument(document);
    });
  }, [ref.path]);

  return document;
}
