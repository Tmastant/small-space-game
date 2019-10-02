$(document).ready(function(){
	
document.body.onmousedown = function() { return false; } //so page is unselectable

	//Canvas stuff
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
	var mx, my;
	var screen;
	
	var planetw = 200;
	var planeth = 200;
	tilesize = 8;
	zoom = 2;
	
	var cam_v = 1;
	var cam_a = 0.1;
	var dirx = -1;
	var diry = -1;
	var curplanet;
	
	var globalpower;
	var generatedpower;
	
	var msecx;
	var msecy;
	
	var amorite;
	var heatrocks;
	
	var cam1;
	var cam2;
	
	var grid = [];
	
	for(var i = 0; i < planetw; i++){
		grid[i] = [];
		for(var j = 0; j < planeth; j++){
			grid[i][j] = 0;
		}
	}
	
	var robots = [];
	var editor;
	
	function createRobot(x, y){
		robots.push(new Robot(x, y));
		editor = new robotedit(robots.length - 1);
	}
	
	function tile(x, y){
		this.x = x;
		this.y = y;
	}
	
	function Robot(x, y){
		this.x = x;
		this.y = y;
		this.texture = 100;
		this.standingon = 0;
		this.xcounter = 10;
		this.ycounter = 10;
		this.scaned = false;
		this.targets = [];
		this.ctarget = 0;
		this.isdone = false;
		this.range = 0;		// Range for collection (From -1/2 range to +1/2 range), In a square around the base point (83, 83 code) in this.scan function
		this.delay = 5;		// Delay before next movement can be issued
		
		this.inv = 0;		// Amount of (insert objective) robot is carrying
		this.standingon = grid[this.x][this.y];
		grid[this.x][this.y] = this.texture;
		
		this.move = function(dir){		// 0 - Right, 1 - Left, 2 - Up, 3 - Down
			if(dir == 0 && grid[x - 1][y] != 100){				// ADD MORE VALUES FOR MORE ROBOT SIZES *_*_*_*_*_*_*_*_*_*
				this.x++;
				grid[this.x - 1][this.y] = this.standingon;
				this.standingon = grid[this.x][this.y];
				grid[this.x][this.y] = this.texture;
			} else if(dir == 1 && grid[x + 1][y] != 100){
				this.x--;
				grid[this.x + 1][this.y] = this.standingon;
				this.standingon = grid[this.x][this.y];
				grid[this.x][this.y] = this.texture;
			} else if(dir == 2 && grid[x][y - 1] != 100){
				this.y++;
				grid[this.x][this.y - 1] = this.standingon;
				this.standingon = grid[this.x][this.y];
				grid[this.x][this.y] = this.texture;
			} else if(dir == 3 && grid[x][y + 1] != 100){
				this.y--;
				grid[this.x][this.y + 1] = this.standingon;
				this.standingon = grid[this.x][this.y];
				grid[this.x][this.y] = this.texture;
			} else {
				this.delay = this.delay + 10;
			}
		}
		
		this.scan = function(){			// 83, 83 IS SILO LOCATION			78, 78 ON GRID
			var temp = [];
			for(var i = (83 - (this.range / 2)); i < ((83 - (this.range / 2)) + this.range); i++){
				for(var j = (83 - (this.range / 2)); j < ((83 - (this.range / 2)) + this.range); j++){
					if(grid[i][j] == this.objective){
						temp.push(new tile(i, j));
					}
				}
			}
			this.targets = temp;
			this.scaned = true;
		}
		
		this.data = function(){
		}
		
		this.recall = function(){
			if(this.xcounter >= 0) this.xcounter--;
			if(this.ycounter >= 0) this.ycounter--;
			if(this.x < 82){
				if(this.xcounter <= 0){
					this.move(0);
					this.xcounter = this.delay;
				}
			}	if(this.x > 82){
				if(this.xcounter <= 0){
					this.move(1);
					this.xcounter = this.delay;
				}
			}
			if(this.y < 84){
				if(this.ycounter <= 0){
					this.move(2);
					this.ycounter = this.delay;
				}
			}
			if(this.y > 84){
				if(this.ycounter <= 0){
					this.move(3);
					this.ycounter = this.delay;
				}
			}
		}
	}
	
	function robotedit(bot){
		this.bot = bot;
		this.isdone = false;
		this.open = true;
		this.reqs = false;
		this.execute = false;
		this.objective = 0;	// 2 - Amorite, 3 - Heat Rock
		this.size = 0;	// Size;	 1 - 1
		this.job = 0;		// Job; 	Harvester -1
		this.mat = 0;	// Material;	Amorite - 1
		this.power = 0;
		this.index = 0;
		
		this.range = 0;
		
		this.draw = function(){
			if(this.open == false) ctx.globalAlpha = 0.3;
			ctx.fillStyle = 'black';
			ctx.fillRect(100, 60, 1100, 670);
			ctx.fillStyle = '#797986';
			ctx.fillRect(110, 70, 1080, 650);
			ctx.fillStyle = 'black';
			ctx.font = 'bold 18pt Trebuchet MS';
			
			if(this.size == 1){
				ctx.fillStyle = 'green';
				ctx.fillRect(157, 127, 70, 70);
			}
			ctx.fillStyle = 'black';
			ctx.fillText("Size", 130, 100);
			ctx.fillRect(570, 70, 5, 550);
			ctx.fillRect(109, 620, 1090, 5);
			ctx.fillRect(158, 128, 68, 68);
			ctx.drawImage(robot1img, 160, 130, 64, 64);
			ctx.fillStyle = 'black';
			ctx.fillRect(258, 128, 68, 68);
			ctx.drawImage(undiscoveredrobotimg, 260, 130, 64, 64);
			ctx.fillRect(358, 128, 68, 68);
			ctx.drawImage(undiscoveredrobotimg, 360, 130, 64, 64);
			ctx.fillRect(458, 128, 68, 68);
			ctx.drawImage(undiscoveredrobotimg, 460, 130, 64, 64);
				
			if(this.job == 1){
				ctx.fillStyle = 'green';
				ctx.fillRect(157, 319, 70, 70);
			}
			ctx.fillStyle = 'black';
			ctx.fillText("Type", 130, 276);
			ctx.fillRect(100, 246, 470, 5);
			ctx.fillStyle = 'black';
			ctx.fillRect(158, 320, 68, 68);
			ctx.drawImage(harvesterimg, 160, 322, 64, 64);
			ctx.fillStyle = 'black';
			ctx.fillRect(258, 320, 68, 68);
			ctx.drawImage(undiscoveredjob, 260, 322, 64, 64);
			ctx.fillStyle = 'black';
			ctx.fillRect(358, 320, 68, 68);
			ctx.drawImage(undiscoveredjob, 360, 322, 64, 64);
			ctx.fillStyle = 'black';
			ctx.fillRect(458, 320, 68, 68);
			ctx.drawImage(undiscoveredjob, 460, 322, 64, 64);
			
			if(this.mat == 1){
				ctx.fillStyle = 'green';
				ctx.fillRect(157, 527, 70, 70);
			}
			ctx.fillStyle = 'black';
			ctx.fillText("Material", 130, 482);
			ctx.fillRect(100, 452, 470, 5);
			ctx.fillStyle = 'black';
			ctx.fillRect(158, 528, 68, 68);
			ctx.drawImage(amoriteimg, 160, 530, 64, 64);
			ctx.fillStyle = 'black';
			ctx.fillRect(258, 528, 68, 68);
			ctx.drawImage(undiscoveredimg, 260, 530, 64, 64);
			ctx.fillRect(358, 528, 68, 68);
			ctx.drawImage(undiscoveredimg, 360, 530, 64, 64);
			ctx.fillRect(458, 528, 68, 68);
			ctx.drawImage(undiscoveredimg, 460, 530, 64, 64);
			
			if(this.job == 1){
				ctx.fillRect(575, 226, 620, 5);
				ctx.fillText("Range of search and collection:", 600, 100);
				
				if(this.range == 16){
					ctx.fillStyle = 'green';
					ctx.fillRect(603, 128, 104, 54);
				}
				if(this.range == 32){
					ctx.fillStyle = 'green';
					ctx.fillRect(713, 128, 104, 54);
				}
				if(this.range == 48){
					ctx.fillStyle = 'green';
					ctx.fillRect(823, 128, 104, 54);
				}
				if(this.range == 64){
					ctx.fillStyle = 'green';
					ctx.fillRect(933, 128, 104, 54);
				}
				if(this.range == 128){
					ctx.fillStyle = 'green';
					ctx.fillRect(1043, 128, 104, 54);
				}
				ctx.fillStyle = 'black';
				ctx.fillRect(604, 129, 102, 52);
				ctx.fillStyle = '#c0c0c0';
				ctx.fillRect(605, 130, 100, 50);
				ctx.fillStyle = 'black';
				ctx.font = '14pt Arial';
				ctx.fillText("16 Sectors", 610, 162);
				
				ctx.fillStyle = 'black';
				ctx.fillRect(714, 129, 102, 52);
				ctx.fillStyle = '#c0c0c0';
				ctx.fillRect(715, 130, 100, 50);
				ctx.fillStyle = 'black';
				ctx.font = '14pt Arial';
				ctx.fillText("32 Sectors", 720, 162);
				
				ctx.fillStyle = 'black';
				ctx.fillRect(824, 129, 102, 52);
				ctx.fillStyle = '#c0c0c0';
				ctx.fillRect(825, 130, 100, 50);
				ctx.fillStyle = 'black';
				ctx.font = '14pt Arial';
				ctx.fillText("48 Sectors", 830, 162);
				
				ctx.fillStyle = 'black';
				ctx.fillRect(934, 129, 102, 52);
				ctx.fillStyle = '#c0c0c0';
				ctx.fillRect(935, 130, 100, 50);
				ctx.fillStyle = 'black';
				ctx.font = '14pt Arial';
				ctx.fillText("64 Sectors", 940, 162);
				
				ctx.fillStyle = 'black';
				ctx.fillRect(1044, 129, 102, 52);
				ctx.fillStyle = '#c0c0c0';
				ctx.fillRect(1045, 130, 100, 50);
				ctx.fillStyle = 'black';
				ctx.font = '14pt Arial';
				ctx.fillText("128 Sectors", 1045, 162);
				
				ctx.font = 'bold 18pt Trebuchet MS';
				ctx.fillStyle = 'black';
				ctx.fillText("Material for collection", 600, 256);
				
				if(this.objective == 2){
					ctx.fillStyle = 'green';
					ctx.fillRect(602, 278, 68, 68);
				}
				if(this.objective == 3){
					ctx.fillStyle = 'green';
					ctx.fillRect(732, 278, 68, 68);
				}
				ctx.fillStyle = 'black';
				ctx.fillRect(603, 279, 66, 66);
				ctx.drawImage(amoriteimg, 604, 280, 64, 64);
				ctx.fillStyle = 'black';
				ctx.font = 'bold 14pt Arial';
				ctx.fillText("Amorite", 603, 365);
				ctx.font = '12pt Arial';
				ctx.fillText("Basic Building", 585, 385);
				ctx.fillText("Material", 585, 405);
				
				ctx.fillStyle = 'black';
				ctx.fillRect(733, 279, 66, 66);
				ctx.drawImage(heatrocksimg, 734, 280, 64, 64);
				ctx.fillStyle = 'black';
				ctx.font = 'bold 14pt Arial';
				ctx.fillText("Heat Rocks", 717, 365);
				ctx.font = '12pt Arial';
				ctx.fillText("Generates Power", 710, 385);
				
				ctx.fillStyle = 'black';
			}
			ctx.font = 'bold 14pt Arial';
			ctx.fillText("Power Consumption: " + this.power + " W", 120, 650);
			
			
			if(this.mat != 0 && this.job != 0 && this.size != 0){
				if(this.job == 1){
					if(this.range != 0){
						this.reqs = true;
					}
				}
			}
			if(this.reqs == false){
				ctx.fillStyle = '#FF0F27';
				ctx.font = 'bold 13pt Arial';
				ctx.fillText("Robot Requirements not met.", 777, 710);
				ctx.fillStyle = 'black';
			}
			else if(this.reqs == true){
				ctx.fillStyle = 'lime';
				ctx.font = 'bold 13pt Arial';
				ctx.fillText("Requirements met!", 835, 710);
				ctx.fillStyle = 'black';
			}
			
			
			
			ctx.fillStyle = 'black';
			ctx.fillRect(1038, 638, 144, 74);
			ctx.fillStyle = 'grey';
			ctx.fillRect(1040, 640, 140, 70);
			ctx.fillStyle = 'black';
			ctx.font = '33pt Arial';
			ctx.fillText("Finish!", 1047, 694);
			ctx.font = 'bold 14pt Arial';
			
			
			
			
			ctx.globalAlpha = 1;
		}
		
		var code = function(){
				if(this.targets.length > 0){
					if(this.xcounter >= 0) this.xcounter--;
					if(this.ycounter >= 0) this.ycounter--;
					if(this.x < this.targets[this.ctarget].x){
						if(this.xcounter <= 0){
							this.move(0);
							if(this.standingon != (2 || 3)) this.xcounter = this.delay;
							else{
								this.xcounter = this.delay  * 2;
								this.ycounter = this.delay * 2;
							}
						}
					}
					if(this.x > this.targets[this.ctarget].x){
						if(this.xcounter <= 0){
							this.move(1);
							if(this.standingon != (2 || 3)) this.xcounter = this.delay;
							else{
								this.xcounter = this.delay * 2;
								this.ycounter = this.delay * 2;
							}
						}
					}
					if(this.y < this.targets[this.ctarget].y){
						if(this.ycounter <= 0){
							this.move(2);
							if(this.standingon != (2 || 3)) this.ycounter = this.delay;
							else{
								this.xcounter = this.delay * 2;
								this.ycounter = this.delay * 2;
							}
						}
					}
					if(this.y > this.targets[this.ctarget].y){
						if(this.ycounter <= 0){
							this.move(3);
							if(this.standingon != (2 || 3)) this.ycounter = this.delay;
							else{
								this.xcounter = this.delay * 2;
								this.ycounter = this.delay * 2;
							}
						}
					}
					
					if(this.x == this.targets[this.ctarget].x && this.y == this.targets[this.ctarget].y){
						this.inv += (8 + rand(12));
						if(rand(8) == 1) this.delay++;
						this.standingon = 40 + rand(3);
						this.targets.splice(this.ctarget, 1);
						this.ctarget = closestTile(this.x, this.y, this.targets);
					}
					
				} else if(this.job == 1 && this.targets.length == 0 && this.x >= 82 && this.x <= 84 && (this.y == 84 || this.y == 85) && this.inv == 0 && robots[this.index].index == this.index){
					grid[this.x][this.y] = this.standingon;
					amorite += 50;
					globalpower -= this.power;
					robots.splice(this.index, 1);
					for(var i = 0; i < (robots.length - 1); i++){
						robots[this.index + i].index--;
					}
				} else if(this.targets.length <= 0){
					this.recall();
					if(this.standingon == 23){
						if(this.inv > 0){
							if(this.objective == 2){
								this.inv--;
								amorite++;
								this.delay = 10;
							} else if(this.objective == 3){
								this.inv--;
								heatrocks++;
								this.delay = 10;
							}
						}
					}
				} else{
					console.log("Internal Error occured. Try to restart your browser");
				}
		}
		this.execute = function(){
			robots[bot].size = this.size;	// Size;	 1 - 1
			robots[bot].job = this.job;		// Job; 	Harvester -1
			robots[bot].mat = this.mat;	// Material;	Amorite - 1
			
			robots[bot].power = this.power;
			robots[bot].range = this.range;
			robots[bot].objective = this.objective;
			
			robots[bot].index = bot;
			robots[bot].data = code;
			robots[bot].isdone = true;
			globalpower += this.power;
		}
	}
	
	function closestTile(x, y, array){
		var result = 0;
		for(var i = 0; i < array.length; i++){
			if(Math.sqrt(((x - array[i].x) ^ 2) + ((y - array[i].y) ^ 2)) < Math.sqrt(((x - array[result].x) ^ 2) + ((y - array[result].y) ^ 2))){
				result = i;
			}
		}
		console.log(result);
		return result;
	}
	
	function planet(x, y, w, h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		
		this.draw = function(){
			ctx.drawImage(planetimg, x, y, w, h);
		}
	}
	
	function UI(){
			msecx = (Math.ceil(mx / tilesize) + (cam1)) / zoom - 6;		// Mouse Sector coorinates
			msecy = (Math.ceil(my / tilesize) + (cam2)) / zoom - 6;
			
			ctx.fillStyle = 'black';						// Bottom Menu thing
			ctx.fillRect(0, 650, w, 200);
			ctx.fillStyle = 'gray'
			ctx.fillRect(0, 655, w, 200);
			
			ctx.font = '15pt Arial';		// Sector Display
			ctx.fillStyle = 'black';
			ctx.fillText("Sector: " + Math.ceil(msecx) + ", " + Math.ceil(msecy), (w / 2) - ctx.measureText("Sector: " + Math.ceil(msecx) + ", " + Math.ceil(msecy)).width, 60);
			ctx.font = '15.5pt Arial';
			ctx.fillStyle = 'lime';
			ctx.fillText("Sector: " + Math.ceil(msecx) + ", " + Math.ceil(msecy), (w / 2) - ctx.measureText("Sector: " + Math.ceil(msecx) + ", " + Math.ceil(msecy)).width, 60);
			ctx.font = '18pt Arial';
			ctx.fillStyle = 'black';
			ctx.fillText("Planet " + curplanet, (w / 2) - ctx.measureText("Planet " + curplanet).width, 25);			// Planet
			ctx.font = '18.5pt Arial';
			ctx.fillStyle = 'white';
			ctx.fillText("Planet " + curplanet,  (w / 2) - ctx.measureText("Planet " + curplanet).width, 25);
			
			ctx.fillStyle = 'black';						// Create Robot Button
			ctx.fillRect(521, 676, 150, 50);
			ctx.fillStyle = 'grey';
			ctx.fillRect(526, 681, 140, 40);
			ctx.fillStyle = 'black';
			ctx.font = '16pt Arial';
			ctx.fillText("Create Robot", (w / 2) - ctx.measureText("Create Robot").width, h - 50);
			
			ctx.fillStyle = 'black';
			ctx.font = '16pt Arial';
			ctx.fillText('Global Power consumed: ' + (Math.round(globalpower * 10) / 10) + " W", 685, 685);				// Global power reading
			
			ctx.fillStyle = 'black';
			ctx.fillRect(683, 698, 284, 14);
			ctx.fillStyle = '#38FF2E';
			ctx.fillRect(685, 700, 280, 10);
			ctx.fillStyle = '#A30000';
			if(globalpower < generatedpower) ctx.fillRect(685, 700, Math.round(280 * (globalpower / generatedpower)), 10);				// Power Meter
			else {
				ctx.fillStyle = 'orange';
				ctx.fillRect(685, 700, 280, 10);
			}
			ctx.fillStyle = 'black';
			
			
			ctx.fillStyle = 'black';
			ctx.font = '16pt Arial';
			ctx.fillText('Global Power generated: ' + (Math.round(generatedpower * 10) / 10) + " W", 685, 735);				// Global power reading
			
			ctx.fillStyle = 'black';
			ctx.font = 'bold 16pt Arial';
			ctx.fillText('Resources', 5, 675);				// Resources
			
			ctx.fillStyle = '#ABC4CC';
			ctx.fillRect(2, 680, 400, 75);
			
			ctx.fillStyle = 'black';
			ctx.font = '13pt Arial';
			ctx.fillText('Amorite: ' + amorite, 5, 695);				// Amorite
			ctx.fillStyle = 'blue';
			ctx.font = '12.9pt Arial';
			ctx.fillText('Amorite: ' + amorite, 5, 695);
			
	}
	
	function overheat(){
		ctx.fillStyle = '#5e0311';
		ctx.fillStyle = '11pt Arial';
		ctx.fillText("Power Exhausted! Generate More power to recover Robot efficiency", 520, 750);
		
	}
	
	function camera(){
			for(var i =0; i < planetw; i++){
				for(var j = 0; j < 5; j++){
					grid[j][i] = 1;
					grid[planetw - (j + 1)][i] = 1;
				}
			}
			for(var i =0; i < planeth; i++){
				for(var j = 0; j < 5; j++){
					grid[i][j] = 1;
					grid[i][planeth - (j + 1)] = 1;
				}
			}
			if(cam2 > 0 && diry == 0){
				cam2 -= cam_v;
				if(cam2 < 0) cam2 = 0;
			}
			if(cam2 < (planeth - ((h / tilesize) / zoom)) * zoom && diry == 1){
				cam2 += cam_v;
				if(cam2 > (planeth - ((h / tilesize) / zoom)) * zoom) cam2 = (planeth - ((h / tilesize) / zoom)) * zoom;
			}
			if(cam1 > 0 && dirx == 0){
				cam1 -= cam_v;
				if(cam1 < 0) cam1 = 0;
			}
			if(cam1 < (planetw - ((w / tilesize) / zoom)) * zoom && dirx == 1){
				cam1 += cam_v;
				if(cam1 > (planetw - ((w / tilesize) / zoom)) * zoom) cam1 = (planetw - ((w / tilesize) / zoom)) * zoom;
			}
	}
	
	function patch(x, y, planet){
		this.x = x;
		this.y = y;
		this.w = 5 + rand(5);
		this.h = 5 + rand(5);
		this.planet = planet;
		this.col = (40 + rand(3));
		
		this.draw = function(){
			for(var i = 0; i < this.w; i++){
				for(var j = 0; j < this.h; j++){
					grid[this.x + i][this.y + j] = 40 + rand(3);
				}
			}
			
		}
		
	}
	function resource(x, y, planet, type){
		this.x = x;
		this.y = y;
		this.w = 4 + rand(3);
		this.h = 4 + rand(3);
		this.planet = planet;
		this.col = type;
		
		this.draw = function(){
			for(var i = 0; i < this.w; i++){
				for(var j = 0; j < this.h; j++){
					var random = rand(8);
					if(random > i && random < this.w + j) grid[this.x + i][this.y + j] = this.col;
				}
			}
			
		}
		
	}
	
	function ambience(){
		var asttimer = 100;
		
		this.tick = function(timer){
			if(asttimer > 0) asttimer--;
			if(asttimer <= 0){
				ambienceo.push(new asteroid(rand(h- 65) + 65, (rand(3) - 1.5)));
				asttimer = timer + rand(200);
			}
		}
	}
	
	function asteroid(y, ang){
		this.x = -100;
		this.y = y;
		this.w = 20 + rand(10);
		this.h = 20 + rand(10);
		
		this.tick = function(){
			ctx.fillStyle = '#36373B';
			ctx.fillRect(this.x, this.y, this.w, this.h);
			this.x += 10;
			this.y += ang;
		}
	}
	
	function click(x1, y1, x2, y2){
		if(mx >= x1 && mx <= x2 && my >= y1 && my <= y2) return true;
		else return false;
	}
	
	function hut(x, y){
			grid[x][y] = 20;
			grid[x][y + 1] = 22;
			grid[x - 1][y] = 21;
			grid[x - 1][y + 1] = 20;
			grid[x + 1][y] = 21;
			grid[x + 1][y + 1] = 20;
	}
	
	function button(x, y, screen, text){
		this.x = x;
		this.y = y;
		this.w = 90;
		this.h = 40;
		this.screen = screen;
		this.text = text;
		
		this.draw = function(){
			ctx.fillStyle = 'red';
			ctx.fillRect(this.x - 5, this.y - 5, this.w + 10, this.h + 10);
			ctx.fillStyle = '#191E40';
			ctx.fillRect(this.x, this.y, this.w, this.h);
			ctx.fillStyle = 'green';
			ctx.font = '25pt Impact';
			ctx.fillText(this.text, this.x + 12, this.y + 33);
		}
	}
	
	var ambienceo = [];
	var buttons = [];
	var ambience = new ambience();	// Ambience controller object
	buttons.push(new button(110, 180, 1, "Start"));
	buttons.push(new button(113, 250, 2, "Help"));
	function rand(n){return Math.floor(Math.random() * n)}
	
	var planetimg = new Image();
	var amoriteimg = new Image();
	var heatrocksimg = new Image();
	var harvesterimg = new Image();
	var undiscoveredimg = new Image();
	var undiscoveredrobotimg = new Image();
	var undiscoveredjob = new Image();
	var robot1img = new Image();
	var loadingplanet = new planet(600, 250, 400, 400);
	
	var patches = [];
	for(var i = 0; i < 165; i++){
		patches.push(new patch(5 + rand(179), 5 + rand(179), 1));
	}
	for(var i = 0; i < patches.length; i++){
		patches[i].draw();
	}
	
	var resources = [];
	for(var i = 0; i < 45; i++){
		if(rand(10) > 3)resources.push(new resource(5 + rand(179), 5 + rand(179), 1, 2));
		if(rand(10) > 5) resources.push(new resource(5 + rand(179), 5 + rand(179), 1, 3));
	}
	for(var i = 0; i < resources.length; i++){
		resources[i].draw();
	}
	var huts = [];
	huts.push(new hut(95, 75));
	huts.push(new hut(100, 76));
	
	{
	grid[82][83] = 20;
	grid[84][83] = 20;
	grid[82][82] = 21;
	grid[84][82] = 21;
	grid[83][82] = 20;
	grid[83][83] = 22;
	
	grid[82][81] = 20;
	grid[84][81] = 20;
	grid[82][80] = 21;
	grid[84][80] = 21;
	grid[83][80] = 20;
	grid[83][81] = 20;
	
	grid[82][79] = 21;
	grid[83][79] = 21;
	grid[84][79] = 21;
	grid[81][78] = 21;
	grid[85][78] = 21;
	grid[85][77] = 21;
	grid[81][77] = 21;
	grid[81][76] = 21;
	grid[82][76] = 21;
	grid[83][76] = 21;
	grid[84][76] = 21;
	grid[85][76] = 21;
	
	grid[82][78] = 20;
	grid[83][78] = 20;
	grid[84][78] = 20;
	grid[82][77] = 22;
	grid[83][77] = 22;
	grid[84][77] = 22;
	
	
	
	grid[83][84] = 23;
	grid[82][84] = 23;
	grid[84][84] = 23;
	grid[82][85] = 23;
	grid[83][85] = 23;
	grid[84][85] = 23;
	
	grid[97][78] = 100;
	}
	/////////////////////////////////
	////////////////////////////////
	////////	GAME INIT
	///////	Runs this code right away, as soon as the page loads.
	//////	Use this code to get everything in order before your game starts 
	//////////////////////////////
	/////////////////////////////
	function init()
	{
		screen = 0;
		planetimg.src = "Images/planet1.jpg";
		amoriteimg.src = "Images/amorite.png";
		heatrocksimg.src = "Images/Heatrock.png";
		harvesterimg.src = "Images/harvester.png";
		undiscoveredimg.src = "Images/undiscovered.png";
		undiscoveredjob.src = "Images/unknownjob.png";
		undiscoveredrobotimg.src = "Images/Robots/undiscoveredrobot.png";
		robot1img.src = "Images/Robots/Robot1.png";
		
		cam1 = 120;
		cam2 = 120;
		
		cam_v = 2;
		dirx = -1;
		diry = -1;
		curplanet = "183E";
		
		msecx = 0;
		msecy = 0;
		
		globalpower = 0;
		generatedpower = 50;
		
		amorite = 200;
		heatrocks = 0;
		
	//////////
	///STATE VARIABLES
	
	//////////////////////
	///GAME ENGINE START
	//	This starts your game/program
	//	"paint is the piece of code that runs over and over again, so put all the stuff you want to draw in here
	//	"60" sets how fast things should go
	//	Once you choose a good speed for your program, you will never need to update this file ever again.

	if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 16.67);
	}

	init();	
	


	
	
	///////////////////////////////////////////////////////
	//////////////////////////////////////////////////////
	////////	Main Game Engine
	////////////////////////////////////////////////////
	///////////////////////////////////////////////////
	function paint()
	{
		
		ctx.fillStyle = 'white';
		ctx.fillRect(0,0, w, h);
		if(screen == 0){
			ctx.fillStyle = '#0a0a0a';
			ctx.fillRect(0,0, w, h);
			ctx.globalAlpha = 0.9;
			ctx.font = 'bold 69.6pt Impact';
			ctx.fillStyle = 'white';
			ctx.fillText("Game Name", 200, 120);
			ctx.font = 'bold 69.5pt Impact';
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'black';
			ctx.fillText("Game Name", 200, 120);
			ctx.font = 'bold 69pt Impact';
			ctx.globalAlpha = 1;
			ctx.fillStyle = 'yellow';
			ctx.fillText("Game Name", 200, 120);
			loadingplanet.draw();
			ambience.tick();
			for(var i = 0; i < ambienceo.length; i++){
				ambienceo[i].tick();
				if(ambienceo[i] instanceof asteroid){
					if(ambienceo[i].x >= 2000){
						ambienceo.splice(i, 1);
					}
				}
			}
			for(var i = 0; i < buttons.length; i++){
			buttons[i].draw();
			}
		}
		else if(screen == 1){
			ctx.fillStyle = '#0a0a0a';
			ctx.fillRect(0,0, w, h);
			
			for(var i = 0; i < planetw; i++){
				for(var j = 0; j < planeth; j++){
					ctx.fillStyle = "#000000";
					if(grid[i][j] == 0) ctx.fillStyle = '#7A7D82';		// Base rock
					if(grid[i][j] == 1) ctx.fillStyle = '#0a0a0a';			// Space
					if(grid[i][j] == 20) ctx.fillStyle = '#1468F5';			// Blue Base
					if(grid[i][j] == 21) ctx.fillStyle = '#20375E';			// Dark Base
					if(grid[i][j] == 22) ctx.fillStyle = '#FFFEF2';			// Entrance Base
					if(grid[i][j] == 23) ctx.fillStyle = '#ABC4CC';			// Edit Tiles
					if(grid[i][j] == 40) ctx.fillStyle = '#6D7075';			// Darker Rock
					if(grid[i][j] == 41) ctx.fillStyle = '#756D6F';			// Sand Rock
					if(grid[i][j] == 42) ctx.fillStyle = '#919499';			// Light Rock
					
					
					ctx.fillRect(i * tilesize * zoom - (cam1 * tilesize), j * tilesize * zoom - (cam2 * tilesize), zoom * tilesize - 0.2, zoom * tilesize - 0.2);
					if(grid[i][j] == 2) ctx.drawImage(amoriteimg, i * tilesize * zoom - (cam1 * tilesize) - 0.05, j * tilesize * zoom - (cam2 * tilesize) - 0.05, zoom * tilesize - 0.05, zoom * tilesize - 0.05);
					if(grid[i][j] == 3) ctx.drawImage(heatrocksimg, i * tilesize * zoom - (cam1 * tilesize) - 0.05, j * tilesize * zoom - (cam2 * tilesize) - 0.05, zoom * tilesize - 0.05, zoom * tilesize - 0.05);
					if(grid[i][j] == 100) ctx.drawImage(robot1img, i * tilesize * zoom - (cam1 * tilesize), j * tilesize * zoom - (cam2 * tilesize), zoom * tilesize - 0.1, zoom * tilesize - 0.1);
				}
			}
			UI();
			camera();
			for(var i = 0; i < robots.length; i++){
				if(robots[i].isdone == true){
					if(robots[i].job == 1 && robots[i].scaned == false) robots[i].scan();
					robots[i].data();
				}
			}
			if(editor instanceof robotedit){
				if(editor.isdone == false){
					editor.draw();
				}
			}
			if(globalpower > generatedpower){
				overheat();
				for(var i = 0; i < robots.length; i++){
					robots[i].delay = 50;
				}
			}
			if(heatrocks > 0){
				generatedpower += 0.1;
				heatrocks--;
			}
			if(rand(400) == 1) amorite++;		// Adds Ambient Amorite
		}
		ctx.fillStyle = 'yellow';
		ctx.fillText(mx + ", " + my + " " + robots.length, 40, 40);
	}////////////////////////////////////////////////////////////////////////////////END PAINT/ GAME ENGINE
	

	
	
	////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////
	/////	MOUSE LISTENER 
	//////////////////////////////////////////////////////
	/////////////////////////////////////////////////////
	





	/////////////////
	// Mouse Click
	///////////////
	canvas.addEventListener('click', function (evt){
		if(screen == 0){
			for(var i = 0; i < buttons.length; i++){
				if(mx >= buttons[i].x && mx <= buttons[i].x + buttons[i].w && my >= buttons[i].y && my <= buttons[i].y + buttons[i].h){
						screen = buttons[i].screen;
				}
			}  
		}
		if(screen == 1){
			if(mx > 520 && mx <= 670 && my > 675 && my <= 725 && amorite >= 100 && grid[83][84] != (100)){	// (100 || ) ** ADD OR STATEMENT FOR MORE ROBOTS
				createRobot(83, 84);
				amorite-= 100;
			}
			
			if(editor instanceof robotedit){
				if(editor.isdone == false && editor.open == true && mx > 1200 || mx < 100 || my < 60 || my > 730){
					editor.open = false;
				}
				if(editor.isdone == false && editor.open == false && mx <= 1200 && mx >= 100 && my >= 60 && my <= 730){
					editor.open = true;
				}
				
				if(editor.isdone == false && editor.open == true && editor.isdone == false){
					if(click(158, 128, 225, 195)){
						if(editor.size != 1) editor.power += 5;
						editor.size = 1;
					} else if(click(158, 320, 225, 388)){
						if(editor.job != 1) editor.power += 5;
						editor.job = 1;
					} else if(click(158, 528, 225, 595)){
						if(editor.mat != 1) editor.power += 5;
						editor.mat = 1;
					}
				}
				if(editor.isdone == false && editor.open == true && editor.job == 1){
					if(click(604, 129, 705, 180)){
						if(editor.range == 0) editor.power += 4;
						if(editor.range == 32) editor.power -= 4;
						if(editor.range == 48) editor.power -= 8;
						if(editor.range == 64) editor.power -= 12;
						if(editor.range == 128) editor.power -= 16;
						editor.range = 16;
					} else if(click(714, 129, 815, 180)){
						if(editor.range == 0) editor.power += 8;
						if(editor.range == 16) editor.power += 4;
						if(editor.range == 48) editor.power -= 4;
						if(editor.range == 64) editor.power -= 8;
						if(editor.range == 128) editor.power -= 12;
						editor.range = 32;
					} else if(click(824, 129, 924, 180)){
						if(editor.range == 0) editor.power += 12;
						if(editor.range == 16) editor.power += 8;
						if(editor.range == 32) editor.power += 4;
						if(editor.range == 64) editor.power -= 4;
						if(editor.range == 128) editor.power -= 8;
						editor.range = 48;
					} else if(click(935, 129, 1035, 180)){
						if(editor.range == 0) editor.power += 16;
						if(editor.range == 16) editor.power += 12;
						if(editor.range == 32) editor.power += 8;
						if(editor.range == 48) editor.power += 4;
						if(editor.range == 128) editor.power -= 4;
						editor.range = 64;
					} else if(click(1044, 129, 1144, 180)){
						if(editor.range == 0) editor.power += 20;
						if(editor.range == 16) editor.power += 16;
						if(editor.range == 32) editor.power += 12;
						if(editor.range == 48) editor.power += 8;
						if(editor.range == 64) editor.power += 4;
						editor.range = 128;
					}
					
					if(click(603, 279, 669, 345)){
						editor.objective = 2;
					} else if(click(733, 279, 799, 345)){
						editor.objective = 3;
					}
				}
				if(editor.isdone == false && editor.open == true && editor.mat != 0 && editor.job != 0 && editor.size != 0 && click(1038, 638, 1172, 712)){
					if(editor.job == 1){
						if(editor.range != 0){
							editor.execute();
							editor.open = false;
							editor.isdone = true;
						}
					}
				} else if(editor.isdone == false && click(1038, 638, 1172, 712)){
					editor.reqs = false;
				}
			}
		}
	      
	}, false);

	
	

	canvas.addEventListener ('mouseout', function(){pause = true;}, false);
	canvas.addEventListener ('mouseover', function(){pause = false;}, false);

      	canvas.addEventListener('mousemove', function(evt) {
        	var mousePos = getMousePos(canvas, evt);

		mx = mousePos.x;
		my = mousePos.y;

      	}, false);


	function getMousePos(canvas, evt) 
	{
	        var rect = canvas.getBoundingClientRect();
        	return {
          		x: evt.clientX - rect.left,
          		y: evt.clientY - rect.top
        		};
      	}
      

	///////////////////////////////////
	//////////////////////////////////
	////////	KEY BOARD INPUT
	////////////////////////////////


	

	window.addEventListener('keydown', function(evt){
		var key = evt.keyCode;
		
		if(key == 87){		// Cam up
			diry = 0;
			cam_v += cam_a;
		} else if (key == 83){	// Cam down
			diry = 1;
			cam_v += cam_a;
		} else if(key == 65){		// Cam Left
			dirx = 0;
			cam_v += cam_a;
		} else if (key == 68){		// Cam right
			dirx = 1;
			cam_v += cam_a;
		}
		
		
	//p 80
	//r 82
	//1 49
	//2 50
	//3 51
		
	}, false);
	
	window.addEventListener('keyup', function(evt){
		var key = evt.keyCode;
		
		if(key == 87){		// Cam up
			diry = -1;
			cam_v = 3;
		} else if (key == 83){	// Cam down
			diry = -1;
			cam_v = 3;
		} else if(key == 65){		// Cam Left
			dirx = -1;
			cam_v = 3;
		} else if (key == 68){		// Cam right
			dirx = -1;
			cam_v = 3;
		}
		
		
	//p 80
	//r 82
	//1 49
	//2 50
	//3 51
		
	}, false);
	
	$(window).bind('mousewheel', function(event) {
		if (event.originalEvent.wheelDelta >= 0) {
			if(zoom < 2){
				if(zoom == 0.5){
					zoom = 1;
					cam1 += planetw / 2 - 75;
					cam2 += planeth / 2 - 70;
				}else if (zoom == 1){
					zoom = 2;
					cam1 += 93;
					cam2 += 77;
				}
			}
		}
		else {
			if(zoom > 0.5){
				if(zoom == 2){
					zoom = 1;
					cam1 -= planetw / 1.2 - 73;
					cam2 -= planeth / 1.2 - 90;
				}
				else if(zoom == 1){
					zoom = 0.5;
					cam1 = 0;
					cam2 = 0;
				}
			}
		}
	});



})
