
import * as Constant from './constant.js';


export class LobbyScene extends Phaser.Scene {

    constructor() {
        super({ key: "lobby" });
    }

    players = {};
    toilet;
    cube;
    bullets;
    client = {};
    nextFire = 0;
    Poochecker;
    toiletAvailable;
    toiletBroken;
    text;
    cursors;
    decrement = 20;
    frames = [
        { key: 'human', frame: "walkcolor0001.png" },
        { key: 'human', frame: "walkcolor0002.png" },
        { key: 'human', frame: "walkcolor0003.png" },
        { key: 'human', frame: "walkcolor0004.png" },
        { key: 'human', frame: "walkcolor0005.png" },
        { key: 'human', frame: "walkcolor0006.png" },
        { key: 'human', frame: "walkcolor0007.png" },
        { key: 'human', frame: "walkcolor0008.png" },
        { key: 'human', frame: "walkcolor0009.png" },
        { key: 'human', frame: "walkcolor0010.png" },
        { key: 'human', frame: "walkcolor0011.png" },
        { key: 'human', frame: "walkcolor0012.png" },
    ];

    preload() {
        this.load.image('floor', 'assets/floor.png');
        this.load.image('toilet', 'assets/toilet.png');
        this.load.atlas('human', 'assets/player.png', "assets/player.json");
    }

    create(data) {
        this.cameras.main.setBounds(0, 0, 1366, 768)
        this.physics.world.setBounds(0, 0, 1366, 768);
        this.add.image(683, 384, 'floor');
        this.toilet = this.physics.add.staticSprite(400, 500, 'toilet');
        this.toilet.name = "toilet";
        this.toilet.setInteractive();

        this.text = this.add.text(10, 10, 'Debug', { font: '16px Courier', fill: '#00ff00' });
        this.text.scrollFactorX = 0;
        this.text.scrollFactorY = 0;

        this.anims.create({
            key: 'walk_left',
            frames: this.frames,
            framerate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk_right',
            frames: this.frames,
            framerate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk_up',
            frames: this.frames,
            framerate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk_down',
            frames: this.frames,
            framerate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'stop',
            frames: [{ key: 'human', frame: "idle.png" }],
            framerate: 20
        });

        this.client.socket = io.connect();
        this.askNewPlayer(300, 300, data.name);

        this.input.on('gameobjectdown', (pointer, object) => {
            this.onObjectClicked(pointer, object);
        });


        this.client.socket.on('newplayer', data => {
            console.log("player");

            this.addNewPlayer(data, this);
        });

        this.client.socket.on('allplayers', data => {
            console.log("allplayers", data);
            for (var i = 0; i < data.players.length; i++) {
                this.addNewPlayer(data.players[i], this)
            }

            this.toiletAvailable = data.toiletAvailable;

        });

        this.client.socket.on('remove', id => {
            this.players[id].destroy();
            delete this.players[id];
        });

        this.cursors = this.input.keyboard.createCursorKeys();


        this.client.socket.on('playerIsMoving', data => {
            if (this.players[data.id]) {
                var distance = Phaser.Math.Distance.Between(this.players[data.id].x, this.players[data.id].y, data.x, data.y);
                var duration = distance * 10;


                if (data.direction == Constant.RIGHT) {
                    this.players[data.id].list[0].anims.play('walk_right', true);
                    this.players[data.id].list[0].resetFlip();
                }

                else if (data.direction == Constant.LEFT) {
                    this.players[data.id].list[0].anims.play('walk_left', true);
                    this.players[data.id].list[0].flipX = true;
                }
                else if (data.direction == Constant.UP) {
                    this.players[data.id].list[0].anims.play('walk_up', true);
                }
                else {
                    this.players[data.id].list[0].anims.play('walk_down', true);
                }

                this.players[data.id].x = data.x;
                this.players[data.id].y = data.y;
            }

        });

        this.client.socket.on('playerStop', data => {
            if (this.players[data.id]) {
                this.players[data.id].list[0].anims.play('stop');
                this.players[data.id].x = data.x;
                this.players[data.id].y = data.y;
            }

        });

        this.client.socket.on('toiletAvailable', available => {
            this.toiletAvailable = available;
        });

    }

    update() {

        this.playerMovementListener(this.cursors);
        this.toiletListener();


        //DEBUG
        this.text.setText([
            'Cliquez pour spawn'
        ]);

        if (this.players[this.client.socket.id]) {
            this.text.setText([
                'Chieur fou ? : Pas encore implémenté',
                'Barre de merde: ' + this.players[this.client.socket.id].player.Poobar,
                'Toilette pétée: ',
                "Travail de l'équipe: ",
            ]);
        }
    }


    //#region CLIENTSOCKET
    askNewPlayer(x, y, name) {
        this.client.socket.emit('newplayer', { x: x, y: y, name: name });
    }

