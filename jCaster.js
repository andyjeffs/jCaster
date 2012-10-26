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
drawMap();
gameLoop();

function castRayY(angle)
{
	x = 0.0;
	y = 0.0;
	deltay = 0.0;

	currentTileX = Math.floor(playerX/TileWidth) + 1;
	currentTileY = Math.floor(playerY/TileHeight) + 1;

	// compute the first Y intercept
	if(playerDir > Math.PI/2 && angle < Math.PI)
	{
		// 2nd quadrant
		x = currentTileX*TileHeight;
		// get the corresponding y coord
		deltay = (x-playerX)*Math.tan(Math.PI/2 + angle);
		y = playerY + deltay;

		// check for a collision
		tx = Math.floor(x/TileWidth);
		ty = Math.floor(y/TileHeight);
		element = (ty*MapHeight) + tx;

		console.log(element);
		console.log(map[element]);
		
		while(map[element] == 0)
		{	
			// compute the next Y intercept 
			y += deltay;
			x += TileWidth;

			console.log(x + "," + y);

			// check for a collision
			tx = Math.floor(x/TileWidth);
			ty = Math.floor(y/TileHeight);
			element = (ty*MapHeight) + tx;

			console.log(element);
			console.log(map[element]);
		}

		canvas.strokeStyle = "black";
		canvas.moveTo(playerX,playerY);
		canvas.lineTo(x,y);
		canvas.stroke();
	}

	var distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

	return distance;
}



function gameLoop()
{
	drawMap();
	drawPlayer();

		//canvas.moveTo(playerX,playerY);
		//l=500;
		//x = l*Math.sin(playerDir);
		//y = l*Math.cos(playerDir);
	
		//canvas.lineTo(playerX + x, playerY - y);
		//canvas.stroke();
	castRays();
	checkTile(playerX,playerY);
	//drawRays();
	//printDebug();
}

function castRayX(angle)
{
	x = 0.0;
	y = 0.0;
	deltax = 0.0;

	currentTileX = Math.floor(playerX/TileWidth) + 1;
	currentTileY = Math.floor(playerY/TileHeight) + 1;

	console.log("Angle " + angle*180.0/Math.PI);

	// compute the first X intercept
	if(playerDir > Math.PI/2 && angle < Math.PI)
	{
		// 2nd quadrant
		y = currentTileX*TileWidth;
		// get the corresponding y coord
		deltax = (y-playerY)/Math.tan(angle - Math.PI/2);
		x = playerX + deltax;

		// check for a collision
		tx = Math.floor(x/TileWidth);
		ty = Math.floor(y/TileHeight);
		element = (ty*MapHeight) + tx;

		console.log(element);
		console.log(map[element]);
		
		while(map[element] == 0)
		{	
			// compute the next X intercept 
			x += deltax;
			y += TileHeight;

			console.log(x + "," + y);

			// check for a collision
			tx = Math.floor(x/TileWidth);
			ty = Math.floor(y/TileHeight);
			element = (ty*MapHeight) + tx;

			console.log(element);
			console.log(map[element]);
		}

		canvas.strokeStyle = "black";
		canvas.moveTo(playerX,playerY);
		canvas.lineTo(x,y);
		canvas.stroke();
	}

	var distance = Math.sqrt((x-playerX)*(x-playerX)+ (y-playerY)*(y-playerY));

	return distance;
}

function castRays()
{
	var distX = castRayX(playerDir);
	var distY = castRayY(playerDir);

	console.log(distX + " - " + distY );

	var dist = Math.min(distX,distY);

	console.log(dist);

	// draw the ray
	x = dist*Math.sin(playerDir);
	y = dist*Math.cos(playerDir);
	canvas.strokeStyle = "blue";
	canvas.moveTo(playerX,playerY);
	canvas.lineTo(playerX + x, playerY - y);
	canvas.stroke();
}

function printMsg(msg)
{
	// print the player view direction
	canvas.font = "14px Arial";
	canvas.fillStyle = "black";
	canvas.fillText(msg,20,20);
}

// Checks if there is a tile at the current world x,y position
function checkTile(worldX, worldY)
{
	tileX = Math.floor(worldX/TileWidth);
	tileY = Math.floor(worldY/TileHeight);

	content = map[(tileY*MapHeight) + tileX];

	printMsg("Tile x: " + tileX + " Tile y: " + tileY + " Content: " + content);

	return content;
}
