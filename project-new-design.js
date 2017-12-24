let boardElement = document.getElementById("rectangle"), boardElementStyle = getComputedStyle(boardElement);
topOffset = 0, leftOffset = 0;

let tileElement = document.getElementById("tileElem"), tileElementStyle = getComputedStyle(tileElement);
let tileBorderWidth = parseInt(tileElementStyle.borderWidth, 10),
	tileElementWidth = parseInt(tileElementStyle.width, 10),
	tileElementHeight = parseInt(tileElementStyle.height, 10);
tileElement.parentNode.removeChild(tileElement);

let scoreElement = document.getElementById("score-num");

let	tileWidth = tileElementWidth + (tileBorderWidth * 2), tileHeight = tileElementHeight + (tileBorderWidth * 2); 
let colorArray = ['DeepPink','GreenYellow', 'LightSeaGreen', 'Gold', 'DarkOrchid'];

let rows = 15, columns = 15;
let deltaT = 0.5, animationTime = 200;

let scoreBlock = {
	combo: 1,
	tileNum: 0,
	scoreNum: 0
}

function Tile(i, j) {
		this.id = i + '_' + j,
		this.TileXPos = i * tileHeight,
		this.TileYPos = j * tileWidth,
		this.color = '',
		this.emptyCell = true,
		this.checked = false,
		this.setRandomColor = 
			function (min, max, colorArray) {
				this.color = colorArray[Math.floor(Math.random() * (max - min + 1)) + min];
				if (this.checkMatch()) {
					max -= 1;
					let tempColorArr = colorArray.slice(),
						removeColor = tempColorArr.indexOf(this.color);
					tempColorArr.splice(removeColor, 1);
					this.setRandomColor(min, max, tempColorArr);
				}
			}
		this.checkMatch = function () {

			let n = j - 2;
			for (let m = 0; m < 3; m++) {
				if (n >= 0 && (n + 2)<= columns -1 && (n + 1) <= columns - 1 
					&& !canvas.grid[i][n].checked && !canvas.grid[i][n + 1].checked && !canvas.grid[i][n + 2].checked
					&& canvas.grid[i][n].color == canvas.grid[i][n + 1].color && canvas.grid[i][n].color == canvas.grid[i][n + 2].color) {
					return true;
				}
				n++;
			}

			n = i - 2;
			for (let m = 0; m < 3; m++) {
				if (n >= 0 && (n + 2)<= rows - 1 && (n + 1) <= rows - 1 
					&& !canvas.grid[n][j].checked && !canvas.grid[n + 1][j].checked && !canvas.grid[n + 2][j].checked
					&& canvas.grid[n][j].color == canvas.grid[n + 1][j].color && canvas.grid[n][j].color == canvas.grid[n + 2][j].color) {
					return true;
				}
				n++;
			}

		return false;
	}
};

