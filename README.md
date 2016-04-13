# axejs

## Installation

```
npm install axejs
```

## use
```
var path = require('path');
var axe = require('axe');
axe.init({
    'root': path.join(__dirname, '../'),
    'name': 'axe test',
    'host': '127.0.0.1',
    'port': 7000,
    'session options': {},
    'session store': 'redis',
    'compression': true,
    'trust proxy': true,
    'view engine': 'jade',
    'view pretty': true,
    'view cache': false,
    'locals': {
        title: 'axe'
    },
    'favicon': 'src/public/static/favicon.ico',
    'static': ['public'],
    'body parser': '50mb',
    'middleware path': ['src/server/middleware']
});

axe.set('debug', true);
axe.set('views', 'src/public/views');
axe.set('controller path', 'src/server/controller');

axe.set('babel options', {log: true});
axe.set('compile', true);
axe.set('source Path', 'src/server');
axe.set('output Path', 'output');
axe.compile();

axe.start();
```

### controller or router

```
export default function(router){
    router.get('/', (req, res) => {
        return res.render('index');
    });
    return router;
};
```
