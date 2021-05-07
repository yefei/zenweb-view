# zenweb-view
zenweb view module

## Quick start

```bash
$ npm i @zenweb/view
```

app/index.js
```js
'use strict';

const app = module.exports = require('zenweb').create();

app.setup('@zenweb/view');

app.boot().then(() => {
  app.router.get('/', ctx => {
    return ctx.render('index', {
      name: 'world',
    });
  });
  app.listen();
});
```

app/view/index.njk
```html
<h1>Hello {{name}}</h1>
```
