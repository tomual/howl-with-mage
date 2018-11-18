function onSkillButtonDown() {
    this.isdown = true;
    this.texture = uiTexture["button-down.png"];
    this.alpha = 1;
}

function onSkillButtonUp() {
    this.isdown = false;
    if (this.isOver) {
        this.texture = uiTexture["button-hover.png"];
        let stat = this.statType;
        console.log(stat);
        levelStat(stat);
    }
    else {
        this.texture = uiTexture["button.png"];
    }
}

function onSkillButtonOver() {
    this.isOver = true;
    if (this.isdown) {
        return;
    }
    this.texture = uiTexture["button-hover.png"];
}

function onSkillButtonOut() {
    this.isOver = false;
    if (this.isdown) {
        return;
    }
    this.texture = uiTexture["button.png"];
}
