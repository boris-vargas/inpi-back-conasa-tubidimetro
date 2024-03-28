const filelocal = require('../../api/files/filesLocal')
const fs = require('fs')
const file = 'bufferModbus.txt'

//======================================================
//timeout dos modulos
//======================================================
var failList = new Array(250).fill(0)
const timeoutCount = 10000//numero de timeouts para retirar da lista de pooling
//======================================================
//Reset lista de escravos desabilitados por timeout
//======================================================
function resetFailList(){
  for (var i = 0; i < failList.length; i++) {
    failList[i] = 0
  };
}
//======================================================
//Disponibiliza registro de numero de timeouts do escravo
//======================================================
function getFailList(index){
    return failList[index]
  }
//======================================================
//Set numero de timeouts do escravo
//======================================================
function setFailList(index, value){
    failList[index] = value
  }
//======================================================
//Incrementa numero de timouts do escravo
//======================================================
function addFailList(index){
    failList[index]++
  }
//======================================================
//Disponibiliza constante de numero max de timouts para 
//desabilitar escravo
//======================================================
function getTimeoutCont(){
    return timeoutCount
  }

//======================================================
//inicializa basse local de acordo como txt file
//======================================================
var bufferModbus = new Array(1100).fill(0)
for (var i = 0; i < bufferModbus.length; i++) {
  bufferModbus[i] = 0
}
//======================================================
//Heartbeat
//======================================================
bufferModbus[0] = 250
setInterval(function(){
  bufferModbus[0]++

},1000)
//======================================================
//Le arquivo com base local
//======================================================
var content;
fs.readFile(file, function read(err, data) {
  if (err) {
    throw err;
  }
  content = data;
  processFile();
});
function processFile() {
  bufferModbus = (content.toString()).split(',').map(Number);
}
//======================================================
//Lê registros locais
//======================================================
function modbusLocalReadHoldReg(from,to){
  var offsetModbus  = parseInt(from)
  var quantModbus = parseInt(to)
  var modbusQuery = new Array(quantModbus)
  for (var i = offsetModbus; i < (quantModbus + offsetModbus); i++) {
    modbusQuery[i-offsetModbus] = bufferModbus[i]
  }
  return {
      result: "read modules done escravo:"+0,
      payload:modbusQuery
    } 
}
//======================================================
//Escreve único registro local
//======================================================
function modbusLocalWriteHoldReg(reg,value){
  var offsetModbus  = parseInt(reg)
  var valueModbus = parseInt(value)
  bufferModbus[offsetModbus] = valueModbus
  bufferModbus[38] = 0
  if (offsetModbus!=1099) {
    filelocal.writeToFile(file,bufferModbus)
  }
  return {
    "result" : "write modules done escravo: 0",
    value: valueModbus
  }
}
//======================================================
//Escreve multiplos registro local
//======================================================
function modbusLocalWriteHoldRegMultiples(reg,quant,values){
  var ini  = parseInt(reg)
  var quant = parseInt(quant)
  var dados = values
  for (var i = 0; i < dados.length; i++) {
    bufferModbus[ini+i] = dados[i]
  }

  bufferModbus[38] = 0
  if (ini!=1099) filelocal.writeToFile(file,bufferModbus)

  return {
      result: "write modules done escravo:"+0,
      value:dados
    }
  }

module.exports = {modbusLocalReadHoldReg, modbusLocalWriteHoldReg, getFailList, setFailList, addFailList, resetFailList,getTimeoutCont,modbusLocalWriteHoldRegMultiples}
