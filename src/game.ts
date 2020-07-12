
import { MainScene } from './scenes/main';
import { MenuScene } from './scenes/menu';
import { PreloadScene, LoadScene } from './scenes/load';

const game = new Phaser.Game({
    width: 960,
    height: 720,
    parent: 'game',
    backgroundColor: 0x28385C,
    scene: [
        PreloadScene,
        LoadScene,
        MenuScene,
        MainScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            tileBias: 32
        }
    },
    scale: {
        mode: Phaser.Scale.FIT
    }
});

export default game;