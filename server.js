var http = require("http");
var net = require("net");
var url = require("url");
var fs = require("fs");
var util;
var HashMap =  require("hashmap");
var mysql = require('mysql');
var map = new HashMap();
var port;
var blockList;
var cache;

//Constructor which sets up all of the parts of the proxy which I need
//Sets up the cached and blacklist
function proxyServer(options) {
    this.port = 9393;
    this.onServerError = function() {};
    this.onBeforeRequest =  function() {};
    this.onBeforeResponse = function() {};
    this.onRequestError = function() {};

    fs.readFile('./websites.json', (err, data) =>{
      if(err) throw err;

      blockList = JSON.parse(data);
      for(var i =0; i<blockList.websites.length; i++){
        console.log(blockList.websites[i].address);
        map.set(blockList.websites[i].address, "block");
      }
    });

    fs.readFile('./cached.json', (err,data) => {
      if(err) throw err;

      cache = JSON.parse(data);
    });

}
//create the proxy server and start listening
//tells the server what to do based on the traffic accross the ports
proxyServer.prototype.start = function() {
    var server = http.createServer();
    server.on("connect", this.connectHandler);
    server.on("request", this.requestHandler);
    server.on("beforeRequest", this.onBeforeRequest);
    server.on("error", this.onServerError);
    server.on("beforeResponse", this.onBeforeResponse);
    server.on("requestError", this.onRequestError);
    server.listen(this.port);

}
//Handles all the request on the server
//Parses requests and checks if valid -> sends valid request on to next stage
//Blacklist websites are blocked
proxyServer.prototype.requestHandler = function(req, res) {
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
        console.log(requestOptions.host + "" + requestOptions.path);
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
            res.write(form.html);
            res.end();
            return;
        }


        //request
        requestRemote(requestOptions, req, res, self);

    } catch (e) {
        console.log("request error: Bad Request: " + e.message);
    }
    //Sets up request to server
    function requestRemote(requestOptions, req, res, proxy) {

        var headers;
        var body;
        var remoteRequest = http.request(requestOptions, function(remoteResponse) {
            remoteResponse.headers['proxy-agent'] = 'Proxy Agent';
            headers = res._header;
            // write out headers to handle redirects
            res.writeHead(remoteResponse.statusCode, '', remoteResponse.headers);
            // change resonse here
            remoteResponse.pipe(res);
        //    console.log(res);
            // finish connection
            res.pipe(remoteResponse);
        });
        remoteRequest.on('error', function(e) {
            console.log('error in request: failed to fetch');
           res.writeHead(502, 'Proxy fetch failed');
           res.end();
           remoteRequest.end();
        });

        req.pipe(remoteRequest);// to the server.
        res.on('close', function() {
           remoteRequest.abort();
         });

      }

}
//handles the connection traffic across the socket
proxyServer.prototype.connectHandler = function(req, socket, head) {
    try {
        var self = this;
        var requestOptions = {
            host: req.url.split(':')[0],
            port: req.url.split(':')[1] || 443  //443 default port (we always want https)
        };
        connectRemote(requestOptions, socket);
        function failedTarget(e) {
            console.log(req.url + " link error: " + e);
                        _synReply(socket, 502, "link Error", {}, function() {
               try {
                    socket.end();
                }
               catch(e) {
                  console.log('could not close. Error: ' + e.message);
              }
           });
       }

        function connectRemote(requestOptions, socket) {
          var body =[];
            var link = net.createConnection(requestOptions, function() {
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
                            link.end();
                            return;
                        }
                        link.pipe(socket);
                        socket.pipe(link);
                    }
                );
            });
            link.setNoDelay(true);
            link.on('error', failedTarget);
            //push to array of data recosived
            link.on('data', function(dataPacket){
              body.push(dataPacket);
            });
            //Send to cache
            link.on('end', () =>{
                body = Buffer.concat(body);
                let values = {
                  url: requestOptions.host + "/" + requestOptions.path,
                  data: body
                };
                fs.readFile('./cached.json', 'utf-8', function(err, data){
                  if(err) throw err;
                  let hold = JSON.parse(data);
                  hold.website.push(values);

          /*        fs.writeFile('./cached.json', JSON.stringify(hold), 'utf-8', function(err){
                    if (err) throw err;
                    console.log('written to json');
                  });*/
                });
                });

        }
    } catch (e) {
        console.log("connectHandler error: " + e.message);
    }
}
//SYN reply on connection transactions
function _synReply(socket, statusCode, info, headers, eHandle) {
    try {
        var status = 'HTTP/1.1 ' + statusCode + ' ' + info + '\r\n';
        var headerLines = '';
        for (var index in headers) {
            headerLines += index + ': ' + headers[index] + '\r\n';  //append all the headers to the header
        }
        socket.write(status + headerLines + '\r\n', 'UTF-8', eHandle); //send on socket

    } catch (error) {
        eHandle(error);
    }
}
module.exports = proxyServer;