let	canvas = {
	grid: [],
	width: '',
	height: '',
	canMove: false,
	userInput: false,
	firstUserSwap: false,
	groups: 0,
	matches: [],
	swappedElements: [],
		
	initCanvas: function() {
		boardElement.style.width = columns * tileWidth + 'px';
		this.width = parseInt(boardElement.style.width, 10);
		boardElement.style.height = rows * tileHeight + 'px';
		this.height = parseInt(boardElement.style.height, 10);
		leftOffset = boardElement.getBoundingClientRect().left + window.pageXOffset;
		topOffset = boardElement.getBoundingClientRect().top + window.pageYOffset;
		this.listenerMouseDown();
		this.listenerMouseUp();
		this.listenerMouseMove();
		this.initGrid();
	},
	
	initGrid: function() {
		let container = boardElement;
		for (let i = 0; i < rows; i++) {
			this.grid[i] = new Array();
			for (let j = 0; j < columns; j++) {
				this.grid[i][j] = new Tile(i, j);
			}
		}
		this.initDivElements();
	},

	initDivElements: function() {
		let container = boardElement;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				let elem = document.createElement("DIV");
				elem.setAttribute("id", i + '_' + j);
				container.appendChild(elem);
			}
		}
		this.initTileProperties();
	},
	
	initTileProperties: function() {
		for (let i = rows - 1; i >= 0; i--) {
			for (let j = columns - 1; j >= 0; j--) {
				if (this.grid[i][j].emptyCell) {
					let elem = document.getElementById(this.grid[i][j].id);
					elem.style.left = this.grid[i][j].TileYPos + 'px';
					this.grid[i][j].setRandomColor(0, colorArray.length - 1, colorArray);
				}
			}
		}
	},

	listenerMouseDown: function () {
		let self = this;
		boardElement.onmousedown = function (e) {
			if (self.userInput) {
				let startXPos, startYPos;
				startXPos = e.pageX;
				startYPos = e.pageY;
				boardElement.style.cursor = 'move';
				self.firstUserSwap = true;
				let i = Math.floor((startYPos - topOffset) / tileHeight), j = Math.floor((startXPos - leftOffset) / tileWidth);
				let elId = i + '_' + j;
				if (i >= 0 && j >= 0 && i < rows && j < columns) {
					self.swappedElements[0] = {id: elId, rowNum: i, colNum: j};
					self.canMove = true;
				}
			}
		};
	},


	listenerMouseUp: function () {
		let self = this;
		document.addEventListener("mouseup", function() {
			boardElement.style.cursor = 'default';
			if (self.canMove && !self.userInput) {
				self.userInput = true;
				self.canMove = false;
				self.swappedElements = [];
			}
			self.canMove = false;
		});
	},

	listenerMouseMove: document.onmousemove = function(event) {
		let self = canvas;
		if (self.canMove) {
			self.userInput = false;
			let currentX, currentY;
			currentX = event.pageX;
			currentY = event.pageY;
			let hoverPosY = Math.floor((currentX - leftOffset) / tileWidth);
			let hoverPosX = Math.floor((currentY - topOffset) / tileHeight);
			let difX = self.swappedElements[0].rowNum - hoverPosX;
			let difY = self.swappedElements[0].colNum - hoverPosY;
			if((Math.abs(difY) == 1 && difX == 0) || (Math.abs(difX) == 1 && difY == 0)){
				if(!(hoverPosY > columns - 1 || hoverPosY < 0) && !(hoverPosX > rows - 1 || hoverPosX < 0)){
					self.canMove = false;
					self.swappedElements[1] = {id: hoverPosX + '_' + hoverPosY, rowNum: hoverPosX, colNum: hoverPosY};
					self.swapTiles(self.swappedElements);
				}
			}
		};
	},
	
	swapTiles: function (swappedElements) {
		//add additional parameters to swap array
		this.addParameters(swappedElements);
		let i = 0;
		while (i < swappedElements.length) {
			let temp = this.grid[swappedElements[i + 1].rowNum][swappedElements[i + 1].colNum].color;
			this.swappedElements[i + 1].color = this.grid[swappedElements[i].rowNum][swappedElements[i].colNum].color;
			this.swappedElements[i].color = temp;
			this.grid[swappedElements[i + 1].rowNum][swappedElements[i + 1].colNum].color = this.grid[swappedElements[i].rowNum][swappedElements[i].colNum].color;
			this.grid[swappedElements[i].rowNum][swappedElements[i].colNum].color = temp;
			i += 2;
		}

		this.swapAnimate(swappedElements);
  	},

  	checkAfterSwap: function (swappedElements) {
  		//check and matches else swap back
  		if (this.firstUserSwap) {
  			this.firstUserSwap = false;
  			//checkMatches
  			for (let i = 0; i < this.swappedElements.length; i++) {
  				let m = swappedElements[i].rowNum, n = swappedElements[i].colNum;
  				if (this.grid[m][n].checkMatch()) {
  					this.matches.push({id: this.grid[m][n].id, rowNum: m, colNum: n});
  					this.getMatches(this.matches);
  				}
  			}
  			if (this.matches.length == 0) {
  				this.swapTiles(swappedElements);
  				this.swappedElements = [];
  				this.userInput = true;
  				scoreBlock.combo = 1;
  				scoreBlock.tileNum = 0;
  			} else {
  				scoreBlock.combo = 1;
  				scoreBlock.tileNum = this.matches.length;
  				scoreBlock.scoreNum += scoreBlock.combo * scoreBlock.tileNum;
  				scoreElement.innerHTML = scoreBlock.scoreNum;
  				this.addParameters(this.matches);
  				this.removeTiles(this.matches);
  			}
  		} else {
  			this.addParameters(this.swappedElements);
  			let i = 0;
  			while (i < this.swappedElements.length) {
  				let m = swappedElements[i].rowNum, n = swappedElements[i].colNum;
  				if (this.grid[m][n].checkMatch()) {
  					this.matches.push({id: this.grid[m][n].id, rowNum: m, colNum: n});
  					this.getMatches(this.matches);
  				}

  				i += 2;
  			}
  			if (this.matches.length == 0) {
  				scoreBlock.combo = 1;
  				scoreBlock.tileNum = 0;
  				this.swappedElements = [];
  				this.initTileProperties();
  				if (this.calcStartRowFill() >= 0) {
  					this.fillAnimation(this.calcStartRowFill(), deltaT);
  				}
  			    this.userInput = true;
  			} else {
  				scoreBlock.combo += 1;
  				scoreBlock.tileNum = this.matches.length;
  				scoreBlock.scoreNum += scoreBlock.combo * scoreBlock.tileNum;
  				scoreElement.innerHTML = scoreBlock.scoreNum;
  				this.addParameters(this.matches);
  				this.removeTiles(this.matches);
  			}
  		}
  	},

  	calcStartRowFill: function () {
  		for (let i = rows - 1; i >= 0; i--) {
  			for (let j = 0; j < columns; j++) {
  				if (this.grid[i][j].emptyCell) {
  					return i;
  				}
  			}
  		}
  	},

  	//save swap tiles parameters
  	addParameters: function (arr) {
  		for (let i = 0; i < arr.length; i++) {
  			let m = arr[i].rowNum, n = arr[i].colNum;
  			arr[i].x = this.grid[m][n].TileYPos;
  			arr[i].y = this.grid[m][n].TileXPos;
  		}
  	},

	getMatches: function(matches) {
		let len = matches.length;
		let elNum = 0;
		for (let n = 0; n < len; n++) {
			//tileUp
			if (matches[n].rowNum - 1 >= 0 && !this.grid[matches[n].rowNum - 1][matches[n].colNum].emptyCell && !this.grid[matches[n].rowNum][matches[n].colNum].color == ''
				&& this.grid[matches[n].rowNum][matches[n].colNum].color == this.grid[matches[n].rowNum - 1][matches[n].colNum].color
				 && !this.grid[matches[n].rowNum - 1][matches[n].colNum].checked) {
				this.matches.push({id: this.grid[matches[n].rowNum - 1][matches[n].colNum].id, rowNum: matches[n].rowNum - 1, colNum: matches[n].colNum});
				this.grid[matches[n].rowNum - 1][matches[n].colNum].checked = true;
				elNum++;
			}
			//tileDown 
			if (matches[n].rowNum + 1 < rows && !this.grid[matches[n].rowNum + 1][matches[n].colNum].emptyCell && !this.grid[matches[n].rowNum][matches[n].colNum].color == ''
				&& this.grid[matches[n].rowNum][matches[n].colNum].color == this.grid[matches[n].rowNum + 1][matches[n].colNum].color
			 	 && !this.grid[matches[n].rowNum + 1][matches[n].colNum].checked) {
				this.matches.push({id: this.grid[matches[n].rowNum + 1][matches[n].colNum].id, rowNum: matches[n].rowNum + 1, colNum: matches[n].colNum});
				this.grid[matches[n].rowNum + 1][matches[n].colNum].checked = true;
				elNum++;
			}
			//tileLeft 
			if (matches[n].colNum - 1 >= 0 && !this.grid[matches[n].rowNum][matches[n].colNum - 1].emptyCell && !this.grid[matches[n].rowNum][matches[n].colNum].color == ''
				&& this.grid[matches[n].rowNum][matches[n].colNum].color == this.grid[matches[n].rowNum][matches[n].colNum - 1].color
			 	 && !this.grid[matches[n].rowNum][matches[n].colNum - 1].checked) {
				this.matches.push({id: this.grid[matches[n].rowNum][matches[n].colNum - 1].id, rowNum: matches[n].rowNum, colNum: matches[n].colNum - 1});
				this.grid[matches[n].rowNum][matches[n].colNum - 1].checked = true;
				elNum++;
			}
			//tileRight 
			if (matches[n].colNum + 1 < columns && !this.grid[matches[n].rowNum][matches[n].colNum + 1].emptyCell && !this.grid[matches[n].rowNum][matches[n].colNum].color == ''
				&& this.grid[matches[n].rowNum][matches[n].colNum].color == this.grid[matches[n].rowNum][matches[n].colNum + 1].color
			 	 && !this.grid[matches[n].rowNum][matches[n].colNum + 1].checked) {
				this.matches.push({id: this.grid[matches[n].rowNum][matches[n].colNum + 1].id, rowNum: matches[n].rowNum, colNum: matches[n].colNum + 1});
				this.grid[matches[n].rowNum][matches[n].colNum + 1].checked = true;
				elNum++;
			}
			this.grid[matches[n].rowNum][matches[n].colNum].checked = true;
		}

		if (len != this.matches.length) {
			this.getMatches(this.matches);
		}
	},

	removeTiles: function (matches) {
		for (let i = 0; i < matches.length; i++) {
			this.grid[matches[i].rowNum][matches[i].colNum].emptyCell = true;
			this.grid[matches[i].rowNum][matches[i].colNum].color = '';
			//reset checked flag
			this.grid[matches[i].rowNum][matches[i].colNum].checked = false;
		}
		this.removeAnimate(this.matches);
	},

	dropDown: function() {
		this.swappedElements = [];
		this.matches = [];
		for (let i = rows - 1; i >= 0; i--) {
			for (let j = 0; j < columns; j++) {
				if (this.grid[i][j].emptyCell) {
					let n = i - 1;
					while (n != -1 && this.grid[n][j].emptyCell) {
						n--;
					}
					
					if (n >= 0) {
						this.grid[i][j].emptyCell = false;
						this.grid[n][j].emptyCell = true;
						
						this.swappedElements.push({id: this.grid[i][j].id, rowNum: i, colNum: j, color: ''});
						this.swappedElements.push({id: this.grid[n][j].id, rowNum: n, colNum: j, color: this.grid[n][j].color});
					}
				}
			}
		}
		this.swapTiles(this.swappedElements);
	},

	// animation block
	completeFill: function() {
		this.fillAnimation(rows - 1, deltaT);
	},

	fillAnimation: function(rowNum, rowTime) {
		this.userInput = false;
		self = this;
		animate({
			duration: animationTime * rowTime,
			timing: function(timeFraction) {
				return timeFraction;
			},
			draw: function(progress) {
  				for (let j = columns - 1; j >= 0; j--) {
  					let elem = document.getElementById(self.grid[rowNum][j].id); 
  					if (self.grid[rowNum][j].emptyCell) {
  						elem.style.background = self.grid[rowNum][j].color;
  						elem.style.top = progress * self.grid[rowNum][j].TileXPos + 'px';
  						elem.setAttribute("class", "Tile");
  					}
  				}	
			},
			done: function() {
				for (let j = columns - 1; j >= 0; j--) {
					self.grid[rowNum][j].emptyCell = false;
					self.grid[rowNum][j].checked = false;
				}
				rowNum--;
				rowTime += 0.05;
				if (rowNum >= 0) {
					self.fillAnimation(rowNum, rowTime);
				}
				if (rowNum < 0) {
					self.userInput = true;
				}
			}
		});
	},

	swapAnimate: function(swappedElements) {
		let self = this;
		this.userInput = false;
		animate({
			duration: animationTime,
  			timing: function(timeFraction) {
    		return timeFraction;
			},
			draw: function(progress) {
				let i = 0;
				while (i < swappedElements.length) {
					let el1 = document.getElementById(swappedElements[i].id);
					let el2 = document.getElementById(swappedElements[i + 1].id);
					let el1difX = swappedElements[i + 1].x - swappedElements[i].x, el1difY = swappedElements[i + 1].y - swappedElements[i].y;
					let el2difX = swappedElements[i].x - swappedElements[i + 1].x, el2difY = swappedElements[i].y - swappedElements[i + 1].y;
					if (swappedElements.length == 2) {
						el1.style.left = swappedElements[i].x + el1difX * progress + 'px';
						el1.style.top = swappedElements[i].y + el1difY * progress + 'px';
						el2.style.left = swappedElements[i + 1].x + el2difX * progress + 'px';
						el2.style.top = swappedElements[i + 1].y + el2difY * progress + 'px';
					} else {
						el2.style.top = swappedElements[i + 1].y + el2difY * progress + 'px';
					}

					i += 2;
				}
			},
			done: function() {
				let i = 0;
				while (i < swappedElements.length) {
					let el1 = document.getElementById(swappedElements[i].id), el2 = document.getElementById(swappedElements[i + 1].id);
					el1.style.left = swappedElements[i + 1].x + 'px';
					el1.style.top = swappedElements[i + 1].y + 'px';
					el2.style.left = swappedElements[i].x + 'px';
					el2.style.top = swappedElements[i].y + 'px';

					//temp
					el1.setAttribute("id", swappedElements[i].id + ' ');
					el1 = document.getElementById(swappedElements[i].id + ' ');
					//swap DIVs
					el2.setAttribute("id", swappedElements[i].id);
					el1.setAttribute("id", swappedElements[i + 1].id);

					i += 2;
				}
				self.checkAfterSwap(swappedElements);				
			}
		});
	},

	removeAnimate: function(matches) {
		this.userInput = false;
		let self = this;
		animate({
			duration: animationTime * 2,
				timing: function(timeFraction) {
				return timeFraction;
			},
			draw: function(progress) {
				for (let i = 0; i < matches.length; i++) {
					let el = document.getElementById(matches[i].id);
					el.style.width = (1 - progress) * tileElementWidth + 'px';
					el.style.height = (1 - progress) * tileElementHeight + 'px';
					el.style.left = matches[i].x + (progress * tileWidth / 2) + 'px';
					el.style.top = matches[i].y + (progress * tileHeight / 2) + 'px';
				}
			},
			done: function() {
				for (let i = 0; i < matches.length; i++) {
					let el = document.getElementById(matches[i].id);
					el.setAttribute("class", "empty");
					el.style = null;
					el.style.left = matches[i].x + 'px';
					el.style.top = matches[i].y + 'px';
				};
				self.matches = [];
				self.swappedElements = [];
				self.dropDown();
			}
		});
	}	
}

function animate(options) {
	let start = performance.now();
	requestAnimationFrame(function animate(time) {

		// timeFraction from 0 to 1
		let timeFraction = (time - start) / options.duration;
		if (timeFraction > 1) timeFraction = 1;
		// current animation status
		let progress = options.timing(timeFraction);
		options.draw(progress);
		if (timeFraction < 1) {
			requestAnimationFrame(animate);
		} else {
			options.done();
		}
	});
}

function startGame(rows, columns) {
	//init canvas

	canvas.initCanvas();

	//remove browser drag&drop
	boardElement.ondragstart = function() {
  		return false;
	};
	//animate filling
	canvas.completeFill();
	scoreBlock.combo = 1;
	scoreBlock.scoreNum = 0;
	scoreBlock.tileNum = 0;
	scoreElement.innerHTML = 0;
}


startGame(rows, columns);