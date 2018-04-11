const net = require('net'),
    JsonSocket = require('json-socket');
let myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);
if (myArgs.length >= 1) {
    let port = myArgs[0];
    let server = net.createServer();
    server.listen(port);
    server.on('connection', function (socket) { //This is a standard net.Socket
        socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket

        socket.on('message', function (message) {
            console.log(message);
            let result = message.a + message.b;
            socket.sendEndMessage({ result: result });
        });
    });
} else {
    console.log('Port not specifed!');
}
