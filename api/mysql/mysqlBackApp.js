const mysqlComp = require('../../config/database')
var picontroller =  require('../picontroller/exec')
const path = require('path');
var fs = require('fs');



//======================================================
//Gera arquivo SQL de backup  da  aplicação
//======================================================
function execFunctionCmdLine(strCommand){
    var response = picontroller.execFuncLocalSync(strCommand).toString()
    if(response.length ===0){
        return true
    }else{
        return false
    }

}
//======================================================
//Backup mysql data
//======================================================
function backupAppMySql(req,res,next){
    var cmdSql = req.body.cmd
    if (req.method=='POST'){
        if(execFunctionCmdLine('sudo mysqldump iot alarmes alarmes_historico avisos config_compontes config_sistema usuarios  > backup.sql')){
            return res.status(200).send({valid: 'ok', status:'backup criado'})
        }else{
            return res.status(500).send({valid: 'erro no command line'})    
        }
    }else {
        return res.status(200).send({valid: 'ok'})
    }
}
//======================================================
//Download  backup file SQL
//======================================================
function backupAppMySqlDownload (req, res, next) {
  var filename = "backup.sql";
  var filePath = path.join(__dirname, '..', '..', '/', filename);
  var stat = fs.statSync(filePath);
  var fileToSend = fs.readFileSync(filePath);
  res.set('Content-Type', 'image/jpeg');
  res.set('Content-Length', stat.size);
  res.set('Content-Disposition', filename);
  res.send(fileToSend);
};
//======================================================
//Download  backup file node-red
//======================================================
function backupAppNodeRedDownload (req, res, next) {
  var filePath = '/home/pi/.node-red/flows_INPI-CPU-3B.json'//path.join(__dirname, '..', '..', '/', filename);
  var stat = fs.statSync(filePath);
  var fileToSend = fs.readFileSync(filePath);
  res.set('Content-Type', 'image/jpeg');
  res.set('Content-Length', stat.size);
  //res.set('Content-Disposition', filename);
  res.send(fileToSend);
};

module.exports = {execFunctionCmdLine, backupAppMySql, backupAppMySqlDownload, backupAppNodeRedDownload}