
import {BootScene} from './boot.js';
import {LobbyScene} from './lobby.js';

window.onload= function(){
    var config = {
        type: Phaser.Auto,
        width: 800,
        height: 600,
        physics: {
            default: 'arcade',
            arcade: {
                debug:true
            },
            pixelArt:true
        },
        scene:[BootScene,LobbyScene]
    };

    var game = new Phaser.Game(config);
    game.scene.start("boot");
}


