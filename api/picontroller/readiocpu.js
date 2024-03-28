const updateip = require('../network/updateIp')
const cmdline = require('../picontroller/exec')
const mysqlComp = require('../../config/database')
const plataforma = process.platform

//============================================================================================
//Verifica sistema operacional
//============================================================================================
if (plataforma=='linux') {
   var rpio = require('rpio');
   const resetPin = 40
   rpio.open(resetPin, rpio.INPUT, rpio.PULL_UP);
   const resetIpPin = 37
   rpio.open(resetIpPin, rpio.INPUT, rpio.PULL_UP);
   var count = 0
   var countIpReset = 0
   //======================================================
   //Verifica jump para restaurar parametros de fábrica.
   //======================================================
   var cmdSql = ''
   setInterval(function(){
   	var state = rpio.read(resetPin) ? false : true;
      if (state) {
      	console.log('Reset em ',10-count, ' segundos')
      	count++
      	if (count>=10) {
      		console.log('Reset de fabrica')
      		updateip.setNetworkIpFactory()
      		cmdSql =`DROP DATABASE iot`
      		mysqlComp.query(cmdSql, function (err, result){
   				console.log(result)
   				cmdSql =`CREATE DATABASE iot`
   				mysqlComp.query(cmdSql, function (err, result){
   					if(err) {
   						console.log('Erro Create mySql log :'+err)
   					}else {
   						console.log(result)
   						cmdline.execFuncLocal('sudo reboot')
   					}
   				})
      		})
      	}
      }else{
         count = 0
      }
   //======================================================
   //Verifica jump para restaurar parametros de fábrica.
   //======================================================
      if(!rpio.read(resetIpPin)){
         countIpReset++
         console.log('Reset de IP em ',10-countIpReset, ' segundos')
         if(countIpReset>=10){
            countIpReset = 0
            updateip.setNetworkIpFactory()
            console.log("atualizei  IP")
            setTimeout(function(){
               console.log("mandei reiniciar")
               cmdline.execFuncLocal('sudo reboot')
            },5000)
         }
      }else{
         countIpReset =  0
      }
   },1000)
}
