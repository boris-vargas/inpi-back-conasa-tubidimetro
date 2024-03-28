//----------------------------
//Configurações
//----------------------------
const server = require('./config/server')
require('./config/database')
require('./config/routes')(server)
require('./api/modbus/modbusLocal')
const modbusServer = require('./api/modbus/modbusServer')
modbusServer.modbusServerStart()

//const mySQLTCP = require('./api/mysql/mySQLTCP')
//const testeco = require('./api/network/no-ip')
//const modbusTCPServer = require('./api/mysql/modbusTCPServer')
//const msSQLTCP = require('./api/mysql/msSQLTCP')

//----------------------------
//Carrga driver sockts
//----------------------------

//mySQLTCP.mySQLTCP()//Server mysql to  serial on pot 5010
//modbusTCPServer.modbusTCPServer()
//msSQLTCP.msSQLTCP()
