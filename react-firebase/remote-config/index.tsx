import { useRemoteConfig } from '../firebaseApp';
import * as React from 'react';
import { remoteConfig } from 'firebase/app';

/**
 * Accepts a key and optionally a Remote Config instance. Returns a
 * Remote Config Value.
 *
 * @param key The parameter key in Remote Config
 * @param remoteConfig Optional instance. If not provided ReactFirebase will either grab the default instance or lazy load.
 */
export function useRemoteConfigValue(key: string, remoteConfig?: remoteConfig.RemoteConfig): remoteConfig.Value {
  remoteConfig = remoteConfig || useRemoteConfig();

  return remoteConfig.getValue(key);
}

/**
 * Convience method similar to useRemoteConfigValue. Returns a `string` from a Remote Config parameter.
 * @param key The parameter key in Remote Config
 * @param remoteConfig Optional instance. If not provided ReactFirebase will either grab the default instance or lazy load.
 */
export function useRemoteConfigString(key: string, remoteConfig?: remoteConfig.RemoteConfig): string {
  remoteConfig = remoteConfig || useRemoteConfig();

  return remoteConfig.getString(key);
}

/**
 * Convience method similar to useRemoteConfigValue. Returns a `number` from a Remote Config parameter.
 * @param key The parameter key in Remote Config
 * @param remoteConfig Optional instance. If not provided ReactFirebase will either grab the default instance or lazy load.
 */
export function useRemoteConfigNumber(key: string, remoteConfig?: remoteConfig.RemoteConfig): number {
  remoteConfig = remoteConfig || useRemoteConfig();

  return remoteConfig.getNumber(key);
}

/**
 * Convience method similar to useRemoteConfigValue. Returns a `boolean` from a Remote Config parameter.
 * @param key The parameter key in Remote Config
 * @param remoteConfig Optional instance. If not provided ReactFirebase will either grab the default instance or lazy load.
 */
export function useRemoteConfigBoolean(key: string, remoteConfig?: remoteConfig.RemoteConfig) {
  remoteConfig = remoteConfig || useRemoteConfig();

  return remoteConfig.getBoolean(key);
}

/**
 * Convience method similar to useRemoteConfigValue. Returns allRemote Config parameters.
 * @param key The parameter key in Remote Config
 * @param remoteConfig Optional instance. If not provided ReactFirebase will either grab the default instance or lazy load.
 */
export function useRemoteConfigAll(
  key: string,
  remoteConfig?: remoteConfig.RemoteConfig
): {
  [key: string]: remoteConfig.Value;
} {
  remoteConfig = remoteConfig || useRemoteConfig();

  return remoteConfig.getAll();
}
