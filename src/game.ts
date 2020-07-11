import { MainScene } from './scenes/main';
import { LoadScene } from './scenes/load';

const game = new Phaser.Game({
    width: 960,
    height: 720,
    parent: 'game',
    backgroundColor: 0x888888,
    scene: [
        LoadScene,
        MainScene
    ],
    physics: {
        default: 'arcade'
    },
    scale: {
        mode: Phaser.Scale.FIT
    }
});

export default game;