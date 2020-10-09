import { storage } from 'firebase/app';
import * as React from 'react';
import { ReactFirebaseOptions } from '..';

/**
 * Subscribe to the progress of a storage task
 *
 * @param task - the task you want to listen to
 * @param ref - reference to the blob the task is acting on
 * @param options
 */
export function useStorageUploadTask<T = unknown>(
    task: storage.UploadTask,
    ref: storage.Reference,
    options?: ReactFirebaseOptions<storage.UploadTaskSnapshot>
): storage.UploadTaskSnapshot {
    const [snapshot, setSnapshot] = React.useState<storage.UploadTaskSnapshot>(options ? options.startWithValue : undefined);

    React.useEffect(() => {
        task.on('state_changed', setSnapshot, e => {
            throw e;
        });
    }, [ref]);

    return snapshot;
}
