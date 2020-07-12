


export const JumpType = {
    JUMP: 0,
    FLAP: 1,
    FLIP: 2,
    GUN: 3
}

export const Weapon = {
    NONE: 0,
    STOMP: 1,
    WHACK: 2,
    GUN_FORWARD: 3,
    GUN_POINTER: 4,
    GUN_POINTER_RICOCHET: 5
}

export const LevelGoal = {
    FINISH_LINE: 0,
    COLLECT: 1,
    DOOR_KEY: 2,
    SURVIVE: 3,
    KILL: 4
}

export const LevelShape = {
    LEFT_TO_RIGHT: 0,
    CLIMB_TOWER: 1,
    CLIMB_MOUNTAIN: 2,
    DESCEND_MOUNTAIN: 4,
    CRAMPED: 5,
}
// hovering gives extra pits, flipping adds close ceiling

export const EnemyMovement = {
    STATIONARY: 0,
    WALKING: 1,
    FLOATING: 2,
    RICOCHET: 3,
    JUMPING: 4
}

export const EnemyAttack = {
    NONE: 0,
    SHOOT: 1,
    SHOOT_PLAYER: 2,
    SAW: 3
}

export interface Vector2 {
    x: number;
    y: number;
}


export interface GameData {

    generator: Phaser.Math.RandomDataGenerator;
    seed: string;

    artStyle?: string;
    levelCount?: number;
    
    playerVariant?: string;
    playerLocation?: Vector2;
    jumpType?: number;
    playerWeapon?: number;
    playerGunProjectile?: number;

    enemyVariant?: string;
    enemyGunProjectile?: number;
    enemyLocations?: Vector2[];
    enemyMovement?: number;
    enemyWeapon?: number;
    
    tileData?: number[][];

    doorLocation?: Vector2;
    description?: string;
}


export function generateGame(seed?: string) {
    console.log(seed);
    let generator;
    if (seed) {
        generator = new Phaser.Math.RandomDataGenerator(seed.split(''));
    } else {
        generator = new Phaser.Math.RandomDataGenerator();
    }

    // generator.init(seed);

    let gameData: GameData = {
        seed: seed,
        generator: generator
    }

    gameData.artStyle = generator.pick([
        'pixel_chunky',
        'DCC',
        'doodle',
        'furry'
    ]);

    gameData.description = "Get to the end!\nUse A and D to move.\nPress SPACE to jump\nSTOMP on enemies!";

    gameData.levelCount = generator.weightedPick([
        2, 3, 4, 5
    ]);

    gameData.playerVariant = generator.pick([
        'player1',
        'player2'
    ]);

    gameData.playerLocation = {
        x: 300,
        y: 300
    };

    gameData.playerWeapon = generator.pick([
        // Weapon.NONE,
        Weapon.STOMP,
        Weapon.GUN_FORWARD,
        Weapon.GUN_POINTER,
        Weapon.WHACK,
        // Weapon.ORBIT
    ]);

    gameData.enemyVariant = generator.pick([
        'enemy1',
        'enemy2'
    ]);

    gameData.enemyLocations = [];

    gameData.jumpType = generator.pick([
        JumpType.JUMP,
        JumpType.FLIP,
        JumpType.FLAP,
        JumpType.GUN
    ]);

    gameData.enemyMovement = generator.weightedPick([
        EnemyMovement.WALKING,
        EnemyMovement.FLOATING,
        // EnemyMovement.STATIONARY,
        EnemyMovement.RICOCHET
    ]);

    gameData.tileData = generateLevel(gameData, generator);

    return gameData;
}


export function generateLevel(gameData: GameData, generator: Phaser.Math.RandomDataGenerator) {
    
    let levelWidth = generator.integerInRange(20, 60);
    let levelHeight = 15;
    let tileData = [];
    let enemyLocations = [];

    // populate with generic tiles
    for (let r = 0; r < levelHeight; r++) {
        tileData.push([]);
        for (let c = 0; c < levelWidth; c++) {
            if (r === 0 || c === 0 || r === levelHeight-1 || c === levelWidth-1) {
                tileData[r].push(0);
            } else {
                tileData[r].push(-1)
            }
        }
    }

    // add varying floor/ceiling
    let floorHeight = generator.integerInRange(1, 3);
    for (let c = 0; c < levelWidth; c++) {
        for (let r = levelHeight-1; r > levelHeight-floorHeight; r--) {
            tileData[r][c] = 0;
        }
        if (generator.integerInRange(1, 4) === 1) {
            floorHeight = generator.integerInRange(Math.min(5, floorHeight+3), Math.max(1, floorHeight-3));
        }
    }

    // add pits
    for (let c = 0; c < levelWidth; c++) {
        if (tileData[levelHeight-1][c] !== -1 && generator.integerInRange(1, 20) === 1) {
            let width = generator.integerInRange(2, 6);

            for (let cc = c+1; cc < c + width + 2 && cc < levelWidth-1; cc++) {
                for (let rr = levelHeight-1; rr > 0; rr--) {
                    tileData[rr][cc] = -1;
                }
            }
        }
    }

    // add floor texture
    for (let r = 1; r < levelHeight; r++) {
        for (let c = 0; c < levelWidth; c++) {
            if (tileData[r][c] === 0 && tileData[r-1][c] === -1) {
                tileData[r][c] = 1;
            }
        }
    }


    // add enemies
    for (let r = 1; r < levelHeight; r++) {
        for (let c = 10; c < levelWidth-1; c++) {
            if (tileData[r][c] === 1 && tileData[r][c-1] === 1 && generator.integerInRange(1, 10) === 1) {
                enemyLocations.push({x: c, y: r})
                c++;
            }
        }
    }
    gameData.enemyLocations = enemyLocations;

    // add player
    loop:
    for (let c = 3; c < levelWidth-1; c++) {
        for (let r = 1; r < levelHeight; r++) {
            if (tileData[r][c] === 1 && tileData[r][c-1] === 1) {
                gameData.playerLocation = {x: c, y: r};
                break loop;
            }
        }
    }

    // add door
    loop:
    for (let c = levelWidth-3; c > 0; c--) {
        for (let r = 1; r < levelHeight; r++) {
            if (tileData[r][c] === 1 && tileData[r][c-1] === 1) {
                gameData.doorLocation = {x: c, y: r};
                break loop;
            }
        }
    }

    return tileData;
}