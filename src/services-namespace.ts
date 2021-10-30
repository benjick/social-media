import * as k8s from '@pulumi/kubernetes';
import { provider } from './cluster';

export const servicesNamespace = new k8s.core.v1.Namespace(
  'services',
  {},
  { provider }
);
