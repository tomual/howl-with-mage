let Application = PIXI.Application;
let loader = PIXI.loader;
let resources = PIXI.loader.resources;
let Sprite = PIXI.Sprite;
let TextureCache = PIXI.utils.TextureCache

PIXI.utils.sayHello();

let app = new Application({ width: 800, height: 450, antialias: true });
document.body.appendChild(app.view);

let dungeon, enemy, player;
let playerTexture, enemyTexture;
let enemyHealth;
let intelligence = 10;
let attackSpeed = 1000;
let lastAttacked = 0;
let damageText;

loader
    .add("img/bg.png")
    .add("img/player.json")
    .add("img/enemy.json")
    .load(setup);

// Initialize
function setup() {
    let bg = new Sprite(resources["img/bg.png"].texture);
    app.stage.addChild(bg);

    playerTexture = resources["img/player.json"].textures;
    enemyTexture = resources["img/enemy.json"].textures;

    initPlayer();
    initEnemy();

    dungeon = new Sprite();
    app.stage.addChild(dungeon);
    drawEnemyHealth();
    state = world;
    app.ticker.add(delta => tick(delta));
}

function initPlayer() {
    player = new Sprite(playerTexture["player-stand.png"]);
    player.height = player.height / 3;
    player.width = player.width / 3;
    player.x = 230;
    player.y = 250;
}

function initEnemy() {
    enemy = new Sprite(enemyTexture["enemy-stand.png"]);
    enemy.height = enemy.height / 3;
    enemy.width = enemy.width / 3;
    enemy.x = 590;
    enemy.y = 250;
    app.stage.addChild(player);
    app.stage.addChild(enemy);
}

// 60 times a second
function tick(delta) {
    state(delta);
}

// World stage
function world(delta) {
    if (damageText) {
        damageText.alpha -= 0.04;
    }
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
    let endHealth = enemyHealth.outer.width - Math.floor(damage / 10);
    if (endHealth <= 0) {
        enemyHealth.outer.width = 0;
        enemyDie();
    } else {
        showDamage(damage);
        enemyHealth.outer.width -= Math.floor(damage / 10);
    }
}

function showDamage(damage) {
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "white",
        stroke: '#000',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#000000",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 2,
        dropShadowDistance: 3,
    });
    damageText = new PIXI.Text(damage, style);
    damageText.x = 500;
    damageText.y = 200;
    app.stage.addChild(damageText);
}

// Enemy death
function enemyDie() {
    console.log('enemy died');
}

// Calculate damage
function getDamage(intelligence) {
    let baseDamage = 1;
    let min = intelligence * 5 + baseDamage;
    let max = intelligence * 10 + baseDamage;
    return randomInt(min, max);
}

// Random number
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}