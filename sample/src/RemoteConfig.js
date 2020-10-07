import React from 'react';
import { useRemoteConfigValue, SuspenseWithPerf } from '@protrex/react-firebase';

const RemoteConfig = props => {
  const parameter = useRemoteConfigValue(props.rcKey);
  const value = parameter.asString();
  return <div>{value}</div>;
};

const SuspenseWrapper = props => {
  return (
    <SuspenseWithPerf traceId={'remote-config-message'} fallback={<p>loading remote config</p>}>
      <RemoteConfig rcKey="message" />
    </SuspenseWithPerf>
  );
};

export default SuspenseWrapper;
