//jCaster - a HTML5 JavaScript Ray Caster - Andrew Jeffs 2012

var canvas = null;
var canvas3d = null;

// textures
var img = null;
var img1 = null;

var EnableTextureMapping = 1;
var EnableMap = 1;

// world constants
var MapWidth = 10;
var MapHeight = 10;
var TileWidth = 64;
var TileHeight = 64;

// The 3d height of the tiles
var TileZ = 64;

var ScreenWidth = 640;
var ScreenHeight = 480;

var FOV = Math.PI/3; // field of view of the player

var AngleIncrement = FOV/ScreenWidth;

var DistanceToScreen = (ScreenWidth/2)/Math.tan(FOV/2);

var FPS = 30; // frames per second

// the world map
var map = [1,2,2,2,2,2,2,2,2,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,2,1,0,1,
           1,0,0,2,2,2,2,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,1,1,1,1,1,1,1,1,1];

// player
var playerX = 200;
var playerY = 200;
var playerDir = 0; // direction the player is looking in (degrees)

var rotationAmount = FOV/ScreenWidth*64; // amount to rotate player (CW or CCW)
var moveDistance = 6;	  // amount to move the player (forward or backward)
var verticalLookDistance = 15; // amount to increment up/down look

var verticalCentre = ScreenHeight/2;

// keyboard
var keyUp = false;
var keyDown = false;
var keyLeft = false;
var keyRight = false;
var keyLookUp = false;
var keyLookDown = false;

function init()
{
	// get the canvas
	c2d = document.getElementById("canvasID");
	canvas = c2d.getContext("2d");

	c3d = document.getElementById("canvas3d")
	canvas3d = c3d.getContext("2d");

	// set the canvas size
	c2d.height = MapHeight*TileHeight;
	c2d.width = MapWidth*TileWidth;
	
	c3d.height = ScreenHeight;
	c3d.width = ScreenWidth;
	
	img = new Image();
	img.src = "greystone.png";

	img1 = new Image();
	img1.src = "wood.png";

	setInterval(gameLoop,1000/FPS);

	window.addEventListener('keydown', keyDownEvent);
	window.addEventListener('keyup', keyUpEvent);
}

// draws the 2d to down world map
function drawMap()
{
	// draw the 2d world map
	canvas.strokeStyle = "black";

	for(var y=0; y < MapHeight; y++)
	{
		for(var x=0; x < MapWidth; x++)
		{
			if(map[(y*MapHeight) + x] == 0)
			{
				canvas.fillStyle = "red";
			}
			else
			{
				canvas.fillStyle = "lime";
			}
			canvas.beginPath();
			canvas.fillRect(x*TileWidth,y*TileHeight,TileWidth,TileHeight);
			canvas.strokeRect(x*TileWidth,y*TileHeight,TileWidth,TileHeight);
			canvas.closePath();	
		}
	}	
}

// draws the player on the map
function drawPlayer()
{
	canvas.arc(playerX,playerY,5,0,2*Math.PI);
	canvas.fill();
}

// keyboard input
function processKeyboard()
{
	newPlayerX = playerX;
	newPlayerY = playerY;

	if(keyLeft)
	{
		// left arrow - rotate player CCW
		playerDir-= rotationAmount;

		if(playerDir < 0)
		{
			playerDir = playerDir + 2*Math.PI;
		}
	}
	else if(keyRight)
	{
		// right arrow - rotate player CW
		playerDir+=rotationAmount;

		if(playerDir > 2*Math.PI)
		{
			playerDir = playerDir - 2*Math.PI;
		}
	}

	if(keyUp)
	{
		// up arrow - move forward
		newPlayerX += moveDistance*Math.sin(playerDir);
		newPlayerY -= moveDistance*Math.cos(playerDir);
	}
	else if(keyDown)
	{
		// down arrow - move back
		newPlayerX -= moveDistance*Math.sin(playerDir);
		newPlayerY += moveDistance*Math.cos(playerDir);
	}

	// check for collision
	collision = checkTile(newPlayerX, newPlayerY);

	if(collision == 0)
	{
		// no collision detected - move the player
		playerX = newPlayerX;
		playerY = newPlayerY;
	}

	if(keyLookUp)
	{
		verticalCentre += verticalLookDistance;
	}
	else if(keyLookDown)
	{
		verticalCentre -= verticalLookDistance;
	}
}

function keyDownEvent(event)
{
	switch(event.keyCode)
	{
		// left arrow
		case 37:
		keyLeft = true;
		break;

		// up arrow
		case 38:
		keyUp = true;
		break;

		// right arrow
		case 39:
		keyRight = true;
		break;

		// down arrow
		case 40:
		keyDown = true;
		break;

		// look up (A)
		case 65:
		keyLookUp = true;
		break;

		// look down (Z)
		case 90:
		keyLookDown = true;
		break;
	}
}

function keyUpEvent(event)
{
	switch(event.keyCode)
	{
		// left arrow
		case 37:
		keyLeft = false;
		break;

		// up arrow
		case 38:
		keyUp = false;
		break;

		// right arrow
		case 39:
		keyRight = false;
		break;

		// down arrow
		case 40:
		keyDown = false;
		break;

		// look up (A)
		case 65:
		keyLookUp = false;
		break;

		// look down (Z)
		case 90:
		keyLookDown = false;
		break;
	}
}

