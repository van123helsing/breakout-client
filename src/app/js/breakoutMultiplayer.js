let levelTxt;


var BreakoutMultiplayer = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function BreakoutMultiplayer() {
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
        this.load.image('paddle0', 'assets/paddle0.png');
        this.load.image('paddle1', 'assets/paddle1.png');
        this.load.image('paddle2', 'assets/paddle2.png');
        this.load.image('paddle3', 'assets/paddle3.png');
        this.load.image('brick1', 'assets/blue.png');
        this.load.image('brick2', 'assets/green.png');
        this.load.image('brick3', 'assets/purple.png');
        this.load.image('brick4', 'assets/red.png');
        this.load.image('brick5', 'assets/silver.png');
        this.load.image('ball0', 'assets/ball0.png');
        this.load.image('ball1', 'assets/ball1.png');
        this.load.image('ball2', 'assets/ball2.png');
        this.load.image('ball3', 'assets/ball3.png');
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
                .setScale(SCALE*0.5)
                .setData('onPaddle', true));


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

        for(var i = 0; i<4; i++)
            this.physics.add.collider(this.balls[i], this.bricks, this.brickHit, null, this);
        for(var i = 0; i<4; i++)
            for(var j = 0; j<4; j++)
                this.physics.add.collider(this.balls[i], this.paddls[j], this.paddleHit, null, this);
        for(var i = 0; i<4; i++)
            for(var j = 0; j<4; j++)
                this.physics.add.collider(this.paddls[i], this.paddls[j], null, null, this);
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

      if (this.bricks.countActive() === 0) {
        this.game.destroy();
        this.endGameModal();
      }
    },


  endGameModal: function (){
    const sorted = this.sort(this.scores);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = "<table class=\"table table-borderless\">" +
      "  <thead>" +
      "    <tr>" +
      "      <th scope=\"col\">Place</th>" +
      "      <th colspan=\"2\">Name</th>" +
      "      <th colspan=\"2\">Score</th>" +
      "    </tr>" +
      "  </thead>" +
      "  <tbody>" +
      "    <tr>" +
      "      <th scope=\"row\">1st</th>" +
      "      <td colspan=\"2\">" + this.getPlayerName(sorted[3]) + "</td>" +
      "      <td colspan=\"2\">" + this.scores[sorted[3]] + "</td>" +
      "    </tr>" +
      "    <tr>" +
      "      <th scope=\"row\">2nd</th>" +
      "      <td colspan=\"2\">" + this.getPlayerName(sorted[2]) + "</td>" +
      "      <td colspan=\"2\">" + this.scores[sorted[2]] + "</td>" +
      "    </tr>" +
      "    <tr>" +
      "      <th scope=\"row\">3rd</th>" +
      "      <td colspan=\"2\">" + this.getPlayerName(sorted[1]) + "</td>" +
      "      <td colspan=\"2\">" + this.scores[sorted[1]] + "</td>" +
      "    </tr>" +
      "<tr>" +
      "      <th scope=\"row\">4th</th>" +
      "      <td colspan=\"2\">" + this.getPlayerName(sorted[0]) + "</td>" +
      "      <td colspan=\"2\">" + this.scores[sorted[0]] + "</td>" +
      "    </tr>" +
      "  </tbody>" +
      "</table>";

    swal({
      title: "Game over",
      closeOnClickOutside: false,
      content: wrapper,
      buttons: {
        confirm: "Menu"
      }
    }).then(isConfirm => {
      var array = $("canvas");
      var last_element = array[array.length - 1];
      last_element.remove();
      $("#mainScreen").show();
    })
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
            }
        });
    },

  sort: function (test) {
    var len = test.length;
    var indices = new Array(len);
    for (var i = 0; i < len; ++i) indices[i] = i;
    indices.sort(function (a, b) { return test[a] < test[b] ? -1 : test[a] > test[b] ? 1 : 0; });
    return indices;
  },

  getPlayerName: function(index){
      switch(index){
        case 0: return $("#player_name1").text();
        case 1: return $("#player_name2").text();
        case 2: return $("#player_name3").text();
        case 3: return $("#player_name4").text();
      }
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
            this.scores[j] += 20;
            this.printScores();
        }
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
                    x: j * 50*SCALE,
                    y: i * 50*SCALE
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
      $("#player_score1").text(this.scores[0]);
      $("#player_score2").text(this.scores[1]);
      $("#player_score3").text(this.scores[2]);
      $("#player_score4").text(this.scores[3]);
    }
});

let configBreakoutMultiplayer = {
    type: Phaser.AUTO,
    width: $(window).width() > $(window).height() ? $(window).height()-5 : $(window).width()-5,
    height: $(window).width() > $(window).height() ? $(window).height()-5 : $(window).width()-5,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [ BreakoutMultiplayer ],
    backgroundColor: '#222',
    physics: {
        default: 'arcade',
    }
};



