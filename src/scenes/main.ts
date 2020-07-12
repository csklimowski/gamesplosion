

import { JumpType, Weapon, EnemyMovement, GameData, generateGame, generateLevel, EnemyAttack, LevelGoal } from '../generator';

import { gameData, metaData } from './menu';
import { credits } from './credits';

let progress = 0;
let inputBound = false;

export class MainScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'main'
        });   
    }
    
    player: Player;
    keys: any = {};

    enemies: Phaser.GameObjects.Group;
    collectibles: Phaser.GameObjects.Group;
    playerBullets: BulletGroup;
    enemyBullets: BulletGroup;
    
    gameOver: Phaser.GameObjects.Image;
    levelWon: boolean;
    curtain: Phaser.GameObjects.Rectangle;
    creditsText: Phaser.GameObjects.Container;
    
    map: Phaser.Tilemaps.Tilemap;
    platformLayer: Phaser.Tilemaps.StaticTilemapLayer;

    background: Phaser.GameObjects.Image;

    goalText: Phaser.GameObjects.BitmapText;
    goalImage: Phaser.GameObjects.Image;

    enemiesLeft: number;

    music: Phaser.Sound.BaseSound;

    

    create() {
        this.background = this.add.image(480, 360, gameData.artStyle+'-background');

        this.levelWon = false;

        let tileData = generateLevel(gameData, gameData.generator);
        
        this.map = this.make.tilemap({
            data: tileData,
            tileWidth: 48,
            tileHeight: 48
        });

        let tiles = this.map.addTilesetImage(gameData.artStyle + '-tiles');
        this.platformLayer = this.map.createStaticLayer(0, tiles);
        this.platformLayer.setCollisionByExclusion([-1], true);

        this.cameras.main.setBounds(0, 0, this.platformLayer.width, this.platformLayer.height);


        let door;
        if (gameData.levelGoal === LevelGoal.REACH_DOOR) {
            door = this.physics.add.image(
                this.platformLayer.tileToWorldX(gameData.doorLocation.x),
                this.platformLayer.tileToWorldY(gameData.doorLocation.y) - 36,
                gameData.artStyle+'-door'
            );
            door.setScale(1.5);
        }
        

        // add player
        this.player = new Player(this, this.platformLayer.tileToWorldX(gameData.playerLocation.x), this.platformLayer.tileToWorldY(gameData.playerLocation.y)-12, gameData);
        

        this.enemies = this.add.group();
        
        this.enemies.runChildUpdate = true;
        for (let loc of gameData.enemyLocations) {
            let enemy = new Enemy(this, this.platformLayer.tileToWorldX(loc.x), this.platformLayer.tileToWorldY(loc.y), gameData);
            
            if (gameData.enemyMovement === EnemyMovement.FLOATING) {
                enemy.y -= 100;
            }
            
            this.enemies.add(enemy);            
        }


        if (gameData.levelGoal === LevelGoal.KILL) {
            this.goalImage = this.add.image(70, 70, gameData.artStyle+'-'+gameData.enemyVariant);
            this.goalText = this.add.bitmapText(140, 40, 'title', '0 / ' + gameData.enemyLocations.length);
            this.enemiesLeft = gameData.enemyLocations.length;
        }


        
        
        let enemySafetyBarriers = this.physics.add.group();
        for (let r = 1; r < tileData.length-1; r++) {
            for (let c = 1; c < tileData[0].length-1; c++) {
                if ((tileData[r][c-1] === -1 && tileData[r+1][c] === -1 && tileData[r+1][c-1] === 1) ||
                    (tileData[r][c+1] === -1 && tileData[r+1][c] === -1 && tileData[r+1][c+1] === 1)) {
                        let rectangle = this.add.rectangle(this.platformLayer.tileToWorldX(c)+24, this.platformLayer.tileToWorldY(r), 24, 12, 0x000000, 0);
                        enemySafetyBarriers.add(rectangle);
                        // @ts-ignore
                        rectangle.body.immovable = true;
                }
            }
        }

        if (gameData.levelGoal === LevelGoal.REACH_DOOR) {
            this.physics.add.overlap(this.player, door, this.winLevel, null, this);
        }

        if (gameData.levelGoal === LevelGoal.COLLECT) {

            this.goalImage = this.add.image(70, 70, gameData.artStyle+'-collectable');
            this.goalText = this.add.bitmapText(140, 40, 'title', '0 / ' + gameData.collectibleLocations.length);

            this.collectibles = this.add.group();
            for (let loc of gameData.collectibleLocations) {
                let col = this.physics.add.image(this.platformLayer.tileToWorldX(loc.x), this.platformLayer.tileToWorldY(loc.y)-30, gameData.artStyle+'-collectable');
                this.collectibles.add(col);
            }

            
            this.physics.add.overlap(this.player, this.collectibles, this.playerMeetsCollectible, null, this);
        }


        this.playerBullets = new BulletGroup(this, gameData.artStyle);
        this.enemyBullets = new BulletGroup(this, gameData.artStyle);

        this.physics.add.collider(this.player, this.platformLayer);
        this.physics.add.collider(this.playerBullets, this.platformLayer, this.bulletMeetsPlatform, null, this);
        this.physics.add.collider(this.enemyBullets, this.platformLayer, this.bulletMeetsPlatform, null, this);
        this.physics.add.collider(this.playerBullets, this.enemies, this.bulletMeetsEnemy, null, this);
        
        this.physics.add.collider(this.enemies, this.platformLayer, this.enemyMeetsPlatform, null, this);
        this.physics.add.collider(this.player, this.enemies, this.playerMeetsEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.playerMeetsBullet, null, this);
        if (gameData.enemyMovement === EnemyMovement.WALKING) {
            this.physics.add.collider(this.enemies, enemySafetyBarriers, this.enemyMeetsPlatform, null, this);
        }

        if (gameData.playerWeapon === Weapon.WHACK) {
            this.physics.add.overlap(this.enemies, this.player.melee, this.enemyMeetsSword, null, this);
        }

        


        this.gameOver = this.add.image(0, 0, 'gameover')
        this.gameOver.setAlpha(0);
        this.curtain = this.add.rectangle(0, 0, 960, 720, 0x000000);
        this.curtain.alpha = 0;


        this.creditsText = this.add.container(480, 1000);
        let creditsFiller = this.add.bitmapText(0, 360, 'library', credits, 32);
        creditsFiller.setCenterAlign();
        creditsFiller.setOrigin(0.5, 0);
        this.creditsText.add(creditsFiller);
        let creditsTitle = this.add.bitmapText(0, 100, 'title', gameData.seed, 64);
        creditsTitle.setCenterAlign();
        creditsTitle.setOrigin(0.5, 0);
        this.creditsText.add(creditsTitle);

        

        if (!inputBound) {
            this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            this.keys.space.on(Phaser.Input.Keyboard.Events.DOWN, this.onSpaceDown, this);
            this.keys.space.on(Phaser.Input.Keyboard.Events.UP, this.onSpaceUp, this);
            
            this.keys.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
            this.keys.w.on(Phaser.Input.Keyboard.Events.DOWN, this.onSpaceDown, this);
            this.keys.w.on(Phaser.Input.Keyboard.Events.UP, this.onSpaceUp, this);
    
            this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
            
            this.keys.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
            this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
            
            inputBound = true;
        }        
        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onClick, this);
    }

    winLevel() {
        if (!this.levelWon) {
            progress++;
            this.levelWon = true;
        }
    }

    loseLevel() {
        if (!this.levelWon) {
            if (this.gameOver.alpha === 0) {
                this.gameOver.setX(480);
                this.gameOver.setY(360);
                this.gameOver.setAlpha(1);
            }
    
            this.time.addEvent({
                callback: function() {
                    progress = 0;
                    metaData.winStreak = 0;
                    this.scene.start('menu');
                },
                callbackScope: this,
                delay: 1000
            });
        }

    }

    playerMeetsCollectible(player, collectible) {
        collectible.destroy();
        this.goalText.setText(gameData.collectibleLocations.length - this.collectibles.getLength() + ' / ' + gameData.collectibleLocations.length);
        if (this.collectibles.getLength() === 0) {
            this.winLevel();
        }
    }

    enemyMeetsSword(enemy, sword) {
        if (this.player.attacking) {
            enemy.setTexture(gameData.artStyle+'-poof');
            enemy.setFlipX(false);
            enemy.kill();
            this.time.addEvent({
                delay: 500,
                callback: enemy.destroy,
                callbackScope: enemy
            });
        }
    }

    playerMeetsEnemy(player: Player, enemy: Enemy) {

        if (gameData.playerWeapon === Weapon.STOMP && player.body.touching.down) {
            enemy.setScale(1, 0.2);
            player.setVelocityY(-0.3*this.player.body.gravity.y);
            enemy.kill();
            
            this.time.addEvent({
                delay: 1000,
                callback: enemy.destroy,
                callbackScope: enemy
            })
        } else {
            player.anims.stop();
            player.showDie();
            this.physics.pause();
            player.alive = false;
            this.loseLevel();
        }
    }


    playerMeetsBullet(player: Player) {
        player.anims.stop();
        player.showDie();
        this.physics.pause();
        player.alive = false;
        this.loseLevel();
    }

    enemyMeetsPlatform(enemy: Enemy) {
        if (gameData.enemyMovement === EnemyMovement.WALKING && (
            enemy.body.velocity.x === 0 || enemy.body.touching.left || enemy.body.touching.right)) {
            enemy.setFlipX(!enemy.flipX);
            enemy.setVelocityX(enemy.flipX ? 100 : -100);
        }

        if (gameData.enemyMovement === EnemyMovement.FLOATING && enemy.body.velocity.y === 0) {
            enemy.setVelocityY(enemy.rising ? 200 : -200);
            enemy.rising = !enemy.rising;
        }

        if (gameData.enemyMovement === EnemyMovement.RICOCHET && enemy.body.velocity.y === 0) {
            enemy.setVelocityY(enemy.rising ? 100 : -100);
            enemy.rising = !enemy.rising;
        }

        if (gameData.enemyMovement === EnemyMovement.RICOCHET && enemy.body.velocity.x === 0) {
            enemy.setVelocityX(enemy.lefting ? 100 : -100);
            enemy.lefting = !enemy.lefting;
            enemy.setFlipX(!enemy.lefting);
        }
    }

    bulletMeetsPlatform(bullet: Phaser.Physics.Arcade.Image) {
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.reset(0, 0);
    }

    bulletMeetsEnemy(enemy: Enemy, bullet: Phaser.Physics.Arcade.Image) {

        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.reset(0, 0);

        enemy.setTexture(gameData.artStyle+'-poof');
        enemy.setFlipX(false);
        enemy.kill();

        this.time.addEvent({
            delay: 500,
            callback: enemy.destroy,
            callbackScope: enemy
        })
        
    }

    onSpaceDown() {
        if (this.player.alive) {
            if (gameData.jumpType === JumpType.JUMP) {
                if (this.player.body.velocity.y === 0) {
                    this.player.setVelocityY(-0.6*this.player.body.gravity.y);
                    this.player.showJump();
                }
            }

            if (gameData.jumpType === JumpType.FLIP) {
                if (this.player.body.velocity.y === 0) {
                    this.player.setGravityY(-this.player.body.gravity.y)
                    this.player.setFlipY(!this.player.flipY);
                    this.player.showJump();
                }
            }

            if (gameData.jumpType === JumpType.FLAP) {
                this.player.setVelocityY(-0.3*this.player.body.gravity.y);
                this.player.hoverDevice.play(gameData.artStyle+'-flap');
                this.player.showJump();
            }
        }
    }

    onSpaceUp() {
        if (this.player.alive) {
            if (gameData.jumpType === JumpType.JUMP) {
                if (this.player.body.velocity.y < 0) {
                    this.player.body.velocity.y*= 0.7;
                }
            }
        }
    }

    onClick() {
        if (gameData.playerWeapon === Weapon.GUN_FORWARD) {
            this.playerBullets.fire(this.player.gun.x, this.player.gun.y, this.player.flipX ? -1000 : 1000, 0);
        }

        if (gameData.playerWeapon === Weapon.GUN_POINTER) {
            let vector = new Phaser.Math.Vector2(this.input.activePointer.worldX - this.player.gun.x, this.input.activePointer.worldY - this.player.gun.y);
            let vector2 = vector.normalize();
            this.playerBullets.fire(this.player.gun.x + vector2.x*10, this.player.gun.y + vector2.y*10, vector2.x*1000, vector2.y*1000);
        }

        if (gameData.playerWeapon === Weapon.WHACK) {
            this.player.swing(); 
        }
    }

    update(time: number, delta: number) {
        // this.graphics.clear();
        // this.player.body.drawDebug(this.graphics);

        // for (let enemy of this.enemies.getChildren()) {
        //     // @ts-ignore
        //     // enemy.body.drawDebug(this.graphics);
        // }

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

            if (gameData.jumpType === JumpType.GUN) {
                if (this.input.keyboard.checkDown(this.keys.w, 150) || this.input.keyboard.checkDown(this.keys.space, 150)) {
                    if (this.player.body.velocity.y === 0) {
                        this.player.showJump();
                    }
                    this.player.setVelocityY(-300);
                    this.playerBullets.fire(this.player.x, this.player.y, 0, 500);
                }
            }
        }


        this.player.update();

        if (this.player.y > this.platformLayer.height || this.player.y < 0) {
            this.loseLevel();
        }
        
        this.cameras.main.centerOn(this.player.x, this.player.y);

        let cameraX = Phaser.Math.Clamp(this.player.x, 480, this.platformLayer.width-480);
        let cameraY = this.cameras.main.worldView.centerY;
        
        this.background.setX(cameraX);
        this.background.setY(cameraY);

        this.curtain.setX(cameraX);
        this.curtain.setY(cameraY);

        this.gameOver.setX(cameraX);
        this.gameOver.setY(cameraY);

        
        this.creditsText.setX(cameraX);

        if (gameData.levelGoal === LevelGoal.COLLECT || gameData.levelGoal === LevelGoal.KILL) {
            this.goalImage.setX(cameraX - 400);
            this.goalText.setX(cameraX - 300);
        }


        if (this.levelWon) {
            if (progress < gameData.levelCount) {
                if (this.curtain.alpha === 1) {   
                    this.scene.restart();
                }
            } else {
                this.creditsText.y -= delta;
                if (this.creditsText.y < -3500) {
                    metaData.winStreak++;
                    progress = 0;
                    this.scene.start('menu');
                }
            }
            this.curtain.setAlpha(Math.min(1, this.curtain.alpha + delta/1000));
            
        } else {
            this.creditsText.setY(cameraY+500);
        }
    }
}


