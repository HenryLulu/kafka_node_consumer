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

function insert(mes, cb){
    var table;
    if(!mes.topic||!mes.value){
        logger.error("illegal message")
        cb(0)
    }
    var json;
    try{
        json = JSON.parse(mes.value)
    }catch(e){
        logger.error("illegal message")
        cb(0)
    }
    if(!json instanceof Object){
        logger.error("illegal message")
        cb(0)
    }
    var data;
    if(json instanceof Array){
        data = json
    }else{
        data = [json]
    }
    if(data.length==0){
        logger.warn("empty message")
        cb(0)
    }
    switch (mes.topic){
        case 'logs':
            table = 'ori_node';
            break;
        case 'users':
            table = 'ori_user';
            break;
        default:
            logger.error("unknow topic")
            cb(0)
    }

    var MongoClient = mongo.MongoClient;
    MongoClient.connect(config.mongo_addr,config.mongo_option, function (err, db) {
        if(!err){
            db.collection(table,function(err,tb){
                if(!err){
                    tb.insert(data,function(err,res){
                        if(!err){
                            db.close()
                            cb(0)
                        }else{
                            logger.error(err)
                            cb(5)
                        }
                    });
                }else{
                    logger.error(err)
                    cb(4)
                }
            })
        }else{
            logger.error(err)
            cb(3)
        }
    })
}

var write = function(mes){
    insert(mes, function(res){
        if(!res){
            var sip;
            try {
                sip = mes.value.match(/"s_ip": "([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)",/)[1]
            }catch(e){
                sip = "unknow server"
            }
            logger.info("success topic:"+((mes&&mes.topic)||'unknow')+" from "+ sip)
        }else{
            logger.error("fail to insert mongo")
        }
    })
}

exports.write = write
