'use strict';

process.env.DEBUG = '*';

const { default: view } = require('../../dist');
const { Core } = require('@zenweb/core');
const { default: router } = require('@zenweb/router');

const app = module.exports = new Core();

app.setup(router());
app.setup(view());
app.start();
