var Axe = require('./dist/axe');
var axe = new Axe();
/**
 * axe版本
 * @type {String|*|string}
 */
axe.version = require('./package.json').version;

// 导出
module.exports = global.axe = axe;
