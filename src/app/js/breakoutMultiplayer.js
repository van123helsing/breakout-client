let scorTxt0;
let scorTxt1;
let scorTxt2;
let scorTxt3;
let levelTxt;
let strtBtn;
let menuBtn;

var BreakoutMultiplayer = new Phaser.Class({

    Extends: Phaser.Scene,


    initialize:

    function BreakoutMultiplayer() {
        Phaser.Scene.call(this, {key: 'BreakoutMultiplayer'});

        this.bricks;
        this.level = 1;
        this.balls = [];
        this.ballsPositions;
        this.paddls = [];
        this.paddlsPositions;
        this.ballsVelocitiy = [{x:300, y:-150}, {x:-300, y:150},{x:300, y:-150}, {x:-300, y:-150}];
        this.scores = [0,0,0,0];
    },

    preload: function () {
        this.load.image('paddle0', '/assets/paddle0.png');
        this.load.image('paddle1', '/assets/paddle1.png');
        this.load.image('paddle2', '/assets/paddle2.png');
        this.load.image('paddle3', '/assets/paddle3.png');
        this.load.image('brick1', '/assets/blue.png');
        // this.load.image('brick2', '/assets/green2.png');
        // this.load.image('brick3', '/assets/yellow2.png');
        // this.load.image('brick4', '/assets/red2.png');
        // this.load.image('brick5', '/assets/silver2.png');
        this.load.image('ball', '/assets/ball0.png');
        this.load.image('ball', '/assets/ball1.png');
        this.load.image('ball', '/assets/ball2.png');
        this.load.image('ball', '/assets/ball3.png');
    },

    create: function () {
        this.ballsPositions = [{x: this.cameras.main.centerX, y:this.game.config.height - 80},
            {x: this.cameras.main.centerX, y:80},
            {x: 80, y:this.cameras.main.centerY},
            {x: this.game.config.width - 80, y:this.cameras.main.centerY}];
        this.paddlsPositions = [{x: this.cameras.main.centerX, y:this.game.config.height - 40},
            {x: this.cameras.main.centerX, y:40},
            {x: 40, y:this.cameras.main.centerY},
            {x: this.game.config.width - 40, y:this.cameras.main.centerY}];

        for(var i = 0; i<4; i++) {
            this.paddls.push(this.physics.add.image(this.paddlsPositions[i].x, this.paddlsPositions[i].y, 'paddle'+i)
                .setImmovable()
                .setScale(SCALE*0.5));
        }


        for(var i = 0; i<4; i++)
            this.balls.push(this.physics.add.image(this.ballsPositions[i].x, this.ballsPositions[i].y, 'ball'+i)
                .setCollideWorldBounds(true)
                .setBounce(1)
                .setScale(SCALE*0.3));

        var allBricks = this.setAllBricks(levelMP1);
        for (var i = 0; i<allBricks.length; i++) {
            var tmp = this.physics.add.staticGroup({
                key: allBricks[i].brick,
                frameQuantity: 1,
                gridAlign: { x: allBricks[i].x, y: allBricks[i].y}
            })
            tmp.children.entries[0].setScale(SCALE);
            if (this.bricks == null)
                this.bricks = tmp;
            else
                this.bricks.addMultiple(tmp.children.entries);
        }

        scorTxt0 = this.add.text(20, 20, 'Player 1: ' + this.scores[0], textStyle);
        scorTxt1 = this.add.text(20, 50, 'Player 2: ' + this.scores[1], textStyle);
        scorTxt2 = this.add.text(20, 80, 'Player 3: ' + this.scores[2], textStyle);
        scorTxt3 = this.add.text(20, 110, 'Player 4: ' + this.scores[3], textStyle);

        for(var i = 0; i<4; i++)
            this.physics.add.collider(this.balls[i], this.bricks, this.brickHit, null, this);
        for(var i = 0; i<4; i++)
            for(var j = 0; j<4; j++)
                this.physics.add.collider(this.balls[i], this.paddls[j], this.paddleHit, null, this);

        this.startGame();

    },

    update: function () {
        for(var i = 0; i<4; i++){
            if (this.ballHitWall(i)) {

                this.balls[i].setPosition(this.ballsPositions[i].x, this.ballsPositions[i].y)
                    .setVelocity(this.ballsVelocitiy[i].x, this.ballsVelocitiy[i].y);

                if (this.scores[i] < 50)
                    this.scores[i] = 0;
                else
                    this.scores[i] = this.scores[i] - 50;

                this.printScores();
            }
        }

    },

    brickHit: function (ball, brick) {
        var tmpScore = 0
        switch (brick.texture.key){
            case "brick1":
                tmpScore = 5;
                break;
            case "brick2":
                tmpScore = 10;
                break;
            case "brick3":
                tmpScore = 15;
                break;
            case "brick4":
                tmpScore = 20;
                break;
            case "brick5":
                tmpScore = 25;
                break;
        }

        for(var i = 0; i<4; i++)
            if(this.balls[i] === ball)
                this.scores[i] += tmpScore

        this.printScores();

        this.tweens.add({
            targets: brick,
            scaleX: 0,
            scaleY: 0,
            ease: 'Power1',
            duration: 500,
            delay: 250,
            angle: 180,
            onComplete: () => {
                brick.destroy();

                if (this.bricks.countActive() === 0) {
                    ball.destroy();

                }
            }
        });
    },

    paddleHit: function(ball, paddle){
        var i = 0;
        var j = 0;
        for(i; i<4; i++)
            if(this.balls[i] === ball)
                break;
        for(j; j<4; j++)
            if(this.paddls[j] === paddle)
                break;

        if(i !== j){
            this.scores[j] += 30;
            this.printScores();
        }
    },

    startGame: function () {
        for(var i = 0; i< 4; i++)
            this.balls[i].setVelocity(this.ballsVelocitiy[i].x, this.ballsVelocitiy[i].y);

    },

    setAllBricks: function (level) {
        var array = [];
        for (var i = 0; i < level.length; i++) {
            for (var j = 0; j < level[0].length; j++) {
                var brickName = "";
                switch (level[i][j]) {
                    case "1":
                        brickName = "brick1";
                        break;
                    case "2":
                        brickName = "brick2";
                        break;
                    case "3":
                        brickName = "brick3";
                        break;
                    case "4":
                        brickName = "brick4";
                        break;
                    case "5":
                        brickName = "brick5";
                        break;
                }
                if (brickName === "") continue;

                array.push({
                    brick: brickName,
                    x: j * 64*SCALE,
                    y: 100 + i * 32*SCALE
                });
            }
        }

        return array;
    }

    ,ballHitWall(index){
        switch (index) {
            case 0:
                return this.balls[index].y > this.paddls[index].y
            case 1:
                return this.balls[index].y < this.paddls[index].y
            case 2:
                return this.balls[index].x < this.paddls[index].x
            case 3:
                return this.balls[index].x > this.paddls[index].x
        }
    }

    ,printScores(){
        scorTxt0.setText('Player 1: ' + this.scores[0]);
        scorTxt1.setText('Player 2: ' + this.scores[1]);
        scorTxt2.setText('Player 3: ' + this.scores[2]);
        scorTxt3.setText('Player 4: ' + this.scores[3]);
    }
});

let configBreakoutMultiplayer = {
    type: Phaser.AUTO,
    width: $(window).width() > $(window).height() ? $(window).height()-5 : $(window).width()-5,
    height: $(window).width() > $(window).height() ? $(window).height()-5 : $(window).width()-5,
    scene: [ BreakoutMultiplayer ],
    backgroundColor: '#222',
    physics: {
        default: 'arcade',
    }
};



