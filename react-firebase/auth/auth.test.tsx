import { cleanup, render, wait } from '@testing-library/react';
import { app, auth } from 'firebase/app';
import '@testing-library/jest-dom/extend-expect';
import * as React from 'react';
import { AuthCheck, useUser } from '.';
import { act } from 'react-dom/test-utils';
import { FirebaseAppProvider } from '../firebaseApp';

class MockAuth {
  app: app.App;
  user: Object | null;
  subscriber: (user: Object) => void | null;

  constructor(app) {
    this.app = app;

    this.user = null;
    this.subscriber = null;
  }

  notifySubscriber() {
    if (this.subscriber) {
      this.subscriber(this.user);
    }
  }

  onIdTokenChanged(s) {
    this.subscriber = s;

    setTimeout(() => {
      this.notifySubscriber();
    }, 100);

    return () => (this.subscriber = null);
  }

  updateUser(u: Object) {
    this.user = u;
    this.notifySubscriber();
  }
}

class MockFirebase {
  name: string = '[DEFAULT]';
  auth: () => MockAuth;
}

const mockFirebase = new MockFirebase();
const mockAuth = new MockAuth(mockFirebase);

mockFirebase.auth = () => mockAuth;

const Provider = ({ children }) => <FirebaseAppProvider firebaseApp={(mockFirebase as any) as firebase.app.App}>{children}</FirebaseAppProvider>;

const Component = (props?: { children?: any }) => (
  <Provider>
    <React.Suspense fallback={'loading'}>
      <AuthCheck fallback={<h1 data-testid="signed-out">not signed in</h1>}>{props?.children || <h1 data-testid="signed-in">signed in</h1>}</AuthCheck>
    </React.Suspense>
  </Provider>
);

describe('AuthCheck', () => {
  beforeEach(() => {
    // clear the signed in user
    act(() => mockFirebase.auth().updateUser(null));
  });

  afterEach(() => {
    act(() => {
      cleanup();
      jest.clearAllMocks();
    });
  });

  it('can find firebase Auth from Context', () => {
    expect(() => render(<Component />)).not.toThrow();
  });

  it('can use firebase Auth from props', () => {
    expect(() =>
      render(
        <React.Suspense fallback={'loading'}>
          <AuthCheck fallback={<h1>not signed in</h1>} auth={(mockFirebase.auth() as unknown) as auth.Auth}>
            {'signed in'}
          </AuthCheck>
        </React.Suspense>
      )
    ).not.toThrow();
  });

  it('renders the fallback if a user is not signed in', async () => {
    const { getByTestId } = render(<Component />);

    await wait(() => expect(getByTestId('signed-out')).toBeInTheDocument(), { timeout: 2000 });

    act(() => mockFirebase.auth().updateUser({ uid: 'testuser' }));

    await wait(() => expect(getByTestId('signed-in')).toBeInTheDocument(), { timeout: 2000 });
  });

  it('renders children if a user is logged in', async () => {
    act(() => mockFirebase.auth().updateUser({ uid: 'testuser' }));

    const { getByTestId } = render(<Component />);

    await wait(() => expect(getByTestId('signed-in')).toBeInTheDocument());
  });

  it('can switch between logged in and logged out', async () => {
    const { getByTestId } = render(<Component />);

    await wait(() => expect(getByTestId('signed-out')).toBeInTheDocument());

    act(() => mockFirebase.auth().updateUser({ uid: 'testuser' }));

    await wait(() => expect(getByTestId('signed-in')).toBeInTheDocument());

    act(() => mockFirebase.auth().updateUser(null));

    await wait(() => expect(getByTestId('signed-out')).toBeInTheDocument());
  });

  test.todo('checks requiredClaims');
});

describe('useUser', () => {
  it('always returns a user if inside an <AuthCheck> component', () => {
    const UserDetails = () => {
      const user = useUser();

      expect(user).not.toBeNull();
      expect(user).toBeDefined();

      return <h1>Hello</h1>;
    };

    render(
      <>
        <Component>
          <UserDetails />
        </Component>
      </>
    );

    act(() => mockFirebase.auth().updateUser({ uid: 'testuser' }));
  });

  test.todo('can find firebase.auth() from Context');

  test.todo('throws an error if firebase.auth() is not available');

  test.todo('returns the same value as firebase.auth().currentUser()');
});
