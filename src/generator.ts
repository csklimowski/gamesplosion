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
    REACH_DOOR: 0,
    COLLECT: 1,
    KILL: 2,
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
    levelSize?: number;
    
    playerVariant?: string;
    playerLocation?: Vector2;
    jumpType?: number;
    playerWeapon?: number;

    enemyVariant?: string;
    enemyLocations?: Vector2[];
    enemyMovement?: number;
    enemyAttack?: number;
    
    tileData?: number[][];

    doorLocation?: Vector2;
    collectibleLocations?: Vector2[];
    music?: string;
    background?: string;

    description?: string;

    levelGoal?: number;

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
        'furry',
        'pixelart',
        'anime',
        'vector',
        'pixel_chunky',
        'DCC',
        'doodle',
        'furry',
        'pixelart',
        'anime',
        'vector',
        'pixel_chunky',
        'DCC',
        'doodle',
        'furry',
        'pixelart',
        'anime',
        'vector',
        'photos',
    ]);

    gameData.background = generator.pick([
        'background',
        'background2'
    ]);

    gameData.music = generator.pick([
        'music1',
        'music2',
        'music3'
    ]);

    gameData.description = "";

    gameData.levelGoal = generator.pick([
        LevelGoal.REACH_DOOR,
        LevelGoal.REACH_DOOR,
        LevelGoal.REACH_DOOR,
        LevelGoal.COLLECT,
        LevelGoal.COLLECT,
        LevelGoal.KILL
    ]);
    gameData.description += {
        [LevelGoal.REACH_DOOR]: 'Get to the exit!',
        [LevelGoal.COLLECT]: 'Collect all of the items!',
        [LevelGoal.KILL]: 'Defeat all of the enemies!',
    }[gameData.levelGoal];

    gameData.description += '\nPress A and D to move.'

    gameData.levelCount = generator.weightedPick([
        2, 3, 4, 5
    ]);

    gameData.levelSize = generator.integerInRange(20, 70);

    gameData.playerVariant = generator.pick([
        'player1',
        'player2'
    ]);

    gameData.enemyVariant = generator.pick([
        'enemy1',
        'enemy2'
    ]);

    gameData.enemyLocations = [];

    gameData.jumpType = generator.pick([
        JumpType.JUMP,
        JumpType.JUMP,
        JumpType.JUMP,
        JumpType.JUMP,
        JumpType.FLAP,
        JumpType.FLAP,
        JumpType.FLIP,
        JumpType.FLIP,
        JumpType.GUN
    ]);

    gameData.description += {
        [JumpType.JUMP]: '\nPress Space to jump.',
        [JumpType.FLIP]: '\nPress Space to flip gravity.',
        [JumpType.FLAP]: '\nTap Space to fly.',
        [JumpType.GUN]: '\nHold Space to shoot downwards.',
    }[gameData.jumpType];


    if (gameData.jumpType === JumpType.GUN) {
        gameData.playerWeapon = Weapon.NONE;
    } else {
        gameData.playerWeapon = generator.pick([
            Weapon.STOMP,
            Weapon.STOMP,
            Weapon.WHACK,
            Weapon.GUN_FORWARD,
            Weapon.GUN_POINTER,
        ]);
        gameData.description += {
            [Weapon.STOMP]: '\nJump on enemies to defeat them.',
            [Weapon.WHACK]: '\nClick to swing your weapon.',
            [Weapon.GUN_FORWARD]: '\nClick to shoot.',
            [Weapon.GUN_POINTER]: '\nAim with your mouse and click to shoot.',
        }[gameData.playerWeapon];
    }

    gameData.enemyAttack = generator.pick([
        EnemyAttack.NONE,
        EnemyAttack.NONE,
        EnemyAttack.NONE,
        EnemyAttack.SAW,
        EnemyAttack.SAW,
        EnemyAttack.SAW,
        EnemyAttack.SHOOT,
        EnemyAttack.SHOOT_PLAYER,
    ]);

    if (gameData.enemyAttack === EnemyAttack.SHOOT_PLAYER) {
        gameData.enemyMovement = generator.weightedPick([
            EnemyMovement.STATIONARY,
            EnemyMovement.WALKING,
            EnemyMovement.WALKING,
            EnemyMovement.FLOATING,
            EnemyMovement.RICOCHET
        ]);
    } else {
        gameData.enemyMovement = generator.weightedPick([
            EnemyMovement.WALKING,
            EnemyMovement.WALKING,
            EnemyMovement.FLOATING,
            // EnemyMovement.STATIONARY,
            EnemyMovement.RICOCHET
        ]);
    }
    

    

    // gameData.tileData = generateLevel(gameData, generator);

    return gameData;
}


