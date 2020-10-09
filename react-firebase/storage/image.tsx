import * as React from 'react';
import { useStorage } from '../firebaseApp';
import { useStorageDownloadURL } from './download';


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
