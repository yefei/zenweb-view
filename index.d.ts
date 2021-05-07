import { Environment, ConfigureOptions } from 'nunjucks';

export interface ViewOptions {
  path?: string | string[];
  ext?: string;
  responseBody?: boolean;
  responseType?: string;
  nunjucksConfig?: ConfigureOptions;
  configureEnvironment?: (env: Environment) => any;
}

declare module 'koa' {
  interface BaseContext {
    render(name: string, context?: object, options?: ViewOptions): Promise<string>;
  }
}
