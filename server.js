var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
var fs = require('fs')
var qs = require('querystring');

app.listen(8080);

var originalColors = ['green', 'greenDark','greenLight', 
    'pink', 'pinkDark', 'yellow', 'darken', 'purple', 
    'blue', 'blueDark', 'blueLight', 'orange', 'orangeDark',
    'red'];
  
var availableColors = originalColors.slice(0);

var teamOrder = [];
var teamColors = {};
var dashboardTarget = null;


function addTeam(name) {
  if (teamOrder.indexOf(name) == -1) {
    teamOrder.push(name)
    console.log("New order: " + teamOrder);
    if (!(name in teamColors)) {
      if (availableColors.length <= 0) {
        availableColors = originalColors.slice(0);
      }
      teamColors[name] = availableColors.pop(0);
    }
  } else {
    console.log("Repeated order from " + teamOrder);
  }
  return {
    team: teamOrder, 
    colors: teamColors
  }
}

function reset() {
  console.log("Received a reset command.");
  teamOrder = [];
  return {
    team: teamOrder, 
    colors: teamColors
  }
}



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
        if (dashboardTarget != null) {
          dashboardTarget.emit('team', addTeam(team_name));
        }
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
    socket.emit('team', reset());
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