import * as firebase from 'firebase';
import { auth } from 'firebase/app';
import * as React from 'react';
import { useAuth } from '../firebaseApp';
import Entity, { EntityOptions } from '../core/entity';

const _users = globalThis['__react-firebase_users'] || (globalThis['__react-firebase_users'] = new Map());

function getUser(auth) {
  let user = _users.get(auth.app.name);

  if (!user) {
    _users.set(auth, (user = new FirebaseUser(auth)));
  }

  return user;
}

export class FirebaseUser extends Entity<firebase.User> {
  auth: auth.Auth;

  constructor(auth: auth.Auth, options?: EntityOptions<firebase.User>) {
    super({
      current: auth.currentUser,
      subscribe: auth.onIdTokenChanged.bind(auth),
      ...options
    });

    this.auth = auth;
  }

  copyWith(options: EntityOptions<firebase.User>) {
    return new FirebaseUser(this.auth, options);
  }

  dispose() {
    super.dispose();

    // Remove from cache
    _users.delete(this.auth);
  }
}

/**
 * Subscribe to Firebase auth state changes, including token refresh
 *
 * @param auth - the [firebase.auth](https://firebase.google.com/docs/reference/js/firebase.auth) object
 */
export function useUser(auth?: auth.Auth): FirebaseUser {
  auth = auth || useAuth();

  // Create hook
  const [user, setUser] = React.useState<FirebaseUser>(getUser(auth));

  React.useEffect(() => {
    const user = getUser(auth);

    // Update user
    setUser(user);

    // Subscribe to changes
    return user.effect(user => {
      // Update user
      setUser(user);
    });
  }, [auth.app.name]);

  return user;
}
