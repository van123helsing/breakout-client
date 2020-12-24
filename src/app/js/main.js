var game;
var queue = [];
var loaded = false;
var SCALE_W = ($(window).width()-5)/2133;
var SCALE_H = ($(window).height()-5)/1041;
var SCALE = ($(window).width() > $(window).height() ? $(window).height()-5 : $(window).width()-5)/1041;
var mode = "menu";
var socket;
var playerN=0;


window.onload = async function() {

    webgazer.params.showVideoPreview = false;
    //start the webgazer tracker
    await webgazer/*.setRegression('ridge') /* currently must set regression and tracker */
        //.setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {

            if(loaded === false){
                $("#mainScreen").show();
                $("#loading").hide();
            }
            loaded = true;

            if(data != null && queue.length < 5){
                queue.push(data.x)
            }

          if(game != null && data != null && game.scene != null && game.scene.keys != null && queue.length >= 5) {
              queue.push(data.x)
              queue.shift();
              if (mode === "singleplayer") {
                if (game.scene.keys.breakout != null && game.scene.keys.breakout.paddle != null ) {
                  var paddl = game.scene.keys.breakout.paddle;
                  paddl.x = getPaddlePosition(SCALE_W, paddl, true);
                }
              } else if (mode === "multiplayer") {
                drawPoint(data);
                if (game.scene.keys.BreakoutMultiplayer != null && game.scene.keys.BreakoutMultiplayer.paddls.length === 4) {
                  paddle_move(playerN, false);
                }
              }
            }
        }).begin();
        webgazer.showVideoPreview(false) /* shows all video previews */
            .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
            .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

    //Set up the webgazer video feedback.
    var setup = function() {

        //Set up the main canvas. The main canvas is used to calibrate the webgazer.
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = $(window).width()-5;
        canvas.height = $(window).height()-5;
        canvas.style.position = 'fixed';
    };
    setup();

};

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function() {
    webgazer.end();
}

