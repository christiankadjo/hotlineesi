var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
 


server.listen(8081,'bework025', function () {
  console.log(`Listening on ${server.address().port}`);
});

server.colors = [
  {color:0x641E16, id:null},
  {color:0x512E5F, id:null},
  {color:0x154360, id:null},
  {color:0x0E6251, id:null},
  {color:0x7D6608, id:null},
  {color:0x1B2631, id:null}
]

io.on('connection', function (socket){
  console.log('a user connected');

  socket.on('newplayer', function(coord){
    console.log(socket.id);
    // socket.player = {
    //   id:socket.id,
    //   x:randomInt(100,400),
    //   y:randomInt(100,400),
    //   color:server.colors.find(x=> x.id == null).color
    // };

    socket.player = new Player(socket.id, getColor(), coord.x, coord.y);
    var color_index = server.colors.indexOf(server.colors.find(x=>x.color == socket.player.Color));
    server.colors[color_index].id = socket.player.ID;
    socket.emit('allplayers', getAllPlayers());
    socket.broadcast.emit('newplayer',socket.player);

    socket.on('keyPress', function(direction, coord){
      //la direction servira à savoir de quel coté regarde le joueur
      var data = {
        id:socket.player.ID,
        x:coord.x,
        y:coord.y
      };
      socket.broadcast.emit('playerIsMoving', data);
    });

    socket.on('stop', function(coord){
      var data = {
        id:socket.player.ID,
        x:coord.x,
        y:coord.y
      };
      socket.broadcast.emit('playerStop', data);
    });


    socket.on('disconnect', function(){
      console.log(socket.player.ID, 'user disconnected');
      io.emit('remove', socket.player.ID);
      var color_index = server.colors.indexOf(server.colors.find(x=>x.color == socket.player.Color));
      server.colors[color_index].id = null;
    });
  });
  

});

function getAllPlayers()
{
  var players = [];
  io.of('/').sockets.forEach(element => {
    if(element.player)
    {
      players.push(element.player);
    }
  });
  // const ids = await io.allSockets();
  // ids.forEach(id => {
  //   var player = io.of('/').sockets.get(id).player;
  //   if(player)
  //   {
  //     players.push(player);
  //   }
  // });
  return players;
}


function randomInt(low, high)
{
  return Math.floor(Math.random() * (high - low) + low);
}

function getColor()
{
  return server.colors.find(x=> x.id == null).color;
}

class Player{
  // var ID = null;
  // Poobar = null;
  // Name = null;
  // Color = null;
  // X = null;
  // Y = null;
  constructor(id,color,x = 0, y = 0)
  {
    this.ID = id;
    this.Poobar = 100;
    this.Name = "";
    this.Color = color;
    this.X = x;
    this.Y = y;
  }
}
