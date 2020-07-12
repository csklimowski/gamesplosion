
const artStyles = [
    'pixel_chunky',
    'DCC',
    'doodle',
    'furry',
    'pixelart',
    'anime',
    'photos'
];

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'preload'
        });
    }

    preload() {
        this.load.image('loading', 'img/menu-loading.png');
    }

    create() {
        this.scene.start('load');
    }
}


export class LoadScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'load'
        });
    }

    preload() {

        
        this.add.image(480, 360, 'loading');

        
        this.load.bitmapFont('library', 'font/library.png', 'font/library.fnt');
        this.load.bitmapFont('title', 'font/title.png', 'font/title.fnt');

        this.load.image('menu-bg', 'img/menu-bg.png');
        this.load.image('menu-descbox', 'img/menu-descbox.png');
        this.load.image('menu-play', 'img/menu-play.png');
        this.load.image('menu-searchbar', 'img/menu-searchbar.png');
        this.load.image('menu-searchbar2', 'img/menu-searchbar2.png');


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
        this.load.image('gameover', 'img/game_over.png');
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
            frameRate: 6
        });
        this.anims.create({
            key: 'doodle-player2-run',
            frames: this.anims.generateFrameNumbers('doodle-player2-run', {frames: [0, 1]}),
            frameRate: 6
        });
        this.anims.create({
            key: 'doodle-flap',
            frames: this.anims.generateFrameNumbers('doodle-hover device', {frames: [0]}),
            frameRate: 5
        });


        this.anims.create({
            key: 'furry-player1-run',
            frames: this.anims.generateFrameNumbers('furry-player1-run', {frames: [0]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'furry-player2-run',
            frames: this.anims.generateFrameNumbers('furry-player2-run', {frames: [0]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'furry-flap',
            frames: this.anims.generateFrameNumbers('furry-hover device', {frames: [1, 0]}),
            frameRate: 5
        });


        this.anims.create({
            key: 'anime-player1-run',
            frames: this.anims.generateFrameNumbers('anime-player1-run', {frames: [0]}),
            frameRate: 6
        });
        this.anims.create({
            key: 'anime-player2-run',
            frames: this.anims.generateFrameNumbers('anime-player2-run', {frames: [0]}),
            frameRate: 6
        });
        this.anims.create({
            key: 'anime-flap',
            frames: this.anims.generateFrameNumbers('anime-hover device', {frames: [0]}),
            frameRate: 5
        });


        this.anims.create({
            key: 'photos-player1-run',
            frames: this.anims.generateFrameNumbers('photos-player1-run', {frames: [0, 1, 2, 3]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'photos-player2-run',
            frames: this.anims.generateFrameNumbers('photos-player2-run', {frames: [0, 1, 2, 3]}),
            frameRate: 12
        });
        this.anims.create({
            key: 'photos-flap',
            frames: this.anims.generateFrameNumbers('photos-hover device', {frames: [0, 1]}),
            frameRate: 5
        });


        this.anims.create({
            key: 'pixelart-player1-run',
            frames: this.anims.generateFrameNumbers('pixelart-player1-run', {frames: [0, 1, 2]}),
            frameRate: 6
        });
        this.anims.create({
            key: 'pixelart-player2-run',
            frames: this.anims.generateFrameNumbers('pixelart-player2-run', {frames: [0, 1, 2, 3]}),
            frameRate: 6
        });
        this.anims.create({
            key: 'pixelart-flap',
            frames: this.anims.generateFrameNumbers('pixelart-hover device', {frames: [1, 0]}),
            frameRate: 5
        });

        this.scene.start('menu');
    }

}
