var squidProxy = require("./index.js");


var squidward = new squidProxy({
	"port": 9393,
	"onBeforeRequest": function(requestOptions) {
		console.log("proxy request :" + requestOptions.host + (requestOptions.path || ''));
	}
});
squidward.start();
console.log("proxy start at 9393");
