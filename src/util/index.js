import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import crypto from 'crypto';

const htmlEntities = require('./htmlEntities');
let htmlEntitiesMap = {};
let htmlEntitiesRegExp = '';

(function () {
    for (let i in htmlEntities) {
        let ent = String.fromCharCode(htmlEntities[i]);
        htmlEntitiesMap[ent] = i;
        htmlEntitiesRegExp += '|' + ent;
    }
    htmlEntitiesRegExp = new RegExp(htmlEntitiesRegExp.substr(1), 'g');
})();

/**
 * 国内手机号校验
 * @param mobile
 * @returns {boolean}
 */
export function ismobile(mobile){
    //todo: 这个字段需要跟着运营商变化变化
    return /^(13|15|18|14|17)\d{9}$/.test(mobile);
}

/**
 * 将字符串转换为数字
 * @param value
 * @param mode
 * @returns {Number|number}
 */
export function intval(value, mode = 10){
    return parseInt(value, mode) || 0
}
/**
 * 解析json =》 query
 * @param param
 *
 * @example:
 *
 * axe.utils.parseParam({a:1,b:2});
 *
 * //=> a=1&b=2
 *
 * @returns {*}
 */
export function parseParam(param){

    if(_.isEmpty(param))
        return '';

    if(_.isArray(param)){
        return param.join(',');
    }

    if(_.isObject(param)){
        let query = [];
        _.mapKeys(param, function(value, key) {
            query.push(key, value);
        });
        return query.join('&');
    }

    return param;

}
/**
 * 把 callback 的写法，作用到 promise 上
 * @param promise
 * @param callback
 * @returns {*}
 */
export function promiseCallback(promise, callback){
    promise.then((...args) =>{
        args.unshift(null);
        callback.apply(null, args);
    }).catch(callback);
    return promise;
}
/**
 * 参数提取
 * @param req
 * @param params
 * @returns {{}}
 */
export function pickParams(req, params){
    let data = req.method == 'POST' ? req.body : req.query;
    // 如果不传params, 默认全部返回
    if(!params){
        return data;
    }

    if(!_.isArray(params))
        params = [params];

    let attr = {};

    _.each(params, (item)=>{
        let value = data[item];
        attr[item] = value;
    });

    return attr;
}
/**
 * 获取客户端真实ip
 * 这里有一个坑，会获取到2个ip，取其中一个即可
 * @param req
 * @returns {*}
 */
export function clientIp(req){
    let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    return ip.split(',')[0];
}
/**
 * 获取真实ip
 * @param req
 * @returns {*}
 */
export function realIp(req){
    return (req.headers['x-real-ip'] || []).split(',')[0];
}
/**
 * 是否存在于白名单
 * @param ip
 * @param whites
 * @returns {boolean}
 */
export function isPrivateIp(ip, whites){
    return _.has(whites, ip);
}
/**
 * 对象合并
 * @param defaults
 * @param ops
 * @returns {*|{}}
 */
export function options (defaults, ops) {
    defaults = defaults || {};
    ops = ops || {};
    Object.keys(ops).forEach((key) => {
        defaults[key] = ops[key];
    });
    return defaults;
}
/**
 * 空函数
 */
export function noop () {}
/**
 * 定时函数
 * @param fn
 * @param args
 */
export function defer(fn, ...args) {
    process.nextTick(function () { fn.apply(null, args); });
}
/**
 * html处理
 * @param str
 * @returns {*}
 */
export function encodeHTMLEntities (str){
    if (str && str.toString) str = str.toString();
    if (!_.isString(str) || !str.length) return '';
    return str.replace(htmlEntitiesRegExp, function (match) {
        return '&' + htmlEntitiesMap[match] + ';';
    });
}
/**
 * uuid
 * @param length
 * @returns {string}
 */
export function uuid(length = 32){
    // length = length || 32;
    let str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
    return str.replace(/[\+\/]/g, '_');
}
/**
 * 文件权限
 * @param p
 * @param mode
 * @returns {*}
 */
export let chmod = (p, mode = '0777') => {
    if (!fs.existsSync(p)) {
        return true;
    }
    return fs.chmodSync(p, mode);
};
/**
 * 创建目录
 * @param p
 * @param mode
 * @returns {boolean}
 */
export let mkdir = (p, mode = '0777') => {
    if (fs.existsSync(p)) {
        chmod(p, mode);
        return true;
    }
    let pp = path.dirname(p);
    if (fs.existsSync(pp)) {
        fs.mkdirSync(p, mode);
    }else{
        mkdir(pp, mode);
        mkdir(p, mode);
    }
    return true;
};
/**
 * md5
 * @param str
 * @returns {*}
 */
export let md5 = str => {
    let instance = crypto.createHash('md5');
    instance.update(str + '', 'utf8');
    return instance.digest('hex');
};

/**
 * 获取日期
 * @param  {Date} date []
 * @return {String}      []
 */
export let datetime = (date, format) => {
    let fn = d => {
        return ('0' + d).slice(-2);
    };

    if(date && _.isString(date)){
        date = new Date(Date.parse(date));
    }
    let d = date || new Date();

    format = format || 'YYYY-MM-DD HH:mm:ss';
    let formats = {
        YYYY: d.getFullYear(),
        MM:  fn(d.getMonth() + 1),
        DD: fn(d.getDate()),
        HH: fn(d.getHours()),
        mm: fn(d.getMinutes()),
        ss: fn(d.getSeconds())
    };

    return format.replace(/([a-z])\1+/ig, a => {
        return formats[a] || a;
    });
};
/**
 * 获取请求的唯一uid
 * @param req
 * @returns {*}
 */
export function createRequestUid(req){
    let rid = req.__datestamp || new Date().getTime();
    let ip = realIp(req) || clientIp(req);
    let referer = req.headers.referer || req.headers.referrer || '';
    let cookies = req['cookies'] || '';
    let statusCode = res.__statusCode || res.statusCode;
    return md5(rid + ip + req.url + referer + cookies + req.method + statusCode).substring(19);
}
/**
 * 记录日志
 * @param logger
 * @param options
 */
export function recordLog(logger, options){
    let key = createRequestUid(options.req);
    let ip = realIp(options.req) || clientIp(options.req);
    let content = typeof options.content === 'string' ? options.content : JSON.stringify(options.content);
    let other = options.other || '';
    // log info
    let logFn = logger.info;
    // error
    if(options.type === 'error'){
        logFn = logger.error;
    }
    // warn
    if(options.type === 'warn'){
        logFn = logger.warn;
    }

    let log = `[${key}] [${ip}] ${options.name}|${options.category}|${options.req.originalUrl || ''}|${content}${other}`;

    logFn.call(logger, log);
}