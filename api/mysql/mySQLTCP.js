const mysql = require('../../config/database')
const ab2str = require('arraybuffer-to-string')

//======================================================
//Query mysql Driver TCP
//======================================================
function mySQLTCP(){
  const porta = 5010
  //Carrga library TCP
  net = require('net');
  // Start o Servidor TCP
  net.createServer(function (socket) {
    //Evento na recepção dos dados TCP
    socket.on('data', function (data) {
      dataStringReceived = ab2str(data);
      mysql.query(dataStringReceived, function (err, result){
        if(err) {
            socket.write(JSON.stringify(err))
          }else {
            socket.write(JSON.stringify(result))
          }
      })
    });
    // Socket close
    socket.on('end', function () {
      //Evento na desconexão TCP
    });
  }).listen(porta);
  // Put a friendly message on the terminal of the server.
  console.log("Driver TCP mySQL rodando na porta: ",porta);
}
module.exports = {mySQLTCP}
