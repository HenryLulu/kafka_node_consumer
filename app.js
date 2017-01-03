/**
 * Created by Henry on 16/12/26.
 */
var kafka = require('kafka-node')
var mongodb = require("mongodb")
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

var config = require('./config')
var controller = require('./controller')

var HighLevelConsumer = kafka.HighLevelConsumer
var client = new kafka.Client(config.zk_addr)
var cons = new HighLevelConsumer(client,config.payload,config.opt)
cons.on('message',function(mes){
    var sip;
    try {
        sip = mes.value.match(/"s_ip": "([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)",/)[1]
    }catch(e){
        sip = "unknow server"
    }
    logger.info("get message of topic:"+((mes&&mes.topic)||"unknow")+" from "+ sip)
    controller.write(mes)
})

