var fs = require('fs')
//var network = require('network-config')
var picontroller =  require('../picontroller/exec')

const plataforma = process.platform
var networkInfos={}
String.prototype.replaceAll = function(str1, str2, ignore)
{
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
String.prototype.insert = function(index, string) {
  if (index > 0)
  {
    return this.substring(0, index) + string + this.substring(index, this.length);
  }

  return string + this;
};


var ipwifi, gatewaywifi, dnswifi, ipeth, gatewayeth, dnseth
var networkinfo = {}
//======================================================
//set ip/mask/gateway/dns
//======================================================
function setNetworkIp(req,res,next){
  if (req.method=='POST'){
    var ipoldWifi = req.body.ipoldWifi
    var ipnewWifi = req.body.ipnewWifi
    var gatewayoldWifi = req.body.gatewayoldWifi
    var gatewaynewWifi = req.body.gatewaynewWifi
    var dnsoldWifi = req.body.dnsoldWifi
    var dnsnewWifi = req.body.dnsnewWifi
    var ipold = req.body.ipold
    var ipnew = req.body.ipnew
    var gatewayold = req.body.gatewayold
    var gatewaynew = req.body.gatewaynew
    var dnsold = req.body.dnsold
    var dnsnew = req.body.dnsnew
    var dhcpwifi = req.body.dhcpwifi
    var dhcpeth = req.body.dhcpeth

    fs.readFile('/etc/dhcpcd.conf', 'utf8', function (err,data) {
      if (err) {res.status(500).send(err.message); console.log('erro leitura');}
      vdata = data.replaceAll(',','@')
      var dataBuffer = []
      var j = 0
      dataBuffer[0] = ''
      for (var i = 0; i < vdata.length; i++) {
        dataBuffer[j]+= vdata[i]
        if (vdata[i]=='\n') {
          j++
          dataBuffer[j] = ''
        }
      }
      //Replace endereço WIFI
      dataBuffer[41] = dataBuffer[41].replace(ipoldWifi, ipnewWifi)
      if(dhcpwifi && dataBuffer[40].charAt(0) != '#') {
        dataBuffer[40] = dataBuffer[40].insert(0,'#')
        dataBuffer[41] = dataBuffer[41].insert(0,'#')
      }

      if(!dhcpwifi && dataBuffer[40].charAt(0) == '#') {
          dataBuffer[40] = dataBuffer[40].substring(1)
          dataBuffer[41] = dataBuffer[41].substring(1)
      }


      dataBuffer[43] = dataBuffer[43].replace(gatewayoldWifi, gatewaynewWifi)
      if(dhcpwifi && dataBuffer[43].charAt(0) != '#') {
        dataBuffer[43] = dataBuffer[43].insert(0,'#')
        dataBuffer[42] = dataBuffer[42].insert(0,'#')
      }

      if(!dhcpwifi && dataBuffer[43].charAt(0) == '#') {
          dataBuffer[43] = dataBuffer[43].substring(1)
          dataBuffer[42] = dataBuffer[42].substring(1)
      }
      dataBuffer[44] = dataBuffer[44].replace(dnsoldWifi, dnsnewWifi)
      if(dhcpwifi && dataBuffer[44].charAt(0) != '#') {
        dataBuffer[44] = dataBuffer[44].insert(0,'#')
      }

      if(!dhcpwifi && dataBuffer[44].charAt(0) == '#') {
          dataBuffer[44] = dataBuffer[44].substring(1)
      }
      //Replace endereço ETH0
      dataBuffer[48] = dataBuffer[48].replace(ipold, ipnew)
      if(dhcpeth && dataBuffer[48].charAt(0) != '#') {
        dataBuffer[47] = dataBuffer[47].insert(0,'#')
        dataBuffer[48] = dataBuffer[48].insert(0,'#')
      }
      if(!dhcpeth && dataBuffer[48].charAt(0) == '#') {
          dataBuffer[47] = dataBuffer[47].substring(1)
          dataBuffer[48] = dataBuffer[48].substring(1)
      }

      dataBuffer[50] = dataBuffer[50].replace(gatewayold, gatewaynew)

      if(dhcpeth && dataBuffer[50].charAt(0) != '#') {
        dataBuffer[49] = dataBuffer[49].insert(0,'#')
        dataBuffer[50] = dataBuffer[50].insert(0,'#')
      }
      if(!dhcpeth && dataBuffer[50].charAt(0) == '#') {
          dataBuffer[49] = dataBuffer[49].substring(1)
          dataBuffer[50] = dataBuffer[50].substring(1)
      }

      dataBuffer[51] = dataBuffer[51].replace(dnsold, dnsnew)

      if(dhcpeth && dataBuffer[51].charAt(0) != '#') {
        dataBuffer[51] = dataBuffer[51].insert(0,'#')
      }
      if(!dhcpeth && dataBuffer[51].charAt(0) == '#') {
          dataBuffer[51] = dataBuffer[51].substring(1)
      }
      dataBufferString = dataBuffer.join().replaceAll(',','')
      dataBufferString = dataBufferString.replaceAll('@',',')

      fs.writeFile('/etc/dhcpcd.conf', dataBufferString, 'utf8', function (err) {
        if (err) return res.status(500).send(err.message)
          res.status(200).send({status:'Successful change!'});
      });
    })
  } else {
    return res.status(200).send({result: 'ok'})
  }
}

//======================================================
//set ip/mask/gateway/dns
//======================================================
function setNetworkIpFactory(){

  var ipoldWifi = networkinfo.ipwifi
  var ipnewWifi = '192.168.0.200'
  var gatewayoldWifi = networkinfo.gatewaywifi
  var gatewaynewWifi = '192.168.0.1'
  var dnsoldWifi = networkinfo.dnswifi
  var dnsnewWifi = '192.168.0.1'
  var ipold = networkinfo.ipeth
  var ipnew = '192.168.0.201'
  var gatewayold = networkinfo.gatewayeth
  var gatewaynew = '192.168.0.1'
  var dnsold = networkinfo.dnseth
  var dnsnew = '192.168.0.1'

  var dhcpwifi = false
  var dhcpeth = false

  fs.readFile('/etc/dhcpcd.conf', 'utf8', function (err,data) {

    if (err) {console.log('erro leitura')}

      vdata = data.replaceAll(',','@')
    var dataBuffer = []
    var j = 0
    dataBuffer[0] = ''
    for (var i = 0; i < vdata.length; i++) {
      dataBuffer[j]+= vdata[i]
      if (vdata[i]=='\n') {
        j++
        dataBuffer[j] = ''
      }
    }
     //Replace endereço WIFI
      dataBuffer[41] = dataBuffer[41].replace(ipoldWifi, ipnewWifi)
      if(dhcpwifi && dataBuffer[40].charAt(0) != '#') {
        dataBuffer[40] = dataBuffer[40].insert(0,'#')
        dataBuffer[41] = dataBuffer[41].insert(0,'#')
      }

      if(!dhcpwifi && dataBuffer[40].charAt(0) == '#') {
          dataBuffer[40] = dataBuffer[40].substring(1)
          dataBuffer[41] = dataBuffer[41].substring(1)
      }


      dataBuffer[43] = dataBuffer[43].replace(gatewayoldWifi, gatewaynewWifi)
      if(dhcpwifi && dataBuffer[43].charAt(0) != '#') {
        dataBuffer[43] = dataBuffer[43].insert(0,'#')
        dataBuffer[42] = dataBuffer[42].insert(0,'#')
      }

      if(!dhcpwifi && dataBuffer[43].charAt(0) == '#') {
          dataBuffer[43] = dataBuffer[43].substring(1)
          dataBuffer[42] = dataBuffer[42].substring(1)
      }
      dataBuffer[44] = dataBuffer[44].replace(dnsoldWifi, dnsnewWifi)
      if(dhcpwifi && dataBuffer[44].charAt(0) != '#') {
        dataBuffer[44] = dataBuffer[44].insert(0,'#')
      }

      if(!dhcpwifi && dataBuffer[44].charAt(0) == '#') {
          dataBuffer[44] = dataBuffer[44].substring(1)
      }
      //Replace endereço ETH0
      dataBuffer[48] = dataBuffer[48].replace(ipold, ipnew)
      if(dhcpeth && dataBuffer[48].charAt(0) != '#') {
        dataBuffer[47] = dataBuffer[47].insert(0,'#')
        dataBuffer[48] = dataBuffer[48].insert(0,'#')
      }
      if(!dhcpeth && dataBuffer[48].charAt(0) == '#') {
          dataBuffer[47] = dataBuffer[47].substring(1)
          dataBuffer[48] = dataBuffer[48].substring(1)
      }

      dataBuffer[50] = dataBuffer[50].replace(gatewayold, gatewaynew)

      if(dhcpeth && dataBuffer[50].charAt(0) != '#') {
        dataBuffer[49] = dataBuffer[49].insert(0,'#')
        dataBuffer[50] = dataBuffer[50].insert(0,'#')
      }
      if(!dhcpeth && dataBuffer[50].charAt(0) == '#') {
          dataBuffer[49] = dataBuffer[49].substring(1)
          dataBuffer[50] = dataBuffer[50].substring(1)
      }

      dataBuffer[51] = dataBuffer[51].replace(dnsold, dnsnew)

      if(dhcpeth && dataBuffer[51].charAt(0) != '#') {
        dataBuffer[51] = dataBuffer[51].insert(0,'#')
      }
      if(!dhcpeth && dataBuffer[51].charAt(0) == '#') {
          dataBuffer[51] = dataBuffer[51].substring(1)
      }
 
      dataBufferString = dataBuffer.join().replaceAll(',','')
      dataBufferString = dataBufferString.replaceAll('@',',')

      fs.writeFile('/etc/dhcpcd.conf', dataBufferString, 'utf8', function (err) {
        console.log('Reset de fabrica realizado');
      });
    })
}
//======================================================
//get ip/mask/gateway/dns
//======================================================
function getNetworkIp(req,res,next){
  var ipDhcpWifi
  var ipDhcpEth
  if (plataforma!='linux') {
    return res.status(200).send({status: 'no linux plataform'})
  }
  fs.readFile('/etc/dhcpcd.conf', 'utf8', function (err,data) {
    if (err) {res.status(200).send(err.message)}
 
      var response = picontroller.execFuncLocalSync('ifconfig wlan0')
      var address_ = response.toString().match(/\w+\.\w+\.\w+\.\w+/g)
      if(address_){
        ipDhcpWifi = address_[0]
      }else{
        ipDhcpWifi = data.match(/\w+\.\w+\.\w+\.\w+/g)[0]
      }
       
      response = picontroller.execFuncLocalSync('ifconfig eth0')
      address_ = response.toString().match(/\w+\.\w+\.\w+\.\w+/g)
      if(address_){
        ipDhcpEth = address_[0]
      }else{
        ipDhcpEth = data.match(/\w+\.\w+\.\w+\.\w+/g)[3]
      }


       var address = data.match(/\w+\.\w+\.\w+\.\w+/g)
      res.status(200).send({
        ipwifi:address[0],
        gatewaywifi:address[1] ,
        dnswifi:address[2] ,
        ipeth:address[3] ,
        gatewayeth:address[4] ,
        dnseth:address[5],
        dhcpwifi: data.match(/\#interface wlan0/g)? true : false,
        dhcpeth: data.match(/\#interface eth0/g)? true : false,
        ipdhcpwifi: ipDhcpWifi,
        ipdhcpeth: ipDhcpEth
    });


  })
}
//======================================================
//get ip/mask/gateway/dns
//======================================================
function getNetwork(){
  if (plataforma!='linux') {
    return {status: 'no linux plataform'}
  }
  
  fs.readFile('/etc/dhcpcd.conf', 'utf8', function (err,data) {
    var ipDhcpWifi
    var ipDhcpEth
    if (err) console.log(err)
      var response = picontroller.execFuncLocalSync('ifconfig wlan0')
      var address_ = response.toString().match(/\w+\.\w+\.\w+\.\w+/g)
      if(address_){
        ipDhcpWifi = address_[0]
      }else{
        ipDhcpWifi = data.match(/\w+\.\w+\.\w+\.\w+/g)[0]
      }
       
      response = picontroller.execFuncLocalSync('ifconfig eth0')
      address_ = response.toString().match(/\w+\.\w+\.\w+\.\w+/g)
      if(address_){
        ipDhcpEth = address_[0]
      }else{
        ipDhcpEth = data.match(/\w+\.\w+\.\w+\.\w+/g)[3]
      }


      var address = data.match(/\w+\.\w+\.\w+\.\w+/g)
      networkinfo.ipwifi=address[0]
      networkinfo.gatewaywifi=address[1] 
      networkinfo.dnswifi=address[2] 
      networkinfo.ipeth=address[3] 
      networkinfo.gatewayeth=address[4] 
      networkinfo.dnseth=address[5]
      networkinfo.dhcpwifi = data.match(/\#interface wlan0/g)? true : false
      networkinfo.dhcpeth = data.match(/\#interface eth0/g)? true : false
      networkinfo.ipdhcpwifi=ipDhcpWifi
      networkinfo.ipdhcpeth=ipDhcpEth

  })
}
getNetwork()

//======================================================
//retorna informações sobre a rede
//======================================================
function getNetworkInfos(){
  return networkinfo
}

module.exports = {setNetworkIp, getNetworkIp, getNetworkInfos, setNetworkIpFactory}
