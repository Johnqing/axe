import fs from 'fs';
import path from 'path';
import * as util from 'util';

export default class {
    constructor(...args){
        this.init(...args);
    }
    /**
     * babel compile
     * @return {} []
     */
    compileByBabel(content, file, logged){
        let startTime = Date.now();
        //babel not export default property
        //so can not use `import babel from 'babel-core'`
        let babel = require('babel-core');
        let data = babel.transform(content, {
            filename: file,
            presets: ['es2015-loose', 'stage-1'].concat(this.options.presets || []),
            plugins: ['transform-runtime'].concat(this.options.plugins || []),
            sourceMaps: true
        });
        if(!logged && this.options.log){
            let loger = axe.log('CompileBabel');
            loger.debug(`Compile file ${file}`, 'Babel', startTime);
        }
        //todo: 输出runtime
    }
}