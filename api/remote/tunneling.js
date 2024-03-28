//======================================================
//Gerencia tuneling 
//======================================================
var http = require('http')
var moment = require('moment')
var localtunnel = require('localtunnel');
var request = require('request')
const consts = require('../config/consts')

var remoteAccesActive = false
var tunnel 
var tunnel1 
var tunnel2
var tunnelingAddress = {
  nodered:'',
  webserver:'',
  api:'',
  timestamp:''
}

//======================================================
//Gerencia tuneling 
//======================================================
function tunneling(){

 //setInterval(function(){
  console.log("passei aqui")
  var req = http.get({host:'138.204.121.216', port:consts.sysInformation.portServer, path:'/api/tunnelingcheck'}, function(res) {
    var bodyChunks = [];
    res.on('data', function(chunk) {
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      console.log('BODY: ' + body);
      var object = JSON.parse(body)
      if(object.active && !tunnel){
        console.log("dentro do active")
        tunnel = localtunnel(1880, function(err, tunnel) {
           if (err) {console.log('erro: ',err);remoteAccesActive = false}
          //   //tunnel.url;
          //console.log("tunel nodered: ",tunnel.url)
          tunnelingAddress.nodered = tunnel.url
          tunnel1 = localtunnel(8080, function(err, tunnel) {
            if (err) {console.log('erro: ',err);remoteAccesActive = false}
            //   //tunnel.url;
            //console.log("tunel1 webserver: ",tunnel.url)
            tunnelingAddress.webserver = tunnel.url
            tunnel2 = localtunnel(5000, function(err, tunnel) {
              if (err) {console.log('erro: ',err);remoteAccesActive = false}
              //   //tunnel.url;
              tunnelingAddress.api = tunnel.url
              tunnelingAddress.timestamp = moment()
              remoteAccesActive = true
              console.log("address: ",tunnelingAddress)

              request.post('http://138.204.121.216:5000/api/tunnelingaddress',{ json: { tunnelingAddress: tunnelingAddress } }, function (error, response, body) {
                if (!error ) { //&& response.statusCode == 200
                  console.log(body);
                }
              if(error) console.log('erro do post',error)
              })

            })
          })
        })
      }
     if(!object.active && tunnel){
      tunnel.close()
      tunnel = undefined
      tunnel1.close()
      tunnel1 = undefined
      tunnel2.close()
      tunnel2 = undefined
      remoteAccesActive = false
      }
  })
});

    req.on('error', function(e) {
      console.log('ERROR: ' + e.message);
    })  

 //},10000) 

}

module.exports = {tunneling}
