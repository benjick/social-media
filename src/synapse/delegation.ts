import { resolve } from 'path';
import * as fs from 'fs';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '../cluster';

const delegationConfigFile = fs.readFileSync(
  resolve(__dirname, 'delegation.conf'),
  'utf8'
);

const delegationConfig = new k8s.core.v1.ConfigMap(
  'delegation-config',
  {
    data: {
      'delegation.conf': delegationConfigFile,
    },
  },
  {
    provider,
  }
);

const volumeName = 'delegation-config';

const volumeMounts: k8s.types.input.core.v1.VolumeMount[] = [
  {
    name: volumeName,
    mountPath: '/etc/nginx/conf.d/default.conf',
    subPath: 'delegation.conf',
  },
];

const volume: k8s.types.input.core.v1.Volume = {
  name: volumeName,
  configMap: {
    name: delegationConfig.metadata.name,
  },
};

const appLabels = { app: 'matrix-delegation' };

const app = new k8s.apps.v1.Deployment(
  'matrix-delegation',
  {
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          containers: [
            {
              name: 'nginx',
              image: 'nginx',
              ports: [
                {
                  containerPort: 80,
                },
              ],
              volumeMounts,
            },
          ],
          volumes: [volume],
        },
      },
    },
  },
  { provider }
);

export const service = new k8s.core.v1.Service(
  'matrix-delegation',
  {
    spec: {
      type: 'ClusterIP',
      selector: app.spec.template.metadata.labels,
      ports: [{ port: 8080, targetPort: 80 }],
    },
  },
  { provider }
);
