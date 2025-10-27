import Phaser from 'phaser';

export default class ScoreUI {
    text: Phaser.GameObjects.Text;
    score: number = 0;
    constructor(scene: Phaser.Scene) {
        this.text = scene.add.text(10, 10, 'Score: 0', { font: '20px Arial', color: '#ffffff' });
        this.text.setDepth(10);
    }

    add(points = 1) {
        this.score += points;
        this.text.setText(`Score: ${this.score}`);
    }
}
