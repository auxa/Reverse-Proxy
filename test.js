var squidProxy = require("./index.js");
var readline = require('readline');
var HashMap = require('hashmap');
var fs = require('fs');
var remove = require('unordered-array-remove');

var arrayOfWebsites;



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
  output: process.stdout
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
				var i;
				 arrayOfWebsites = JSON.parse(data);

				 var testing =-1;
				 for(i =0; i< arrayOfWebsites.websites.length; i++){
					  if(arrayOfWebsites.websites[i].address === line.trim()){
							arrayOfWebsites.websites[i].address='null';
							testing =0;
						}
				 }
				 if(testing != 0){
					 arrayOfWebsites.websites.push({
					 address: line.trim()
				 });
				 }



				 console.log(i + " " +arrayOfWebsites.websites.length )


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
