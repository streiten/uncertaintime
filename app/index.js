var express = require('express');
var mustache = require('mustache-express');

var app = express();

app.use(express.static('public'));
app.get('/',requestHandler);

function requestHandler(request, response) {
  response.sendfile('./views/index.html');
  console.log('Serving another request (sigh)')
}

app.listen(8888, function(){
    console.log('Serving you...')
});
