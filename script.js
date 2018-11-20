let Application = PIXI.Application;
let loader = PIXI.loader;
let resources = PIXI.loader.resources;
let Sprite = PIXI.Sprite;
let TextureCache = PIXI.utils.TextureCache

PIXI.utils.sayHello();

let app = new Application({ width: 950, height: 450, antialias: true, transparent: true });
document.body.appendChild(app.view);

let dungeon, enemy, player, frame;
let playerTexture, enemyTexture;
let enemyHealthBar, experienceBar;
let statsWindow;
let lastAttacked = 0;
let damageText;
let battleInProgress = true;

let strengthText, intelligenceText, agilityText, levelText;
let strengthButton, intelligenceButton, agilityButton;

let monsterStats = {
    maxhp: 3500,
    hp: 3500,
    strength: 1,
    intelligence: 1,
    agility: 1,
    experience: 50,
};

let playerStats = {
    strength: 1,
    intelligence: 100,
    agility: 30,
    experience: 0,
    maxExperience: 200,
    level: 1,
    unallocated: 0,
    points: 0,
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
    state = battle;
    app.ticker.add(delta => tick(delta));
}

function initUi() {
    drawExperienceBar();
    frame = new Sprite(uiTexture["frame.png"]);
    frame.x = 0;
    frame.y = 0;
    app.stage.addChild(frame);

    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 14,
        fill: "#000",
    });

    let nameLabel = new PIXI.Text("tom", style);
    nameLabel.x = 722;
    nameLabel.y = 95;
    app.stage.addChild(nameLabel);

    let levelLabel = new PIXI.Text("Lv.", style);
    levelLabel.x = 722;
    levelLabel.y = 125;
    app.stage.addChild(levelLabel);

    levelText = new PIXI.Text(playerStats.level, style);
    levelText.x = 748;
    levelText.y = 125;
    app.stage.addChild(levelText);

    let strengthLabel = new PIXI.Text("Strength", style);
    strengthLabel.x = 722;
    strengthLabel.y = 165;
    app.stage.addChild(strengthLabel);

    let intelligenceLabel = new PIXI.Text("Intelligence", style);
    intelligenceLabel.x = 722;
    intelligenceLabel.y = 195;
    app.stage.addChild(intelligenceLabel);

    let agilityLabel = new PIXI.Text("Agility", style);
    agilityLabel.x = 722;
    agilityLabel.y = 225;
    app.stage.addChild(agilityLabel);

    strengthText = new PIXI.Text(playerStats.strength, style);
    strengthText.x = 822;
    strengthText.y = 165;
    app.stage.addChild(strengthText);

    intelligenceText = new PIXI.Text(playerStats.intelligence, style);
    intelligenceText.x = 822;
    intelligenceText.y = 195;
    app.stage.addChild(intelligenceText);

    agilityText = new PIXI.Text(playerStats.agility, style);
    agilityText.x = 822;
    agilityText.y = 225;
    app.stage.addChild(agilityText);

    strengthButton = new Sprite(uiTexture["button.png"]);
    strengthButton.x = 868;
    strengthButton.y = 165 - 4;
    strengthButton.interactive = true;
    strengthButton.buttonMode = true;
    strengthButton.statType = 'strength';
    strengthButton
        .on('pointerdown', onSkillButtonDown)
        .on('pointerup', onSkillButtonUp)
        .on('pointerupoutside', onSkillButtonUp)
        .on('pointerover', onSkillButtonOver)
        .on('pointerout', onSkillButtonOut);
    app.stage.addChild(strengthButton);

    intelligenceButton = new Sprite(uiTexture["button.png"]);
    intelligenceButton.x = 868;
    intelligenceButton.y = 195 - 4;
    intelligenceButton.interactive = true;
    intelligenceButton.buttonMode = true;
    intelligenceButton.statType = 'intelligence';
    intelligenceButton
        .on('pointerdown', onSkillButtonDown)
        .on('pointerup', onSkillButtonUp)
        .on('pointerupoutside', onSkillButtonUp)
        .on('pointerover', onSkillButtonOver)
        .on('pointerout', onSkillButtonOut);
    app.stage.addChild(intelligenceButton);

    agilityButton = new Sprite(uiTexture["button.png"]);
    agilityButton.x = 868;
    agilityButton.y = 225 - 4;
    agilityButton.interactive = true;
    agilityButton.buttonMode = true;
    agilityButton.statType = 'agility';
    agilityButton
        .on('pointerdown', onSkillButtonDown)
        .on('pointerup', onSkillButtonUp)
        .on('pointerupoutside', onSkillButtonUp)
        .on('pointerover', onSkillButtonOver)
        .on('pointerout', onSkillButtonOut);
    app.stage.addChild(agilityButton);
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
    return 20000 / playerStats.agility;
}

