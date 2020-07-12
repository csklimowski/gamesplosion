

import { JumpType, Weapon, EnemyMovement, GameData, generateGame } from '../generator';

// @ts-ignore
export let gameData: GameData;
export let playedGames: Set<string> = new Set();
export let metaData = {
    winStreak: 0
};

export class MenuScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'menu'
        });
    }

    searchClicked: boolean;
    searchEntered: boolean;
    searchPage: Phaser.GameObjects.Container;
    playPage: Phaser.GameObjects.Container;
    

    create() {
        
        this.searchClicked = false;
        this.searchEntered = false;
        
        this.searchPage = this.add.container(480, 360);
        this.playPage = this.add.container(480, 360);
        this.playPage.setScale(0.8);
        this.playPage.setAlpha(0);
        
        this.searchPage.add(this.add.image(0, 0, 'menu-bg'));
        let searchBar = this.add.image(0, -60, 'menu-searchbar2');
        searchBar.setInteractive();
        searchBar.on(Phaser.Input.Events.POINTER_OVER, function() {
            searchBar.setTint(0xcccccc);
        }, this);
        searchBar.on(Phaser.Input.Events.POINTER_OUT, function() {
            searchBar.setTint(0xffffff);
        }, this);
        searchBar.on(Phaser.Input.Events.POINTER_DOWN, function() {
            if (!this.searchClicked) {
                searchBar.setTexture('menu-searchbar');
                searchText.setText('|');
                this.searchClicked = true;
            }
        }, this);
        this.searchPage.add(searchBar);

        if (metaData.winStreak > 0) {
            let winText = this.add.bitmapText(0, 100, 'library', 'Win streak: ' + metaData.winStreak, 32,);
            winText.setOrigin(0.5, 0.5);
            this.searchPage.add(winText);
        }

        let inputStr = '';
        let searchText = this.add.bitmapText(-250, -80, 'library', '', 32);
        this.searchPage.add(searchText);

        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, function(event) {

            if (this.searchClicked && !this.searchEntered) {
                if (event.key === 'Enter' && inputStr.length > 0) {
                    this.search(inputStr);
                }
        
                if (event.key === 'Backspace') {
                    event.preventDefault();
                    inputStr = inputStr.substr(0, inputStr.length-1);
                }
                    
                if (event.key.length === 1) {
                    inputStr += event.key;    
                }
                if (playedGames.has(inputStr)) {
                    searchText.setAlpha(0.3);
                } else {
                    searchText.setAlpha(1);
                }
                searchText.setText(inputStr + '|');
            }
        }, this);
    }

    search(text) {
        if (playedGames.has(text)) return;

        this.searchEntered = true;
        gameData = generateGame(text);
        let bg = this.add.image(0, 0, gameData.artStyle+'-background');
        bg.setScale(0.675)
        this.playPage.add(bg);

        let bmText = this.add.bitmapText(0, -200, 'title', text, 64, 0.5);
        bmText.setOrigin(0.5, 0.5);
        this.playPage.add(bmText);
        let player = this.add.image(-200, 0, gameData.artStyle+'-'+gameData.playerVariant+'-idle');
        player.setScale(1.5);
        this.playPage.add(player);
        let enemy = this.add.image(200, 0, gameData.artStyle+'-'+gameData.enemyVariant);
        enemy.setScale(1.5);
        this.playPage.add(enemy);
        this.playPage.add(this.add.image(0, 160, 'menu-descbox'));

        let playButton = this.add.image(-230, 120, 'menu-play');
        playButton.setInteractive();
        playButton.on(Phaser.Input.Events.POINTER_OVER, function() {
            playButton.setTint(0xcccccc);
        }, this);
        playButton.on(Phaser.Input.Events.POINTER_OUT, function() {
            playButton.setTint(0xffffff);
        }, this);
        playButton.on(Phaser.Input.Events.POINTER_DOWN, function() {
            playedGames.add(text);
            this.scene.start('main');
        }, this);
        this.playPage.add(playButton);

        let description = this.add.bitmapText(-110, 90, 'library', gameData.description, 28);
        description.setAlpha(0.8);
        this.playPage.add(description);
    }

    update(time: number, delta: number) {
        
        if (this.searchEntered) {
            this.searchPage.setAlpha(Math.max(this.searchPage.alpha - delta/500, 0));
            this.searchPage.setScale(this.searchPage.scaleX - delta/1000);
            this.playPage.setAlpha(Math.min(this.playPage.alpha + delta/500, 1));
            this.playPage.setScale(Math.min(this.playPage.scaleX + delta/1000, 1));
        }
    }
}

