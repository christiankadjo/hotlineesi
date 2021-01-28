
import * as Constant from './constant.js';

var config = {
    type: Phaser.Auto,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {

        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var game = new Phaser.Game(config);
var players = {};
var toilet;
var cube;
var bullets;
var client = {};
var nextFire = 0;
var Poochecker;
var toiletAvailable;
var text;
var cursors;
function preload() {
    this.load.image('floor', 'assets/floor.png');
    this.load.spritesheet('cube', 'assets/cube.png', { frameWidth: 40, frameHeight: 40 });
    this.load.image('toilet', 'assets/toilet.png');
}

function create() {
    this.cameras.main.setBounds(0, 0, 1366, 768)
    this.physics.world.setBounds(0, 0, 1366, 768);
    this.add.image(683, 384, 'floor');
    toilet = this.physics.add.staticSprite(400, 500, 'toilet');
    toilet.name = "toilet";
    //toilet.setTintFill(0x7D6608);
    toilet.setInteractive();
    // cube = this.physics.add.sprite(400,300,'cube');
    // cube.setCollideWorldBounds(true);
    // cube.body.allowRotation = false;

    // bullets = new BulletGroup(this);
    //this.input.setDefaultCursor('url(assets/crosshair.png), pointer');

    text = this.add.text(10, 10, 'Debug', { font: '16px Courier', fill: '#00ff00' });

    client.socket = io.connect();
    //askNewPlayer();

    this.input.on('gameobjectdown', onObjectClicked);

    this.input.on('pointerdown', pointer => {
        if (!players[client.socket.id]) {
            askNewPlayer(pointer.x, pointer.y);
        }
        else {

        }
    });

    client.socket.on('newplayer', data => {
        console.log("player");

        addNewPlayer(data, this);
    });

    client.socket.on('allplayers', data => {
        console.log("allplayers", data);
        for (var i = 0; i < data.players.length; i++) {
            addNewPlayer(data.players[i], this)
        }

        toiletAvailable = data.toiletAvailable;

    });

    client.socket.on('remove', id => {
        players[id].destroy();
        delete players[id];
    });

    cursors = this.input.keyboard.createCursorKeys();


    client.socket.on('playerIsMoving', data => {

        players[data.id].x = data.x;
        players[data.id].y = data.y;
    });

    client.socket.on('playerStop', data => {
        if (players[data.id]) {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
        }

    });

    client.socket.on('toiletAvailable', available => {
        toiletAvailable = available;
    });

}

function update() {

    playerMovementListener(cursors);
    toiletListener();
    // var angle =0;


    //playerMovement(cursors);

    // this.input.on('pointermove',function(pointer){
    //     angle = Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.BetweenPoints(cube, pointer);
    //     cube.setAngle(angle);
    // }, this);


    // this.input.on('pointerdown', pointer => {
    //     if(game.getTime()> nextFire)
    //     {
    //         nextFire = game.getTime() + FIRERATE;
    //         var bullet = bullets.getFirstDead(false); //getFirstDead will get the first child of the group that is considered dead... ie: The .alive property is false...
    //         if(bullet){
    //             bullet.shoot(cube.x,cube.y);
    //             this.physics.velocityFromAngle(angle, PROJECTILE_SPEED, bullet.body.velocity);
    //         }
    //     }
    // }, this);


    //DEBUG
    text.setText([
        'Cliquez pour spawn'
        //'nextFire: ' + nextFire
    ]);

    if (players[client.socket.id]) {
        text.setText([
            'Barre de merde: ' + players[client.socket.id].player.Poobar
        ]);
    }
}




//#region CLIENTSOCKET
function askNewPlayer(x, y) {
    client.socket.emit('newplayer', { x: x, y: y });
}

function addNewPlayer(data, scene) {
    players[data.ID] = scene.physics.add.sprite(data.X, data.Y, 'cube');
    players[data.ID].setCollideWorldBounds(true);
    players[data.ID].body.allowRotation = false;
    players[data.ID].setTintFill(data.Color);
    players[data.ID].player = data;

    scene.physics.add.collider(players[data.ID], toilet);

    //SE DECLENCHE QUAND L'ID DU JOUEUR EST CELUI DE LA SOCKET, DONC C'EST TOI LA DERRIERE L'ECRAN QUI JOUE. PAS LES AUTRES JOUEURS. CA NE DOIT ARRIVER QU'UNE FOIS
    if (data.ID == client.socket.id) {
        scene.cameras.main.startFollow(players[data.ID], true, 0.05, 0.05);
        // Poochecker= setInterval(()=>{
        //     if(100 - players[data.ID].player.Poobar >= 5)
        //     {
        //         players[data.ID].player.Poobar += 5;
        //     }
        //     else
        //     {
        //         players[data.ID].player.Poobar += 100 - players[data.ID].player.Poobar
        //     }

        //     if(players[data.ID].player.Poobar == 100)
        //     {
        //         clearInterval(Poochecker);
        //     }
        // },5000);

        launchPooChecker();

    }

}


function playerMovementListener(cursors) {
    if (players[client.socket.id]) {

        if (cursors.left.isDown) {
            players[client.socket.id].setVelocityX(-Constant.PLAYER_SPEED);
            client.socket.emit('keyPress', Constant.LEFT, { x: players[client.socket.id].x, y: players[client.socket.id].y });
        }
        else if (cursors.right.isDown) {
            players[client.socket.id].setVelocityX(Constant.PLAYER_SPEED);
            client.socket.emit('keyPress', Constant.RIGHT, { x: players[client.socket.id].x, y: players[client.socket.id].y });
            // cube.setVelocityX(PLAYER_SPEED);
        }
        else {
            players[client.socket.id].setVelocityX(0);
            client.socket.emit('stop', { x: players[client.socket.id].x, y: players[client.socket.id].y });
            // cube.setVelocityX(0);
        }


        if (cursors.up.isDown) {
            players[client.socket.id].setVelocityY(-Constant.PLAYER_SPEED);
            client.socket.emit('keyPress', Constant.UP, { x: players[client.socket.id].x, y: players[client.socket.id].y });
            // cube.setVelocityY(-PLAYER_SPEED);
        }
        else if (cursors.down.isDown) {
            players[client.socket.id].setVelocityY(Constant.PLAYER_SPEED);
            client.socket.emit('keyPress', Constant.DOWN, { x: players[client.socket.id].x, y: players[client.socket.id].y });
            // cube.setVelocityY(PLAYER_SPEED);
        }
        else {
            players[client.socket.id].setVelocityY(0);
            client.socket.emit('stop', { x: players[client.socket.id].x, y: players[client.socket.id].y });
            // cube.setVelocityY(0);
        }
    }

}

function toiletListener() {
    if (players[client.socket.id]) {
        toiletAvailable == true ? toilet.setTint(0xffffff) : toilet.setTint(0xff0000);
    }
}

function onObjectClicked(pointer, gameObject) {
    if (gameObject.name = "toilet") {
        if (toiletAvailable) {
            startPoo();
        }

    }

}

function startPoo() {
    clearInterval(Poochecker);
    client.socket.emit('usingTheToilet', true);
    Poochecker = setInterval(() => {
        if (players[client.socket.id].player.Poobar - 20 >= 0) {
            players[client.socket.id].player.Poobar -= 20;
        }
        else {
            players[client.socket.id].player.Poobar = 0
        }

        if (players[client.socket.id].player.Poobar == 0) {
            clearInterval(Poochecker);
            client.socket.emit('usingTheToilet', false);
            launchPooChecker();
        }
    }, 2000);
}

function launchPooChecker() {
    Poochecker = setInterval(() => {
        if (100 - players[client.socket.id].player.Poobar >= 5) {
            players[client.socket.id].player.Poobar += 5;
        }
        else {
            players[client.socket.id].player.Poobar += 100 - players[client.socket.id].player.Poobar
        }

        if (players[client.socket.id].player.Poobar == 100) {
            clearInterval(Poochecker);
        }
    }, 5000);
}
//#endregion

class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        // Call the super constructor, passing in a world and a scene
        super(scene.physics.world, scene);

        // Initialize the group
        this.createMultiple({
            classType: Bullet,
            frameQuantity: 10, //create 10 instances
            active: false,
            visible: false,
            key: 'bullet'
        });
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    shoot(x, y) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
    }
}