const { SerialPort } = require('serialport')
const ModbusMaster = require('modbus-rtu').ModbusMaster
const plataforma = process.platform
const mysql = require('../../config/database')
const fs = require('fs')
const fileSerialConfig = 'serialConfig.json'

//======================================================
//Le arquivo serial
//======================================================
  var fileConfig= fs.readFileSync(fileSerialConfig);
  var config = JSON.parse(fileConfig.toString()) 
  var fComm1 = false


// Create a port
const serialPort = new SerialPort({
  path: '/dev/ttyAMA0',
  baudRate: config.jsonConfig.serial.baudrate,
})


// serialPort.open(function(response){
//   console.log(response)
//   if (response!=null) {
//     console.log('Status porta COM - '+response);
//     fComm1 = true
//   }
//   fComm = fComm1
// })

  master = new ModbusMaster(serialPort,{
    debug:false,
    responseTimeout:config.jsonConfig.serial.timeout
})

console.log("Driver modbus na porta: " + serialPort.path + " - "+ "8N1 - " + serialPort.baudRate)
//var port  = "/dev/ttyAMA0"
//var port  = "/dev/ttyACM0"
//var port  = "/dev/ttyUSB1"
var fComm
var master
//============================================================================================
//Retorna erro na abertura da comport
//============================================================================================
function getfComm(){
  if(fComm)
   console.log(`Debug Modbus => Erro na abertura da porta - "${port}"`)
  return fComm
}

module.exports = {master, getfComm}
