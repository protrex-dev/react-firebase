import { database } from 'firebase/app';
import * as React from 'react';
import Entity, { EntityOptions } from '../core/entity';
import { ListenEvent } from '../core/events';

const _objects = globalThis['__react-firebase_database_objects'] || (globalThis['__react-firebase_database_objects'] = new Map());

function getObject(ref: database.Reference) {
  let object = _objects.get(ref.toString());

  if (!object) {
    _objects.set(ref.toString(), (object = new DatabaseObject(ref)));
  }

  return object;
}

export class DatabaseObject extends Entity<database.DataSnapshot> {
  ref: database.Reference;

  constructor(ref: database.Reference, options?: EntityOptions<database.DataSnapshot>) {
    super({
      get: ref.once.bind(ref, ListenEvent.value),
      subscribe: ref.on.bind(ref, ListenEvent.value),
      ...options
    });

    this.ref = ref;
  }

  get snapshot(): database.DataSnapshot {
    return this.value;
  }

  copyWith(options: EntityOptions<database.DataSnapshot>) {
    return new DatabaseObject(this.ref, options);
  }

  dispose() {
    super.dispose();

    // Remove from cache
    _objects.delete(this.ref);
  }
}

/**
 * Subscribe to a Realtime Database object
 *
 * @param ref - Reference to the DB object you want to listen to
 */
export function useDatabaseObject(ref: database.Reference): DatabaseObject {
  if (!ref) {
    return null;
  }

  // Create hook
  const [object, setObject] = React.useState<DatabaseObject>(getObject(ref));

  React.useEffect(() => {
    const object = getObject(ref);

    // Update object
    setObject(object);

    // Subscribe to changes
    return object.effect(object => {
      // Update object
      setObject(object);
    });
  }, [ref.toString()]);

  return object;
}
