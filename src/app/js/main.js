var game;
var queue = [];
var loaded = false;
var SCALE_W = ($(window).width()-5)/2133;
var SCALE_H = ($(window).height()-5)/1041;
var SCALE = ($(window).width() > $(window).height() ? $(window).height()-5 : $(window).width()-5)/1041;
var mode = "menu";


window.onload = async function() {

    webgazer.params.showVideoPreview = false;
    //start the webgazer tracker
    await webgazer.setRegression('ridge') /* currently must set regression and tracker */
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

            if(game != null && data != null && game.scene != null && game.scene.keys != null && game.scene.keys.breakout != null && game.scene.keys.breakout.paddle != null){
                queue.push(data.x);
                queue.shift();
                var paddl = game.scene.keys.breakout.paddle;
                paddl.x = Phaser.Math.Clamp(queue.reduce((a, b) => a + b, 0)/queue.length, paddl.width*SCALE_W / 2,
                                                    game.config.width - paddl.width*SCALE_W / 2);
            }
            // console.log(data.x); /* data is an object containing an x and y key which are the x and y prediction coordinates (no bounds limiting) */
          //   console.log(clock); /* elapsed time in milliseconds since webgazer.begin() was called */
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
        $("#mainScreen").hide();
        ClearCanvas();

        if (PointCalibrate >= 9) {
            configBreakout.height = $(window).height()-5;
            configBreakout.width = $(window).width()-5;
            game = new Phaser.Game(configBreakout);
        } else {
            mode = "singleplayer";
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

function StartMultiplayer(){
    if(loaded) {
        $("#mainScreen").hide();
        ClearCanvas();

        if (PointCalibrate >= 0) {
            configBreakout.height = $(window).height()-5;
            configBreakout.width = $(window).width()-5;
            game = new Phaser.Game(configBreakoutMultiplayer);
        } else {
            mode = "multiplayer";
            Restart();
        }
    }
}
