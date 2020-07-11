
const artStyles = [
    'pixel_chunky',
];


export class LoadScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'load'
        });
    }

    

    preload() {
        for (let style of artStyles) {
            this.load.image(style+'-player1-idle', 'img/'+style+'/player1/idle.png');
            this.load.image(style+'-player1-jump', 'img/'+style+'/player1/jump.png');
            this.load.image(style+'-player1-die', 'img/'+style+'/player1/die.png');
            this.load.spritesheet(style+'-player1-run', 'img/'+style+'/player1/run.png', { frameWidth: 72, frameHeight: 96});
            this.load.image(style+'-player2-idle', 'img/'+style+'/player2/idle.png');
            this.load.image(style+'-player2-jump', 'img/'+style+'/player2/jump.png');
            this.load.image(style+'-player2-die', 'img/'+style+'/player2/die.png');
            this.load.spritesheet(style+'-player2-run', 'img/'+style+'/player2/run.png', { frameWidth: 72, frameHeight: 96});
            this.load.image(style+'-player3-idle', 'img/'+style+'/player3/idle.png');
            this.load.image(style+'-player3-jump', 'img/'+style+'/player3/jump.png');
            this.load.image(style+'-player3-die', 'img/'+style+'/player3/die.png');
            this.load.spritesheet(style+'-player3-run', 'img/'+style+'/player3/run.png', { frameWidth: 72, frameHeight: 96});

            this.load.image(style+'-enemy1', 'img/'+style+'/enemy1/enemy1.png');
            this.load.image(style+'-enemy2', 'img/'+style+'/enemy2/enemy2.png');
            this.load.image(style+'-enemy3', 'img/'+style+'/enemy3/enemy3.png');
        }

        this.load.image('pixel_chunky-enemy1', 'img/enemy.png');
        this.load.image('tiles', 'img/tiles.png');
        this.load.image('player', 'img/player.png');
    }

    create() {
        this.anims.create({
            key: 'pixel_chunky-player1-run',
            frames: this.anims.generateFrameNumbers('pixel_chunky-player1-run', {frames: [0, 1]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'pixel_chunky-player2-run',
            frames: this.anims.generateFrameNumbers('pixel_chunky-player2-run', {frames: [0, 1, 2, 3, 4, 5]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'pixel_chunky-player3-run',
            frames: this.anims.generateFrameNumbers('pixel_chunky-player3-run', {frames: [0, 1, 2, 3, 4, 5]}),
            frameRate: 12
        });

        this.scene.start('main');
    }

}
