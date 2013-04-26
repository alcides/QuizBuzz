var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
var fs = require('fs')
var qs = require('querystring');

app.listen(8080);


var teamOrder = [];
var dashboardTarget = null


function handler (req, res) {
  var filename = '/index.html'
  if (req.url == '/dashboard.html') filename = '/dashboard.html'
  get_post(req, function(POST) {
    var team_name = '';
    if (req.method == 'POST') team_name = POST['team'] 
    fs.readFile(__dirname + filename, function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      if (team_name != "") {
        teamOrder.push(team_name);
        console.log("New order: " + teamOrder )
        if (dashboardTarget != null) dashboardTarget.emit('team', { team:teamOrder });
      }
      res.writeHead(200);
      ndata = data.toString().replace('value=""','value="' + team_name + '"')
      res.end(ndata);
    });
  });
}

io.sockets.on('connection', function (socket) {
  dashboardTarget = socket;
  socket.on('reset', function(data) {
    console.log("Received a reset command.")
    teamOrder = [];
    socket.emit('team', { team:teamOrder });
  });
});


function get_post(request, callback) {
  if (request.method == 'POST') {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var POST = qs.parse(body);
      callback(POST);
    });
  } else {
    callback(null);
  }
}