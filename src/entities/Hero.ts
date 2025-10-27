import Phaser from 'phaser';

export default class Hero extends Phaser.Physics.Arcade.Sprite {
    speed: number = 360;
    target?: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(2);
        this.setCircle(this.width / 2);
    }

    moveToPoint(point: Phaser.Math.Vector2) {
        this.target = point.clone();
        const angle = Phaser.Math.Angle.Between(this.x, this.y, point.x, point.y);
        if (this.body) {
            this.body.velocity.x = Math.cos(angle) * this.speed;
            this.body.velocity.y = Math.sin(angle) * this.speed;
        }
    }

    stop(): this {
        this.target = undefined;
        if (this.body) this.body.velocity.set(0, 0);
        return this;
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        if (this.target) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            if (dist < 6) {
                this.stop();
            }
        }
    }
}
