import * as k8s from '@pulumi/kubernetes';
import * as docker from '@pulumi/docker';
import * as pulumi from '@pulumi/pulumi';
import { registryCredentials, imagePullSecrets, registry } from './registry';
import { provider } from './cluster';
import { connectionUri } from './vendor/supertokens';

const appName = 'collo-auth';
const appLabels = { app: appName };

const image = new docker.Image(
  appName,
  {
    build: {
      context: '../auth',
      cacheFrom: true,
    },
    imageName: pulumi.interpolate`registry.digitalocean.com/${registry.name}/collo-auth`,
    registry: registryCredentials,
  },
  {
    provider,
  }
);

const deployment = new k8s.apps.v1.Deployment(
  appName,
  {
    metadata: {
      // namespace: namespace.metadata.name,
      labels: appLabels,
    },
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          imagePullSecrets,
          containers: [
            {
              name: 'auth',
              image: image.imageName,
              env: [
                {
                  name: 'SUPERTOKENS_URI',
                  value: connectionUri,
                },
              ],
            },
          ],
        },
      },
    },
  },
  { provider }
);

export const service = new k8s.core.v1.Service(
  appName,
  {
    metadata: {
      labels: deployment.spec.template.metadata.labels,
      // namespace: namespace.metadata.name,
    },
    spec: {
      type: 'NodePort',
      ports: [{ port: 3000, targetPort: 3000, protocol: 'TCP' }],
      selector: deployment.spec.template.metadata.labels,
    },
  },
  { provider }
);

const ingress = new k8s.networking.v1.Ingress(
  'auth',
  {
    metadata: {
      annotations: {
        'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
        'kubernetes.io/ingress.class': 'nginx',
      },
    },
    spec: {
      tls: [
        {
          hosts: ['auth.molny.se'],
          secretName: `auth-tls`,
        },
      ],
      rules: [
        {
          host: 'auth.molny.se',
          http: {
            paths: [
              {
                pathType: 'Prefix',
                path: '/',
                backend: {
                  service: {
                    name: service.metadata.name,
                    port: {
                      number: service.spec.ports[0].port,
                    },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
  { provider }
);
