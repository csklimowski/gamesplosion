


export const JumpType = {
    JUMP: 0,
    FLAP: 1,
    HOVER: 2,
    FLIP: 3,
    POGO: 4,
    CLIMB: 5
}

export const Weapon = {
    NONE: 0,
    STOMP: 1,
    GUN_FORWARD: 2,
    GUN_DOWN: 3,
    GUN_POINTER: 4,
    WHACK: 5,
    ORBIT: 6
}

export const SpecialAction = {
    NONE: 0,
    SWAP: 1
}

export const GunProjectile = {
    NONE: 0,
    RICOCHET: 1,
    ARC: 2,
    RAPID: 3,
    SLOW: 4
}

export const LevelType = {
    NORMAL: 0,
    TOWER_ASCEND: 1,
    AUTO: 2,
    LAVA: 3,
    SURVIVE: 4,
    COLLECT: 5,
    KEY: 6,
}

export const LevelShape = {
    NORMAL: 0,
    TOWER: 1,
    SPACIOUS: 3,
    ARENA: 4,
    EXPLORE: 5,
    AERIAL: 6,
}

export const EnemyMovement = {
    STATIONARY: 0,
    WALKING: 1,
    FLOATING: 2,
    RICOCHET: 3,
    FLIPPING: 4
}

export const EnemyAttack = {
    NONE: 0,
    SHOOT: 1,
    SAW: 2
}

export interface Vector2 {
    x: number;
    y: number;
}


export interface GameData {
    artStyle?: string;
    
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
}

export function generateGame(generator: Phaser.Math.RandomDataGenerator) {

    let gameData: GameData = {}

    gameData.artStyle = generator.pick([
        // 'pixel_chunky',
        // 'DCC',
        'doodle',
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
        // Weapon.STOMP,
        Weapon.GUN_FORWARD,
        // Weapon.GUN_DOWN,
        // Weapon.GUN_POINTER,
        // Weapon.WHACK,
        // Weapon.ORBIT
    ]);

    gameData.enemyVariant = generator.pick([
        'enemy1',
        'enemy2'
    ]);

    gameData.enemyLocations = [];

    gameData.jumpType = generator.weightedPick([
        JumpType.HOVER,
        JumpType.JUMP,
        JumpType.FLIP,
        JumpType.FLAP,
        // JumpType.POGO
    ]);

    gameData.enemyMovement = generator.weightedPick([
        EnemyMovement.STATIONARY,
        EnemyMovement.WALKING,
        EnemyMovement.FLOATING,
        EnemyMovement.RICOCHET
    ]);

    

    

    let levelWidth = generator.integerInRange(20, 60);
    let levelHeight = 15;
    let tileData = [];

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
        for (let c = 0; c < levelWidth; c++) {
            if (tileData[r][c] === 1 && generator.integerInRange(1, 10) === 1) {
                gameData.enemyLocations.push({x: c, y: r})
            }
        }
    }

    

    gameData.tileData = tileData;

    return gameData;
}