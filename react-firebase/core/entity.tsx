import { Observer } from './observer';
import {useCacheValue} from "./cache";
import { app } from "firebase";

type GetFn<T> = () => Promise<T>;
type NextFn<T> = (value: T) => void;
type ErrorFn<E = Error> = (error: E) => void;
type CompleteFn = () => void;

type SubscribeFunction<T> = (next: NextFn<T>, error?: ErrorFn<any>, complete?: CompleteFn) => UnsubscribeFunction;

export type EntityOptions<T> = {
  type: string;
  subscribe: SubscribeFunction<T>;

  app?: app.App;
  initialValue?: T | null;
  error?: Error | null;
  get?: GetFn<T>;
  observers?: Observer<T>[] | null;
  promise?: Promise<void> | null;
  unsubscribe?: UnsubscribeFunction | null;
};

export type EntityGetOptions = {
  wait?: boolean;
}

type UnsubscribeFunction = () => void;

export default class Entity<T> {
  private readonly getFn: GetFn<T>;
  private readonly observers: Observer<T>[] = [];
  private readonly subscribeFn: SubscribeFunction<T> = null;
  private readonly wait: boolean;

  private error: any = null;
  private promise: Promise<void> | null = null;
  private unsubscribeFn: UnsubscribeFunction = null;

  value: T;

  constructor(options: EntityOptions<T>) {
    this.value = options.initialValue;
    this.error = options.error || null;
    this.getFn = options.get || null;
    this.observers = options.observers || [];
    this.promise = options.promise || null;
    this.subscribeFn = options.subscribe;
    this.unsubscribeFn = options.unsubscribe || null;
  }

  get(options?: EntityGetOptions): T {
    options = options || {};

    const wait = typeof options.wait !== 'undefined' ? options.wait : true;

    if (this.error) {
      throw this.error;
    }

    if(typeof this.value === 'undefined' && wait) {
      if(!this.promise) {
        this.promise = (this.getFn ? this.getFn() : this.first()).then(
            value => {
              this.value = value;
              this.dispatchNext(value);
            },
            err => {
              this.dispatchError(err);
            }
        );
      }

      throw this.promise;
    }

    return this.value;
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

export function useEntity<T>(id: any, options: EntityOptions<T>): Entity<T> {
  return useCacheValue<any, Entity<T>>(id, () => new Entity<T>(options), {
    app: options.app,
    type: options.type
  });
}
