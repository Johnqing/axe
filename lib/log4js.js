import path from 'path';
export default function (logdir) {
    return {
        "appenders": [
            {"type": "console", "category": "console"},
            {
                "type": "clustered",
                "appenders": [
                    {
                        //  日志文件类型，可以使用日期作为文件名的占位符
                        "type": "dateFile",
                        // 日志文件名，可以设置相对路径或绝对路径
                        "filename": path.join(logdir, "access.log."),
                        // 占位符，紧跟在filename后面
                        "pattern": "yyyyMMdd",
                        // 文件是否始终包含占位符
                        alwaysIncludePattern: true,
                        // 记录器名
                        "category": "http"
                    },
                    {
                        //  日志文件类型，可以使用日期作为文件名的占位符
                        "type": "dateFile",
                        // 日志文件名，可以设置相对路径或绝对路径
                        "filename": path.join(logdir, "app.log."),
                        // 占位符，紧跟在filename后面
                        "pattern": "yyyyMMdd",
                        // 文件是否始终包含占位符
                        alwaysIncludePattern: true
                    },
                    {
                        "type": "logLevelFilter",
                        "level": "ERROR",
                        "appender": {
                            //  日志文件类型，可以使用日期作为文件名的占位符
                            "type": "dateFile",
                            // 日志文件名，可以设置相对路径或绝对路径
                            "filename": path.join(logdir, "errors.log."),
                            // 占位符，紧跟在filename后面
                            "pattern": "yyyyMMdd",
                            // 文件是否始终包含占位符
                            alwaysIncludePattern: true
                        }
                    }
                ]
            }
        ]
    }
}