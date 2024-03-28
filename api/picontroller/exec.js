var exec = require('child_process').exec
const execSync = require('child_process').execSync;
const si = require('systeminformation')
const path = process.platform;

var deviceInfo = {}

//setInterval(function(){
  si.system().then(function(data){
    deviceInfo.system = data
    si.baseboard().then(function(data){
      deviceInfo.baseboard = data
      si.cpu().then(function(data){
        deviceInfo.cpu = data
        //si.cpuCurrentspeed().then(function(data){
          deviceInfo.cpuCurrentspeed = data
          si.cpuTemperature().then(function(data){
            deviceInfo.cpuTemperature = data
            si.mem().then(function(data){
              deviceInfo.mem = data
              si.osInfo().then(function(data){
                deviceInfo.osInfo = data
                si.uuid().then(function(data){
                  deviceInfo.uuid = data
                  si.versions().then(function(data){
                    deviceInfo.versions = data
                    si.users().then(function(data){
                      deviceInfo.users = data
                      si.currentLoad().then(function(data){
                        deviceInfo.currentLoad = data
                        si.diskLayout().then(function(data){
                          deviceInfo.diskLayout = data
                          si.networkInterfaces().then(function(data){
                            deviceInfo.networkInterfaces = data
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        //})
      })
    })
  })

//======================================================
//Atualiza relogio da CPU a partir do relogio externo
//======================================================
setTimeout(function(){
  execFuncLocal('sudo hwclock -s')
},1000)
//======================================================
//get dados da CPU
//======================================================
function execFuncCpuData(req, res, next) {
  var cmd = req.params.cmd
  if(req.method === 'OPTIONS') {
    res.status(200).send({method:'ok'})
  }else{
    res.status(200).send(deviceInfo)
  }
}
//======================================================
//Executa comandline
//======================================================
function execFuncLocal(sudoCmd) {
  var cmd = sudoCmd
    child = exec(cmd, function (error, stdout, stderr) {
      if (error) {
        console.log(`Erro no comando para OS: ${error}`)
      }
      return stdout
    })
  }

//======================================================
//Executa comandline Sync
//======================================================
function execFuncLocalSync(sudoCmd) {
    return execSync(sudoCmd)
  }  
//======================================================
//Reboot system
//======================================================
function execFunc(req, res, next) {
  var cmd = req.params.cmd
  if(req.method === 'OPTIONS') {
    res.status(200).send({result: 'ok'})
  } else {
    child = exec(cmd, function (error, stdout, stderr) {
      if (error) {
        console.log(error);
        res.status(500).send({error: error});
      }else{
        res.status(200).send({result: [stdout]})
      }
    })
  }
}

//======================================================
//Comando shell via post
//======================================================
function picontrollerPost(req,res,next){

  var cmd = req.body.cmd
  if (req.method=='POST'){
        child = exec(cmd, function (error, stdout, stderr) {
          if (error) {
            console.log(error);
            res.status(500).send({error: error});
          }else{
            res.status(200).send({result: [stdout]})
          }
        })
    }else{
      return res.status(200).send({valid: 'ok'})
    }
  }



    module.exports = {execFunc, execFuncCpuData, execFuncLocal, picontrollerPost, execFuncLocalSync}
