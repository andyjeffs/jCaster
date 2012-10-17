//jCaster - a HTML5 JavaScript Ray Caster - Andrew Jeffs 2012

var canvas = null;

// world constants
var MapWidth = 10;
var MapHeight = 10;
var TileWidth = 64;
var TileHeight = 64;

var FOV = Math.PI/3; // field of view of the player

var FPS = 30; // frames per second

// the world map
var map = [1,1,1,1,1,1,1,1,1,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,1,1,1,1,0,1,
           1,0,0,0,1,0,0,0,0,1,
           1,0,0,0,1,0,0,0,0,1,
           1,0,0,0,1,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,1,1,1,1,1,1,1,1,1];

// player
var playerX = 200;
var playerY = 200;
var playerDir = Math.PI; // direction the player is looking in (degrees)

var rotationAmount = Math.PI/180*5; // amount to rotate player (CW or CCW)
var moveDistance = 3;	  // amount to move the player (forward or backward)

function init()
{
	// get the canvas
	canvas = document.getElementById("canvasID").getContext("2d");

	// set the canvas size - not working??
	//canvas.width = MapWidth*TileWidth;
	//canvas.height = MapHeight*TileHeight;

	setInterval(gameLoop,1000/FPS);

	window.addEventListener('keydown', keyDown);
}

// draws the 2d to down world map
function drawMap()
{
	// draw the 2d world map
	for(var y=0; y < MapHeight; y++)
	{
		for(var x=0; x < MapWidth; x++)
		{
			if(map[(y*MapHeight) + x] == 1)
			{
				canvas.fillStyle = "#00FF00";
			}
			else
			{
				canvas.fillStyle = "#FF0000";
			}
			canvas.fillRect(x*TileWidth,y*TileHeight,TileWidth,TileHeight);
		}
	}	
}

// draws the player on the map
function drawPlayer()
{
	canvas.beginPath();
	canvas.arc(playerX,playerY,5,0,2*Math.PI);
	canvas.closePath();
	canvas.fill();
}

// draw rays out from player
function drawRays()
{	
	l = 1000;

	canvas.strokeStyle = "#0000FF";
	for(var i=(playerDir-FOV/2); i < (playerDir+FOV/2); i = i + (Math.PI/360))
	{
		canvas.moveTo(playerX,playerY);
		
		x = l*Math.sin(i);
		y = l*Math.cos(i);
	
		canvas.lineTo(playerX + x, playerY - y);
		canvas.stroke();
	}
}

// keyboard input
function keyDown(event)
{
	switch(event.keyCode)
	{
		// left arrow - rotate player CCW
		case 37:
		playerDir-= rotationAmount;
		break;

		// up arrow - move forward
		case 38:
		playerX += moveDistance*Math.sin(playerDir);
		playerY -= moveDistance*Math.cos(playerDir);
		break;

		// right arrow - rotate player CW
		case 39:
		playerDir+=rotationAmount;
		break;

		// down arrow - move back
		case 40:
		playerX -= moveDistance*Math.sin(playerDir);
		playerY += moveDistance*Math.cos(playerDir);
		break;
	}
}

function printDebug()
{
	// print the player view direction
	canvas.font = "14px Arial";
	canvas.fillStyle = "black";
	canvas.fillText(playerDir*(180/Math.PI),20,20);
}

init();

function gameLoop()
{
	drawMap();
	drawPlayer();
	drawRays();
	//printDebug();
}
