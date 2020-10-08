import { storage } from 'firebase/app';
import * as React from 'react';
import { ReactFirebaseOptions } from '..';
import { useStorage } from '../firebaseApp';

/**
 * Subscribe to the progress of a storage task
 *
 * @param task - the task you want to listen to
 * @param ref - reference to the blob the task is acting on
 * @param options
 */
export function useStorageTask<T = unknown>(
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

/**
 * Subscribe to a storage ref's download URL
 *
 * @param ref - reference to the blob you want to download
 * @param options
 */
export function useStorageDownloadURL<T = string>(ref: storage.Reference, options?: ReactFirebaseOptions<string>): string {
  const [url, setUrl] = React.useState<string>(options ? options.startWithValue : undefined);

  React.useEffect(() => {
    ref.getDownloadURL().then(setUrl);
  }, [ref]);

  return url;
}

type StorageImageProps = {
  storagePath: string;
  storage?: firebase.storage.Storage;
};

export function StorageImage(props: StorageImageProps & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  let { storage, storagePath, ...imgProps } = props;

  storage = storage || useStorage();

  const imgSrc = useStorageDownloadURL(storage.ref(storagePath));
  return <img src={imgSrc} {...imgProps} />;
}
