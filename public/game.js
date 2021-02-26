
import {BootScene} from './boot.js';
import {LobbyScene} from './lobby.js';

window.onload= function(){
    var config = {
        type: Phaser.Auto,
        width: 800,
        height: 640,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y:0},
                debug:true
            },
            pixelArt:true
        },
        scene:[BootScene,LobbyScene]
    };

    var game = new Phaser.Game(config);
    game.scene.start("boot");
}


