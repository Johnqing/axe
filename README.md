# axe

## use
```
var axe = require('axe');
axe.init({
    'root': __dirname,
    'name': 'application name',
    'host': 'application host',
    'port': 5500,
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
    'favicon': 'public/favicon.ico',
    'body parser': '50mb'
});
// 请在生产关闭debug
axe.set('debug', true);
axe.set('static', ['public']);
axe.set('middleware path', ['middleware']);
axe.set('controller path', 'controller');
axe.set('views', 'controller');

axe.start();
```

*ps: `controller path` 这个比较特殊会根据传入的路径，生成路由。*

## controller or router
```
module.exports = function(router){
    router.get('/', function(req, res) {
        return res.render('index');
    });
    return router;
};
```
