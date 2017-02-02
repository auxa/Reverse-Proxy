var express = require("express");
var http = require("http");
var socketIO = require("socket.io");

var app = express();
app.get("/", function(req, res){
    res.sendfile("./index.html");
});

var server = http.createServer(app);
var io = socketIO.listen(server, {log: false});
io.sockets.on("connection", function(socket){
    socket.on("sendVar", function(value){
        console.log("The value of the variable is " + value);
    });
});

server.listen(5000);
