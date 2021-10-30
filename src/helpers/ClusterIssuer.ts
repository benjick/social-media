import { CustomResourceOptions, Input } from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';

type ClusterIssuerArgs = {
  name: string;
  acme: any;
  namespace?: Input<string>;
};

export class ClusterIssuer extends k8s.apiextensions.CustomResource {
  constructor(
    resourceName: string,
    resourceArgs: ClusterIssuerArgs,
    opts: CustomResourceOptions
  ) {
    const args: k8s.apiextensions.CustomResourceArgs = {
      apiVersion: 'cert-manager.io/v1',
      kind: 'ClusterIssuer',
      metadata: {
        annotations: {},
        namespace: resourceArgs.namespace,
        name: resourceArgs.name,
      },
      spec: {
        acme: resourceArgs.acme,
      },
    };
    super(resourceName, args, opts);
  }
}
