const net = require('net'),
    JsonSocket = require('json-socket');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const app = new Koa();
app.use(bodyParser());

require('events').EventEmitter.prototype._maxListeners = 20;
// const emitter = new EventEmitter()
// emitter.setMaxListeners(100)
// // or 0 to turn off the limit
// emitter.setMaxListeners(0);
app.use(async ctx => {
    ctx.body = 'Hello World';
});

app.listen(3000,()=>{
    console.log('Client up and running!');
});
/**
 * Server communication code!
 * */
let portList = [];
let port = 0; //The same port that the server is listening on
let max = portList.length;
let host = '127.0.0.1';
let socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
let ct = 0;
retryServerConnection(port,host);
socket.on('connect', function () { //Don't send until we're connected
    socket.sendMessage({ a: 5, b: 7 });
    socket.on('message', function (message) {
        console.log('The result is: ' + message.result);
    });
});
socket.on('error',connectionErrorHandler);

function retryServerConnection(port,host){
    socket.connect(portList[port], host);    
    socket.on('error',connectionErrorHandler);
}

async function connectionErrorHandler(data){
        ct++;
        console.log('Server is not up yet!');
        // if(ct<1){
        //     console.log('Retrying same server\nCount:'+ct);
        //     retryServerConnection(portList[port],host);
        // } else {
        //     if(port<max){
        //         console.log('Trying next server');
        //         ct=0;
        //         port++;
        //         retryServerConnection(portList[port],host);    
        //     } else {
        //         console.log('No server currently is active!');
        //     }
        // }
}
