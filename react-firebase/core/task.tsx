import * as React from "react";
import { useCacheItem } from "./cache";


export interface TaskOptions<T> {
    type: string;
    id: string;

    resolve: () => Promise<T>;
    wait?: boolean;
}

export class Task<T> {
    private readonly resolve: () => Promise<T>;
    private readonly wait: boolean;

    private error: any;
    private promise: Promise<void>;
    private value: T;

    constructor(options: TaskOptions<T>) {
        options = {
            wait: true,
            ...options
        };

        this.resolve = options.resolve;
        this.wait = options.wait;
    }

    get(): T {
        if(!this.promise) {
            this.promise = this.resolve().then((value) => {
                this.value = value || null;
            }, (err) => {
                this.error = err || new Error('Resolution failed');
            });
        }

        if(this.error) {
            throw this.error;
        }

        if(typeof this.value === 'undefined' && this.wait) {
            throw this.promise;
        }

        return this.value;
    }
}

export function useTask<T>(options: TaskOptions<T>) {
    return useCacheItem(options.type, options.id, () => new Task<T>(options)).get();
}
