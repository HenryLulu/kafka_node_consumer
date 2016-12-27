/**
 * Created by Henry on 16/12/26.
 */
var mongo = require("mongodb");

var config = require("./config");

function insert(mes){
    var table;
    if(!mes.topic||!mes.value){
        console.log("Error:illegal message")
        return 0
    }
    var json = JSON.parse(mes.value)
    var data;
    if(json instanceof Array){
        data = json
    }else{
        data = [json]
    }
    switch (mes.topic){
        case 'logs':
            table = 'log_table';
            break;
        case 'users':
            table = 'user_table';
            break;
        default:
            console.log("Error:unknow topic")
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
                    console.log(err)
                    return 4
                }
            })

        }else{
            console.log(err)
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
        console.log("Error:insert mongo fail")
    }else{
        console.log("Info:success topic:"+mes.topic||'unknow')
    }
}

exports.write = write
