const net = require('net'),
    JsonSocket = require('json-socket');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const uuid = require('uuid/v4')
const app = new Koa();
const router = new Router();
let myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);
let activeProcesses = {};
let output = {};
if (myArgs.length >= 1) {

    let port = myArgs[0];
    app.use(bodyParser());

    router.get('/status',(ctx,next)=>{
        console.log('Retrieving slave status');
        ctx.body = {
            activeProcesses:activeProcesses
        };
    });

    router.get('/', (ctx, next) => {
        console.log('Finding output');
        if (output[ctx.query.id]) {
            ctx.body = output[ctx.query.id]
        } else {
            ctx.body = { status: "-1", message: 'No such process' };
        }
    });

    app.use(router.routes())
        .use(router.allowedMethods());

    app.listen((Number(port) + 1), () => {
        console.log('Slave up and running!');
    });

    let server = net.createServer();
    server.listen(port);
    server.on('connection', function (socket) { //This is a standard net.Socket
        socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
        console.log('Master established connection!');
        socket.on('message', function (message) {
            if (message.type == 1) {
                let result = { id: uuid(),port: Number(port), count: Object.keys(activeProcesses).length };
                //Send number of working processes!
                console.log(result);
                socket.sendMessage(result);
            } else if (message.type == 2) {
                activeProcesses[message.id] = { status: 0, output: "Still processing!" };
                output[message.id] = { status: 0, output: "Still processing!" };
                runSlowProcess(message.id, message.data);
                console.log('Processing!');
            }
        });
        socket.on('error', connectionErrorHandler);
    });
} else {
    console.log('Port not specifed!');
}

function connectionErrorHandler(data) {
    console.log('Master terminated the connection!');
}

function runSlowProcess(id, data) {
    setTimeout(() => {
        output[id] = {
            status: 1,
            output: {
                sum: (data.a + data.b),
                difference: (data.a - data.b),
                product: (data.a * data.b),
                quotient: (data.a / data.b),
                remainder: (data.a % data.b)
            }
        }
        delete activeProcesses[id];

    }, 25000)
}