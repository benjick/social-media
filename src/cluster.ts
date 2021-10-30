import * as digitalocean from '@pulumi/digitalocean';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('k8s');

const cluster = new digitalocean.KubernetesCluster('do-cluster', {
  region: config.require('region'),
  version: digitalocean.getKubernetesVersions().then((p) => p.latestVersion),
  nodePool: {
    name: 'default',
    size: config.require('dropletSize'),
    nodeCount: config.requireNumber('nodecount'),
  },
});

export const kubeconfig = cluster.status.apply((status) => {
  if (status === 'running') {
    const clusterDataSource = cluster.name.apply((name) =>
      digitalocean.getKubernetesCluster({ name })
    );
    return clusterDataSource.kubeConfigs[0].rawConfig;
  } else {
    return cluster.kubeConfigs[0].rawConfig;
  }
});

export const provider = new k8s.Provider('do-k8s', { kubeconfig });
