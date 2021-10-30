import * as k8s from '@pulumi/kubernetes';
import { provider } from './cluster';
import {
  volumeMounts as homeserverVolumeMounts,
  volume as homeserverVolume,
} from './homeserver';

const dirs = ['/data/media_store', '/data/uploads', '/data/logs'];

const args = dirs.map((dir) => `mkdir -p ${dir}; chown 991:991 ${dir};`);

const pvc = new k8s.core.v1.PersistentVolumeClaim(
  'pvc',
  {
    spec: {
      accessModes: ['ReadWriteOnce'],
      resources: {
        requests: {
          storage: '30Gi',
        },
      },
      storageClassName: 'do-block-storage',
    },
  },
  {
    provider,
  }
);

const appLabels = { app: 'synapse' };
const app = new k8s.apps.v1.Deployment(
  'synapse',
  {
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          securityContext: {
            fsGroup: 991,
          },
          initContainers: [
            {
              name: 'chown',
              image: 'busybox:latest',
              // command: ['/bin/mkdir', '-p', '/data/media_store'],
              command: ['/bin/sh', '-c'],
              args,
              volumeMounts: [
                {
                  name: 'data',
                  mountPath: '/data',
                },
              ],
            },
          ],
          containers: [
            {
              name: 'synapse',
              // image: 'matrixdotorg/synapse:v1.45.1',
              image: 'paulbouwer/hello-kubernetes:1.8',
              ports: [
                {
                  containerPort: 8008,
                },
              ],
              volumeMounts: [
                ...homeserverVolumeMounts,
                {
                  name: 'data',
                  mountPath: '/data',
                },
              ],
            },
          ],
          volumes: [
            homeserverVolume,
            {
              name: 'data',
              persistentVolumeClaim: {
                claimName: pvc.metadata.name,
              },
            },
          ],
        },
      },
    },
  },
  { provider }
);

const service = new k8s.core.v1.Service(
  'synapse',
  {
    spec: {
      type: 'ClusterIP',
      selector: app.spec.template.metadata.labels,
      ports: [{ port: 8008, targetPort: 8008 }],
    },
  },
  { provider }
);

const ingress = new k8s.networking.v1.Ingress(
  'synapse',
  {
    metadata: {
      annotations: {
        'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/proxy-body-size': '100M',
      },
    },
    spec: {
      tls: [
        {
          hosts: ['matrix.molny.se'],
          secretName: `synapse-tls`,
        },
      ],
      rules: [
        {
          host: 'matrix.molny.se',
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
