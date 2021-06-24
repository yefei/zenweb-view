import { Environment, ConfigureOptions } from 'nunjucks';
import { Context } from 'koa';

export interface ViewOptions {
  path?: string | string[];
  ext?: string;
  responseBody?: boolean;
  responseType?: string;
  nunjucksConfig?: ConfigureOptions;
  configureEnvironment?: (env: Environment) => any;
  beforeRender?: (ctx: Context, name: string, context: object, options: ViewOptions) => Promise<string>;
}

declare module 'koa' {
  interface BaseContext {
    render(name: string, context?: object, options?: ViewOptions): Promise<string>;
  }
}
