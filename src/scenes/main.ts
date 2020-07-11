

const JumpType = {
    JUMP: 0,
    FLAP: 1,
    HOVER: 2,
    FLIP: 3,
    POGO: 4
}

const Weapon = {
    NONE: 0,
    STOMP: 1,
    SHOOT: 2,
    WHACK: 3,
    SAW: 4
}

const SpecialAction = {
    NONE: 0,
    SWAP: 1
}

const Gun = {
    FORWARD: 0,
    POINTER: 1,
    DOWN: 3,
}


const LevelType = {
    NORMAL: 0,
    TOWER_ASCEND: 1,
    AUTO: 2,
    LAVA: 3,
    SURVIVE: 4,
    COLLECT: 5,
    KEY: 6,
}

const LevelShape = {
    NORMAL: 0,
    TOWER: 1,
    SPACIOUS: 3,
    ARENA: 4,
    EXPLORE: 5,
}

const EnemyMovement = {
    STATIONARY: 0,
    WALKING: 1,
    FLOATING: 2,
    RICOCHET: 3,
    FLIPPING: 4
}

const EnemyAttack = {
    NONE: 0,
    SHOOT: 1,
    SAW: 2
}


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



class Bullet extends Phaser.GameObjects.Image {
    
}



interface GameParams {
    jumpType: number,
    weapon: number
}



export class MainScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'main'
        });
    }
    
    player: Player;
    keys: any = {};
    generator: Phaser.Math.RandomDataGenerator;
    graphics: Phaser.GameObjects.Graphics;

    enemies: Phaser.GameObjects.Group;

    gameParams: GameParams;

    create() {

        this.generator = new Phaser.Math.RandomDataGenerator();

        let levelWidth = this.generator.integerInRange(20, 60);
        let levelHeight = 15;
        let tileData = [];

        this.gameParams = {
            jumpType: JumpType.JUMP,
            weapon: Weapon.STOMP
        }

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

        let playerStyle = ['player1', 'player2', 'player3'][this.generator.integerInRange(0, 2)]
        let enemyStyle = ['enemy1', 'enemy2', 'enemy3'][this.generator.integerInRange(0, 2)]

        // add player
        this.player = new Player(this, 300, 300, 'pixel_chunky', playerStyle);
        
        this.player.setCollideWorldBounds(false);
        this.player.setGravity(0, 1499);
        this.player.setScale(1);
        this.physics.add.collider(this.player, blocks);

        this.enemies = this.add.group();
        let enemy = new Enemy(this, 600, 300, 'pixel_chunky', enemyStyle);
        enemy.setGravity(0, 1499);
        enemy.setOrigin(0.5, 1);
        this.physics.add.collider(enemy, blocks);

        enemy.body.immovable = true;

        this.enemies.add(enemy);

        this.physics.add.collider(this.player, enemy, this.playerMeetsEnemy, null, this);
        


        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.space.on(Phaser.Input.Keyboard.Events.DOWN, this.onSpaceDown, this);
        this.keys.space.on(Phaser.Input.Keyboard.Events.UP, this.onSpaceUp, this);
        
        this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onClick, this);

        this.graphics = this.add.graphics();
    }

    playerMeetsEnemy(player: Player, enemy: Enemy) {

        if (player.body.touching.down) {
            enemy.setScale(1, 0.2);
            player.setVelocityY(-0.3*this.player.body.gravity.y);
            enemy.disableBody();
            
            this.time.addEvent({
                delay: 1000,
                callback: enemy.destroy,
                callbackScope: enemy
            })
        } else {
            player.anims.stop();
            player.showDie();
            player.alive = false;
        }
    }

    onSpaceDown() {
        if (this.player.alive) {
            if (this.gameParams.jumpType === JumpType.JUMP) {
                if (this.player.body.velocity.y === 0) {
                    this.player.setVelocityY(-0.6*this.player.body.gravity.y);
                    this.player.showJump();
                }
            }

            if (this.gameParams.jumpType === JumpType.FLIP) {
                if (this.player.body.velocity.y === 0) {
                    this.player.setGravityY(-this.player.body.gravity.y)
                    this.player.setFlipY(!this.player.flipY);
                    this.player.showJump();
                }
            }
        }
    }

    onSpaceUp() {
        if (this.player.alive) {
            if (this.gameParams.jumpType === JumpType.JUMP) {
                if (this.player.body.velocity.y < 0) {
                    this.player.body.velocity.y*= 0.7;
                }
            }
        }
    }

    onClick() {

    }

    update(time: number, delta: number) {

        this.graphics.clear();
        this.player.body.drawDebug(this.graphics);

        for (let enemy of this.enemies.getChildren()) {
            // @ts-ignore
            enemy.body.drawDebug(this.graphics);
        }


        if (this.player.alive) {
            if (this.keys.d.isDown && !this.keys.a.isDown) {
                this.player.setVelocityX(400);
                this.player.setFlipX(false);
                if (this.player.body.velocity.y === 0) {
                    this.player.showRun();
                }
            } else if (this.keys.a.isDown && !this.keys.d.isDown) {
                this.player.setVelocityX(-400);
                this.player.setFlipX(true);
                if (this.player.body.velocity.y === 0) {
                    this.player.showRun();
                }
            } else {
                this.player.setVelocityX(0);
                if (this.player.body.velocity.y === 0) {
                    this.player.showIdle();
                }
            }
        }
    }
}


export class Player extends Phaser.Physics.Arcade.Sprite {

    artStyle: string;
    variant: string;
    alive: boolean = true;

    constructor(scene: Phaser.Scene, x, y, artStyle: string, variant: string) {
        super(scene, x, y, artStyle+'-'+variant+'-idle');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.artStyle = artStyle;
        this.variant = variant;
    }

    showRun() {
        this.play(this.artStyle+'-'+this.variant+'-run', true);
    }

    showJump() {
        this.anims.stop();
        this.setTexture(this.artStyle+'-'+this.variant+'-jump');
    }

    showIdle() {
        this.setTexture(this.artStyle+'-'+this.variant+'-idle');
    }

    showDie() {
        this.setTexture(this.artStyle+'-'+this.variant+'-die');
    }
}

export class Enemy extends Phaser.Physics.Arcade.Image {
    artStyle: string;
    variant: string;

    constructor(scene: Phaser.Scene, x, y, artStyle: string, variant: string) {
        super(scene, x, y, artStyle+'-'+variant);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.artStyle = artStyle;
        this.variant = variant;
    }
}