# axejs

## Installation

```
npm install axejs
```

## use
```
var path = require('path');
var axejs = require('axejs');
axejs.init({
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

axejs.set('debug', true);
axejs.set('views', 'src/public/views');
axejs.set('controller path', 'src/server/controller');

axejs.set('babel options', {log: true});
axejs.set('compile', true);
axejs.set('source Path', 'src/server');
axejs.set('output Path', 'output');
axejs.compile();

axejs.start();
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
