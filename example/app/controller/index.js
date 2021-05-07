'use strict';

const app = require('..');

app.router.get('/', ctx => {
  ctx.state.date = new Date();
  return ctx.render('index', {
    name: '<b>world</b>',
  });
});
