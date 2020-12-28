let scoreText;
let livesText;
let levelText;
let startButton;
let menuButton;
let rotation;



var Breakout = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Breakout() {
        Phaser.Scene.call(this, {key: 'breakout'});

        this.bricks;
        this.paddle;
        this.ball;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
    },

    preload: function () {
        this.load.image('paddle', 'assets/paddle.png');
        this.load.image('ball', 'assets/ball.png');
        this.load.image('brick1', 'assets/tile.png');
        // this.load.image('brick2', 'assets/green.png');
        // this.load.image('brick3', 'assets/purple.png');
        // this.load.image('brick4', 'assets/red.png');
        // this.load.image('brick5', 'assets/silver.png');
    },

    create: function () {
        this.paddle = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 50, 'paddle')
            .setImmovable()
            .setScale(SCALE_W*0.5,SCALE_H*0.5);

        this.ball = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 80, 'ball')
            .setCollideWorldBounds(true)
            .setBounce(1)
            .setScale(SCALE_W*0.5,SCALE_H*0.5);

        var allBricks = this.setAllBricks(level1);
        for (i in allBricks) {
            var tmp = this.physics.add.staticGroup({
                key: allBricks[i].brick,
                frameQuantity: 1,
                gridAlign: { x: allBricks[i].x, y: allBricks[i].y}
            })
            tmp.children.entries[0].setScale(SCALE_W,SCALE_H);
            if (this.bricks == null)
                this.bricks = tmp;
            else
                this.bricks.addMultiple(tmp.children.entries);
        }


        scoreText = this.add.text(20, 20, 'Score: 0');
        livesText = this.add.text(this.game.config.width - 20, 20, 'Lives: ' + this.lives).setOrigin(1, 0);
        // levelText = this.add.text(this.cameras.main.centerX, 20, 'Level: ' + this.level, textStyle).setOrigin(1, 0);

        startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start game')
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({backgroundColor: '#111'})
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => this.startGame.call(this))
            .on('pointerover', () => startButton.setStyle({fill: '#f39c12'}))
            .on('pointerout', () => startButton.setStyle({fill: '#FFF'}));

        menuButton = this.add.text(this.game.config.width - 60, 70, 'Menu')
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({backgroundColor: '#111'})
            .setInteractive({useHandCursor: true})
            .on('pointerdown', () => {
                if(this.ball.body !== undefined) {
                    var velocity = this.ball.body.velocity.clone()
                    this.ball.setVelocity(0, 0);
                }
                swal({
                    title: "EXIT GAME?",
                    text: "If you go to the menu the game will end. Sure you wanna do this?",
                    buttons: {
                        cancel: "CANCEL",
                        confirm: "EXIT"
                    }
                }).then(isConfirm => {
                    if (isConfirm) {
                      this.endGame();
                    } else {
                        if(this.ball.body !== undefined)
                            this.ball.setVelocity(velocity.x, velocity.y);
                    }
                })
            })
            .on('pointerover', () => menuButton.setStyle({fill: '#f39c12'}))
            .on('pointerout', () => menuButton.setStyle({fill: '#FFF'}));

        this.physics.add.collider(this.ball, this.bricks, this.brickHit, null, this);
        this.physics.add.collider(this.ball, this.paddle, null, null, this);

        $("#singleplayer_canvas canvas").css("display", "block");
    },

    update: function () {
        if (rotation) {
            this.ball.rotation = rotation === 'left' ? this.ball.rotation - .05 : this.ball.rotation + .05;
        }

        if (this.ball.y > this.paddle.y) {
            this.lives--;

            if (this.lives > 0) {
                livesText.setText(`Lives: ${this.lives}`);

                this.ball.setPosition(this.cameras.main.centerX, this.game.config.height - 100)
                    .setVelocity(300, -150);
            } else {
              this.game.destroy();
              this.endGameModal("GAME OVER");
            }
        }
    },

    brickHit: function (ball, brick) {
        var tmpScore = 25
        // switch (brick.texture.key){
        //     case "brick1":
        //         tmpScore = 5;
        //         break;
        //     case "brick2":
        //         tmpScore = 10;
        //         break;
        //     case "brick3":
        //         tmpScore = 15;
        //         break;
        //     case "brick4":
        //         tmpScore = 20;
        //         break;
        //     case "brick5":
        //         tmpScore = 25;
        //         break;
        // }

        this.score += tmpScore;
        scoreText.setText(`Score: ${this.score}`);

      brick.destroy();

      if (this.bricks.countActive() === 0) {
        this.game.destroy();
        this.endGameModal("You've cleared the game!");
      }
    },

    endGameModal: function (text){
      swal({
        title: text,
        closeOnClickOutside: false,
        text: "Your score is " + this.score + ". Would you like to save it?",
        content:{
          element: "input",
          attributes: {
            placeholder: "Type your name",
            type: "text",
          },
        },
        buttons: {
          confirm:"SAVE",
          cancel: "MENU"
        }
      }).then(isConfirm => {
        if (isConfirm) {
          var event = new CustomEvent('onScoreSubmit', {detail:{player_name:isConfirm, score:this.score }})
          window.dispatchEvent(event);
        }
        this.endGame();
      })
    },

    startGame: function () {
        startButton.destroy();
        this.ball.setVelocity(-300, -150);
        rotation = 'left';
    },

    endGame: function(){
      $("#singleplayer_canvas canvas").remove();
      this.game.destroy();
      $("#mainScreen").show();
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
                    x: j * 80*SCALE_W,
                    y: 100 + i * 80*SCALE_H
                });
            }
        }

        return array;
    }
});

let configBreakout = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height:window.innerHeight,
    scene: [ Breakout ],
    parent: "singleplayer_canvas",
    backgroundColor: '#000',
    physics: {
        default: 'arcade',
    }
};


