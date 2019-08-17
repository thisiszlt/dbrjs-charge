var express = require('express');
var router = express.Router();
var uuid = require('uuid');
var HashMap = require("hashmap");
var log4js = require('log4js');

var sessionNum;
var barcodeCount;
var clientPool = new HashMap();
var timeOut = 300000;
router.get('/', function(req, res, next) {
  console.log("success");
  res.render('decode', { title: 'Express' });
});

//Page Server
router.post('/ps',function(req,res){
  var perUuid = uuid.v1();
  var freshID = {perUuid:perUuid,timeOut:timeOut};
  res.send(freshID);     //for each session,send uuid and session timeout
});

//Statistical Server
router.post('/ss',function (req,res) {
  var info = req.body;
  var uuid = info.uuid;
  var count = info.count;

  clientPool.set(uuid,count);

  var sign = {sign:"update page record"};
  res.send(sign);       //just a response

  setInterval(function () {
      sessionNum = clientPool.size;
      barcodeCount=0;
      timeOut = 300000;
      clientPool.forEach(function (value,key) {
          barcodeCount+=value;
      });
  },60000)

});


log4js.configure({
    replaceConsole: true,
    appenders: {
        cheese: {
            type: 'dateFile',
            filename: 'client pool.log',
            encoding: 'utf-8',
            layout: {
                type: "pattern",
                pattern: '{"data":\'%m\',"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z"}'
            },
            pattern: "-yyyy-MM-dd-hh",
            keepFileExt: true,
            alwaysIncludePattern: true,
        },
    },
    categories: {
        // 设置默认的 categories
        default: {appenders: ['cheese'], level: 'debug'},
    }
});

var logger = log4js.getLogger();
//Client Pool,log into file
setInterval(function () {
    logger.info("clientPool:",clientPool._data);
},60000);


module.exports = router;
