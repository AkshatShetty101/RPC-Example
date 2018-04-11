const net = require('net'),
    JsonSocket = require('json-socket');

let portList = [4000, 5000, 6000];
let port = 9389;
let host = '127.0.0.1';
let server = net.createServer();
let slaveSocket = []
server.listen(port);

var CronJob = require('cron').CronJob;
var job = new CronJob({
    cronTime: '00 */1 * * * *', // Every 2 mins
    onTick: retryServerConnection,
    start: true,
    runOnInit: true
});

server.on('connection', function (socket) { //This is a standard net.Socket
    clientSocket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    socket.on('message', function (message) {
        let result = message.a + message.b;
        socket.sendEndMessage({ result: result });
    });
});

function connectToSlaves() {
    for (i in portList) {
        retryServerConnection(i,host);
    }
}

function retryServerConnection(port, host) {
    if (!slaveSocket[port]) {
        let socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
        socket.connect(portList[port], host);
        socket.on('error', connectionErrorHandler);
        slaveSocket[port] = socket;
    } else {
        console.log('Connection already established!');
    }
}

function connectionErrorHandler(data) {
    console.log('Slave is not up');
}

function pollSlaves() {

}