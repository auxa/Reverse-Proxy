var fs = require('fs');
var readline = require('readline');
var HashMap = require('hashmap');
var map = new HashMap();
var data = {};
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('What do you think of Node.js? ', (answer) => {
  // TODO: Log the answer in a database
  map.set(answer, 1);
  console.log(`Thank you for your valuable feedback: ${answer}`);
console.log(map.get("id"));
  rl.close();
});

//
