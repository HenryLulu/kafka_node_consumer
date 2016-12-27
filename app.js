/**
 * Created by Henry on 16/12/26.
 */
var kafka = require('kafka-node')
var mongodb = require("mongodb")

var config = require('./config')
var controller = require('./controller')

var HighLevelConsumer = kafka.HighLevelConsumer
var client = new kafka.Client(config.zk_addr)
var cons = new HighLevelConsumer(client,config.payload,config.opt)

cons.on('message',function(mes){
    console.log("Info:get message of topic:"+mes.topic||"unknow")
    controller.write(mes)
})

