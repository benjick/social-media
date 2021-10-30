import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as digitalocean from '@pulumi/digitalocean';
import { provider } from './cluster';

export const registry = new digitalocean.ContainerRegistry('molny', {
  subscriptionTierSlug: 'starter',
});

const credentials = new digitalocean.ContainerRegistryDockerCredentials(
  'registry-credentials',
  {
    registryName: registry.name,
    write: true,
    expirySeconds: 60 * 60 * 365 * 49, // 49 years
  }
);

const login = credentials.dockerCredentials.apply((credentials) => {
  const json = JSON.parse(credentials);
  const base64 = json.auths['registry.digitalocean.com'].auth;
  const [username, password] = atob(base64).split(':');
  return {
    username,
    password,
    server: 'registry.digitalocean.com',
  };
});

function generateBase64(
  username: pulumi.Output<string>,
  password: pulumi.Output<string>
) {
  const output = pulumi.interpolate`${username}:${password}`;
  return output.apply((string) => {
    const base64Credentials = Buffer.from(string).toString('base64');
    const json = `{"auths":{"registry.digitalocean.com":{"auth":"${base64Credentials}"}}}`;
    return Buffer.from(json).toString('base64');
  });
}

const base64JsonEncodedCredentials = generateBase64(
  login.username,
  login.password
);

export const pullSecret = new k8s.core.v1.Secret(
  'pull-secret',
  {
    // metadata: {
    //   namespace: namespace.metadata.name,
    // },
    type: 'kubernetes.io/dockerconfigjson',
    data: {
      '.dockerconfigjson': base64JsonEncodedCredentials,
    },
  },
  { provider }
);

export const imagePullSecrets = [
  {
    name: pullSecret.metadata.name,
  },
];

export const registryCredentials = {
  username: login.username,
  password: login.password,
  server: 'registry.digitalocean.com',
};
