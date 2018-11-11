let Application = PIXI.Application;
let loader = PIXI.loader;
let resources = PIXI.loader.resources;
let Sprite = PIXI.Sprite;
let TextureCache = PIXI.utils.TextureCache

PIXI.utils.sayHello();

let app = new Application({ width: 800, height: 450 });
document.body.appendChild(app.view);

let dungeon;
let enemyHealth;
let intelligence = 10;
let attackSpeed = 1000;
let lastAttacked = 0;

loader.load(setup);

// Initialise
function setup() {
	dungeon = new Sprite();
    app.stage.addChild(dungeon);
    drawEnemyHealth();
    state = world;
    app.ticker.add(delta => tick(delta));
}

// 60 times a second
function tick(delta) {
    state(delta);
}

// World stage
function world(delta) {
	if (performance.now() - lastAttacked > attackSpeed) {
		lastAttacked = performance.now();
		attack();
	}
}

// Enemy health
function drawEnemyHealth() {
	enemyHealth = new PIXI.Container();
	enemyHealth.position.set(app.screen.width - 200, 40);
	app.stage.addChild(enemyHealth);

	let innerBar = new PIXI.Graphics();
	innerBar.beginFill(0x000000);
	innerBar.drawRect(0, 0, 128, 8);
	innerBar.endFill();
	enemyHealth.addChild(innerBar);

	let outerBar = new PIXI.Graphics();
	outerBar.beginFill(0xFF3300);
	outerBar.drawRect(0, 0, 128, 8);
	outerBar.endFill();
	enemyHealth.addChild(outerBar);

	enemyHealth.outer = outerBar;
}

// Attack enemy
function attack() {
	let damage = getDamage(intelligence);
	let endHealth = enemyHealth.outer.width - damage;
	if (endHealth <= 0) {
		enemyHealth.outer.width = 0;
		enemyDie();
	} else {
		enemyHealth.outer.width -= getDamage(intelligence);
	}
}

// Enemy death
function enemyDie() {
	console.log('enemy died');
}

// Calculate damage
function getDamage(intelligence) {
    let baseDamage = 1;
    return baseDamage * intelligence / 2;
}

// Random number
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}