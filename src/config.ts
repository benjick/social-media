import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config('k8s');

export const region = config.require('region');
export const dropletSize = config.require('dropletSize');
