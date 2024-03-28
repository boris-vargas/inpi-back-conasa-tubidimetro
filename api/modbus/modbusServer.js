const ab2str = require('arraybuffer-to-string')
const modbusLocal = require('../../api/modbus/modbusLocal')

function bytesToInt(buffer, index) {
  index = (index || 0);

  return (buffer[index + 0] << 8) |
  buffer[index + 1];
}

function intToByteArray(bufferInt) {
  var byteArray = []
  var countBufferByte = 0
  for (var i = 0; i < bufferInt.length; i++) {
    byteArray[1+countBufferByte] =  bufferInt[i] & 255//& 255
    byteArray[0+countBufferByte] = bufferInt[i] >> 8

    countBufferByte += 2
  }

  return  byteArray
}

//======================================================
//Driver modbus server INPI
//======================================================
function modbusServerStart(){
  const porta = 10502
  net = require('net');
  net.createServer(function (socket) {
    //Evento na recepção dos dados TCP
    socket.on('data', function (data) {
      var dataHeader = []
      //console.log(data);
      //======================================================
      //Verifica função 03 modbus e responde solicitação
      //======================================================
      if (data[7]==3) {
        dataHeader = [data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7]]
        //console.log(dataHeader);
        var reg  = modbusLocal.modbusLocalReadHoldReg(bytesToInt(data,8),bytesToInt(data,10)).payload
        //console.log("reg",reg)
        dataHeader = [data[0],data[1],data[2],data[3],data[4],(reg.length*2)+3,data[6],data[7],reg.length*2 ]
        var regsValue = intToByteArray(reg)
        for (var i = 0; i < regsValue.length; i++) {
          dataHeader[9+i] = regsValue[i]
        }
        
        socket.write(Buffer.from(dataHeader))
      }
      //======================================================
      //Verifica função 06 modbus e responde solicitação
      //======================================================
      if (data[7]==6) {
        //dataHeader = [data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10],data[11]]
        modbusLocal.modbusLocalWriteHoldReg(bytesToInt(data,8),bytesToInt(data,10))
        //console.log(data);
        socket.write(Buffer.from(data))
      }
      //======================================================
      //Verifica função 16 modbus e escreve solicitação
      //======================================================
      if (data[7]==16) {
        var regIni = bytesToInt(data,8)
        var regCount = bytesToInt(data,10)
        var headerfc16 = [data[0],data[1],data[2],data[3],data[4],6,data[6],data[7],data[8],data[9],data[10],data[11]]
        var j = 0
        for (var i = 0; i < regCount; i++) {
          modbusLocal.modbusLocalWriteHoldReg(regIni+i,bytesToInt(data,13+j))
          j+=2
        }
        socket.write(Buffer.from(headerfc16))
      }

    })
    // Socket close
    socket.on('end', function () {
      //Evento na desconexão TCP
    });
  }).listen(porta);
  // Put a friendly message on the terminal of the server.
  console.log("Driver Modbus TCP Server rodando na porta: ",porta);
}
module.exports = {modbusServerStart}
