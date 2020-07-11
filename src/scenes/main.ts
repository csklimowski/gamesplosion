

import { JumpType, Weapon, SpecialAction, GunProjectile, EnemyMovement, GameData, generateGame } from '../generator';


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
    playerBullets: BulletGroup;
    enemyBullets: BulletGroup;

    map: Phaser.Tilemaps.Tilemap;
    platformLayer: Phaser.Tilemaps.StaticTilemapLayer;

    gameData: GameData;
    background: Phaser.GameObjects.Image;

    create() {

        this.gameData = generateGame(new Phaser.Math.RandomDataGenerator());

        this.background = this.add.image(480, 360, this.gameData.artStyle+'-background');
        // this.background.setTint(0xaaaaaa);

        
        this.map = this.make.tilemap({
            data: this.gameData.tileData,
            tileWidth: 48,
            tileHeight: 48
        });

        let tiles = this.map.addTilesetImage(this.gameData.artStyle + '-tiles');
        this.platformLayer = this.map.createStaticLayer(0, tiles);
        this.platformLayer.setCollisionByExclusion([-1], true);
        
        this.cameras.main.setBounds(0, 0, this.platformLayer.width, this.platformLayer.height);


        // add player
        this.player = new Player(this, this.gameData);
        this.player.setCollideWorldBounds(false);
        this.player.setGravity(0, 1499);
        this.physics.add.collider(this.player, this.platformLayer);


        this.enemies = this.add.group();
        this.enemies.runChildUpdate = true;
        for (let loc of this.gameData.enemyLocations) {
            let enemy = new Enemy(this, this.platformLayer.tileToWorldX(loc.x), this.platformLayer.tileToWorldY(loc.y), this.gameData.artStyle, this.gameData.enemyVariant);
            enemy.setGravity(0, 1499);
            this.enemies.add(enemy);            
        }


        this.playerBullets = new BulletGroup(this, this.gameData.artStyle);

        this.physics.add.collider(this.playerBullets, this.platformLayer, this.bulletMeetsPlatform, null, this);
        this.physics.add.collider(this.playerBullets, this.enemies, this.bulletMeetsEnemy, null, this);
        
        this.physics.add.collider(this.enemies, this.platformLayer);
        this.physics.add.collider(this.player, this.enemies, this.playerMeetsEnemy, null, this);

        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.space.on(Phaser.Input.Keyboard.Events.DOWN, this.onSpaceDown, this);
        this.keys.space.on(Phaser.Input.Keyboard.Events.UP, this.onSpaceUp, this);
        
        this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keys.w.on(Phaser.Input.Keyboard.Events.DOWN, this.onSpaceDown, this);
        this.keys.w.on(Phaser.Input.Keyboard.Events.UP, this.onSpaceUp, this);

        this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        
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

    bulletMeetsPlatform(bullet: Phaser.Physics.Arcade.Image) {
        bullet.setActive(false);
        bullet.setVisible(false);
    }

    bulletMeetsEnemy(enemy: Enemy, bullet: Phaser.Physics.Arcade.Image) {

        bullet.setActive(false);
        bullet.setVisible(false);

        enemy.setTexture(this.gameData.artStyle+'-poof');
        enemy.disableBody();

        this.time.addEvent({
            delay: 500,
            callback: enemy.destroy,
            callbackScope: enemy
        })
        
    }

    onSpaceDown() {
        if (this.player.alive) {
            if (this.gameData.jumpType === JumpType.JUMP) {
                if (this.player.body.velocity.y === 0) {
                    this.player.setVelocityY(-0.6*this.player.body.gravity.y);
                    this.player.showJump();
                }
            }

            if (this.gameData.jumpType === JumpType.FLIP) {
                if (this.player.body.velocity.y === 0) {
                    this.player.setGravityY(-this.player.body.gravity.y)
                    this.player.setFlipY(!this.player.flipY);
                    this.player.showJump();
                }
            }

            if (this.gameData.jumpType === JumpType.FLAP) {
                this.player.setVelocityY(-0.3*this.player.body.gravity.y);
                this.player.hoverDevice.play(this.gameData.artStyle+'-flap');
                this.player.showJump();
            }
        }
    }

    onSpaceUp() {
        if (this.player.alive) {
            if (this.gameData.jumpType === JumpType.JUMP) {
                if (this.player.body.velocity.y < 0) {
                    this.player.body.velocity.y*= 0.7;
                }
            }
        }
    }

    onClick() {
        if (this.gameData.playerWeapon === Weapon.GUN_FORWARD) {
            this.playerBullets.fire(this.player.weapon.x, this.player.weapon.y, this.player.flipX ? -1000 : 1000, 0);
        }

        if (this.gameData.playerWeapon === Weapon.GUN_POINTER) {

        }

        if (this.gameData.playerWeapon === Weapon.GUN_DOWN) {

        }

        if (this.gameData.playerWeapon === Weapon.WHACK) {
            
        }
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

            if (this.gameData.jumpType === JumpType.HOVER) {
                if (this.keys.w.isDown && !this.keys.s.isDown) {
                    if (this.player.body.velocity.y === 0) {
                        this.player.showJump();
                    }
                    this.player.setVelocityY(-400);
                    this.player.hoverDevice.setFrame(1);
                } else {
                    this.player.hoverDevice.setFrame(0);
                }
            }
        }


        this.player.update();
        
        this.cameras.main.centerOn(this.player.x, this.player.y);
        
        this.background.setX(Phaser.Math.Clamp(this.player.x, 480, this.platformLayer.width-480));
        this.background.setY(this.cameras.main.worldView.centerY);
    }
}