// find the Y intercept
function castRayY(angle)
{
	var x = 0.0;
	var y = 0.0;
	var distance = 0.0;

	var tile = currentTile(playerX, playerY);
	var currentTileX = tile.x;

	var cosAlpha = Math.cos(Math.PI/2 + angle);
	var sinAlpha = Math.sin(Math.PI/2 + angle);

	var slope = -1*sinAlpha/cosAlpha;
	var dir = 1;

	if(angle >= 0 && angle < Math.PI)
	{
		// 1st or 2nd quadrant
		dir = 1; // ray going right
		x = currentTileX*TileWidth + TileWidth;
	}
	else
	{
		// // 3rd or 4th quadrant
		dir = -1; // ray going left
		x = currentTileX*TileWidth;
	}

	y = slope*(playerX - x) + playerY;

	while(checkTile(x + dir*1,y) == 0)
	{
		x = x + dir*TileWidth;
		y = slope*(playerX - x) + playerY;
	}

	distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

	return {distance:distance, textureCoord:Math.floor(y)%TileHeight, tileContent:checkTile(x + dir*1,y)};
}

// find the X intercept
function castRayX(angle)
{
	var x = 0.0;
	var y = 0.0;
	var distance = 0.0;

	var tile = currentTile(playerX, playerY);
	var currentTileY = tile.y;

	var cosAlpha = Math.cos(Math.PI/2 + angle);
	var sinAlpha = Math.sin(Math.PI/2 + angle);

	var slope = -1*sinAlpha/cosAlpha;
	var dir = 1;

	if(angle > Math.PI/2 && angle < 3*Math.PI/2)
	{
		// 2nd or 3rd quadrant
		y = currentTileY*TileHeight + TileHeight;
		dir = 1; // ray going down	
	}
	else
	{
		// 1st or 4th quadrant
		y = currentTileY*TileHeight;
		dir = -1; // ray going up
	}

	x = (playerY - y)/slope + playerX;

	while(checkTile(x,y + dir*1) == 0)
	{
		y = y + dir*TileHeight;
		x = (playerY - y)/slope + playerX;
	}

	distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

	return {distance:distance, textureCoord:Math.floor(x)%TileWidth, tileContent:checkTile(x,y + dir*1)};
}

function castRays()
{
	var yCounter = 0;
	var FOVCorrect = -Math.PI/6;

	// cast the rays
	for(var i = playerDir-FOV/2; i < (playerDir+FOV/2); i += AngleIncrement)
	{
		// make sure the angle is between 0 and 360 degrees
		var angle = i;

		if(angle < 0)
		{
			angle = angle + Math.PI*2		
		}
		else if(angle > Math.PI*2)
		{
			angle = angle - Math.PI*2;
		}

		FOVCorrect += AngleIncrement;

		var rayX = castRayX(angle);
		var rayY = castRayY(angle);

		var dist = 0;
		var texture = 0;
		var textureCoord = 0;

		if(rayX.distance > rayY.distance)
		{
			color = '#00FF00'; // for non texture mapped
			texture = rayY.tileContent;
			textureCoord = rayY.textureCoord;
			dist = rayY.distance;
		}
		else
		{
			color = '#008800'; // for non texture mapped
			texture = rayX.tileContent;
			textureCoord = rayX.textureCoord;
			dist = rayX.distance;
		}

		if(EnableMap == 1)
		{
			// draw the rays on the map
			x = dist*Math.sin(angle);
			y = dist*Math.cos(angle);

			canvas.strokeStyle = "white";
			canvas.beginPath();
			canvas.moveTo(playerX,playerY);
			canvas.lineTo(playerX + x, playerY - y);
			canvas.closePath();
			canvas.stroke();
		}

		// correct for fishbowl effect
		dist = dist*Math.cos(FOVCorrect);
		
		// calculate the height of the wall
		var height = TileZ/dist*DistanceToScreen;

		if(EnableTextureMapping == 1)
		{
			if(texture == 1)
			{
				canvas3d.drawImage(img,textureCoord,0,1,TileHeight,yCounter,verticalCentre - height/2,1,height);
			}
			else if(texture == 2)
			{
				canvas3d.drawImage(img1,textureCoord,0,1,TileHeight,yCounter,verticalCentre - height/2,1,height);
			}
		}
		else
		{
			canvas3d.strokeStyle = color;
			canvas3d.beginPath();
			canvas3d.moveTo(yCounter,ScreenHeight/2-height/2);
			canvas3d.lineTo(yCounter,ScreenHeight/2+height/2);
			canvas3d.closePath();
			canvas3d.stroke();
		}
		
		yCounter++;
	}
}

function printMsg(msg)
{
	canvas.font = "14px Arial";
	canvas.fillStyle = "black";
	canvas.fillText(msg,20,20);
}

// Checks if there is a tile at the current world x,y position
function checkTile(worldX, worldY)
{
	tile = currentTile(worldX, worldY);
	content = 0;

	if(tile.x >= 0 && tile.x < MapWidth)
	{
		if(tile.y >= 0 && tile.y < MapHeight)
		{
			content = map[(tile.y*MapHeight) + tile.x];
		}
	}
	else
	{
		// out of bounds - return a hit
		content = 1;
	}

	return content;
}

// Returns the map x,y for the given world x,y
function currentTile(worldX, worldY)
{
	tileX = Math.floor(worldX/TileWidth);
	tileY = Math.floor(worldY/TileHeight);

	return {x:tileX, y:tileY};
}

function drawFloorAndSky()
{
	// draw the sky
	canvas3d.fillStyle = "blue";
	canvas3d.fillRect(0,0,ScreenWidth,verticalCentre);

	// draw the floor
	canvas3d.fillStyle = "grey";
	canvas3d.fillRect(0,verticalCentre,ScreenWidth,ScreenHeight);	
}

init();
gameLoop();

function gameLoop()
{
	if(EnableMap == 1)
	{
		drawMap();
		drawPlayer();
	}

	processKeyboard();
	drawFloorAndSky();
	castRays();
}