export class Player extends Phaser.Physics.Arcade.Sprite {

    alive: boolean;
    gun?: Phaser.GameObjects.Image;
    hoverGun?: Phaser.GameObjects.Image;
    melee?: Phaser.Physics.Arcade.Image;
    hoverDevice?: Phaser.GameObjects.Sprite;
    attacking: boolean;
    

    constructor(scene: Phaser.Scene, x, y, gameData: GameData) {
        super(scene, x, y, gameData.artStyle+'-'+gameData.playerVariant+'-idle', gameData.playerVariant);
        
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(false);
        this.setGravity(0, 1499);
        this.setOrigin(0.5, 1);

        this.alive = true;
        this.attacking = false;

        if (gameData.jumpType === JumpType.FLAP) {
            this.hoverDevice = scene.add.sprite(this.x, this.y, gameData.artStyle+'-hover device');
        }

        if (gameData.jumpType === JumpType.GUN) {
            this.hoverGun = scene.add.image(this.x, this.y+50, gameData.artStyle+'-gun');
            this.hoverGun.setAngle(90);
        }

        scene.add.existing(this);
        if (gameData.playerWeapon === Weapon.GUN_FORWARD) {
            this.gun = scene.add.image(this.x, this.y, gameData.artStyle+'-gun');
        }

        if (gameData.playerWeapon === Weapon.GUN_POINTER) {
            this.gun = scene.add.image(this.x, this.y, gameData.artStyle+'-gun');
            this.gun.setOrigin(-1, 0.5);
        }

        if (gameData.playerWeapon === Weapon.WHACK) {
            this.melee = scene.physics.add.image(this.x, this.y-20, gameData.artStyle+'-melee');
        }
    }

