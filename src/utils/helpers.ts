import Phaser from 'phaser';

export function createCircleTexture(scene: Phaser.Scene, key: string, radius: number, fillStyle: number) {
    const gfx = scene.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(fillStyle, 1);
    gfx.fillCircle(radius, radius, radius);
    gfx.generateTexture(key, radius * 2, radius * 2);
    gfx.destroy();
}
