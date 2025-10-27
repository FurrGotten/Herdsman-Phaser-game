import Phaser from 'phaser';
import Hero from './Hero';

export type AnimalState = 'idle' | 'patrol' | 'follow';

export default class Animal extends Phaser.Physics.Arcade.Sprite {
    state: AnimalState = 'idle';
    followSpeed = 160;
    patrolSpeed = 40;
    id: number;
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, id: number) {
        super(scene, x, y, texture);
        this.id = id;
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(1);
        this.setCircle(this.width / 2);
        this.setImmovable(false);
    }

    startFollow() {
        this.state = 'follow';
    }

    stopFollow() {
        this.state = 'idle';
        (this.body as Phaser.Physics.Arcade.Body).velocity.set(0, 0);
    }

    patrolRandomly() {
        this.state = 'patrol';
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const vx = Math.cos(angle) * this.patrolSpeed;
        const vy = Math.sin(angle) * this.patrolSpeed;
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(vx, vy);
    }

    update(time: number, delta: number, hero?: Hero) {
        if (!this.active || !this.body) return;

        if (this.state === 'follow' && hero && hero.active && hero.body) {
            this.scene.physics.moveToObject(this, hero, this.followSpeed);
        }
    }
}
