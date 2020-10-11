import * as React from "react";
import { useCacheValue } from "./cache";


export interface TaskOptions<T> {
    type: string;
    resolve: () => Promise<T>;
}

export interface TaskGetOptions {
    wait?: boolean;
}

export class Task<T> {
    private readonly resolve: () => Promise<T>;

    private error: any;
    private promise: Promise<void>;
    private value: T;

    constructor(options: TaskOptions<T>) {
        this.resolve = options.resolve;
    }

    get(options?: TaskGetOptions): T {
        options = options || {};

        const wait = typeof options.wait !== 'undefined' ? options.wait : true;

        if(this.error) {
            throw this.error;
        }

        if(typeof this.value === 'undefined' && wait) {
            if(!this.promise) {
                this.promise = this.resolve().then((value) => {
                    this.value = value || null;
                }, (err) => {
                    this.error = err || new Error('Resolution failed');
                });
            }

            throw this.promise;
        }

        return this.value;
    }
}

export function useTask<T>(id: any, options: TaskOptions<T>): Task<T> {
    return useCacheValue(id, () => new Task<T>(options), {
        type: options.type
    });
}
