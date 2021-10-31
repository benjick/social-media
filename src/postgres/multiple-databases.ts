import * as k8s from '@pulumi/kubernetes';
import * as fs from 'fs';
import { provider } from '../cluster';

const config = new k8s.core.v1.ConfigMap(
  'postgres-multiple-dbs',
  {
    data: {
      'create-multiple-postgresql-databases.sh': fs.readFileSync(
        './postgres/create-multiple-postgresql-databases.sh',
        'utf8'
      ),
    },
  },
  {
    provider,
  }
);

const volumeName = 'postgres-multiple-dbs';

export const volumeMounts: k8s.types.input.core.v1.VolumeMount[] = [
  {
    name: volumeName,
    mountPath:
      '/docker-entrypoint-initdb.d/create-multiple-postgresql-databases.sh',
    subPath: 'create-multiple-postgresql-databases.sh',
    readOnly: true,
  },
];

export const volume: k8s.types.input.core.v1.Volume = {
  name: volumeName,
  configMap: {
    name: config.metadata.name,
  },
};
