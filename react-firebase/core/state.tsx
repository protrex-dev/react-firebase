import {useFirebaseApp} from "../firebaseApp";
import * as React from "react";

export interface State {
    cache: Map<string, Map<string, any>>;
}

export function useState(): State {
    return useFirebaseApp()['__react-firebase'];
}
