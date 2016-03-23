import _ from 'lodash';
export const _ = _;
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