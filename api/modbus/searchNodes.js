const consts = require('../../config/consts')
var modbusPromises = require('../../api/modbus/modbusPromises');
var modbusLocal = require('../../api/modbus/modbusLocal')
var nodesModbus = []
var scanStarted = false
var cancelScan = false
var serverDetails = {
  host: 'localhost',
  port: consts.sysInformation.serverPort,
  path: '/api/modbusread/0/0/1',
  method: 'GET'
}
var nodesModbusScan = 10
//============================================================================================
//Retira IDs duplicados
//============================================================================================
function getUnique(arr, comp) {
  const unique = arr
    .map(e => e[comp])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter(e => arr[e]).map(e => arr[e]);
    return unique;
}
//============================================================================================
//Procura por nós de rede
//============================================================================================
function searchNodeModbus(endereco){
  serverDetails.path = `/api/modbusread/${endereco}/38/1/1`
  return modbusPromises.getData(serverDetails).then(function (response) {
    if (response.name != 'ModbusResponseTimeout') {
      console.log('Encontrado endereco: '+ endereco);
      if(response.payload){
        nodesModbus.push({id: endereco, tipo: response.payload})
      }else{
        nodesModbus.push({id: endereco, tipo: response.value})
      }
    }
  }).catch(function (err) {
    console.log('Erro na procura por modulos: '+err);
  });
}
//============================================================================================
//Procura por nós de rede
//============================================================================================
function searchNodeModbusFor(){
  if (!scanStarted) {
    setTimeout(function(){scanStarted = false},15000)
    scanStarted = true
    nodesModbus = []
    for (var i = 0; i <= nodesModbusScan; i++) {
      searchNodeModbus(i)
    }
  } else{

  }
}
//============================================================================================
//Incia procura na incialização da CPU
//============================================================================================
setTimeout(function(){
  searchNodeModbusFor()
  searchNodeModbus(240)
},5000)
//============================================================================================
//Inicia procura por nós de rede
//============================================================================================
function modbusStartScanSearch(req,res,next){
  
  if (!scanStarted) {
    modbusLocal.resetFailList()
    // searchNodeModbus(0)  
    // searchNodeModbus(1)  
    // searchNodeModbus(1) 
    console.log(req.body.params)
    nodesModbusScan = req.body.params
    searchNodeModbusFor()
    searchNodeModbus(240)
    res.status(200).send({result:'scan iniciado...'})
  } else{
    res.status(200).send({result:'scan já em andamento...'})
  }
}
//============================================================================================
//cancela por nós de rede
//============================================================================================
function modbusCancelSearch(req,res,next){
    //scanStarted = false
    res.status(200).send({result:'scan cancelado...'})

  }
//============================================================================================
//Envia procura
//============================================================================================
function modbusGetSearch(req,res,next){
  nodesModbus = getUnique(nodesModbus,'id')
  res.status(200).send(nodesModbus)
}
//============================================================================================
//Indica se a procura esta inciada
//============================================================================================
function getStatusSearch(){
  return scanStarted
}
module.exports = {modbusStartScanSearch, modbusGetSearch, modbusCancelSearch, getStatusSearch}
