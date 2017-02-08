var squidProxy = require("./index.js");
var readline = require('readline');
var HashMap = require('hashmap');
var fs = require('fs');

fs.readFile('./websites.json', 'utf-8', function(err, data){
	if(err) throw err;

	var arrayOfWebsites = JSON.parse(data);
	arrayOfWebsites.websites.push({
		address: 'www.youtube.com'
	});
	console.log(arrayOfWebsites);
});


var map = new HashMap();

var myProxy = new squidProxy({
	"port": 9393,
	"onBeforeRequest": function(requestOptions) {
		console.log("proxy request :" + requestOptions.host + (requestOptions.path || ''));
	}
});
myProxy.start();
console.log("proxy start at 9393");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
	prompt: 'OHAI> '
});

rl.prompt();

rl.on('line', (line) =>{
	switch (line.trim()) {
		case '':
				console.log('invalid input');
				console.log(map.get("facebook.com"));
			break;
		default:
			console.log(`blocking '${line.trim()}`);
			map.set(line.trim(), 'block');
			break;
	}
	rl.prompt();
}).on('close', () =>{
	console.log('have a good day');
})
