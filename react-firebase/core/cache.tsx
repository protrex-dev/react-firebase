import * as React from "react";
import { useState } from './state';
import { app} from "firebase";


export interface CacheOptions<T> {
    create: () => T;

    app?: app.App;
}

function getCache(cache: Map<string, any>, type: string, create: () => any) {
    if(cache[type]) {
        return cache[type];
    }

    return cache[type] = create();
}

export function useCache<T>(type: string, options: CacheOptions<T>): T {
    const collection = useState(options.app).cache;

    const [cache, setCache] = React.useState<T>(
        getCache(collection, type, options.create)
    );

    React.useEffect(() => {
        setCache(getCache(collection, type, options.create));
    }, [type]);

    return cache;
}

export interface CacheValueOptions<TKey, TValue> {
    app?: app.App;
    type: string;
}

function getValue<TKey, TValue>(collection: Map<TKey, TValue>, id: TKey, resolve: () => TValue): TValue {
    if(!collection.has(id)) {
        collection.set(id, resolve());
    }

    return collection.get(id);
}

export function useCacheValue<TKey, TValue>(id: TKey, resolve: () => TValue, options: CacheValueOptions<TKey, TValue>): TValue {
    const collection = useCache<Map<TKey, TValue>>(options.type, {
        app: options.app,
        create: () => new Map()
    });

    const [value, setValue] = React.useState<TValue>(
        getValue<TKey, TValue>(collection, id, resolve)
    );

    React.useEffect(() => {
        setValue(getValue<TKey, TValue>(collection, id, resolve));
    }, [id]);

    return value;
}

export interface CacheMemoOptions<T> {
    isEqual: (a: T, b: T) => boolean;
    type: string;

    app?: app.App;
}

function getMemo<T>(collection: Array<T>, value: T, options: CacheMemoOptions<T>): [number, T] {
    let index = collection.findIndex((cachedValue) => options.isEqual(cachedValue, value));

    if (index < 0) {
        index = collection.push(value) - 1;
    }

    return [index, collection[index]];
}

export function useCacheMemo<T>(value: T, options: CacheMemoOptions<T>): [number, T] {
    const collection = useCache<Array<T>>(options.type, {
        app: options.app,
        create: () => []
    });

    const [state, setState] = React.useState<[number, T]>(
        getMemo<T>(collection, value, options)
    );

    React.useEffect(() => {
        setState(getMemo<T>(collection, value, options));
    }, [value]);

    return state;
}