    update() {
        if (gameData.playerWeapon === Weapon.GUN_FORWARD) {
            this.gun.setX(this.flipX ? this.body.position.x : this.body.position.x + 72);
            this.gun.setY(this.body.position.y+48);
            this.gun.setFlip(this.flipX, this.flipY);
        }

        if (gameData.playerWeapon === Weapon.GUN_POINTER) {
            this.gun.setX(this.body.position.x + 36);
            this.gun.setY(this.body.position.y+48);
            this.gun.setRotation(Phaser.Math.Angle.Between(this.gun.x, this.gun.y, this.scene.input.activePointer.worldX, this.scene.input.activePointer.worldY));
        }

        if (gameData.jumpType === JumpType.GUN) {
            this.hoverGun.setX(this.body.position.x+36);
            this.hoverGun.setY(this.body.position.y+80);
        }

        if (gameData.jumpType === JumpType.FLAP) {
            this.hoverDevice.setX(this.body.position.x+36);
            this.hoverDevice.setY(gameData.artStyle === 'doodle' ? this.body.position.y-38 : this.body.position.y+48);

            this.hoverDevice.setFlip(this.flipX, this.flipY);
        }


        if (gameData.playerWeapon === Weapon.WHACK) {
            this.melee.setX(this.flipX ? (this.attacking ? this.body.position.x - 36 : this.body.position.x) : (this.attacking ? this.body.position.x + 108 : this.body.position.x + 72));
            this.melee.setY(this.attacking ? (this.body.position.y+40) : this.body.position.y+20);
            this.melee.setFlip(this.flipX, this.flipY);
        }
    }

