import { storage } from 'firebase/app';
import * as React from 'react';
import { ReactFirebaseOptions } from '..';
import {useTask} from "../core/task";


/**
 * Subscribe to a storage ref's download URL
 *
 * @param ref - reference to the blob you want to download
 * @param options
 */
export function useStorageDownloadURL<T = string>(ref: storage.Reference, options?: ReactFirebaseOptions<string>): string {
  return useTask<string>({
    type: 'useStorageDownloadURL',
    id: ref.fullPath,

    resolve: () => ref.getDownloadURL()
  });
}
