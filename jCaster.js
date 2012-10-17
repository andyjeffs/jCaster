//jCaster - a HTML5 JavaScript Ray Caster - Andrew Jeffs 2012

// world constants
var MapWidth = 10;
var MapHeight = 10;
var TileWidth = 64;
var TileHeight = 64;

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

// get the canvas
var canvas = document.getElementById("canvasID").getContext("2d");

// set the canvas size - not working??
//canvas.width = MapWidth*TileWidth;
//canvas.height = MapHeight*TileHeight;

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

drawMap();


