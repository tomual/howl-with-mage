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
let enemyHealthBar;
let statsWindow;
let lastAttacked = 0;
let damageText;
let battleInProgress = true;

let monsterStats = {
    maxhp: 3500,
    hp: 3500,
    strength: 1,
    intelligence: 1,
    agility: 1,
    experience: 10,
};

let playerStats = {
    strength: 1,
    intelligence: 10,
    agility: 10,
    experience: 0,
    level: 1,
    unallocated: 0,
};

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
    drawEnemyHealthBar();
    // drawStatWindow();
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

function getAttackSpeed() {
    return playerStats.agility * 100;
}

// World stage
function world(delta) {
    if (damageText) {
        damageText.alpha -= 0.04;
    }
    if (performance.now() - lastAttacked > (getAttackSpeed() / 2)) {
        player.texture = playerTexture["player-stand.png"];
        enemy.texture = enemyTexture["enemy-stand.png"];
    }
    if (performance.now() - lastAttacked > getAttackSpeed()) {
        if (battleInProgress) {
            lastAttacked = performance.now();
            attack();
        }
    }
}

// Enemy health
function drawEnemyHealthBar() {
    enemyHealthBar = new PIXI.Container();
    enemyHealthBar.position.set(500, 70);
    app.stage.addChild(enemyHealthBar);

    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 180, 28);
    innerBar.endFill();
    enemyHealthBar.addChild(innerBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 180, 28);
    outerBar.endFill();
    enemyHealthBar.addChild(outerBar);

    enemyHealthBar.outer = outerBar;
}

function drawStatWindow() {
    statsWindow = new PIXI.Container();
    statsWindow.position.set(30, 30);

    let background = new PIXI.Graphics();
    background.beginFill(0xdadcac);
    background.lineStyle(5, 0xdadcac);
    background.drawRect(0, 0, 400, 390);
    statsWindow.addChild(background);

    app.stage.addChild(statsWindow);
}

// Attack enemy
function attack() {
    player.texture = playerTexture["player-attack.png"];
    enemy.texture = enemyTexture["enemy-stand.png"];
    let damage = getDamage();
    monsterStats.hp -= damage;
    console.log(monsterStats.hp);
    console.log(damage);
    if (monsterStats.hp <= 0) {
        enemyHealthBar.outer.width = 0;
        finishBattle();
    } else {
        showDamage(damage);
        let damageToPixel = 180 / monsterStats.maxhp;
        let pixelToTake = damageToPixel * damage;
        console.log('take ' + damage + ' damage');
        console.log('take ' + pixelToTake + ' pixel');
        enemyHealthBar.outer.width -= pixelToTake;
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

function showStats() {

}

function finishBattle() {
    battleInProgress = false;
    enemyDie();
    addExperience();
}

function addExperience() {
    playerStats.experience += monsterStats.experience;
}

// Enemy death
function enemyDie() {
    console.log('enemy died');
}

// Calculate damage
function getDamage() {
    let baseDamage = 1;
    let min = playerStats.intelligence * 5 + baseDamage;
    let max = playerStats.intelligence * 10 + baseDamage;
    return randomInt(min, max);
}

// Random number
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}