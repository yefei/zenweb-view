import { Context } from 'koa';
import { Environment, ConfigureOptions, configure } from 'nunjucks';
import { SetupFunction } from '@zenweb/core';
import fs = require('fs');
import path = require('path');
import merge = require('lodash.merge');

export interface ViewOption {
  /**
   * 模版文件夹
   * @default './app/view'
   */
  path?: string | string[];

  /**
   * 模版扩展名
   * @default 'njk'
   */
  ext?: string;

  /**
   * 输出到 body 中
   * @default true
   */
  responseBody?: boolean;

  /**
   * 输出类型
   * @default 'html'
   */
  responseType?: string;

  /**
   * 设置 nunjucks 配置
   */
  nunjucksConfig?: ConfigureOptions;

  /**
   * 设置 nunjucks 环境变量
   */
  configureEnvironment?: (env: Environment) => any;

  /**
   * 渲染之前钩子
   */
  beforeRender?: (ctx: Context, name: string, context: object, options: ViewOption) => Promise<string>;
}

const defaultOption: ViewOption = {
  path: path.resolve(process.cwd(), 'app/view'),
  ext: 'njk',
  responseBody: true,
  responseType: 'html',
};

export default function setup(option?: ViewOption): SetupFunction {
  const globalOptions = Object.assign({}, defaultOption, option);
  return function view(setup) {
    setup.debug('option: %o', globalOptions);
    const env = configure(globalOptions.path, globalOptions.nunjucksConfig);

    function loadItems(p: string, filename: string): [string, any][] {
      const fullpath = path.resolve(p, `${filename}.js`);
      if (fs.existsSync(fullpath)) {
        setup.debug('load %s: %s', filename, fullpath);
        const mod = require(fullpath);
        const keys = Object.keys(mod);
        setup.debug('add %s: %s', filename, keys.join(', '));
        return keys.map(name => [name, mod[name]]);
      }
      return [];
    }

    // load filter, tag, global
    for (const p of Array.isArray(globalOptions.path) ? globalOptions.path : [globalOptions.path]) {
      loadItems(p, 'filter').forEach(([name, func]) => env.addFilter(name, func));
      loadItems(p, 'tag').forEach(([name, func]) => env.addExtension(name, func));
      loadItems(p, 'global').forEach(([name, func]) => env.addGlobal(name, func));
    }
  
    if (typeof globalOptions.configureEnvironment === 'function') {
      globalOptions.configureEnvironment(env);
    }
  
    async function render(name: string, context?: object, option?: ViewOption) {
      option = Object.assign({}, globalOptions, option);
      context = merge({ ctx: this }, this.state, context);
      if (option.beforeRender) {
        name = await option.beforeRender(this, name, context, option);
      }
      return new Promise((resolve, reject) => {
        env.render(`${name}.${option.ext}`, context, (err, res) => {
          if (err) return reject(err);
          if (option.responseBody) {
            this.type = option.responseType;
            this.body = res;
          }
          resolve(res);
        });
      });
    };

    setup.defineContextProperty('render', { value: render });
  }
}

declare module 'koa' {
  interface DefaultContext {
    /**
     * 渲染模版
     * @param name 模版名
     * @param context 数据内容
     * @param option 可覆盖全局设置项
     */
    render(name: string, context?: object, option?: ViewOption): Promise<string>;
  }
}