    swing() {
        this.attacking = true;
        if (this.flipX) {
            this.melee.setAngle(-90);
        } else {
            this.melee.setAngle(90);
        }

        this.scene.time.addEvent({
            callback: function() { 
                this.melee.setAngle(0);
                this.attacking = false;
            },
            callbackScope: this,
            delay: 200
        })

    }

    showRun() {
        this.play(gameData.artStyle+'-'+gameData.playerVariant+'-run', true);
    }

    showJump() {
        this.anims.stop();
        this.setTexture(gameData.artStyle+'-'+gameData.playerVariant+'-jump');
    }

    showIdle() {
        this.setTexture(gameData.artStyle+'-'+gameData.playerVariant+'-idle');
    }

    showDie() {
        this.setTexture(gameData.artStyle+'-'+gameData.playerVariant+'-die');
    }
}

export class Enemy extends Phaser.Physics.Arcade.Image {

    rising: boolean;
    lefting: boolean;
    hoverDevice: Phaser.GameObjects.Image;
    gun: Phaser.GameObjects.Image;
    scene: MainScene;

    constructor(scene: Phaser.Scene, x, y, gameData: GameData) {
        super(scene, x, y, gameData.artStyle+'-'+gameData.enemyVariant);
        scene.physics.add.existing(this);
        this.setOrigin(0.5, 1);
        this.body.immovable = true;
        this.setGravity(0, 1499);

        this.rising = false;
        this.lefting = false;
        
        if (gameData.enemyMovement === EnemyMovement.WALKING) {
            this.setVelocityX(-100);
        }
        if (gameData.enemyMovement === EnemyMovement.FLOATING) {
            this.setVelocityY(-200);
            this.setGravity(0, 0);
            this.rising = true;
            this.hoverDevice = scene.add.sprite(this.x, this.y, gameData.artStyle+'-hover device');
        }
        
        scene.add.existing(this);

        if (gameData.enemyMovement === EnemyMovement.RICOCHET) {
            this.rising = true;
            this.lefting = true;
            this.setVelocityY(-100);
            this.setVelocityX(-100);
            this.setGravity(0);
        }

        if (gameData.enemyAttack === EnemyAttack.SHOOT) {
            this.gun = scene.add.image(this.x, this.y, gameData.artStyle+'-gun');
        }

        if (gameData.enemyAttack === EnemyAttack.SHOOT_PLAYER) {
            this.gun = scene.add.image(this.x, this.y, gameData.artStyle+'-gun');
            this.gun.setOrigin(-1, 0.5);
        }

        this.scene.time.addEvent({
            loop: true,
            delay: 2000,
            callback: this.shoot,
            callbackScope: this
        });
    }

