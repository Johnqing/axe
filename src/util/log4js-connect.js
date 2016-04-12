import * as utils from './index';
const DEFAULT_FORMAT = `[:remote-addr] -- :url|:req[cookies]|:referrer##:user-agent##`;
/**
 * 返回日志信息
 * @param str
 * @param req
 * @param res
 * @returns {string|XML}
 */
function format(str, req, res){
    return str
        .replace(':url', req.originalUrl)
        .replace(':method', req.method)
        .replace(':status', res.__statusCode || res.statusCode)
        .replace(':response-time', res.responseTime)
        .replace(':date', new Date().toUTCString())
        .replace(':referrer', req.headers.referer || req.headers.referrer || '')
        .replace(':http-version', req.httpVersionMajor + '.' + req.httpVersionMinor)
        .replace(':remote-addr', utils.realIp(req) || utils.clientIp(req))
        .replace(':user-agent', req.headers['user-agent'] || '')
        .replace(
        ':content-length',
        (res._headers && res._headers['content-length']) ||
        (res.__headers && res.__headers['Content-Length']) ||
        '-'
    )
    .replace(/:req\[([^\]]+)\]/g, (_, field) => {
        if(field === 'cookies'){
            return JSON.stringify(req[field]);
        }
        return req[field].toLowerCase();
    })
    .replace(/:res\[([^\]]+)\]/g, (_, field) => {
        return res._headers ?
            (res._headers[field.toLowerCase()] || res.__headers[field])
            : (res.__headers && res.__headers[field]);
    });
}
/**
 * http日志
 * @param logger
 * @param formatString
 * @param nolog
 * @returns {Function}
 */
export default function(logger, formatString, nolog){
    let fmt = formatString || DEFAULT_FORMAT;
    if(fmt instanceof RegExp){
        nolog = fmt;
        fmt = DEFAULT_FORMAT;
    }

    return (req, res, next)=>{
        // 屏蔽log
        if (nolog && nolog.test(req.originalUrl))
            return next();

        let now = new Date();
        let statusCode;
        let logFn = logger.info;
        let writeHead = res.writeHead;
        let end = res.end;

        res.writeHead = (code, reasonPhrase, headers) => {
            if (typeof reasonPhrase === 'object' && reasonPhrase !== null) {
                headers = reasonPhrase;
                reasonPhrase = null;
            }
            res.writeHead = writeHead;
            res.writeHead(code, reasonPhrase, headers);
            res.__statusCode = statusCode = code;
            res.__headers = headers || {};

            // 根据状态不一样，值也不一样
            if(code >= 300)
                logFn = logger.warn;
            if(code >= 400)
                logFn = logger.error;
        };

        res.end = (chunk, encoding) => {
            res.end = end;
            res.end(chunk, encoding);
            res.responseTime = new Date() - now;
            logFn.call(logger, format(fmt, req, res));
        };

        next();

    }
}