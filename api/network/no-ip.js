var exec = require('child_process').exec

console.log("PASSEI NO MODULO NO-IP")

function getProcessNoIp(){
	exec("sudo noip2 -M", function (error, stdout, stderr) {
      if (error) {
        console.log("Erro STDOUT->",error);
      }
      else{
      //return stdout
      console.log("Comando STDOUT->",stdout)

    }
})
	//console.log("Sudo command", exec.execFuncLocal(`ifconfig`))
}


getProcessNoIp()

