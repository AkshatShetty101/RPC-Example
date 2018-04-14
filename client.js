const net = require('net'),
    JsonSocket = require('json-socket');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();


app.use(bodyParser());

require('events').EventEmitter.prototype._maxListeners = 20;

router.post('/', async (ctx, next) => {
    console.log(ctx.request.body);
    let data = await sendReqToMaster(ctx.request.body)
    console.log('sending response!');
    ctx.body = { status: "1", message: data };
    // });
});

app.use(router.routes())
    .use(router.allowedMethods());

app.listen(3000, () => {
    console.log('Client up and running!');
});

/**
 * Server communication code!
 * */
let portList = [9389];
let port = 0; //The same port that the server is listening on
let max = portList.length;
let host = '127.0.0.1';
let socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
let ct = 0;
retryServerConnection(port, host);
socket.on('connect', function () { //Don't send until we're connected
    // socket.sendMessage({ a: 5, b: 7 });
    // socket.on('message', function (message) {
    //     console.log('The result is: ' + message.result);
    // });
});
socket.on('error', connectionErrorHandler);

function retryServerConnection(port, host) {
    socket.connect(portList[port], host);
    socket.on('error', connectionErrorHandler);
}

function sendReqToMaster(data) {
    return new Promise((resolve, reject) => {
        socket.sendMessage({ data: data });
        // resolve('1');
        socket.on('message', (message) => {
            console.log(message);
            resolve(message);
        });
        socket.on('error', (message) => {
            console.log(message);
            reject(message);
        });
    });
}

async function connectionErrorHandler(data) {
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
