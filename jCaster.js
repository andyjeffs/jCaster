//jCaster - a HTML5 JavaScript Ray Caster - Andrew Jeffs 2012

var canvas = null;
var canvas3d = null;

// textures
var img = null;
var img1 = null;

var EnableTextureMapping = 1;

// world constants
var MapWidth = 10;
var MapHeight = 10;
var TileWidth = 64;
var TileHeight = 64;

// The 3d height of the tiles
var TileZ = 64;

var ScreenWidth = 640;
var ScreenHeight = 400;

var FOV = Math.PI/3; // field of view of the player

var AngleIncrement = FOV/ScreenWidth;

var DistanceToScreen = (ScreenWidth/2)/Math.tan(FOV/2);

var FPS = 30; // frames per second

// the world map
var map = [1,1,1,1,1,1,1,1,1,1,
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

var rotationAmount = FOV/ScreenWidth*16; // amount to rotate player (CW or CCW)
var moveDistance = 3;	  // amount to move the player (forward or backward)

// keyboard
var keyUp = false;
var keyDown = false;
var keyLeft = false;
var keyRight = false;

function init()
{
	// get the canvas
	canvas = document.getElementById("canvasID").getContext("2d");

	canvas3d = document.getElementById("canvas3d").getContext("2d");

	// set the canvas size - not working??
	//canvas.width = MapWidth*TileWidth;
	//canvas.height = MapHeight*TileHeight;

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
	//canvas.beginPath();
	canvas.arc(playerX,playerY,5,0,2*Math.PI);
	canvas.fill();
	//canvas.closePath();
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
	}
}

function castRayY(angle)
{
	var x = 0.0;
	var y = 0.0;

	var c = currentTile(playerX, playerY);
	var currentTileX = c[0];

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

	var distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

	canvas.strokeStyle = "blue";
	canvas.beginPath();
	canvas.moveTo(playerX,playerY);
	canvas.lineTo(x,y);
	canvas.closePath();
	canvas.stroke();

	return [distance,Math.floor(y)%TileHeight,checkTile(x,y)];
}

function castRayX(angle)
{
	x = 0.0;
	y = 0.0;
	deltax = 0.0;
	distance = 0.0;

	c = currentTile(playerX, playerY);

	currentTileY = c[1];

	// compute the first X intercept
	if(angle > Math.PI/2 && angle < 3*Math.PI/2)
	{
		// 2nd or 3rd quadrant
		y = currentTileY*TileHeight + TileHeight;
		// get the corresponding x coord
		deltax = (y-playerY)/Math.tan(angle - Math.PI/2);

		x = playerX + deltax;
		x1 = x;

		if((checkTile(x,y) == 0) && (checkTile(x,y - TileHeight) == 0))
		{
			// compute the next intercept
			y += TileHeight;
			x = playerX + (y-playerY)/Math.tan(angle - Math.PI/2);
			x2 = x;

			while((checkTile(x,y) == 0) && (checkTile(x,y - TileHeight) == 0))
			{
				deltax = x2 - x1;

				// compute the next intercept
				x += deltax;
				y += TileHeight;
			}
		}
	}
	else
	{
		// 1st or 4th quadrant
		y = currentTileY*TileHeight;
		// get the corresponding x coord
		deltax = (y-playerY)/Math.tan(angle - Math.PI/2);
		x = playerX + deltax;
		x1 = x;

		if((checkTile(x,y) == 0) && (checkTile(x,y - TileHeight) == 0))
		{
			// compute the next intercept
			y -= TileHeight;
			x = playerX + (y-playerY)/Math.tan(angle - Math.PI/2);
			x2 = x;

			while((checkTile(x,y) == 0) && (checkTile(x,y - TileHeight) == 0))
			{
				deltax = x2 - x1;

				// compute the next intercept
				x += deltax;
				y -= TileHeight;
			}
		}
	}

	// canvas.strokeStyle = "blue";
	// canvas.beginPath();
	// canvas.moveTo(playerX,playerY);
	// canvas.lineTo(x,y);
	// canvas.closePath();
	// canvas.stroke();



	var distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

		if(x < 0 || x > 640)
	{
		y = 0;
		x = 0;
		dist = 100000;
	}

	return [distance,Math.floor(x)%TileWidth,checkTile(x,y)];
}

