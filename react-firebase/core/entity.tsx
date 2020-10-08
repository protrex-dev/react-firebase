import { Observer } from './observer';

type GetFn<T> = () => Promise<T>;
type NextFn<T> = (value: T) => void;
type ErrorFn<E = Error> = (error: E) => void;
type CompleteFn = () => void;

type SubscribeFunction<T> = (next: NextFn<T>, error?: ErrorFn<any>, complete?: CompleteFn) => UnsubscribeFunction;

export type EntityOptions<T> = {
  current?: T | null;
  error?: Error | null;
  get?: GetFn<T>;
  observers?: Observer<T>[] | null;
  promise?: Promise<void> | null;
  subscribe: SubscribeFunction<T>;
  unsubscribe?: UnsubscribeFunction | null;
};

type UnsubscribeFunction = () => void;

export default class Entity<T> {
  private readonly getFn: GetFn<T>;
  private readonly observers: Observer<T>[] = [];
  private readonly subscribeFn: SubscribeFunction<T> = null;

  private error: any = null;
  private promise: Promise<void> | null = null;
  private unsubscribeFn: UnsubscribeFunction = null;

  private current: T;

  constructor(options: EntityOptions<T>) {
    this.current = options.current;
    this.error = options.error || null;
    this.getFn = options.get || null;
    this.observers = options.observers || [];
    this.promise = options.promise || null;
    this.subscribeFn = options.subscribe;
    this.unsubscribeFn = options.unsubscribe || null;
  }

  get value(): T {
    return this.current;
  }

  copyWith(options: EntityOptions<T>): Entity<T> {
    throw new Error('Not Implemented');
  }

  copyWithValue(value: T) {
    return this.copyWith({
      current: value,
      error: this.error,
      get: this.getFn,
      observers: this.observers,
      promise: this.promise,
      subscribe: this.subscribeFn,
      unsubscribe: this.unsubscribeFn
    } as EntityOptions<T>);
  }

  effect(dispatch: (value: Entity<T>) => void) {
    return this.on(value => {
      dispatch(this.copyWithValue(value));
    });
  }

  get(): T {
    if (this.error) {
      throw this.error;
    }

    if (typeof this.current !== 'undefined') {
      return this.current;
    }

    if (this.promise) {
      throw this.promise;
    }

    throw (this.promise = (this.getFn ? this.getFn() : this.first()).then(
      value => {
        this.current = value;

        this.dispatchNext(value);
      },
      err => {
        this.dispatchError(err);
      }
    ));
  }

  on(nextOrObserver: Observer<T> | NextFn<T>, error?: ErrorFn, complete?: CompleteFn): UnsubscribeFunction {
    const observer = new Observer<T>(nextOrObserver, error, complete);

    // Add observer
    this.observers.push(observer);

    // Ensure entity has been subscribed
    this.subscribe();

    // Unsubscribe function
    return () => this.off(observer);
  }

  off(observer: Observer<T>) {
    const index = this.observers.indexOf(observer);

    // Ensure observer exists
    if (index < 0) {
      return;
    }

    // Emit complete
    if (observer.complete) {
      observer.complete();
    }

    // Remove observer
    this.observers.splice(index, 1);

    // Unsubscribe if there are no more observers
    if (this.observers.length < 1) {
      this.unsubscribe();
    }
  }

  unsubscribe() {
    if (!this.unsubscribeFn) {
      return;
    }

    // Unsubscribe
    this.unsubscribeFn();

    // Clear state
    this.unsubscribeFn = null;
  }

  dispose() {
    this.unsubscribe();
  }

  private dispatchNext(value: T) {
    for (const observer of this.observers) {
      if (observer.next) {
        observer.next(value);
      }
    }
  }

  private dispatchError(error: any) {
    this.error = error;

    for (const observer of this.observers) {
      if (observer.error) {
        observer.error(error);
      }
    }
  }

  private first(): Promise<T> {
    return new Promise((resolve, reject) => {
      let unsubscribe = this.subscribeFn(
        value => {
          unsubscribe();
          resolve(value);
        },
        err => {
          unsubscribe();
          reject(err);
        }
      );
    });
  }

  private subscribe() {
    if (this.unsubscribeFn) {
      return;
    }

    // Subscribe to token changes
    this.unsubscribeFn = this.subscribeFn(this.dispatchNext.bind(this));
  }
}
