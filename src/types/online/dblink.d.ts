export interface DBLink {
  dblinkId?: string;
  dblinkName?: string;
  dblinkDescription?: string;
  dblinkType?: number;
  configuration: {
    host?: string;
    database?: string;
    username?: string;
    password?: string;
    jdbcString?: string;
    serviceId?: string;
    port?: number;
    schema?: string;
    sid?: boolean;
    initialPoolSize?: number;
    minPoolSize?: number;
    maxPoolSize?: number;
  } & string;
  isDatasourceInit: boolean;
  [key: string]: ANY_OBJECT;
}
