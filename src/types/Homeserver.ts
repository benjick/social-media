export interface Homeserver {
  modules?: {
    module: string;
    config?: {};
  }[];
  server_name: string;
  pid_file: string;
  listeners: {
    port: number;
    tls: boolean;
    type: string;
    resources: {
      names: string[];
      compress: boolean;
    }[];
  }[];
  database: {
    name: string;
    args: any;
  };
  log_config: string;
  media_store_path: string;
  registration_shared_secret: string;
  report_stats: boolean;
  macaroon_secret_key: string;
  form_secret: string;
  signing_key_path: string;
  trusted_key_servers: {
    server_name: string;
  }[];
  enable_group_creation: boolean;
  group_creation_prefix: string;
}
