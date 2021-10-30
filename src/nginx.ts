import * as digitalocean from '@pulumi/digitalocean';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import { provider } from './cluster';

// Enable some configurable parameters.
const config = new pulumi.Config('k8s');
const domainName = config.get('domain');

export const nginxIngressNamespace = new k8s.core.v1.Namespace(
  'nginx-ingress',
  undefined,
  { provider }
);

export const nginx = new k8s.helm.v3.Chart(
  'nginx-ingress',
  {
    // namespace: nginxIngressNamespace.metadata.name,
    chart: 'ingress-nginx',
    version: '3.9.0',
    fetchOpts: { repo: 'https://kubernetes.github.io/ingress-nginx' },
    values: {
      controller: {
        publishService: {
          enabled: true,
        },
      },
    },
  },
  { provider }
);

export const service = nginx.resources.apply((resources) => {
  const key = Object.keys(resources).find(
    (key) =>
      key.includes('v1/Service::') && key.endsWith('ingress-nginx-controller')
  );
  if (!key) {
    throw new Error('Could not find service');
  }
  const service = resources[key] as k8s.core.v1.Service;
  return service;
});

export const ingressIp = service.status.loadBalancer.ingress[0].ip;

if (domainName) {
  const domain = new digitalocean.Domain(
    'do-domain',
    {
      name: domainName,
      ipAddress: ingressIp,
    },
    {
      deleteBeforeReplace: true,
    }
  );

  const subdomains = ['www', 'matrix'];
  subdomains.map((name) => {
    new digitalocean.DnsRecord(`do-${name}-cname`, {
      domain: domain.name,
      type: 'CNAME',
      name,
      value: '@',
    });
  });
}
