import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { ClusterIssuer } from '../helpers/ClusterIssuer';
import { provider } from '../cluster';
import { servicesNamespace } from '../services-namespace';

const config = new pulumi.Config('do');
const token = config.requireSecret('token');
const email = config.requireSecret('email');

export const certManagerChart = new k8s.helm.v3.Chart(
  'cert-manager',
  {
    chart: 'cert-manager',
    version: 'v1.6.0',
    namespace: servicesNamespace.metadata.name,
    // https://github.com/jetstack/cert-manager/issues/2602#issuecomment-739971813
    values: {
      installCRDs: true,
    },
    fetchOpts: {
      repo: 'https://charts.jetstack.io',
    },
  },
  {
    provider,
    // dependsOn: certManagerCRDS,
  }
);

const secret = new k8s.core.v1.Secret(
  'cloudflare-secret',
  {
    metadata: {
      namespace: servicesNamespace.metadata.name,
    },
    stringData: {
      'access-token': token,
    },
  },
  { provider }
);

const letsencryptStaging = new ClusterIssuer(
  'letsencrypt-staging',
  {
    name: 'letsencrypt-staging',
    namespace: servicesNamespace.metadata.name,
    acme: {
      server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
      privateKeySecretRef: {
        name: 'letsencrypt-staging',
      },
      email,
      solvers: [
        {
          http01: {
            ingress: {
              class: 'nginx',
            },
          },
        },
      ],
    },
  },
  {
    provider,
    dependsOn: certManagerChart,
  }
);

const letsencryptProduction = new ClusterIssuer(
  'letsencrypt-prod',
  {
    name: 'letsencrypt-prod',
    namespace: servicesNamespace.metadata.name,
    acme: {
      server: 'https://acme-v02.api.letsencrypt.org/directory',
      privateKeySecretRef: {
        name: 'letsencrypt-prod',
      },
      email,
      solvers: [
        {
          dns01: {
            digitalocean: {
              email,
              tokenSecretRef: {
                name: secret.metadata.name,
                key: 'access-token',
              },
            },
          },
        },
      ],
    },
  },
  {
    provider,
    dependsOn: certManagerChart,
  }
);
