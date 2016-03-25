import fs from 'fs';
import path from 'path';
import glob from 'glob';
import Sequelize from 'sequelize';
import _ from 'lodash';
// db存储
let dbCache = {};
/**
 * 数据库
 * @param config
 * @param modelPath
 * @returns {{}}
 */
export default function(config, modelPath){
    let log = axe.log('[SQL]');
    // sql config
    let sqlConf = _.assign({
        host: config.host,
        port: config.port || 3306,
        dialect: config.dialect || 'mysql',
        logging: (log) => {
            log.info(log);
        },
        // 不需要创建createdAt|updatedAt2个字段
        define: {
            underscored: false,
            freezeTableName: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
            timestamps: false
        },
        maxConcurrentQueries: 120
    }, config);

    // Sequelize
    let seq = new Sequelize(sqlConf.database, sqlConf.username, sqlConf.password, sqlConf);
    /**
     * 获取所有model
     */
    glob.sync(path.join(modelPath, '**/*.js')).forEach((file) => {
        let model = seq.import(path.join(modelPath, file));
        dbCache[model.name] = model;
    });
    /**
     * 多表关联
     */
    Object.keys(dbCache).forEach(function (modelName) {
        if ("associate" in dbCache[modelName]) {
            dbCache[modelName].associate(dbCache);
        }
    });

    dbCache.sequelize = seq;
    dbCache.Sequelize = Sequelize;

    return dbCache;
}