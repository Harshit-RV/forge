import { CoreV1Api, Exec, KubeConfig } from '@kubernetes/client-node';

const kc = new KubeConfig();
kc.loadFromDefault();

export function getCore(): CoreV1Api {
  return kc.makeApiClient(CoreV1Api);
}

export function getExec(): Exec {
  return new Exec(kc);
}
