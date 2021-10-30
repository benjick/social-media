import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as random from '@pulumi/random';
import { provider } from './cluster';

const appLabels = { app: 'postgres' };

const password = new random.RandomPassword('postgres', {
  length: 32,
});

export const postgresqlPassword = password.result;

const configMap = new k8s.core.v1.ConfigMap(
  'postgres',
  {
    data: {
      POSTGRES_DB: 'synapse',
      POSTGRES_USER: 'synapse-db',
      POSTGRES_PASSWORD: password.result,
      POSTGRES_INITDB_ARGS: '--locale=C --encoding=UTF-8',
    },
  },
  { provider }
);

const pvc = new k8s.core.v1.PersistentVolumeClaim(
  'postgres',
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

const serviceName = 'postgres-service';

const service = new k8s.core.v1.Service(
  'postgres',
  {
    metadata: {
      name: serviceName,
    },
    spec: {
      type: 'ClusterIP',
      selector: appLabels,
      ports: [{ port: 80, targetPort: 8080 }],
    },
  },
  { provider }
);

export const postgresUri = pulumi.interpolate`postgres://postgres:${postgresqlPassword}@${service.metadata.name}:5432/{dbname}`;

const app = new k8s.apps.v1.StatefulSet(
  'postgres',
  {
    spec: {
      serviceName: serviceName,
      selector: { matchLabels: appLabels },
      replicas: 1,
      template: {
        metadata: { labels: appLabels },
        spec: {
          containers: [
            {
              name: 'postgres',
              image: 'postgres:12',
              ports: [
                {
                  containerPort: 5432,
                },
              ],
              volumeMounts: [
                {
                  name: 'data',
                  mountPath: '/var/lib/postgresql/data',
                },
              ],
              envFrom: [
                {
                  configMapRef: {
                    name: configMap.metadata.name,
                  },
                },
              ],
              env: [
                {
                  name: 'PGDATA',
                  value: '/var/lib/postgresql/data/pgdata',
                },
              ],
            },
          ],
          volumes: [
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
