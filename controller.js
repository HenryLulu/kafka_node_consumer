/**
 * Created by Henry on 16/12/26.
 */
var mongo = require("mongodb");
var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file',
            filename: 'logs/app.log',
            "maxLogSize": 20480,
            "backups": 10
        }
    ]
});
var logger = log4js.getLogger();

var config = require("./config");

function insert(mes){
    var table;
    if(!mes.topic||!mes.value){
        logger.error("illegal message")
        return 0
    }
    var json = JSON.parse(mes.value)
    var data;
    if(json instanceof Array){
        data = json
    }else{
        data = [json]
    }
    if(data.length==0){
        logger.warn("empty message")
        return 0
    }
    switch (mes.topic){
        case 'logs':
            table = 'log_table';
            break;
        case 'users':
            table = 'user_table';
            break;
        default:
            logger.error("unknow topic")
            return 0
    }

    var MongoClient = mongo.MongoClient;
    MongoClient.connect(config.mongo_addr, function (err, db) {
        if(!err){
            db.collection(table,function(err,tb){
                if(!err){
                    tb.insert(data,function(err,res){
                        if(!err){
                            return 0
                        }else{
                            return 5
                        }
                    });
                }else{
                    logger.error(err)
                    return 4
                }
            })

        }else{
            logger.error(err)
            return 3
        }
    })
}

var write = function(mes){
    var retry_time = 10;
    var res = 1;
    while(res&&retry_time>0){
        retry_time -= 1
        res = insert(mes)
    }
    if(retry_time==0){
        logger.error("insert mongo error and retried fail")
    }else{
        var sip;
        try {
            sip = mes.value.match(/"s_ip": "(.+)",/)[1]
        }catch(e){
            sip = "unknow server"
        }
        logger.info("success topic:"+(mes&&mes.topic)||'unknow'+" from "+ sip)
    }
}

exports.write = write
