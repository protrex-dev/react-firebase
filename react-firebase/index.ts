export interface ReactFirebaseOptions<T = unknown> {
  startWithValue?: T;
  idField?: string;
}

export function checkOptions(options: ReactFirebaseOptions, field: string) {
  return options ? options[field] : undefined;
}

export function checkStartWithValue(options: ReactFirebaseOptions) {
  return checkOptions(options, 'startWithValue');
}

export function checkIdField(options: ReactFirebaseOptions) {
  return checkOptions(options, 'idField');
}

export * from './auth';
export * from './database';
export * from './firebaseApp';
export * from './firestore';
export * from './performance';
export * from './remote-config';
export * from './storage';
