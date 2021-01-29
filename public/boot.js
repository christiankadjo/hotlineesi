export class BootScene extends Phaser.Scene {
    constructor()
    {
        super({key:"boot"});
    }

     
    create()
    {
        this.add.text(10,10, 'Saisir un nom de joueur:', {font: '32px Courier', fill: '#ffffff' });
        var textEntry = this.add.text(10, 50, '', { font: '32px Courier', fill: '#ffff00' });

        this.input.keyboard.on('keydown', event=> {
            if (event.keyCode === 8 && textEntry.text.length > 0)
            {
                textEntry.text = textEntry.text.substr(0, textEntry.text.length - 1);
            }
            else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90))
            {
                textEntry.text += event.key;
            }

            else if (event.keyCode === 13)
            {
                if(textEntry.text.length > 0)
                {
                    this.scene.start('lobby',{name:textEntry.text});
                }
                
            }
    
        });
    }
}