export function generateLevel(gameData: GameData, generator: Phaser.Math.RandomDataGenerator) {
    
    let levelWidth = gameData.levelSize;
    let levelHeight = 15;
    let tileData = [];
    let enemyLocations = [];
    let collectibleLocations = [];

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
    let ceilHeight = generator.integerInRange(1, 3);
    for (let c = 0; c < levelWidth; c++) {
        for (let r = levelHeight-1; r > levelHeight-floorHeight; r--) {
            tileData[r][c] = 0;
        }
        for (let r = 0; r < ceilHeight; r++) {
            tileData[r][c] = 0;
        }
        if (generator.integerInRange(1, 4) === 1) {
            floorHeight = generator.integerInRange(Math.min(5, floorHeight+3), Math.max(1, floorHeight-3));
        }
        if (generator.integerInRange(1, 6) === 2) {
            ceilHeight = generator.integerInRange(Math.min(4, ceilHeight+3), Math.max(1, ceilHeight-3))
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


    // add player
    gameData.playerLocation = {x: -1000, y: -1000};
    if (gameData.levelGoal === LevelGoal.REACH_DOOR) {
        playerLoop:
        for (let c = 3; c < levelWidth-1; c++) {
            for (let r = 1; r < levelHeight; r++) {
                if (tileData[r][c] === 1 && tileData[r][c-1] === 1) {
                    gameData.playerLocation = {x: c, y: r};
                    break playerLoop;
                }
            }
        }
    } else {
        for (let c = 3; c < levelWidth-1; c++) {
            for (let r = 1; r < levelHeight; r++) {
                if (tileData[r][c] === 1 && tileData[r][c-1] === 1) {
                    if (Math.abs(c - levelWidth/2) < Math.abs(gameData.playerLocation.x - levelWidth/2)) {
                        gameData.playerLocation = {x: c, y: r};
                    }
                }
            }
        }
    }


    // add enemies
    do {
        for (let r = 1; r < levelHeight; r++) {
            for (let c = 0; c < levelWidth-1; c++) {
                if (tileData[r][c] === 1 && tileData[r][c-1] === 1 && Math.abs(c-gameData.playerLocation.x) > 3 && generator.integerInRange(1, 8) === 1) {
                    enemyLocations.push({x: c, y: r})
                    c++;
                }
            }
        }
    } while (gameData.levelGoal === LevelGoal.KILL && enemyLocations.length === 0)

    gameData.enemyLocations = enemyLocations;


    if (gameData.levelGoal === LevelGoal.COLLECT) {
        while (collectibleLocations.length < 2) {
            for (let r = 1; r < levelHeight; r++) {
                colSearch:
                for (let c = 10; c < levelWidth-1; c++) {
                    for (let loc of enemyLocations) {
                        if (loc.x === c && loc.y === r) continue colSearch;
                    }
                    if (tileData[r][c] === 1 && tileData[r][c-1] === 1 && Math.abs(c-gameData.playerLocation.x) > 3 && generator.integerInRange(1, 9) === 1) {
                        collectibleLocations.push({x: c, y: r})
                        c++;
                    }
                }
            }
        }
    }

    gameData.collectibleLocations = collectibleLocations;

    

    // add door
    if (gameData.levelGoal === LevelGoal.REACH_DOOR) {
        doorLoop:
        for (let c = levelWidth-3; c > 0; c--) {
            for (let r = 1; r < levelHeight; r++) {
                if (tileData[r][c] === 1 && tileData[r][c-1] === 1) {
                    gameData.doorLocation = {x: c, y: r};
                    break doorLoop;
                }
            }
        }
    }

    return tileData;
}