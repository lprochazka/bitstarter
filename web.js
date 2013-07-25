var express = require('express');
var app = express.createServer(express.logger());

var fs = require('fs');
var fileData = new Buffer(fs.readFileSync("index.html"));
app.get('/', function(request, response) {
  response.send(fileData.toString());
});

app.configure(function () {
    app.use('/evelo', express.static(__dirname + '/media'));
    app.use(express.static(__dirname + '/'));
})

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
