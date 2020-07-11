
const artStyles = [
    'pixel_chunky',
    'DCC',
    'doodle'
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
            // this.load.image(style+'-player3-idle', 'img/'+style+'/player3/idle.png');
            // this.load.image(style+'-player3-jump', 'img/'+style+'/player3/jump.png');
            // this.load.image(style+'-player3-die', 'img/'+style+'/player3/die.png');
            // this.load.spritesheet(style+'-player3-run', 'img/'+style+'/player3/run.png', { frameWidth: 72, frameHeight: 96});

            // this.load.image(style+'-enemy3', 'img/'+style+'/enemy3/enemy3.png');
            
            
            this.load.image(style+'-enemy1', 'img/'+style+'/enemy1.png');
            this.load.image(style+'-enemy2', 'img/'+style+'/enemy2.png');
            this.load.image(style+'-tiles', 'img/'+style+'/tiles.png');
            this.load.image(style+'-gun', 'img/'+style+'/gun.png');
            this.load.image(style+'-bullet', 'img/'+style+'/bullet.png');
            this.load.spritesheet(style+'-hover device', 'img/'+style+'/hover device.png', {frameWidth: 96, frameHeight: 72});
            this.load.image(style+'-collectable', 'img/'+style+'/collectable.png');
            this.load.image(style+'-door', 'img/'+style+'/door.png');
            this.load.image(style+'-key', 'img/'+style+'/key.png');
            this.load.image(style+'-poof', 'img/'+style+'/poof.png');
            this.load.image(style+'-key', 'img/'+style+'/key.png');
            this.load.image(style+'-background', 'img/'+style+'/background.png');
            this.load.image(style+'-melee', 'img/'+style+'/melee.png');
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
            key: 'pixel_chunky-flap',
            frames: this.anims.generateFrameNumbers('pixel_chunky-hover device', {frames: [1, 0]}),
            frameRate: 5
        });
        // this.anims.create({
        //     key: 'pixel_chunky-player3-run',
        //     frames: this.anims.generateFrameNumbers('pixel_chunky-player3-run', {frames: [0, 1, 2, 3, 4, 5]}),
        //     frameRate: 12
        // });

        this.anims.create({
            key: 'DCC-player1-run',
            frames: this.anims.generateFrameNumbers('DCC-player1-run', {frames: [0, 1, 2, 3, 4, 5, 6, 7]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'DCC-player2-run',
            frames: this.anims.generateFrameNumbers('DCC-player2-run', {frames: [0, 1, 2, 3, 4, 5, 6, 7]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'DCC-flap',
            frames: this.anims.generateFrameNumbers('DCC-hover device', {frames: [1, 0]}),
            frameRate: 5
        });


        this.anims.create({
            key: 'doodle-player1-run',
            frames: this.anims.generateFrameNumbers('doodle-player1-run', {frames: [0, 1]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'doodle-player2-run',
            frames: this.anims.generateFrameNumbers('doodle-player2-run', {frames: [0, 1]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'doodle-flap',
            frames: this.anims.generateFrameNumbers('doodle-hover device', {frames: [0]}),
            frameRate: 5
        });

        this.scene.start('main');
    }

}
