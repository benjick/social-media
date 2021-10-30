import * as k8s from '@pulumi/kubernetes';
import { provider } from './cluster';

const appLabels = { app: 'app-nginx' };
const app = new k8s.apps.v1.Deployment(
  'do-app-dep',
  {
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          containers: [
            {
              name: 'hello-kubernetes',
              image: 'paulbouwer/hello-kubernetes:1.8',
              ports: [
                {
                  containerPort: 8080,
                },
              ],
              env: [
                {
                  name: 'MESSAGE',
                  value: 'Hello from the first deployment!',
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

const appService = new k8s.core.v1.Service(
  'do-app-svc',
  {
    spec: {
      type: 'ClusterIP',
      selector: app.spec.template.metadata.labels,
      ports: [{ port: 80, targetPort: 8080 }],
    },
  },
  { provider }
);

const appIngress = new k8s.networking.v1.Ingress('app', {
  metadata: {
    annotations: {
      'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
      'kubernetes.io/ingress.class': 'nginx',
    },
  },
  spec: {
    tls: [
      {
        hosts: ['molny.se'],
        secretName: `test-app-tls`,
      },
    ],
    rules: [
      {
        host: 'molny.se',
        http: {
          paths: [
            {
              pathType: 'Prefix',
              path: '/',
              backend: {
                service: {
                  name: appService.metadata.name,
                  port: {
                    number: appService.spec.ports[0].port,
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
});
