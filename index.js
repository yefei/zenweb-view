'use strict';

const debug = require('debug')('zenweb:view');
const path = require('path');
const nunjucks = require('nunjucks');
const merge = require('lodash.merge');

/**
 * @param {import('zenweb').Core} core 
 * @param {object} [options]
 */
function setup(core, options) {
  const globalOptions = Object.assign({
    path: path.resolve(process.cwd(), 'app/view'),
    ext: 'njk',
    responseBody: true,
    responseType: 'html',
  }, options);
  debug('options: %o', globalOptions);

  const env = nunjucks.configure(globalOptions.path, globalOptions.nunjucksConfig);

  if (typeof globalOptions.configureEnvironment === 'function') {
    globalOptions.configureEnvironment(env);
  }

  core.koa.context.render = function render(name, context, options) {
    options = Object.assign({}, globalOptions, options);
    const mergedContext = merge({}, this.state, context);
    return new Promise((resolve, reject) => {
      env.render(`${name}.${options.ext}`, mergedContext, (err, res) => {
        if (err) return reject(err);
        if (options.responseBody) {
          this.type = options.responseType;
          this.body = res;
        }
        resolve(res);
      });
    });
  };
}

module.exports = {
  setup,
};
