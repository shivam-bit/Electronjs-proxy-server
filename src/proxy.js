/* eslint-disable no-console */
const Proxy = require('http-mitm-proxy');
// eslint-disable-next-line import/no-extraneous-dependencies
const { ipcRenderer } = require('electron');
const path = require('path');

const proxy = Proxy();
const PORT = 8080;
let requestCount = 0;
ipcRenderer.sendSync('port-number-transfer', PORT);

const requestCountBox = document.querySelector('#request-count-data');
const methodBox = document.querySelector('#request-method-data');
const hostDataBox = document.querySelector('.request-host-data-box');
const referrerDataBox = document.querySelector('.request-referrer-data-box');

proxy.onError((ctx, err, errorKind) => {
    // ctx may be null
    const url = ctx && ctx.clientToProxyRequest ? ctx.clientToProxyRequest.url : '';
    console.error(`${errorKind} on ${url}:`, err);
});
proxy.onCertificateRequired = function (hostname, callback) {
    return callback(null, {
        keyFile: path.resolve('./.http-mitm-proxy/keys', `${hostname}.key`),
        certFile: path.resolve('./.http-mitm-proxy/certs', `${hostname}.crt`),
    });
};

proxy.onRequest((ctx, callback) => {
    // Increment request count each time
    requestCount += 1;
    // Update the DOM contents according to the latest request
    requestCountBox.innerText = requestCount;
    methodBox.innerText = ctx.clientToProxyRequest.method;
    hostDataBox.innerText = ctx.clientToProxyRequest.headers.host;
    referrerDataBox.innerText = ctx.clientToProxyRequest.headers.referer;
    return callback();
});
proxy.onWebSocketConnection((ctx, callback) => {
    console.log('WEBSOCKET CONNECT:', ctx.clientToProxyWebSocket.upgradeReq.url);
    return callback();
});
proxy.onWebSocketError((ctx, err) => {
    console.log('WEBSOCKET ERROR:', ctx.clientToProxyWebSocket.upgradeReq.url, err);
});

let serverStatusCode = null;
try {
    proxy.listen({ port: PORT }, () => {
        console.log(`Listening on port ${PORT}`);
    });
    serverStatusCode = 200;
} catch (error) {
    serverStatusCode = 500;
} finally {
    // This will send the current status of proxy server
    ipcRenderer.sendSync('proxy-server-status', serverStatusCode);
}
