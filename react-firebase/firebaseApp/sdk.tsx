import * as firebase from 'firebase/app';
import { useFirebaseApp } from './context';

type ComponentName = 'analytics' | 'auth' | 'database' | 'firestore' | 'functions' | 'messaging' | 'performance' | 'remoteConfig' | 'storage';

type ValueOf<T> = T[keyof T];
type App = firebase.app.App;
type FirebaseInstanceFactory = ValueOf<Pick<App, ComponentName>>;
type FirebaseNamespaceComponent = ValueOf<Pick<typeof firebase, ComponentName>>;

const _components: Map<string, Map<string, Component>> = globalThis['__react-firebase_components'] || (globalThis['__react-firebase_components'] = new Map());

function getComponents(appName: string) {
  let components = _components.get(appName);

  if (!components) {
    _components.set(appName, (components = new Map()));
  }

  return components;
}

function importSDK(sdk: ComponentName) {
  switch (sdk) {
    case 'analytics':
      return import(/* webpackChunkName: "analytics" */ 'firebase/analytics');
    case 'auth':
      return import(/* webpackChunkName: "auth" */ 'firebase/auth');
    case 'database':
      return import(/* webpackChunkName: "database" */ 'firebase/database');
    case 'firestore':
      return import(/* webpackChunkName: "firestore" */ 'firebase/firestore');
    case 'functions':
      return import(/* webpackChunkName: "functions" */ 'firebase/functions');
    case 'messaging':
      return import(/* webpackChunkName: "messaging" */ 'firebase/messaging');
    case 'performance':
      return import(/* webpackChunkName: "performance" */ 'firebase/performance');
    case 'remoteConfig':
      return import(/* webpackChunkName: "remoteConfig" */ 'firebase/remote-config');
    case 'storage':
      return import(/* webpackChunkName: "storage" */ 'firebase/storage');
  }
}

function proxyComponent(componentName: 'auth'): typeof firebase.auth;
function proxyComponent(componentName: 'analytics'): typeof firebase.analytics;
function proxyComponent(componentName: 'database'): typeof firebase.database;
function proxyComponent(componentName: 'firestore'): typeof firebase.firestore;
function proxyComponent(componentName: 'functions'): typeof firebase.functions;
function proxyComponent(componentName: 'messaging'): typeof firebase.messaging;
function proxyComponent(componentName: 'performance'): typeof firebase.performance;
function proxyComponent(componentName: 'remoteConfig'): typeof firebase.remoteConfig;
function proxyComponent(componentName: 'storage'): typeof firebase.storage;
function proxyComponent(componentName: ComponentName): FirebaseNamespaceComponent {
  let contextualApp: App | undefined;

  const useComponent = (app?: App) => {
    contextualApp = useFirebaseApp();

    const component = preload(componentName, app);

    if (component.loading) {
      throw component.promise;
    }

    if (component.error) {
      throw component.error;
    }

    return firebase[componentName];
  };

  return new Proxy(useComponent, {
    get: (target, p) => target()[p],
    apply: (target, _this, args) => {
      const component = target(args[0]).bind(_this);

      // If they don't pass an app, assume the app in context rather than [DEFAULT]
      if (!args[0]) {
        args[0] = contextualApp;
      }

      return component(...args);
    }
  }) as any;
}

export const useAuth = proxyComponent('auth');
export const useAnalytics = proxyComponent('analytics');
export const useDatabase = proxyComponent('database');
export const useFirestore = proxyComponent('firestore');
export const useFunctions = proxyComponent('functions');
export const useMessaging = proxyComponent('messaging');
export const usePerformance = proxyComponent('performance');
export const useRemoteConfig = proxyComponent('remoteConfig');
export const useStorage = proxyComponent('storage');

export const auth = useAuth;
export const analytics = useAnalytics;
export const database = useDatabase;
export const firestore = useFirestore;
export const functions = useFunctions;
export const messaging = useMessaging;
export const performance = usePerformance;
export const remoteConfig = useRemoteConfig;
export const storage = useStorage;

class Component<T = unknown> {
  error: any;
  instanceFactory: T;
  loading: boolean = true;
  promise: Promise<void> | null = null;

  constructor(promise: Promise<void>) {
    this.promise = promise;

    // Listen for result
    this.promise.then(
      () => {
        this.loading = false;
      },
      error => {
        this.error = error;
        this.loading = false;
      }
    );
  }

  then(onFulfilled, onRejected?) {
    return this.promise.then(() => onFulfilled(this.instanceFactory), onRejected);
  }
}

export type PreloadOptions<T> = {
  firebaseApp?: App;
  setup?: (instanceFactory: T) => void | Promise<any>;
};

function preloadFactory(componentName: 'auth'): (options?: PreloadOptions<App['auth']>) => Component<App['auth']>;
function preloadFactory(componentName: 'analytics'): (options?: PreloadOptions<App['analytics']>) => Component<App['analytics']>;
function preloadFactory(componentName: 'database'): (options?: PreloadOptions<App['database']>) => Component<App['database']>;
function preloadFactory(componentName: 'firestore'): (options?: PreloadOptions<App['firestore']>) => Component<App['firestore']>;
function preloadFactory(componentName: 'functions'): (options?: PreloadOptions<App['functions']>) => Component<App['functions']>;
function preloadFactory(componentName: 'messaging'): (options?: PreloadOptions<App['messaging']>) => Component<App['messaging']>;
function preloadFactory(componentName: 'performance'): (options?: PreloadOptions<App['performance']>) => Component<App['performance']>;
function preloadFactory(componentName: 'remoteConfig'): (options?: PreloadOptions<App['remoteConfig']>) => Component<App['remoteConfig']>;
function preloadFactory(componentName: 'storage'): (options?: PreloadOptions<App['storage']>) => Component<App['storage']>;
function preloadFactory(componentName: ComponentName) {
  return (options?: PreloadOptions<FirebaseInstanceFactory>) => preload(componentName, options?.firebaseApp, options?.setup);
}

function preload<T>(
  componentName: ComponentName,
  firebaseApp?: App,
  settingsCallback: (instanceFactory: FirebaseInstanceFactory) => any = () => {}
): Component<T> {
  const app = firebaseApp || useFirebaseApp();

  // Retrieve components
  const components = getComponents(app.name);

  // Retrieve component
  let component = components.get(componentName);

  if (component) {
    return component as Component<T>;
  }

  // Initialize component
  components.set(
    componentName,
    (component = new Component(
      importSDK(componentName).then(() => {
        const instanceFactory: FirebaseInstanceFactory = app[componentName].bind(app);

        // Apply settings
        return Promise.resolve(settingsCallback(instanceFactory)).then(() => {
          component.instanceFactory = instanceFactory;
        });
      })
    ))
  );

  return component as Component<T>;
}

export const preloadAuth = preloadFactory('auth');
export const preloadAnalytics = preloadFactory('analytics');
export const preloadDatabase = preloadFactory('database');
export const preloadFirestore = preloadFactory('firestore');
export const preloadFunctions = preloadFactory('functions');
export const preloadMessaging = preloadFactory('messaging');
export const preloadPerformance = preloadFactory('performance');
export const preloadRemoteConfig = preloadFactory('remoteConfig');
export const preloadStorage = preloadFactory('storage');
