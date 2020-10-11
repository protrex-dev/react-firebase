import {useFirebaseApp} from "../firebaseApp";
import * as React from "react";
import { app } from "firebase";

export interface State {
    cache: Map<string, Map<string, any>>;
}

export function useState(app?: app.App): State {
    return (app || useFirebaseApp())['__react-firebase'];
}