function castRays()
{
	//printMsg("angle = " + playerDir*(180/Math.PI));

	// draw the direction of the player
	// x = 300*Math.sin(playerDir);
	// y = 300*Math.cos(playerDir);

	// canvas.beginPath();
	// canvas.strokeStyle = "white";
	// canvas.moveTo(playerX,playerY);
	// canvas.lineTo(playerX + x, playerY - y);
	// canvas.stroke();
	// canvas.closePath();
	
	var x5=0;
	var FOVCorrect = -Math.PI/6;
	var i = 0;

	for(i = playerDir-FOV/2; i < (playerDir+FOV/2); i += AngleIncrement)
	//i = playerDir;
	//if(1)
	{
		FOVCorrect += AngleIncrement;
		// cast the rays
		//i=i+0.000001;
		a = castRayX(i);
		b = castRayY(i);

		distX = a[0];
		distY = b[0];

		var dist = Math.min(distX,distY);

		var tex = 0;
		var type = 0;

		if(distX > distY)
		{
			color = '#00FF00';
			tex = b[1];
			type = b[2];
		}
		else
		{
			color = '#008800';
			tex = a[1];
			type = a[2];
		}

		// draw the ray
		//x = dist*Math.sin(i);
		//y = dist*Math.cos(i);

		// canvas.strokeStyle = "white";
		// canvas.beginPath();
		// canvas.moveTo(playerX,playerY);
		// canvas.lineTo(playerX + x, playerY - y);
		// canvas.closePath();
		// canvas.stroke();

		dist = dist*Math.cos(FOVCorrect);
		var height = TileZ/dist*DistanceToScreen;

		if(EnableTextureMapping == 1)
		{
			if(type == 1)
			{
				canvas3d.drawImage(img,tex,0,1,TileHeight,x5,ScreenHeight/2 - height/2,1,height);
			}
			else// if(type == 2)
			{
				canvas3d.drawImage(img1,tex,0,1,TileHeight,x5,ScreenHeight/2 - height/2,1,height);
			}
		}
		else
		{
			// canvas3d.strokeStyle = color;
			// canvas3d.beginPath();
			// canvas3d.moveTo(x5,ScreenHeight/2-height/2);
			// canvas3d.lineTo(x5,ScreenHeight/2+height/2);
			// canvas3d.closePath();
			// canvas3d.stroke();
		}
		
		x5 = x5 + 1;
	}
}

function printMsg(msg)
{
	// print the player view direction
	//canvas.beginPath();
	canvas.font = "14px Arial";
	canvas.fillStyle = "black";
	canvas.fillText(msg,20,20);
	//canvas.closePath();
}

// Checks if there is a tile at the current world x,y position
function checkTile(worldX, worldY)
{
	tile = currentTile(worldX, worldY);

	tileX = tile[0];
	tileY = tile[1];

	content = 0;

	if(tileX >= 0 && tileX < MapWidth)
	{
		if(tileY >= 0 && tileY < MapHeight)
		{
			content = map[(tileY*MapHeight) + tileX];
		}
	}
	else
	{
		// out of bounds - return a hit
		content = 1;
	}

	//printMsg("Tile x: " + tileX + " Tile y: " + tileY + " Content: " + content);

	return content;
}

// Returns the map x,y for the given world x,y
function currentTile(worldX, worldY)
{
	tileX = Math.floor(worldX/TileWidth);
	tileY = Math.floor(worldY/TileHeight);

	return [tileX, tileY];
}

function drawFloorAndSky()
{
	// draw the sky
	//canvas3d.beginPath();
	canvas3d.fillStyle = "blue";
	canvas3d.fillRect(0,0,ScreenWidth,ScreenHeight/2);
	//canvas3d.closePath();

	// draw the floor
	//canvas3d.beginPath();
	canvas3d.fillStyle = "grey";
	canvas3d.fillRect(0,ScreenHeight/2,ScreenWidth,ScreenHeight);
	//canvas3d.closePath();		
}

init();
gameLoop();

function gameLoop()
{
	drawMap();
	//drawPlayer();
	processKeyboard();
	drawFloorAndSky();
	castRays();
	printMsg("angle = " + playerDir*(180/Math.PI));
}
