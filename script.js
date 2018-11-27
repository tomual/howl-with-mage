let Application = PIXI.Application;
let loader = PIXI.loader;
let resources = PIXI.loader.resources;
let Sprite = PIXI.Sprite;
let TextureCache = PIXI.utils.TextureCache

PIXI.utils.sayHello();

let app = new Application({ width: 950, height: 450, antialias: true, transparent: true });
document.body.appendChild(app.view);

let name;
let dungeon, enemy, player, frame;
let playerTexture, enemyTexture;
let enemyHealthBar, experienceBar;
let statsWindow;
let lastAttacked = 0;
let damageText, damageParticle, spellParticle;
let battleInProgress = true;
let nameInput, nameEnteredTime;

let strengthText, intelligenceText, agilityText, levelText;
let strengthButton, intelligenceButton, agilityButton;

let monsterStats = {
    maxhp: 300,
    hp: 300,
    strength: 1,
    intelligence: 1,
    agility: 1,
    experience: 50,
};

let playerStats = {
    strength: 1,
    intelligence: 10,
    agility: 10,
    experience: 0,
    maxExperience: 100,
    level: 1,
    unallocated: 0,
    points: 0,
};

WebFont.load({
    google: {
        families: ['Abel']
    },
    active: e => {
        loader
            .add("img/bg.png")
            .add("img/player.json")
            .add("img/enemy.json")
            .add("img/particles.json")
            .add("img/ui.json")
            .load(setup);
    }
});

// Initialize
function setup() {
    playerTexture = resources["img/player.json"].textures;
    enemyTexture = resources["img/enemy.json"].textures;
    uiTexture = resources["img/ui.json"].textures;
    particlesTexture = resources["img/particles.json"].textures;

    state = askName;
    app.ticker.add(delta => tick(delta));
}

function initUi() {
    drawExperienceBar();
    frame = new Sprite(uiTexture["frame.png"]);
    frame.x = 0;
    frame.y = 0;
    app.stage.addChild(frame);

    let style = new PIXI.TextStyle({
        fontFamily: "Abel",
        fontSize: 17,
        fill: "#3e3832",
    });

    let boldStyle = new PIXI.TextStyle({
        fontWeight: "bold",
        fontFamily: "Abel",
        fontSize: 17,
        fill: "#3e3832",
    });

    let nameLabel = new PIXI.Text(name, boldStyle);
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

    let strengthLabel = new PIXI.Text("Strength", boldStyle);
    strengthLabel.x = 722;
    strengthLabel.y = 165;
    app.stage.addChild(strengthLabel);

    let intelligenceLabel = new PIXI.Text("Intelligence", boldStyle);
    intelligenceLabel.x = 722;
    intelligenceLabel.y = 195;
    app.stage.addChild(intelligenceLabel);

    let agilityLabel = new PIXI.Text("Agility", boldStyle);
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
    strengthButton.visible = false;
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
    intelligenceButton.visible = false;
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
    agilityButton.visible = false;
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

function initParticles() {
    spellParticle = new Sprite(particlesTexture["bolt.png"]);
    spellParticle.x = 240;
    spellParticle.y = 170;
    spellParticle.alpha = 0;
    app.stage.addChild(spellParticle);

    damageParticle = new Sprite(particlesTexture["hit.png"]);
    damageParticle.x = 430;
    damageParticle.y = 200;
    damageParticle.alpha = 0;
    app.stage.addChild(damageParticle);
}

// 60 times a second
function tick(delta) {
    state(delta);
}

function getAttackSpeed() {
    return 18000 / playerStats.agility;
}

function askName(delta) {
    if (name) {
        nameEnteredTime = performance.now();
        let bg = new Sprite(resources["img/bg.png"].texture);
        bg.height = 400;
        bg.width = 620;
        bg.x = 20;
        bg.y = 20;
        app.stage.addChild(bg);

        initPlayer();
        initEnemy();
        initUi();
        initParticles();
        drawEnemyHealthBar();
        app.stage.alpha = 0;
        state = showGame;
    }
}

function showGame(delta) {
    if (performance.now() - nameEnteredTime < 2000) {
        app.stage.alpha += 0.04;
    } else {
        updateSkillButton();
        state = battle;
    }
}

// World stage
function battle(delta) {
    if (damageText && damageText.alpha > 0) {
        damageText.alpha -= 0.04;
        damageParticle.alpha -= 0.04;
        spellParticle.alpha -= 0.04;
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
        damageParticle.alpha -= 0.04;
        spellParticle.alpha -= 0.04;
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
let enemyInnerBar;
let enemyOuterBar;
let enemyHealthFrame;

// Enemy health
function drawEnemyHealthBar() {
    enemyHealthBar = new PIXI.Container();
    enemyHealthBar.position.set(390, 100);
    app.stage.addChild(enemyHealthBar);

    enemyInnerBar = new PIXI.Graphics();
    enemyInnerBar.beginFill(0x506171);
    enemyInnerBar.drawRect(0, 0, 180, 24);
    enemyInnerBar.endFill();
    enemyHealthBar.addChild(enemyInnerBar);

    enemyOuterBar = new PIXI.Graphics();
    enemyOuterBar.beginFill(0xf56e6e);
    enemyOuterBar.drawRect(0, 0, 180, 24);
    enemyOuterBar.endFill();
    enemyHealthBar.addChild(enemyOuterBar);

    enemyHealthFrame = new Sprite(uiTexture["enemy-hp.png"]);
    enemyHealthFrame.x = -10;
    enemyHealthFrame.y = -13;
    enemyHealthBar.addChild(enemyHealthFrame);

    enemyHealthBar.outer = enemyOuterBar;
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
    spellParticle.alpha = 1;
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

let damageStyle = new PIXI.TextStyle({
        fontFamily: "Abel",
        fontSize: 24,
        fontWeight: "bold",
        fill: "white",
        stroke: '#000',
        strokeThickness: 4,
        dropShadow: true,
        dropShadowColor: "#8c6951",
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 2,
        dropShadowDistance: 3,
    });

function showDamage(damage) {
    damageText = new PIXI.Text(damage, damageStyle);
    damageText.x = 420;
    damageText.y = 200;
    app.stage.addChild(damageText);
    damageParticle.alpha = 1;
}

function finishBattle() {
    battleInProgress = false;
    addExperience();
    state = despawnEnemy;
}

function addExperience() {
    playerStats.experience += monsterStats.experience;
    let experienceToPixel = 244 / playerStats.maxExperience;
    let pixelToAdd = experienceToPixel * playerStats.experience;
    experienceBar.outer.width = pixelToAdd;

    if (playerStats.experience >= playerStats.maxExperience) {
        levelUp();
    }
}

function levelUp() {
    ++playerStats.level;
    ++playerStats.points;
    playerStats.experience = 0;
    levelText.text = playerStats.level;
    experienceBar.outer.width = 0;

    playerStats.maxExperience += playerStats.maxExperience / playerStats.level;
    monsterStats.maxhp += playerStats.level * 10;
    monsterStats.experience += 10;

    updateSkillButton();
}

// Calculate damage
function getDamage() {
    let baseDamage = playerStats.strength;
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
    updateSkillButton();
}

function updateSkillButton() {
    if (playerStats.points) {
        strengthButton.visible = true;
        agilityButton.visible = true;
        intelligenceButton.visible = true;
    } else {
        strengthButton.visible = false;
        agilityButton.visible = false;
        intelligenceButton.visible = false;
    }
}

$('#name').keyup(function(e){
    if(e.keyCode == 13) {
        $('.ask-name').fadeOut('slow', function () {
            name = $('#name').val();
        });
    }
});