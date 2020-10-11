import * as firebase from 'firebase';
import { auth } from 'firebase/app';
import * as React from 'react';
import { useAuth } from '../firebaseApp';
import {useEntity} from '../core/entity';

export interface UserOptions {
  auth?: auth.Auth;
  wait?: boolean;
}

/**
 * Subscribe to Firebase auth state changes, including token refresh
 *
 * @param auth - the [firebase.auth](https://firebase.google.com/docs/reference/js/firebase.auth) object
 */
export function useUser(options?: UserOptions): firebase.User {
  options = options || {};

  const auth = options.auth || useAuth();

  const entity = useEntity<firebase.User>(auth.app.name, {
    type: 'firebase.user',

    app: auth.app,
    initialValue: auth.currentUser,
    subscribe: auth.onIdTokenChanged.bind(auth),
    ...options
  });

  const [user, setUser] = React.useState<firebase.User>(entity.get({
    wait: options.wait
  }));

  React.useEffect(() => {
    return entity.on(user => {
      setUser(user);
    });
  }, [entity]);

  return user;
}
