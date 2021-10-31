import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { createPostgresDb } from '../postgres';
import { provider } from '../cluster';

const { uri } = createPostgresDb('supertoken');

const appName = 'supertokens';
const appLabels = { app: appName };

const secrets = new k8s.core.v1.Secret(
  appName,
  {
    stringData: {
      'postgres-uri': uri,
    },
  },
  {
    provider,
  }
);

const app = new k8s.apps.v1.Deployment(
  'supertokens',
  {
    metadata: {
      labels: appLabels,
    },
    spec: {
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          containers: [
            {
              name: 'supertokens',
              image:
                'registry.supertokens.io/supertokens/supertokens-postgresql',
              env: [
                {
                  name: 'POSTGRESQL_CONNECTION_URI',
                  valueFrom: {
                    secretKeyRef: {
                      name: secrets.metadata.name,
                      key: 'postgres-uri',
                    },
                  },
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
  'supertokens',
  {
    metadata: {
      labels: app.spec.template.metadata.labels,
    },
    spec: {
      type: 'NodePort',
      ports: [{ port: 3567, targetPort: 3567, protocol: 'TCP' }],
      selector: app.spec.template.metadata.labels,
    },
  },
  { provider }
);

export const connectionUri = pulumi.interpolate`http://${service.metadata.name}:3567`;
