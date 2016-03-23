// 系统级别的包
import fs from 'fs';
import path from 'path';
// 用户级别的包导入
import express from 'express';
import _ from 'lodash';
import glob from 'glob';
import favicon from 'static-favicon';
import session from 'express-session';
import compression from 'compression';
import serveStatic from 'serve-static';
import bodyParser from 'body-parser';
const dashes = '\n------------------------------------------------\n';
/**
 * Axe Class
 *
 * @api public
 */
class Axe {
    constructor() {
        this.express = express;
        this._options = {
            'name': 'Axe'
        };

        this.set('session options', '');
        this.set('env', process.env.NODE_ENV || 'development');
        this.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT);
        this.set('host', process.env.HOST || process.env.IP || process.env.OPENSHIFT_NODEJS_IP);
        this.set('listen', process.env.LISTEN);
    }

    creatExpressApp() {
        const app = this.express();
        this.initExpressSession();
        // 显示团队信息
        app.use((req, res, next) => {
            res.header('X-Powered-By', 'Axe <TJFE>');
            next();
        });

        // 静态压缩
        if (this.get('compression')) {
            app.use(compression());
        }

        // trust proxy
        if (this.get('trust proxy') === true) {
            app.enable('trust proxy');
        } else {
            app.disable('trust proxy');
        }

        // view engine
        const engine = this.get('view engine');
        app.set('views', this.getPath('views') || path.sep);
        app.set('view engine', engine);

        // jade的情况下，建议在开发环境开启非压缩模式，进行调试
        if (engine === 'jade' && this.get('view pretty')) {
            app.locals.pretty = true;
        }

        // cache
        app.set('view cache', this.get('view cache'));

        //locals var
        _.assign(app.locals, this.get('locals'));

        //favicon
        if (this.get('favicon')) {
            app.use(favicon(this.getPath('favicon')));
        }

        // 静态资源处理
        const statics = this.get('static');
        if (typeof statics === 'string') {
            app.use(serveStatic(this.getPath('static')));
        } else if (Array.isArray(statics)) {
            statics.forEach((path)=> {
                app.use(serveStatic(this.expandPath(path)));
            });
        }

        // body parse
        const limit = this.get('body parser') || '50mb';
        if (this.get('body parser')) {
            app.use(bodyParser.json({limit: limit}));
            app.use(bodyParser.urlencoded({extended: false, limit: limit}));
        }

        // 中间件
        const middleWarePath = this.get('middleware path');
        if(middleWarePath){
            glob.sync(this.expandPath(middleWarePath)).forEach((path)=> {
                app.use(require(path));
            });
        }

        // controller
        const controllerPath = this.get('controller path');
        if(controllerPath){
            const cpath = this.expandPath(controllerPath);
            const routers = path.join(cpath, '**/*.js');
            glob.sync(routers).forEach((file)=> {
                const routerDirname = file.replace(cpath, '');
                const router = routerDirname.replace('.js');
                app.use(router, require(file));
            });
        }

        return app;
    }

    /**
     * 初始化express session的配置
     * @returns {Axe}
     */
    initExpressSession() {
        // 设置过session，直接返回
        if (this.expressSession)
            return this;
        // 获取session的配置
        let sessionOptions = this.get('session options');

        if (typeof sessionOptions !== 'object')
            sessionOptions = {};

        // 设置 cookie 中，保存 session 的字段名称，默认为 connect.sid
        !sessionOptions.name && (sessionOptions.name = '_S');
        // 即使 session 没有被修改，也保存 session 值，默认为 true。
        !sessionOptions.resave && (sessionOptions.resave = false);
        !sessionOptions.saveUninitialized && (sessionOptions.saveUninitialized = false);
        // rolling: 每个请求都重新设置一个 cookie，默认为 false。
        !sessionOptions.rolling && (sessionOptions.rolling = false);
        // 通过设置的 secret 字符串，来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改。
        !sessionOptions.secret && (sessionOptions.secret = this.get('cookie secret'));

        let sessionStore = this.get('session store');
        if (typeof sessionStore === 'function') {
            sessionOptions.store = sessionStore(session);
        } else if (sessionStore) {
            let sessionStoreOptions = this.get('session store options') || {};
            if (sessionStore === 'redis') {
                sessionStore = 'connect-redis';
            }
            // 处理不同的session store，目前只支持redis
            switch (sessionStore) {
                case 'connect-redis':
                    break;
            }
            const SessionStore = require(sessionStore)(session);
            sessionOptions.store = new SessionStore(sessionStoreOptions);
        }

        this.set('session options', sessionOptions);
        this.expressSession = session(sessionOptions);
    }

    /**
     * 初始化一个express的应用
     * @returns {Axe}
     */
    initExpressApp() {
        if (this.app)
            return this;
        this.initExpressSession();
        this.app = this.creatExpressApp();
    }

    /**
     * 初始化axe
     * @param options
     * @returns {Axe}
     */
    init(options) {
        this.options(options);
        return this;
    }

    /**
     * 启动
     * @returns {Axe}
     */
    start() {
        process.on('uncaughtException', function (e) {
            if (e.code === 'EADDRINUSE') {
                console.log(dashes
                    + this.get('name') + ' failed to start: address already in use\n'
                    + 'Please check you are not already running a server on the specified port.\n');
                process.exit();
            } else {
                console.log(e.stack || e);
                process.exit(1);
            }
        });

        this.initExpressApp();

        var axe = this;
        var app = axe.app;

        var host = axe.get('host');
        var port = axe.get('port') || 3000;
        var message = axe.get('name') + ' is ready on ';
        // 启动成功
        function ready(err) {
            if (err) {
                return console.log(`${axe.get('name') }:start:`, err);
            }
            console.log(`${axe.get('name') }:start:`, message);
        }

        if (host) {
            message += 'http://' + host + ':' + port;
            axe.httpServer = app.listen(port, host, ready);
        } else {
            message += 'port ' + port;
            // 没有设置端口的话随机一个
            axe.httpServer = app.listen(port, ready);
        }

        return this;
    }

    /**
     * 设置Axe的options
     * @param key
     * @param value
     * @returns {*}
     *
     * @example:
     *          axe.set('xx', 'xx');
     */
    set(key, value) {
        if (arguments.length === 1) {
            return this._options[key];
        }

        this._options[key] = value;
        return this;
    }

    /**
     * 类似set
     * @param options
     * @returns {*}
     */
    options(options) {
        if (!arguments.length) {
            return this._options;
        }

        if (typeof options === 'object') {
            var keys = Object.keys(options);
            var i = keys.length;
            var k;
            while (i--) {
                k = keys[i];
                this.set(k, options[k]);
            }
        }
        return this._options;
    }

    /**
     * 获取key的值
     * @param key
     * @returns {*}
     */
    get(key) {
        return this._options[key];
    }

    /**
     * 获取文件路径
     * @param key
     * @returns {*}
     */
    getPath(key) {
        return this.expandPath(this.get(key));
    }

    /**
     * 获取路径
     * @param value
     * @returns {*}
     */
    expandPath(value) {
        return (typeof value === 'string' &&
        value.substring(0, 1) !== path.sep &&
        value.substring(1, 2) !== ':\\') ? path.join(this.get('root'), value) : value;
    }
}

module.exports = new Axe;