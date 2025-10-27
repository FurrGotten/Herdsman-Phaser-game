import Phaser from 'phaser';

export default class Yard {
    zone: Phaser.GameObjects.Zone;
    graphics: Phaser.GameObjects.Graphics;
    scene: Phaser.Scene;
    constructor(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.fillStyle(0xF1C40F, 1);
        this.graphics.fillRect(x, y, w, h);
        this.graphics.setDepth(0);

        this.zone = scene.add.zone(x + w / 2, y + h / 2, w, h);
        scene.physics.add.existing(this.zone);
        (this.zone.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        (this.zone.body as Phaser.Physics.Arcade.Body).immovable = true;
    }
}
