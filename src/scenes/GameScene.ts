import Phaser from 'phaser';
import { createCircleTexture } from '../utils/helpers';
import Hero from '../entities/Hero';
import Animal from '../entities/Animal';
import Yard from '../entities/Yard';
import ScoreUI from '../ui/ScoreUI';

export default class GameScene extends Phaser.Scene {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
    hero!: Hero;
    animals: Animal[] = [];
    following: Animal[] = [];
    yard!: Yard;
    scoreUI!: ScoreUI;
    animalIdCounter = 0;

    maxFollow = 5;
    initialAnimals = Phaser.Math.Between(5, 10);

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // generate simple circle textures
        createCircleTexture(this, 'hero', 14, 0xff0000);
        createCircleTexture(this, 'animal', 10, 0xffffff);
        createCircleTexture(this, 'bggreen', 10, 0x2ecc71); // not used as tile but optional
    }

    create() {
        const { width, height } = this.scale;

        const field = this.add.rectangle(0, 0, width, height, 0x00690C).setOrigin(0, 0);
        field.setDepth(-1);

        const yardW = 160, yardH = 110;
        this.yard = new Yard(this, width - yardW - 30, height - yardH - 30, yardW, yardH);

        this.hero = new Hero(this, 100, 100, 'hero');

        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        this.hero.setCollideWorldBounds(true);

        for (let i = 0; i < this.initialAnimals; i++) {
            this.spawnAnimalRandom();
        }

        this.scoreUI = new ScoreUI(this);

        // hero moving on mice click
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.hero.moveToPoint(new Phaser.Math.Vector2(pointer.worldX, pointer.worldY));
        });

        // Keyboard input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasdKeys = this.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as { [key: string]: Phaser.Input.Keyboard.Key };
        }

        this.physics.add.overlap(this.hero, this.physics.add.group(this.animals), (heroObj, animalObj) => {
            const animal = animalObj as Animal;
            this.tryAddToFollowing(animal);
        });

        this.physics.add.overlap(this.yard.zone, this.physics.add.group(this.animals), (zoneObj, animalObj) => {
            const animal = animalObj as Animal;
            this.collectAnimal(animal);
        });

        // spawn generator
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000), // first spawn
            callback: this.spawnTimerCallback,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                this.animals.forEach(a => {
                    if (a.state === 'idle') a.patrolRandomly();
                });
            }
        });

        this.animals.forEach(animal => {
            (animal.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        });
    }

    spawnTimerCallback() {
        this.spawnAnimalRandom();
    }

    spawnAnimalRandom() {
        const w = this.scale.width, h = this.scale.height;
        const margin = 40;
        const x = Phaser.Math.Between(margin, w - margin);
        const y = Phaser.Math.Between(margin, h - margin);
        const id = this.animalIdCounter++;
        const animal = new Animal(this, x, y, 'animal', id);
        // small chance to start with patrol
        if (Math.random() < 0.6) animal.patrolRandomly();
        this.animals.push(animal);

        this.physics.add.overlap(this.hero, animal, () => {
            this.tryAddToFollowing(animal);
        });

        this.physics.add.overlap(this.yard.zone, animal, () => {
            this.collectAnimal(animal);
        });
    }

    tryAddToFollowing(animal: Animal) {
        if (this.following.includes(animal)) return;
        const dist = Phaser.Math.Distance.Between(animal.x, animal.y, this.hero.x, this.hero.y);
        const threshold = 60;
        if (dist <= threshold && this.following.length < this.maxFollow) {
            animal.startFollow();
            this.following.push(animal);
        }
    }

    collectAnimal(animal: Animal) {
        if (!this.animals.includes(animal)) return;
        const idx = this.animals.indexOf(animal);
        if (idx >= 0) this.animals.splice(idx, 1);

        const followIdx = this.following.indexOf(animal);
        if (followIdx >= 0) this.following.splice(followIdx, 1);

        this.scoreUI.add(1);

        Phaser.Utils.Array.Remove(this.animals, animal);
        Phaser.Utils.Array.Remove(this.following, animal);

        // destroy animation
        this.tweens.add({
            targets: animal,
            scale: 0,
            duration: 300,
            onComplete: () => {
                animal.destroy();
            }
        });
        if (animal) animal.destroy();
    }

    update(time: number, delta: number) {
        // update animals behavior
        this.following.forEach((a, idx) => {
            if (!a || !a.active || !a.body) return;
            if (!this.hero || !this.hero.active || !this.hero.body) return;

            a.update(time, delta, this.hero);

            const offsetAngle = Phaser.Math.DegToRad(30 * idx);
            const dist = 28 + idx * 6;
            const tx = this.hero.x + Math.cos(offsetAngle) * dist;
            const ty = this.hero.y + Math.sin(offsetAngle) * dist;
            this.physics.moveTo(a, tx, ty, a.followSpeed);
        });

        this.animals.forEach(a => {
            if (!this.following.includes(a)) {
                a.update(time, delta);
                const margin = 10;
                if (a.x < margin) a.x = margin;
                if (a.x > this.scale.width - margin) a.x = this.scale.width - margin;
                if (a.y < margin) a.y = margin;
                if (a.y > this.scale.height - margin) a.y = this.scale.height - margin;
            }
        });

        // Hero movement via keyboard
        const body = this.hero.body as Phaser.Physics.Arcade.Body;

        // 1️⃣ Keyboard input
        const left = this.cursors.left.isDown || this.wasdKeys.left.isDown;
        const right = this.cursors.right.isDown || this.wasdKeys.right.isDown;
        const up = this.cursors.up.isDown || this.wasdKeys.up.isDown;
        const down = this.cursors.down.isDown || this.wasdKeys.down.isDown;

        const isKeyboardMoving = left || right || up || down;

        if (isKeyboardMoving) {
            let vx = 0;
            let vy = 0;

            if (left) vx -= 1;
            if (right) vx += 1;
            if (up) vy -= 1;
            if (down) vy += 1;

            const vec = new Phaser.Math.Vector2(vx, vy).normalize().scale(this.hero.speed);
            body.setVelocity(vec.x, vec.y);

            // cancel click target movement
            this.hero.target = undefined;
        }
        else if (this.hero.target) {
            // 2️⃣ Click-move logic: hero handles this itself
            // Do NOT zero velocity here
        }
        else {
            // 3️⃣ Nothing pressed and no target: stop
            body.setVelocity(0, 0);
        }
    }
}
