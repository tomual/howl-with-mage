let Application = PIXI.Application;
let loader = PIXI.loader;
let resources = PIXI.loader.resources;
let Sprite = PIXI.Sprite;
let TextureCache = PIXI.utils.TextureCache

PIXI.utils.sayHello();

let app = new Application({ width: 950, height: 450, antialias: true });
document.body.appendChild(app.view);

let dungeon, enemy, player, frame;
let playerTexture, enemyTexture;
let enemyHealthBar;
let statsWindow;
let lastAttacked = 0;
let damageText;
let battleInProgress = true;

let strengthText, intelligenceText, agilityText, levelText;

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
    .add("img/ui.json")
    .load(setup);

// Initialize
function setup() {
    let bg = new Sprite(resources["img/bg.png"].texture);
    bg.height = 400;
    bg.width = 620;
    bg.x = 20;
    bg.y = 20;
    app.stage.addChild(bg);

    playerTexture = resources["img/player.json"].textures;
    enemyTexture = resources["img/enemy.json"].textures;
    uiTexture = resources["img/ui.json"].textures;

    initPlayer();
    initEnemy();
    initUi();

    dungeon = new Sprite();
    app.stage.addChild(dungeon);
    drawEnemyHealthBar();
    // drawStatWindow();
    state = world;
    app.ticker.add(delta => tick(delta));
}

function initUi() {
    frame = new Sprite(uiTexture["frame.png"]);
    frame.x = 0;
    frame.y = 0;
    app.stage.addChild(frame);

    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fill: "#000",
    });

    let nameText = new PIXI.Text("tom", style);
    nameText.x = 722;
    nameText.y = 95;
    app.stage.addChild(nameText);
}

function initPlayer() {
    player = new Sprite(playerTexture["player-stand.png"]);
    player.height = player.height / 4;
    player.width = player.width / 4;
    player.x = 85;
    player.y = 135;
    app.stage.addChild(player);
}

function initEnemy() {
    enemy = new Sprite(enemyTexture["enemy-stand.png"]);
    enemy.height = enemy.height / 4;
    enemy.width = enemy.width / 4;
    enemy.x = 370;
    enemy.y = 140;
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
    enemyHealthBar.position.set(390, 100);
    app.stage.addChild(enemyHealthBar);

    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 180, 24);
    innerBar.endFill();
    enemyHealthBar.addChild(innerBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 180, 24);
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
    enemy.texture = enemyTexture["enemy-damage.png"];
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