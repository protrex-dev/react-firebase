import { database } from 'firebase/app';
import { QueryChange } from '../core/events';
import * as React from 'react';

const _queries = globalThis['__react-firebase_database_queries'] || (globalThis['__react-firebase_database_queries'] = []);
const _lists = globalThis['__react-firebase_database_lists'] || (globalThis['__react-firebase_database_lists'] = new Map());

function getUniqueIdForDatabaseQuery(query: database.Query) {
  const index = _queries.findIndex(cachedQuery => cachedQuery.isEqual(query));

  if (index > -1) {
    return index;
  }

  return _queries.push(query) - 1;
}
/**
 * Subscribe to a Realtime Database list
 *
 * @param ref - Reference to the DB List you want to listen to
 */
export function useDatabaseList<T = { [key: string]: unknown }>(ref: database.Reference | database.Query): QueryChange[] {
  throw new Error('Not Implemented');
}
