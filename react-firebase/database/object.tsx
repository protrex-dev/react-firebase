import { database } from 'firebase/app';
import * as React from 'react';
import {useEntity} from '../core/entity';
import { ListenEvent } from '../core/events';

/**
 * Subscribe to a Realtime Database object
 *
 * @param ref - Reference to the DB object you want to listen to
 */
export function useDatabaseObject(ref: database.Reference): database.DataSnapshot {
  const entity = useEntity<database.DataSnapshot>(ref.toString(), {
    type: 'database.object',

    get: ref.once.bind(ref, ListenEvent.value),
    subscribe: ref.on.bind(ref, ListenEvent.value),
  });

  const [snapshot, setSnapshot] = React.useState<database.DataSnapshot>(entity.get());

  React.useEffect(() => {
    return entity.on(snapshot => {
      setSnapshot(snapshot);
    });
  }, [entity]);

  return snapshot;
}