// World stage
function battle(delta) {
    if (damageText && damageText.alpha > 0) {
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

function despawnEnemy(delta) {
    if (damageText && damageText.alpha > 0) {
        damageText.alpha -= 0.04;
    }
    if (performance.now() - lastAttacked > 1000) {
        player.texture = playerTexture["player-stand.png"];
        if (enemy.alpha > 0) {
            enemy.alpha -= 0.04;
        } else {
            enemy.texture = enemyTexture["enemy-stand.png"];
            state = spawnEnemy;
        }
    }
}

function spawnEnemy(delta) {
    if (performance.now() - lastAttacked > 2000) {
        if (enemy.alpha <= 1) {
            enemy.alpha += 0.04;
        } else {
            monsterStats.hp = monsterStats.maxhp;
            enemyHealthBar.outer.width = 180;
            battleInProgress = true;
            state = battle;
        }
    }
}

// Enemy health
function drawEnemyHealthBar() {
    enemyHealthBar = new PIXI.Container();
    enemyHealthBar.position.set(390, 100);
    app.stage.addChild(enemyHealthBar);


    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x506171);
    innerBar.drawRect(0, 0, 180, 24);
    innerBar.endFill();
    enemyHealthBar.addChild(innerBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xf56e6e);
    outerBar.drawRect(0, 0, 180, 24);
    outerBar.endFill();
    enemyHealthBar.addChild(outerBar);

    let healthFrame = new Sprite(uiTexture["enemy-hp.png"]);
    healthFrame.x = -10;
    healthFrame.y = -13;
    enemyHealthBar.addChild(healthFrame);

    enemyHealthBar.outer = outerBar;
}

function drawExperienceBar() {
    experienceBar = new PIXI.Container();
    experienceBar.position.set(684, 18);
    app.stage.addChild(experienceBar);

    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x506171);
    innerBar.drawRect(0, 0, 244, 45);
    innerBar.endFill();
    experienceBar.addChild(innerBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0x6eb6f5);
    outerBar.drawRect(0, 0, 1, 45);
    outerBar.endFill();
    experienceBar.addChild(outerBar);

    experienceBar.outer = outerBar;
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
    showDamage(damage);
    // console.log(monsterStats.hp);
    // console.log(damage);
    if (monsterStats.hp <= 0) {
        enemyHealthBar.outer.width = 0;
        finishBattle();
    } else {
        let damageToPixel = 180 / monsterStats.maxhp;
        let pixelToTake = damageToPixel * damage;
        // console.log('take ' + damage + ' damage');
        // console.log('take ' + pixelToTake + ' pixel');
        enemyHealthBar.outer.width -= pixelToTake;
    }
}

function showDamage(damage) {
    let style = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 24,
        fill: "white",
        stroke: '#000',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#8c6951",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 2,
        dropShadowDistance: 3,
    });
    damageText = new PIXI.Text(damage, style);
    damageText.x = 420;
    damageText.y = 200;
    app.stage.addChild(damageText);
}

function finishBattle() {
    battleInProgress = false;
    addExperience();
    state = despawnEnemy;
    // enemySpawn();
}

function addExperience() {
    playerStats.experience += monsterStats.experience;
    let experienceToPixel = 244 / playerStats.maxExperience;
    let pixelToAdd = experienceToPixel * playerStats.experience;
    experienceBar.outer.width = pixelToAdd;

    if (playerStats.experience >= playerStats.maxExperience) {
        ++playerStats.level;
        ++playerStats.points;
        playerStats.experience = 0;
        levelText.text = playerStats.level;
        experienceBar.outer.width = 0;
    }
}

// Enemy spawn
function enemySpawn() {
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

function levelStat(stat) {
    --playerStats.points;
    ++playerStats[stat];
    let statText = stat + 'Text';
    eval(statText).text = playerStats[stat];
}