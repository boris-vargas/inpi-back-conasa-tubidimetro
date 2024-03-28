  var piWifi = require('pi-wifi')
  const plataforma = process.platform

  var Wifi = require('rpi-wifi-connection');
  var wifi = new Wifi();
  var statusNetworkWifi 
  var ScanNetworkWifi 

var filter = 0
updateScan()
updateNetwork()
//======================================================
//Lista redes sem fio proximas
//======================================================
function updateScan(){
    piWifi.scan(function(err, networks) {
      if (err) {
        console.error(err.message);
      }
      //console.log(networks)
      if(networks.result!='FAIL-BUSY')
      ScanNetworkWifi = networks
    });
  }
//======================================================
//Atualiza informações da rede conectada
//======================================================
function updateNetwork(){
    piWifi.status('wlan0', function(err, status) {
      if (err) {
      console.log(err);
      }
      statusNetworkWifi = status
    });
  }
  //======================================================
  //Lista redes sem fio proximas
  //======================================================
  function scanNetwork( req,res,next){
    if (plataforma!='linux') {
       return res.status(200).send({status: 'no linux platafor'})
    }
    updateScan()
    res.status(200).send(ScanNetworkWifi)
  }

  //======================================================
  //Status da rede conectada
  //======================================================
  function statusNetwork( req,res,next){

    if (plataforma!='linux') {
       return res.status(200).send({status: 'no linux platafor'})
    }
    updateNetwork()
   res.status(200).send(statusNetworkWifi)
   }
  //======================================================
  //Conecta na rede wifi
  //======================================================
  function setNetwork(req,res,next){

    if (plataforma!='linux') {
       return res.status(200).send({status: 'no linux platafor'})
    }
    var ssid = req.body.ssid
    var password = req.body.password
    console.log(req.body)
    console.log('ssid: ',ssid)
    console.log('psk: ',password)

    if (req.method=='POST'){
    wifi.connect({ssid:ssid , psk:password}).then((algo) => {
        //console.log('Connected to network.',algo);
        res.status(201).send({status:'Successful connection!'});
    })
    .catch((error) => {
        //console.log(error);
        console.log('wifi setNetwork error', error)
        res.status(500).send(error.message)
      });
    }
      if (req.method=='OPTIONS'){
      res.status(200).send({method: 'ok'})
    }
  }

  module.exports = {scanNetwork, statusNetwork, setNetwork}