function startGameMultiplayer(){
  setTimeout(function(){
    $("#game_start").text("Game start in 3");
    setTimeout(function(){
      $("#game_start").text("Game start in 2");
      setTimeout(function(){
        $("#game_start").text("Game start in 1");
        setTimeout(function(){
          $("#game_start").text("Start!");
          for(var i = 0; i< 4; i++) {
            game.scene.keys.BreakoutMultiplayer.balls[i].setData('onPaddle', false);
            game.scene.keys.BreakoutMultiplayer.balls[i].setVelocity(game.scene.keys.BreakoutMultiplayer.ballsVelocitiy[i].x, game.scene.keys.BreakoutMultiplayer.ballsVelocitiy[i].y);
          }
          setTimeout(function(){
            $("#game_start").text("");
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

function getPaddlePosition(scale, paddl, width) {
  var offset = ($(window).width() - game.config.width) / 2;
  if (width === true)
    return Phaser.Math.Clamp((queue.reduce((a, b) => a + b, 0) / queue.length)-offset, paddl.width * scale * 0.5 / 2, game.config.width - paddl.width * scale * 0.5 / 2);
  else
    return Phaser.Math.Clamp((queue.reduce((a, b) => a + b, 0) / queue.length)-offset, paddl.height * scale * 0.5 / 2, game.config.height - paddl.height * scale * 0.5 / 2);
}

function drawPoint(data){
  var canvas = document.getElementById("plotting_canvas");
  canvas.style.zIndex = "8000";
  var ctx = canvas.getContext("2d");
  ctx.fillStyle= 'red'
  var limit1 = ($(window).width() - game.config.width) / 2;
  var limit2 = $(window).width() - limit1;
  ClearCanvas();

  if(data.x < limit1 && mode === "multiplayer"){
    ctx.fillRect(limit1,data.y,10,10);
  } else if(data.x > limit2 && mode === "multiplayer"){
    ctx.fillRect(limit2,data.y,10,10);
  } else {
    ctx.fillRect(data.x,data.y,10,10);
  }
}

function paddle_move(player, other, x, y) {
  var paddl = game.scene.keys.BreakoutMultiplayer.paddls[player - 1];
  var ball = game.scene.keys.BreakoutMultiplayer.balls[player - 1];
  switch (player) {
    case 1:
      paddl.x = !other ? getPaddlePosition(SCALE, paddl, true) : x*game.config.width;
      if (ball.getData('onPaddle'))
        ball.x = paddl.x;
      break;
    case 2:
      paddl.x = !other ? game.config.width - getPaddlePosition(SCALE, paddl, true) : x*game.config.width;
      if (ball.getData('onPaddle'))
        ball.x = paddl.x;
      break;
    case 3:
      paddl.y = !other ? getPaddlePosition(SCALE, paddl, false) : y*game.config.height;
      if (ball.getData('onPaddle'))
        ball.y = paddl.y;
      break;
    case 4:
      paddl.y = !other ? game.config.height - getPaddlePosition(SCALE, paddl, false): y*game.config.height;
      if (ball.getData('onPaddle'))
        ball.y = paddl.y;
      break;
  }

  if(!other)
    socket.emit('update-paddle', {player_num:player, x:paddl.x/game.config.width, y:paddl.y/game.config.height});

}

/**
 * Restart the calibration process by clearing the local storage and reseting the calibration point
 */
function Restart(){
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}


function Start(){
    if(loaded) {
        mode = "singleplayer";
        $("#mainScreen").hide();
        ClearCanvas();

        if (PointCalibrate >= 9) {
            configBreakout.height = $(window).height()-5;
            configBreakout.width = $(window).width()-5;
            game = new Phaser.Game(configBreakout);
        } else {
            Restart();
        }
    }
}

function Recalibrate(){
    if(loaded){
        webgazer.showPredictionPoints(true);
        $("#mainScreen").hide();
        ClearCanvas();
        mode  = "menu";
        Restart();
    }
}

function Multiplayer(){
    $("#mainScreen").hide();
    $("#createRoom").hide();
    $("#joinRoom").hide();
    $("#room").hide();
    $("#multiplayer").show();
}

function HighScore(){
  $("#mainScreen").hide();
  $("#highscores").show();
}

function Help(){
  $("#mainScreen").hide();
  $("#help").show();
}

function Authors(){
  $("#mainScreen").hide();
  $("#authors").show();
}

function CreateRoom(){
  $("#multiplayer").hide();
  $("#createRoom").show();
}

function GoToMenu(){
  $("#authors").hide();
  $("#help").hide();
  $("#highscores").hide();
  $("#multiplayer").hide();
  $("#room").hide();
  $("#mainScreen").show();
}

function JoinRoom(){
  $("#multiplayer").hide();
  $("#joinRoom").show();
}

function Room(){
  $("#createRoom").hide();
  $("#joinRoom").hide();
  $("#room").show();
}


function StartMultiplayer(room_id, player_id, playerNum){
    if(loaded) {
      Room();
      socket = io('http://localhost:5000');
      socket.emit('joined-room', { room_id: room_id, player_id:  player_id, x:0, y:0});
      socket.on('someone joined', () => {
        var event = new CustomEvent('refreshRoom')
        window.dispatchEvent(event);
      });
      socket.on('someone left', () => {
        var event = new CustomEvent('refreshRoom')
        window.dispatchEvent(event);
      });

      socket.on('paddle moved', (data) => {
        paddle_move(data.player_num, true, data.x, data.y);
      });

      socket.on('start game', () => {
        startGameMultiplayer();
      });

      game = new Phaser.Game(configBreakoutMultiplayer);
      var angle = 0;
      switch(playerNum) {
        case 2:
          angle = 180;
          break;
        case 3:
          angle = 270;
          break;
        case 4:
          angle = 90;
          break;
      }
      $("canvas:not(#plotting_canvas):not(#webgazerVideoFeed):not(#webgazerVideoCanvas):not(#webgazerFaceOverlay):not(#webgazerFaceFeedbackBox)").first().css("transform", "rotate("+ angle +"deg)")
      playerN = playerNum;
      mode = "multiplayer";
      webgazer.showPredictionPoints(false);
    }
}
