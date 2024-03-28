const bcrypt = require('bcrypt')
//const configNodered = require
var fs = require('fs')
var dataBuffer = []
var delayReq = false

String.prototype.replaceAll = function(str1, str2, ignore)
{
	return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

String.prototype.replaceAt = function(index, replacement) {
	return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}
//======================================================
//cria hash nodered
//======================================================
function createNewHashNodeRed (req, res, next) {
	if(req.body.password ){
		//console.log("Senha recebida: ",req.body)
		const password = req.body.password || ''
		const saltRounds = 10
		var hashReq = bcrypt.hashSync(password, saltRounds)
		fs.readFile('/home/pi/.node-red/settings.js', 'utf8', function (err,data) {
			if (err) {
				console.log('erro leitura no arquivo')
			}
			vdata = data.replaceAll(',','@')
			var j = 0
			dataBuffer[0] = ''
			for (var i = 0; i < vdata.length; i++) {
				dataBuffer[j]+= vdata[i]
				if (vdata[i]=='\n') {
					j++
					dataBuffer[j] = ''
				}
			}
			//console.log(dataBuffer)
			var bufftemp = dataBuffer[122].search("password: \"")
			var strd = dataBuffer[122].substring(bufftemp+11, bufftemp+11+60)
			// console.log("nova: ",hashReq)
			// console.log("antiga: ",strd)
			// console.log("Linha inteira antiga: ",dataBuffer[122])
			dataBuffer[122] = dataBuffer[122].replace(strd, hashReq)
			//console.log("Linha inteira Nova: ",dataBuffer[122])

			 var dataBufferString = dataBuffer.join().replaceAll(',','')
			 dataBufferString = dataBufferString.replaceAll('@',',')
			 dataBufferString = dataBufferString.replace(strd, hashReq)		
			 fs.writeFile('/home/pi/.node-red/settings.js', dataBufferString, 'utf8', function (err) {
			 	if (err) return res.send(err.message)
			 		res.send({status:'Successful change!'});
			 });

			//res.send({status:'Successful change!'});
		})
	}else{
		res.send({status:'Sem password!'});
	}
	

}


module.exports = {createNewHashNodeRed}
