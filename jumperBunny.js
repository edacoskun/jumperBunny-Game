const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

var bg = new Image();
var bunny = new Image();
var turtle = new Image();
var carrt = new Image();

bg.src = "images/bg.png";
bunny.src = "images/rabbit.png";
turtle.src = "images/turtle.png";
carrt.src = "images/carrot.png";

var CollectionSound = new Audio();
CollectionSound.src = "sounds/CollectionSound.mp3";
var HighestNumberSound = new Audio();
HighestNumberSound.src = "sounds/HighestNumberSound.mp3";

let Score;
let ScoreText;
let HighScore;
let HighScoreText;
let RabbitPlayer;
let GameGravity;
let BarrierAndCarrots = [];
let GameSpeed;
let PressedKey = {};
let bestCarrotPassed;
let bestCarrot;
let carrot;

document.addEventListener('keydown', function (evt) {
    PressedKey[evt.code] = true;
});
document.addEventListener('keyup', function (evt) {
    PressedKey[evt.code] = false;
});

class Rabbit {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.dy = 0;
        this.JumpForce = 10;
        this.OriginalHeight = h;
        this.grounded = false;
        this.JumpTime = 0;
    }

    Animation() {
        if (PressedKey['Space']) {
            this.Jump();
        } else {
            this.JumpTime = 0;
        }

        this.y += this.dy;

        if (this.y + this.h < canvas.height) {
            this.dy += GameGravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }

        this.Draw();
    }

    Jump() {
        if (this.grounded && this.JumpTime == 0) {
            this.JumpTime = 1;
            this.dy = -this.JumpForce;
        } else if (this.JumpTime > 0 && this.JumpTime < 15) {
            this.JumpTime++;
            this.dy = -this.JumpForce - (this.JumpTime / 50);
        }
    }

    Draw() {
        ctx.beginPath();
        ctx.drawImage(bunny, this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class TurtleOrCarrot {
    constructor(x, y, w, h, type) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;

        this.dx = -GameSpeed;
    }

    SceneUpdate() {
        this.x += this.dx;
        this.Draw();
        this.dx = -GameSpeed;
    }

    Draw() {
        ctx.beginPath();
        ctx.drawImage(this.type == 0 ? turtle : carrt, this.x, this.y, this.w, this.h);
        ctx.closePath();
    }
}

class Text {
    constructor(t, x, y, align, color, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.align = align;
        this.color = color;
        this.s = s;
    }

    Draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = this.s + "px Comic Sans MS";
        ctx.textAlign = this.align;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

function CreateTurtleOrCarrot() {
    let size = CreateRandomInt(30, 40);
    let type = CreateRandomInt(0, 1);

    let gameObject = new TurtleOrCarrot(canvas.width + size, canvas.height - size, size, size, type);

    if (type == 1) {
        gameObject.y -= RabbitPlayer.OriginalHeight + 15;
    }
    BarrierAndCarrots.push(gameObject);
}


function CreateRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function Start() {
    GameSpeed = 3;
    GameGravity = 1;

    Score = 0;
    HighScore = 0;
    bestCarrot = 0;
    carrot = 0;

    bestCarrotPassed = false;

    if (localStorage.getItem('HighScore')) {
        HighScore = localStorage.getItem('HighScore');
    }

    if (localStorage.getItem('bestCarrot')) {
        bestCarrot = localStorage.getItem('bestCarrot');
    }

    RabbitPlayer = new Rabbit(25, 0, 50, 50);

    ScoreText = new Text("Score: " + Score, 25, 25, "left", "#FF6600", "20");
    HighScoreText = new Text("Highscore: " + HighScore, canvas.width - 25, 25, "right", "#FF6600", "20");
    bestCarrotText = new Text("Best Carrot: " + bestCarrot, canvas.width - 35, 50, "right", "#FF6600", "20");
    carrotText = new Text("Carrot: " + carrot, 25, 50, "left", "#FF6600", "20");

    requestAnimationFrame(SceneUpdate);
}

let SetFormationTime = 200;
let FormationTime = SetFormationTime;
function SceneUpdate() {
    requestAnimationFrame(SceneUpdate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0);

    FormationTime--;
    if (FormationTime <= 0) {
        CreateTurtleOrCarrot();
        console.log(BarrierAndCarrots);
        FormationTime = SetFormationTime - GameSpeed * 8;

        if (FormationTime < 60) {
            FormationTime = 60;
        }
    }

    for (let i = 0; i < BarrierAndCarrots.length; i++) {
        let o = BarrierAndCarrots[i];

        if (o.x + o.w < 0) {
            BarrierAndCarrots.splice(i, 1);
        }

        if (
            RabbitPlayer.x < o.x + o.w &&
            RabbitPlayer.x + RabbitPlayer.w > o.x &&
            RabbitPlayer.y < o.y + o.h &&
            RabbitPlayer.y + RabbitPlayer.h > o.y
        ) {
            if (o.type == 1) {
                carrot++;
                CollectionSound.play();
                BarrierAndCarrots.splice(i, 1);
                Score += 20;
            } else {
                BarrierAndCarrots = [];
                Score = 0;
                carrot= 0;
                bestCarrotPassed = false;
                FormationTime = SetFormationTime;
                GameSpeed = 3;
                window.localStorage.setItem('HighScore', HighScore);
                window.localStorage.setItem('bestCarrot', bestCarrot);
            }

        }

        o.SceneUpdate();
    }

    RabbitPlayer.Animation();

    Score++;
    ScoreText.t = "Score: " + Score;
    ScoreText.Draw();

    if (Score > HighScore) {
        HighScore = Score;
        HighScoreText.t = "Highscore: " + HighScore;
    }
    HighScoreText.Draw();

    carrotText.t = "Carrot: " + carrot;
    carrotText.Draw();

    if (carrot > bestCarrot) {
        if (!bestCarrotPassed){
            HighestNumberSound.play();           
            bestCarrotPassed = true;
        }
        bestCarrot = carrot;
        bestCarrotText.t = "Best Carrot: " + bestCarrot;
    }
    bestCarrotText.Draw();

    GameSpeed += 0.002;
}

Start();
