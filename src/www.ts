import * as k8s from '@pulumi/kubernetes';
import { service } from './auth';
import { provider } from './cluster';
import { service as delegationService } from './synapse/delegation';

const ingress = new k8s.networking.v1.Ingress(
  'app',
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
          hosts: ['molny.se'],
          secretName: `www-tls`,
        },
      ],
      rules: [
        {
          host: 'molny.se',
          http: {
            paths: [
              {
                pathType: 'Prefix',
                path: '/.well-known/matrix/server',
                backend: {
                  service: {
                    name: delegationService.metadata.name,
                    port: {
                      number: delegationService.spec.ports[0].port,
                    },
                  },
                },
              },
              {
                pathType: 'Prefix',
                path: '/.well-known/matrix/client',
                backend: {
                  service: {
                    name: delegationService.metadata.name,
                    port: {
                      number: delegationService.spec.ports[0].port,
                    },
                  },
                },
              },
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
