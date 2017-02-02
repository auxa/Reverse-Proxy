var prompt = require('prompt');

  var input = [
    {
      name: 'website'
    }
  ];

  prompt.start();
function test_prompt(){
  prompt.get(input, function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Checking Website: ' + result.website);
  });

  test_prompt();




  function onErr(err) {
    console.log(err);
    return 1;
  }
