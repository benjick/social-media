import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as random from '@pulumi/random';
import { provider } from '../cluster';
import * as postgresql from '@pulumi/postgresql';
import fetch from 'node-fetch';
import { postgresqlPassword, service } from './postgres';

async function getMyIp(): Promise<string> {
  const res = await fetch('https://api.ipify.org?format=json');
  const json = await res.json();
  return `${json.ip}/32`;
}

const ingress = new k8s.networking.v1.Ingress(
  'postgres',
  {
    metadata: {
      annotations: {
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/whitelist-source-range': getMyIp(),
        'nginx.ingress.kubernetes.io/ssl-redirect': 'false',
      },
    },
    spec: {
      rules: [
        {
          host: 'db.molny.se',
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

const postgresProvider = new postgresql.Provider(
  'provider',
  {
    host: 'db.molny.se',
    port: 80,
    username: 'admin',
    password: postgresqlPassword,
  },
  {
    dependsOn: ingress,
  }
);

export function createPostgresDb(name: string) {
  const _name = `postgres-db-${name}`;
  const opts = {
    provider: postgresProvider,
  };
  const db = new postgresql.Database(_name, {}, opts);
  const password = new random.RandomPassword(_name, {
    length: 32,
  });
  const user = new postgresql.Role(
    _name,
    {
      login: true,
      password: password.result,
    },
    opts
  );
  new postgresql.Grant(
    _name,
    {
      database: db.name,
      objectType: 'table',
      privileges: ['ALL'],
      role: user.name,
      schema: 'public',
    },
    opts
  );
  const uri = pulumi.interpolate`postgres://${user.name}:${password.result}@${service.metadata.name}:5432/${db.name}`;

  return { uri };
}
