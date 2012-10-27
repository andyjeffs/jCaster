//jCaster - a HTML5 JavaScript Ray Caster - Andrew Jeffs 2012

var canvas = null;
var canvas3d = null;

// world constants
var MapWidth = 10;
var MapHeight = 10;
var TileWidth = 64;
var TileHeight = 64;

var ScreenWidth = 640;
var ScreenHeight = 400;

var FOV = Math.PI/3; // field of view of the player

var AngleIncrement = FOV/ScreenWidth;

var FPS = 30; // frames per second

// the world map
var map = [1,1,1,1,1,1,1,1,1,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,1,1,0,1,
           1,0,0,1,1,1,1,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,0,0,0,0,0,0,0,0,1,
           1,1,1,1,1,1,1,1,1,1];

// player
var playerX = 200;
var playerY = 200;
var playerDir = Math.PI/3 + Math.PI/2;//2*Math.PI/3; // direction the player is looking in (degrees)

var rotationAmount = Math.PI/180*5; // amount to rotate player (CW or CCW)
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

	setInterval(gameLoop,1000/FPS);

	window.addEventListener('keydown', keyDownEvent);
	window.addEventListener('keyup', keyUpEvent);
}

// draws the 2d to down world map
function drawMap()
{
	//canvas.beginPath();
	// draw the 2d world map
	for(var y=0; y < MapHeight; y++)
	{
		for(var x=0; x < MapWidth; x++)
		{
			if(map[(y*MapHeight) + x] == 1)
			{
				canvas.fillStyle = "lime";
			}
			else
			{
				canvas.fillStyle = "red";
			}
			canvas.fillRect(x*TileWidth,y*TileHeight,TileWidth,TileHeight);
			canvas.strokeStyle = "black";
			canvas.strokeRect(x*TileWidth,y*TileHeight,TileWidth,TileHeight);
		}
	}
	//canvas.closePath();	
}

// draws the player on the map
function drawPlayer()
{
	//canvas.beginPath();
	canvas.arc(playerX,playerY,5,0,2*Math.PI);
	canvas.fill();
	//canvas.closePath();
}

// draw rays out from player
function drawRays()
{	
	l = 1000;

	canvas.strokeStyle = "blue";
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
	x = 0.0;
	y = 0.0;
	deltay = 0.0;

	c = currentTile(playerX, playerY);

	currentTileX = c[0];

	// compute the first Y intercept
	if(playerDir > 0 && angle < Math.PI)
	{
		// 1st or 2nd quadrant
		x = currentTileX*TileWidth + TileWidth;
		// get the corresponding y coord
		deltay = (x-playerX)*Math.tan(Math.PI/2 + angle);
		y = playerY + deltay;
		y1 = y;

		if((checkTile(x,y) == 0) && (checkTile(x - TileWidth,y) == 0))
		{
			// compute the next intercept
			x += TileWidth;
			y = playerY + (x-playerX)*Math.tan(Math.PI/2 + angle);
			y2 = y;

			while((checkTile(x,y) == 0) && (checkTile(x - TileWidth,y) == 0))
			{
				deltay = y2 - y1;

				// compute the next intercept
				x += TileWidth;
				y += deltay; 
			}
		}
	}
	else
	{
		// 3rd or 4th quadrant
		x = currentTileX*TileWidth - TileWidth;
		// get the corresponding y coord
		deltay = (x-playerX)*Math.tan(Math.PI/2 + angle);
		y = playerY + deltay;
		y1 = y;

		if((checkTile(x,y) == 0) && (checkTile(x - TileWidth,y) == 0))
		{
			// compute the next intercept
			x -= TileWidth;
			y = playerY + (x-playerX)*Math.tan(Math.PI/2 + angle);
			y2 = y;

			while((checkTile(x,y) == 0) && (checkTile(x - TileWidth,y) == 0))
			{
				deltay = y2 - y1;

				// compute the next intercept
				x -= TileWidth;
				y += deltay; 
			}
		}
	}

	// canvas.beginPath();
	// canvas.strokeStyle = "green";
	// canvas.moveTo(playerX,playerY);
	// canvas.lineTo(x,y);
	// canvas.stroke();
	// canvas.closePath();

	var distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

	return distance;
}

function castRayX(angle)
{
	x = 0.0;
	y = 0.0;
	deltax = 0.0;

	c = currentTile(playerX, playerY);

	currentTileY = c[1];

	// compute the first X intercept
	if(playerDir > Math.PI/2 && angle < 3*Math.PI/2)
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
		y = currentTileY*TileHeight - TileHeight;
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

	// canvas.beginPath();
	// canvas.strokeStyle = "blue";
	// canvas.moveTo(playerX,playerY);
	// canvas.lineTo(x,y);
	// canvas.stroke();
	// canvas.closePath();

	var distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

	return distance;
}

function castRays()
{
	//printMsg("angle = " + playerDir*(180/Math.PI));

	// draw the direction of the player
	x = 300*Math.sin(playerDir);
	y = 300*Math.cos(playerDir);

	// canvas.beginPath();
	// canvas.strokeStyle = "white";
	// canvas.moveTo(playerX,playerY);
	// canvas.lineTo(playerX + x, playerY - y);
	// canvas.stroke();
	// canvas.closePath();
	
	var x5=0;
	var FOVCorrect = -Math.PI/6;

	//for(var i=(playerDir-FOV/2); i < (playerDir+FOV/2); i = i + (Math.PI/360))
	for(var i=(playerDir-FOV/2); i < (playerDir+FOV/2); i += AngleIncrement)
	{
		FOVCorrect += AngleIncrement;
		// cast the rays
		var distX = castRayX(i);
		var distY = castRayY(i);

		//console.log(distX + " - " + distY );

		var dist = Math.min(distX,distY);

		if(distX > distY)
		{
			color = '#00FF00';
		}
		else
		{
			color = '#008800';
		}

		//console.log(dist);

		// draw the ray
		x = dist*Math.sin(i);
		y = dist*Math.cos(i);

		//canvas.beginPath();
		// canvas.strokeStyle = "white";
		// canvas.moveTo(playerX,playerY);
		// canvas.lineTo(playerX + x, playerY - y);
		// canvas.stroke();
		//canvas.closePath();

		dist = dist*Math.cos(FOVCorrect);

		height = 64/dist*277;
		x5 = x5 + 1;

		canvas3d.strokeStyle = color;
		canvas3d.beginPath();
		canvas3d.moveTo(x5,ScreenHeight/2-height/2);
		canvas3d.lineTo(x5,ScreenHeight/2+height/2);
		canvas3d.closePath();
		canvas3d.stroke();
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
	canvas3d.fillStyle = "black";
	canvas3d.fillRect(0,ScreenHeight/2,ScreenWidth,ScreenHeight);
	//canvas3d.closePath();		
}

init();
gameLoop();

function gameLoop()
{
	//drawMap();
	//drawPlayer();
	processKeyboard();
	drawFloorAndSky();
	castRays();
}
