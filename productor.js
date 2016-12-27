/**
 * Created by Henry on 16/12/26.
 */
var kafka = require('kafka-node')

var config = require('./config')

var Producer = kafka.Producer;
var HighLevelProducer = kafka.HighLevelProducer;
var client = new kafka.Client(config.zk_addr)
var producer = new Producer(client)
var payloads = [
    { topic: 'logs', messages: '{"user_n": 0, "s_ip": "unknow", "jam_n": 0, "suc_r": 0.0, "band": 0.0, "suc_n": 0, "bitrate": 0, "req_n": 0, "flu": 0, "start": 1482371400, "freeze_r": 0.0, "channal_n": {}, "rate_n": {"1": 0, "3": 0, "2": 0, "4": 0}}' },
    { topic: 'users', messages: '[]' }
];
producer.on('ready', function () {
    producer.send(payloads, function (err, data) {
        console.log(err)
        console.log(data);
    });
});