    shoot() {
        if (this.active) {
            if (gameData.enemyAttack === EnemyAttack.SHOOT) {
                this.scene.enemyBullets.fire(this.gun.x, this.gun.y, this.flipX ? 500 : -500, 0);
            }
            
            if (gameData.enemyAttack === EnemyAttack.SHOOT_PLAYER) {
                let vector = new Phaser.Math.Vector2(this.scene.player.x - this.gun.x, this.scene.player.y - this.gun.y);
                let vector2 = vector.normalize();
                this.scene.enemyBullets.fire(this.gun.x + vector2.x*10, this.gun.y + vector2.y*10, vector2.x*500, vector2.y*500);
            }
        }
    }

    kill() {
        this.disableBody();
        this.setActive(false);
        if (this.hoverDevice) {
            this.hoverDevice.destroy();
        }
        if (this.gun) {
            this.gun.destroy();
        }

        if (gameData.levelGoal === LevelGoal.KILL) {
            this.scene.enemiesLeft--;
            this.scene.goalText.setText(gameData.enemyLocations.length - this.scene.enemiesLeft + ' / ' + gameData.enemyLocations.length);
            if (this.scene.enemiesLeft === 0) {
                this.scene.winLevel();
            }
        }
    }

    update(time: number, delta: number) {
        if (gameData.enemyMovement === EnemyMovement.WALKING) {
            this.setAngle(10*Math.sin(time/50));
        }

        if (gameData.enemyMovement === EnemyMovement.FLOATING) {
            this.hoverDevice.setY(gameData.artStyle === 'doodle' ? this.body.position.y-38 : this.body.position.y+48);
        }

        if (gameData.enemyAttack === EnemyAttack.SHOOT) {
            this.gun.setX(this.flipX ? this.body.position.x + 72 : this.body.position.x);
            this.gun.setY(this.body.position.y+48);
            this.gun.setFlip(!this.flipX, this.flipY);
        }

        if (gameData.enemyAttack === EnemyAttack.SHOOT_PLAYER) {
            this.gun.setX(this.body.position.x+36);
            this.gun.setY(this.body.position.y+48);
            this.gun.setRotation(Phaser.Math.Angle.Between(this.gun.x, this.gun.y, this.scene.player.x, this.scene.player.y));
        }


        if (this.y > this.scene.platformLayer.height) {
            this.kill();
            this.destroy();
        }
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
        let bullet: Phaser.Physics.Arcade.Image = this.getFirstDead(true);
        bullet.body.reset(x, y);

        bullet.setRotation(Phaser.Math.Angle.Between(0, 0, vx, vy));
        
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityX(vx);
        bullet.setVelocityY(vy);
    }
}