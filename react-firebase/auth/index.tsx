import { auth, User } from 'firebase/app';
import * as React from 'react';
import { FirebaseUser, useUser } from './user';

export function useIdTokenResult(user: User, forceRefresh: boolean = false) {
  if (!user) {
    throw new Error('you must provide a user');
  }

  const [idTokenResult, setIdTokenResult] = React.useState<firebase.auth.IdTokenResult>();

  React.useEffect(() => {
    user.getIdTokenResult(forceRefresh).then(setIdTokenResult);
  }, [user, forceRefresh]);

  return idTokenResult;
}

export interface AuthCheckProps {
  auth?: auth.Auth;
  fallback: React.ReactNode;
  children: React.ReactNode;
  requiredClaims?: Object;
}

export interface ClaimsCheckProps {
  user: User;
  fallback: React.ReactNode;
  children: React.ReactNode;
  requiredClaims?: Object;
}

export function ClaimsCheck({ user, fallback, children, requiredClaims }: ClaimsCheckProps) {
  const { claims } = useIdTokenResult(user, false);
  const missingClaims = {};

  Object.keys(requiredClaims).forEach(claim => {
    if (requiredClaims[claim] !== claims[claim]) {
      missingClaims[claim] = {
        expected: requiredClaims[claim],
        actual: claims[claim]
      };
    }
  });

  if (Object.keys(missingClaims).length === 0) {
    return <>{children}</>;
  } else {
    return <>{fallback}</>;
  }
}

export function AuthCheck({ auth, fallback, children, requiredClaims }: AuthCheckProps): JSX.Element {
  const user = useUser(auth);

  if (user.value) {
    return requiredClaims ? (
      <ClaimsCheck user={user.value} fallback={fallback} requiredClaims={requiredClaims}>
        {children}
      </ClaimsCheck>
    ) : (
      <>{children}</>
    );
  } else {
    return <>{fallback}</>;
  }
}

export { FirebaseUser, useUser };
