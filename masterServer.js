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

let countOfInstance = 0;

server.on('connection', function (socket) { //This is a standard net.Socket
    clientSocket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    console.log('client connected!');
    console.log('CountofInstance', countOfInstance);
    countOfInstance++;
    clientSocket.on('message', async (message) => {
        // var result = message.data.code + message.data.x;
        // console.log(result);
        try {
            let x = await pollSlaves(slaveSocket, message);
            clientSocket.sendMessage({ result: x });
        } catch (err) {
            console.log(err);
            clientSocket.sendError(new Error(err));
        }
    });
    clientSocket.on('error', (error) => {
        console.log(error);
    });
});

function pollSlaves(slaveSocket, message) {
    let list = [];
    console.log('In slavePolls');
    return new Promise((resolve, reject) => {
        if (slaveSocket.length == 0) {
            console.log('Rejecting request');
            reject("Slave servers are down!");
        } else {
            async.each(portList, (port, callback) => {
                console.log('in!', port);
                JsonSocket.sendSingleMessageAndReceive(port, host, { type: 1 }, (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('received message');
                        console.log(data);
                        // list.push({ id: 1, count: 0 });
                        list.push(data);
                        console.log(list);

                    }
                    callback();
                });
            }, (err) => {
                console.log('In callback!');
                if (err) {
                    console.log('Slave not up!');
                } else {
                    console.log(list);
                    let min = list[0].count;
                    let pos = 0;
                    if (min != 0) {
                        for (let i = 1; i < list.length; i++) {
                            if (list[i].count < min) {
                                min = list[i].count;
                                pos = i;
                            }
                        }
                    }
                    console.log("Selected port to assign job:", (list[pos].port + 1));
                    message.id = list[pos].id;
                    message.type = 2;
                    JsonSocket.sendSingleMessage(list[pos].port, host, message, (err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            resolve({ id: list[pos].id, port: (list[pos].port + 1) });
                        }
                    });
                }
            });

        }

    });

}

function connectToSlaves() {
    for (let i in portList) {
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
