/**
 * 将字符串转换为数字
 * @param value
 * @param mode
 * @returns {Number|number}
 */
export function intval(value, mode = 10){
    return parseInt(value, mode) || 0
}

