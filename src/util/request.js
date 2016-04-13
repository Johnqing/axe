import request from 'request';
import * as util from './index';
import log4js from 'log4js';

const logger = log4js.getLogger('[API]');


export default function(){
    return (req, options)=>{
        let ip = util.realIp(options.req) || util.clientIp(options.req);

        // data
        options.data = options.data || {};

        var method = options.method || 'POST';
        var url = (options.api || '') + options.url;

        var param = {
            method: method.toUpperCase(),
            uri: url,
            headers: {
                'client-ip': ip
            },
            form: options.data
        };
        // 记录传入的参数
        util.recordLog(logger, {
            req,
            name: 'REQ',
            category: 'OPTIONS',
            content: param
        });


        return new Promise((resolve, reject) => {
            request(param, (err, request, body) => {
                // 错误记录
                if(err){
                    reject(err);
                    return util.recordLog(logger, {
                        req,
                        name: 'RES',
                        category: 'ERROR',
                        type: 'error',
                        content: error
                    });
                }

                let data = body;

                try{
                    data = typeof data === 'object' ? JSON.parse(data) : data;
                } catch(err){
                    resolve(data);
                    data = null;
                    util.recordLog(logger, {
                        req,
                        name: 'RES',
                        category: 'ERROR',
                        type: 'error',
                        content: body
                    });
                    return;
                }

                resolve(data);
                util.recordLog(logger, {
                    req,
                    name: 'RES',
                    category: 'SUCCESS',
                    content: data
                });
            });
        });

    }
}