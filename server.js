var http = require("http");
var net = require("net");
var url = require("url");
var fs = require("fs");
var HashMap =  require("hashmap");
var map = new HashMap();
var port;
var blockList;

function squidProxy(options) {
    this.port = 9393;
    this.onServerError = options.onServerError || function() {};
    this.onBeforeRequest = options.onBeforeRequest || function() {};
    this.onBeforeResponse = options.onBeforeResponse || function() {};
    this.onRequestError = options.onRequestError || function() {};

    fs.readFile('./websites.json', (err, data) =>{
      if(err) throw err;

      blockList = JSON.parse(data);
      for(var i =0; i<blockList.websites.length; i++){
        console.log(blockList.websites[i].address);
        map.set(blockList.websites[i].address, "block");
      }
    });

}
//create the proxy server and start listening
squidProxy.prototype.start = function() {
    var server = http.createServer();
    server.on("request", this.requestHandler);
    server.on("connect", this.connectHandler);
    server.on("error", this.onServerError);
    server.on("beforeRequest", this.onBeforeRequest);
    server.on("beforeResponse", this.onBeforeResponse);
    server.on("requestError", this.onRequestError);
    server.listen(this.port);

}

squidProxy.prototype.requestHandler = function(req, res) {
    try {
        var self = this; // this -> server
        var path = req.headers.path || url.parse(req.url).path;
        var requestOptions = {
            host: req.headers.host.split(':')[0],
            port: req.headers.host.split(':')[1] || 80,
            path: path,
            method: req.method,
            headers: req.headers
        };
        //print the http headers
        console.log(requestOptions.host);
      //  console.log('henkadnre');
          if("block" == map.get(requestOptions.host)){
            res.writeHead(403, {
                'Content-Type': 'text/plain'
            });
            res.write("You do not have permission to access this websites");
            res.end();
            return
          }


        //check url to see if we want the management console
        if (requestOptions.host == "127.0.0.1" && requestOptions.port == port) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.write("Server");
            res.end();
            return;
        }

        //request
        requestRemote(requestOptions, req, res, self);

    } catch (e) {
        console.log("request error: Bad Request: " + e.message);
    }

    function requestRemote(requestOptions, req, res, proxy) {

        /*console.log(requestOptions.path);
        console.log(requestOptions.headers);
        console.log(requestOptions.method);*/


        var remoteRequest = http.request(requestOptions, function(remoteResponse) {
            remoteResponse.headers['proxy-agent'] = 'Proxy Agent';

            // write out headers to handle redirects
            res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);

            // change resonse here
            remoteResponse.pipe(res);
            // finish connection
            res.pipe(remoteResponse);
        });

        remoteRequest.on('error', function(e) {
            console.log('error in request: failed to fetch');
           res.writeHead(502, 'Proxy fetch failed');
           res.end();
           remoteRequest.end();
        });

        req.pipe(remoteRequest);
        // to the server.
       res.on('close', function() {
           remoteRequest.abort();
         });

    }

}

squidProxy.prototype.connectHandler = function(req, socket, head) {
    try {
        var self = this;
        var requestOptions = {
            host: req.url.split(':')[0],
            port: req.url.split(':')[1] || 443  //443 default port (we always want https)
        };

        connectRemote(requestOptions, socket);

        function ontargeterror(e) {
            console.log(req.url + " Tunnel error: " + e);
                        _synReply(socket, 502, "Tunnel Error", {}, function() {
               try {
                    socket.end();
                }
               catch(e) {
                  console.log('could not close. Error: ' + e.message);
              }
           });
       }

        function connectRemote(requestOptions, socket) {
            var tunnel = net.createConnection(requestOptions, function() {
                //format http protocol
                _synReply(socket, 200, 'Connection established', {
                        'Connection': 'keep-alive',
                        'Proxy-Agent': 'Squid Proxy'
                    },
                    //TCP connection
                    //close connect if an error otherwise send packet
                    function(error) {
                        if (error) {
                            socket.end();
                            console.log("syn error", error.message);
                            tunnel.end();
                            return;
                        }
                        tunnel.pipe(socket);
                        socket.pipe(tunnel);
                      //  console.log('here ' + socket);
                      //  console.log(tunnel);


                    }
                );
            });

            tunnel.setNoDelay(true);
            tunnel.on('error', ontargeterror);
        }
    } catch (e) {
        console.log("connectHandler error: " + e.message);
    }

}

function _synReply(socket, code, reason, headers, errorHandle) {
    try {
        var statusLine = 'HTTP/1.1 ' + code + ' ' + reason + '\r\n';
        var headerLines = '';
        for (var index in headers) {
            headerLines += index + ': ' + headers[index] + '\r\n';  //append all the headers to the header
        }
        socket.write(statusLine + headerLines + '\r\n', 'UTF-8', errorHandle); //send on socket

    } catch (error) {
        errorHandle(error);
    }
}

module.exports = squidProxy;
