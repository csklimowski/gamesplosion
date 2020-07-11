import { MainScene } from './scenes/main';

const game = new Phaser.Game({
    width: 960,
    height: 720,
    parent: 'game',
    scene: [
        MainScene,
    ],
    physics: {
        default: 'arcade'
    },
    scale: {
        mode: Phaser.Scale.FIT
    }
});

export default game;