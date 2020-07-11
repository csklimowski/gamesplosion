
/*
Jump
Reverse Gravity (produces things on ceiling)
Helicopter

with...

Controlled movement
Auto-run (makes level longer/more sparse, puts exit on end)

OR

Throw teleporter/golf



Melee weapon
Sawblade
Rushdown/tackle
Down gun (knocks you up, replaces jump)
Forward gun
Stomp enemies

Guns have randomized...
- Fire rate
- Drop off
- Projectile speed
- Spread
- Number of projectiles

LEVEL VARIANTS/GOALS

- Climb the tower
- Key and back again
- Rising lava (produces stairs as you go right)
- Parallel universes 
- Auto run (not compatible with golf))
- Kill the monsters
- Can climb walls

*/



export class MainScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'main'
        });
    }

    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    player: Phaser.Physics.Arcade.Sprite;

    generator: Phaser.Math.RandomDataGenerator;

    preload() {
        this.load.image('player', 'img/player.png');
        this.load.image('enemy', 'img/enemy.png');
        this.load.image('tiles', 'img/tiles.png');
    }

    create() {

        this.generator = new Phaser.Math.RandomDataGenerator('Minecraft');

        let levelWidth = this.generator.integerInRange(20, 60);
        let levelHeight = 15;
        let tileData = [];

        for (let r = 0; r < levelHeight; r++) {
            tileData.push([]);
            for (let c = 0; c < levelWidth; c++) {
                if (r === 0 || c === 0 || r === levelHeight-1 || c === levelWidth-1) {
                    if (r > 0 && tileData[r-1][c] === -1) {
                        tileData[r].push(1);
                    } else {
                        tileData[r].push(0);
                    }
                } else {
                    tileData[r].push(-1)
                }
            }
        }

        let map = this.make.tilemap({
            data: tileData,
            tileWidth: 48,
            tileHeight: 48
        });

        let tiles = map.addTilesetImage('tiles');
        let blocks = map.createStaticLayer(0, tiles);
        blocks.setCollisionByExclusion([-1], true);


        // basic level dimensions

        for (let r = 0; r < levelHeight; r++) {
            tileData.push([]);
            for (let c = 0; c < levelWidth; c++) {
                if (r === 0 || c === 0 || r === levelHeight-1 || c === levelWidth-1) {
                    if (r > 0 && tileData[r-1][c] === -1) {
                        tileData[r].push(1);
                    } else {
                        tileData[r].push(0);
                    }
                } else {
                    tileData[r].push(-1)
                }
            }
        }

        // add player
        this.player = this.physics.add.sprite(50, 50, 'player');
        this.player.setOrigin(0.5, 1);
        this.player.setScale(1, 1);
        this.player.setCollideWorldBounds(true);
        this.player.setGravity(0, 1000);
        this.physics.add.collider(this.player, blocks);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.cursors.space.on(Phaser.Input.Keyboard.Events.DOWN, () => {
            if (this.player.body.velocity.y === 0) {
                this.player.setVelocityY(-500);
            }
        });
    }

    update(time: number, delta: number) {
        if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else {
            this.player.setVelocityX(0);
        }
    }
}