export class Player extends Phaser.Physics.Arcade.Sprite {

    gameData: GameData;
    alive: boolean = true;
    weapon?: Phaser.GameObjects.Image;
    hoverDevice?: Phaser.GameObjects.Sprite;

    constructor(scene: Phaser.Scene, gameData: GameData) {
        super(scene, gameData.playerLocation.x, gameData.playerLocation.y, gameData.artStyle+'-'+gameData.playerVariant+'-idle', gameData.playerVariant);
        
        scene.physics.add.existing(this);
        this.gameData = gameData;

        if (gameData.jumpType === JumpType.HOVER || gameData.jumpType === JumpType.FLAP) {
            this.hoverDevice = scene.add.sprite(gameData.playerLocation.x, gameData.playerLocation.y, gameData.artStyle+'-hover device');
        }
        

        scene.add.existing(this);
        if (gameData.playerWeapon) {
            this.weapon = scene.add.image(gameData.playerLocation.x, gameData.playerLocation.y, gameData.artStyle+'-gun');
        }
        
    }

    update() {
        if (this.weapon) {
            this.weapon.setX(this.flipX ? this.body.position.x : this.body.position.x + 72);
            this.weapon.setY(this.body.position.y+48);
            this.weapon.setFlip(this.flipX, this.flipY);
        }

        if (this.hoverDevice) {
            this.hoverDevice.setX(this.body.position.x+36);
            this.hoverDevice.setY(this.body.position.y+48);
            this.hoverDevice.setFlip(this.flipX, this.flipY);
        }
    }

    showRun() {
        this.play(this.gameData.artStyle+'-'+this.gameData.playerVariant+'-run', true);
    }

    showJump() {
        this.anims.stop();
        this.setTexture(this.gameData.artStyle+'-'+this.gameData.playerVariant+'-jump');
    }

    showIdle() {
        this.setTexture(this.gameData.artStyle+'-'+this.gameData.playerVariant+'-idle');
    }

    showDie() {
        this.setTexture(this.gameData.artStyle+'-'+this.gameData.playerVariant+'-die');
    }
}

export class Enemy extends Phaser.Physics.Arcade.Image {
    artStyle: string;
    variant: string;

    constructor(scene: Phaser.Scene, x, y, artStyle: string, variant: string) {
        super(scene, x, y, artStyle+'-'+variant);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 1);
        this.body.immovable = true;
        this.artStyle = artStyle;
        this.variant = variant;
    }

    update(time: number, delta: number) {
        
    }
}


class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene: MainScene, artStyle) {
        super(scene.physics.world, scene);

        this.createMultiple({
            active: false,
            visible: false,
            key: artStyle+'-bullet',
            quantity: 30
        });
    }

    fire(x, y, vx, vy) {
        let bullet: Phaser.Physics.Arcade.Image = this.getFirstDead(false);
        bullet.body.reset(x, y);

        bullet.setRotation(Phaser.Math.Angle.Between(0, 0, vx, vy));
        
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityX(vx);
        bullet.setVelocityY(vy);
    }
}