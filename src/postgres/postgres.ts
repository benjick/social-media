import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as random from '@pulumi/random';
import { provider } from '../cluster';
import {
  volume as multipleVolume,
  volumeMounts as multipleVolumeMounts,
} from './multiple-databases';

const appLabels = { app: 'postgres' };

const password = new random.RandomPassword('postgres', {
  length: 32,
});

export const postgresqlPassword = password.result;

const configMap = new k8s.core.v1.ConfigMap(
  'postgres',
  {
    data: {
      POSTGRES_USER: 'admin',
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

export const service = new k8s.core.v1.Service(
  'postgres',
  {
    metadata: {
      name: serviceName,
    },
    spec: {
      type: 'ClusterIP',
      selector: appLabels,
      ports: [{ port: 5432, targetPort: 5432 }],
    },
  },
  { provider }
);

export function createPostgresUri(dbname: string) {
  return pulumi.interpolate`postgres://admin:${password.result}@${service.metadata.name}:5432/${dbname}`;
}

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
              // image: 'postgres:12',
              // image: 'paulbouwer/hello-kubernetes:1',
              image: 'postgres:11',
              ports: [
                {
                  containerPort: 5432,
                },
              ],
              volumeMounts: [
                ...multipleVolumeMounts,
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
                  name: 'POSTGRES_MULTIPLE_DATABASES',
                  value: 'supertokens,synapse',
                },
                {
                  name: 'PGDATA',
                  value: '/var/lib/postgresql/data/pgdata',
                },
              ],
            },
          ],
          volumes: [
            multipleVolume,
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
