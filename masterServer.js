const net = require('net'),
    JsonSocket = require('json-socket');
const async = require('async');
let portList = [4000, 5000, 6000];
let port = 9389;
let host = '127.0.0.1';
let server = net.createServer();
let slaveSocket = []
server.listen(port);

var CronJob = require('cron').CronJob;
let job = new CronJob({
    cronTime: '00 */1 * * * *', // Every 2 mins
    onTick: connectToSlaves,
    start: true,
    runOnInit: true
});

server.on('connection', function (socket) { //This is a standard net.Socket
    clientSocket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    console.log('client connected!');
    clientSocket.on('message', async (message) => {
        var result = message.data.code + message.data.x;
        console.log(result);
        let x = await pollSlaves();
        clientSocket.sendEndMessage({ result: x });
    });
    clientSocket.on('error', (error) => {
        console.log(error);
    });
});

function pollSlaves() {
    return new Promise((resolve, reject) => {
        let list = [];
        async.each(slaveSocket, (socket, callback) => {
            console.log('in!');
            socket.sendMessage({ type: 1 });
            socket.on('message', (data) => {
                console.log('ahere!');
                console.log(data);
                list.push(data.data);
                callback();
            });
        }, (data) => {
            if (data) {
                console.log('data:');
                console.log(data);
                reject(data);
            } else {
                console.log('here!');
                console.log(list);
                let min = list[0];
                let pos = list[1];
                if (min != 0) {
                    for (let i = 1; i < list.length; i++) {
                        if (list[i] < min) {
                            min = list[i];
                            pos = i;
                        }
                    }
                }
                resolve(portList[pos]);

            }
        })
    });
}

function connectToSlaves() {
    for (i in portList) {
        console.log(i);
        retryServerConnection(i, host);
    }
}

function retryServerConnection(p, host) {
    if (!slaveSocket[p]) {
        console.log('Trying slave at port: ', portList[p]);
        let socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
        socket.connect(portList[p], host);
        socket.on('error', connectionErrorHandler);
        socket.on('connect', () => {
            slaveSocket[p] = socket;
            console.log('Connection established to slave at port: ', portList[p]);
        });
    } else {
        console.log('Connection already established to slave at port:', portList[p]);
        console.log(slaveSocket[p]._closed);
    }
}

function connectionErrorHandler(data) {
    console.log('Slave is not up');
}
