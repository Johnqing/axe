import fs from 'fs';
import path from 'path';
import * as util from './index';
import glob from 'glob';

export default class {
    constructor(...args){
        this.loger = axejs.log('CompileBabel');
        this.init(...args);
    }

    /**
     * 初始化参数
     * @param srcPath
     * @param outPath
     * @param options
     */
    init(srcPath, outPath, options = {}){
        this.sep = path.sep;
        this.options = options;
        this.srcPath = path.normalize(srcPath);
        this.outPath = path.normalize(outPath);
    }
    compile(){
        glob.sync(path.join(this.srcPath, '**/*.js')).forEach((filePath) => {
            let content = fs.readFileSync(filePath, 'utf8');
            try{
                this.compileByBabel(content, filePath);
                return true;
            }catch(e){

                this.loger.debug(`compile file ${filePath} error`, 'COMPILE');
                this.loger.debug(e);

                e.message = 'Compile Error: ' + e.message;
            }
        });
        return false;
    }
    /**
     * babel compile
     * @return {} []
     */
    compileByBabel(content, file, logged){
        let startTime = new Date();
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
            this.loger.debug(`Compile file ${file}`, 'Babel', startTime);
        }
        file = file.replace(this.srcPath, '');
        util.mkdir(path.dirname(`${this.outPath}${this.sep}${file}`));
        let basename = path.basename(file);
        let outputContent = data.code + '\n//# sourceMappingURL=' + basename + '.map';
        fs.writeFileSync(`${this.outPath}${this.sep}${file}`, outputContent);
        let relativePath = path.relative(this.outPath + this.sep + file, this.srcPath + this.sep + file);
        data.map.sources[0] = relativePath;
        fs.writeFileSync(`${this.outPath}${this.sep}${file}.map`, JSON.stringify(data.map));
    }
}