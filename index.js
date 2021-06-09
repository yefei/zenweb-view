'use strict';

const debug = require('debug')('zenweb:view');
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const merge = require('lodash.merge');

function loadItems(p, filename) {
  const fullpath = path.resolve(p, `${filename}.js`);
  if (fs.existsSync(fullpath)) {
    debug('load %s: %s', filename, fullpath);
    const mod = require(fullpath);
    const keys = Object.keys(mod);
    debug('add %s: %s', filename, keys.join(', '));
    return keys.map(name => [name, mod[name]]);
  }
  return [];
}

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

  // load filter, tag, global
  for (const p of Array.isArray(globalOptions.path) ? globalOptions.path : [globalOptions.path]) {
    loadItems(p, 'filter').forEach(([name, func]) => env.addFilter(name, func));
    loadItems(p, 'tag').forEach(([name, func]) => env.addExtension(name, func));
    loadItems(p, 'global').forEach(([name, func]) => env.addGlobal(name, func));
  }

  if (typeof globalOptions.configureEnvironment === 'function') {
    globalOptions.configureEnvironment(env);
  }

  core.koa.context.render = function render(name, context, options) {
    options = Object.assign({}, globalOptions, options);
    const mergedContext = merge({ ctx: this }, this.state, context);
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
