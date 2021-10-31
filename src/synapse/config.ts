import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as fs from 'fs';
import { provider } from '../cluster';

const config = new pulumi.Config();
const signingKey = config.requireSecret('signing-key');

const homeserverConfig = new k8s.core.v1.ConfigMap(
  'homeserver-config',
  {
    data: {
      'homeserver.yaml': fs.readFileSync('../homeserver.yaml', 'utf8'),
      'log.yaml': fs.readFileSync('./synapse/log.yaml', 'utf8'),
      'signing.key': signingKey,
    },
  },
  {
    provider,
  }
);

const volumeName = 'homeserver-config';

export const volumeMounts: k8s.types.input.core.v1.VolumeMount[] = [
  {
    name: volumeName,
    mountPath: '/data/homeserver.yaml',
    subPath: 'homeserver.yaml',
    readOnly: true,
  },
  {
    name: volumeName,
    mountPath: '/data/matrix.molny.se.signing.key',
    subPath: 'signing.key',
    readOnly: true,
  },
  {
    name: volumeName,
    mountPath: '/data/log.yaml',
    subPath: 'log.yaml',
    readOnly: true,
  },
];

export const volume: k8s.types.input.core.v1.Volume = {
  name: volumeName,
  configMap: {
    name: homeserverConfig.metadata.name,
  },
};
