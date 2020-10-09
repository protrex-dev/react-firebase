import * as React from "react";
import { useState } from './state';


export function useCache<T>(type: string): Map<string, any> {
    const cache = useState().cache;

    if(cache[type]) {
        return cache[type];
    }

    console.log(cache);

    return cache[type] = new Map();
}

export function useCacheItem<T>(type: string, id: string, create: () => T): T {
    const collection = useCache(type);

    if(collection[id]) {
        return collection[id];
    }

    return collection[id] = create();
}