    addNewPlayer(data, scene) {
        var container = scene.add.container(data.X, data.Y);
        var playerName = scene.add.text(0, 0, data.Name, { font: "20px Luminari", fill: "#ffffff" });
        playerName.setOrigin(0.5, 4);
        var player = scene.physics.add.sprite(0, 0, 'human');
        //this.players[data.ID] = scene.physics.add.sprite(data.X, data.Y, 'human');
        player.setCollideWorldBounds(true);
        player.setTint(data.Color);
        container.add(player);
        container.add(playerName);
        container.setSize(85, 100);
        scene.physics.world.enable(container);
        container.body.setCollideWorldBounds(true);
        this.players[data.ID] = container;
        this.players[data.ID].player = data;
        // players[data.ID].body.allowRotation = false;
        // players[data.ID].setTintFill(data.Color);

        //this.players[data.ID].addChild(playerName);

        // this.players[data.ID].tween = scene.tweens.add({
        //     targets: this.players[data.ID],
        //     x: data.X,
        //     y: data.Y,
        //     ease: 'Linear',
        //     duration: 1000
        // });

        scene.physics.add.collider(this.players[data.ID], this.toilet);
        //SE DECLENCHE QUAND L'ID DU JOUEUR EST CELUI DE LA SOCKET, DONC C'EST TOI LA DERRIERE L'ECRAN QUI JOUE. PAS LES AUTRES JOUEURS. CA NE DOIT ARRIVER QU'UNE FOIS
        if (data.ID == this.client.socket.id) {
            scene.cameras.main.startFollow(this.players[data.ID], true);
            this.launchPooChecker();

        }

    }


    playerMovementListener(cursors) {
        if (this.players[this.client.socket.id]) {

            if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
                if (cursors.left.isDown) {
                    this.players[this.client.socket.id].body.velocity.x = -Constant.PLAYER_SPEED;
                    this.players[this.client.socket.id].list[0].flipX = true;
                    this.players[this.client.socket.id].list[0].anims.play('walk_left', true);
                    this.client.socket.emit('keyPress', Constant.LEFT, { x: this.players[this.client.socket.id].x, y: this.players[this.client.socket.id].y });
                }
                if (cursors.right.isDown) {
                    this.players[this.client.socket.id].body.velocity.x = Constant.PLAYER_SPEED;
                    this.players[this.client.socket.id].list[0].resetFlip();
                    this.players[this.client.socket.id].list[0].anims.play('walk_right', true);
                    this.client.socket.emit('keyPress', Constant.RIGHT, { x: this.players[this.client.socket.id].x, y: this.players[this.client.socket.id].y });
                }


                if (cursors.up.isDown) {
                    this.players[this.client.socket.id].body.velocity.y = -Constant.PLAYER_SPEED;
                    if(!cursors.left.isDown && !cursors.right.isDown)
                    {
                        this.players[this.client.socket.id].list[0].anims.play('walk_up', true);
                    }
                    
                    this.client.socket.emit('keyPress', Constant.UP, { x: this.players[this.client.socket.id].x, y: this.players[this.client.socket.id].y });
                }

                if (cursors.down.isDown) {
                    this.players[this.client.socket.id].body.velocity.y = Constant.PLAYER_SPEED;
                    if(!cursors.left.isDown && !cursors.right.isDown)
                    {
                        this.players[this.client.socket.id].list[0].anims.play('walk_down', true);
                    }
                    
                    this.client.socket.emit('keyPress', Constant.DOWN, { x: this.players[this.client.socket.id].x, y: this.players[this.client.socket.id].y });
                }
            }

            else {
                this.players[this.client.socket.id].body.velocity.x = 0;
                this.players[this.client.socket.id].body.velocity.y = 0;
                this.players[this.client.socket.id].list[0].anims.play('stop');
                this.client.socket.emit('stop', { x: this.players[this.client.socket.id].x, y: this.players[this.client.socket.id].y });
            }
        }

    }

    toiletListener() {
        if (this.players[this.client.socket.id]) {
            this.toiletAvailable == true ? this.toilet.setTint(0xffffff) : this.toilet.setTint(0xff0000);
        }
    }

    onObjectClicked(pointer, gameObject, yolo) {
        if (gameObject.name = "toilet") {

            if (this.toiletAvailable) {
                this.startPoo();
            }

        }

    }

    startPoo() {

        clearInterval(this.Poochecker);
        this.client.socket.emit('usingTheToilet', true);
        this.Poochecker = setInterval(() => {
            if (this.players[this.client.socket.id].player.Poobar - this.decrement >= 0) {
                this.players[this.client.socket.id].player.Poobar -= this.decrement;
            }
            else {
                this.players[this.client.socket.id].player.Poobar = 0
            }

            if (this.players[this.client.socket.id].player.Poobar == 0) {
                clearInterval(this.Poochecker);
                this.client.socket.emit('usingTheToilet', false);
                this.launchPooChecker();
            }
        }, 2000);
    }

    launchPooChecker() {
        this.Poochecker = setInterval(() => {
            if (100 - this.players[this.client.socket.id].player.Poobar >= 5) {
                this.players[this.client.socket.id].player.Poobar += 5;
                //decrement = (players[client.socket.id].player.Poobar * 20)/100;
            }
            else {
                this.players[this.client.socket.id].player.Poobar += 100 - this.players[this.client.socket.id].player.Poobar
            }

            if (this.players[this.client.socket.id].player.Poobar == 100) {
                clearInterval(this.Poochecker);
                //decrement = (players[client.socket.id].player.Poobar * 20)/100;
            }
        }, 5000);
    }
    //#endregion
}
