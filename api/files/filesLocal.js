var fs = require('fs');
//======================================================
//Escreve em arquivo
//======================================================
function writeToFile(file,buffer){
  fs.writeFile(file, buffer.toString(), function(err) {
  //console.log('escrevi no arquivo - buffer->')
    if(err) {
      //console.log('erro de escrevi')
      return console.log(err)
    }
    
  })
}
module.exports = {writeToFile}
