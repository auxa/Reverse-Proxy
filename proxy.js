var proxyServer = require("./index.js");
var readline = require('readline');
var HashMap = require('hashmap');
var fs = require('fs');
var arrayOfWebsites;



var myProxy = new proxyServer({
	"port": 9393,
	"onBeforeRequest": function(requestOptions) {
		console.log("proxy request :" + requestOptions.host);
	}
});

myProxy.start();
console.log("proxy start at 9393");
/*
management console set up
works by taking user input from the command line and checking against the JSON file
if the website is a member of the JSON file it is removed
else it is added to be a new blacklisted website
*/
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
							arrayOfWebsites.websites[i].address='';
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
	console.log('Close connection');
})
