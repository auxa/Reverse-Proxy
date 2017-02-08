var squidProxy = require("./index.js");
var readline = require('readline');
var HashMap = require('hashmap');
var fs = require('fs');

var arrayOfWebsites;

fs.readFile('./websites.json', 'utf-8', function(err, data){
	if(err) throw err;

	arrayOfWebsites = JSON.parse(data);
});

var myProxy = new squidProxy({
	"port": 9393,
	"onBeforeRequest": function(requestOptions) {
		console.log("proxy request :" + requestOptions.host + (requestOptions.path || ''));
	},
	"blocked" :arrayOfWebsites
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
			break;
		default:
			console.log(`blocking '${line.trim()}`);
			fs.readFile('./websites.json', 'utf-8', function(err, data){
				if(err) throw err;

				 arrayOfWebsites = JSON.parse(data);
				arrayOfWebsites.websites.push({
					address: line.trim()
				});
				console.log(arrayOfWebsites);


			fs.writeFile('./websites.json', JSON.stringify(arrayOfWebsites), 'utf-8', function(err){
				if (err) throw err;

				console.log('written to json');
			});
			});
			break;
	}
	rl.prompt();
}).on('close', () =>{
	console.log('have a good day');
})
