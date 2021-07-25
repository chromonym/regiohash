// This is the main code, which I have put into a separate file because Github

// Values which will be replaced by a form or something and are here for testing
var cols = 3;
var rows = 3;
var score = 0;
var time = 0;
var mapID = "JP:05";
var lat = "0";
var lon = "0";
// Getting info from the hyperlink (after the ? but before the &)
var val=document.URL;
function getLinkInfo(key,equals) {
	if (equals) {
		var start;
		start = val.search(key+"=");
		var end;
		end = val.split(key+"=")[1].search("&");
		if (start != -1) {
			var thispos = val.substring(start+key.length+1);
			if (end != -1) {
				thispos = thispos.slice(0,end);
			}
			return thispos;
		} else {
			return undefined;
		}
	} else {
		var start;
		find = val.search("\\?"+key);
		console.log(find);
		if (find === -1) {
			find = val.search("&"+key);
		}
		console.log(find);
		if (find === -1) {
			return false;
		} else {
			return true;
		}
	}
}
console.log(getLinkInfo("hello",false));
// Getting the correct map from maps.txt
var map = ["","","0","2","0","2","\nooo\nooo\nooo"];
var yes = false;
console.log(txt);
var textByTR = txt.split(/;\n[^;o0#]/); //txt is the contents of maps.txt... technically.
totalLines = 1;
for (let i = 1; i < textByTR.length; i++) {
	textByTR[i] = txt.split("\n")[totalLines].charAt(0) + textByTR[i];
	totalLines += textByTR[i].split("\n").length;
}
textByTR = textByTR.slice(1)
var textBySub = [];
for (let i = 0; i < textByTR.length; i++) {
	textBySub.push(textByTR[i].split(";\n;"));
}
textBySub = textBySub.slice(0,-1);
var mapList = [];
for (let i = 0; i < textBySub.length; i++) {
	let ml = [];
	for (let j = 0; j < textBySub[i].length; j++) {
		ml.push(textBySub[i][j].split(";"));
	}
	mapList.push(ml);
}
console.log(mapList);

/*for (let i = 0; i < textByLine.length; i++) {
	if (textByLine[i].split(";").length > 2) {
		let info = textByLine[i].split(";").slice(0,-1);
		if (mapID.split(":").length === 1) { // is top level region
			if (mapID === info[0] || mapID === info[1]){ // is valid
				cols = info[2]-info[3]+3;
				rows = info[5]-info[4]+3;
				console.log(textByLine.slice(i+1));
				map = "e";
			}
		} else if (info.length === 7) { // is subregion
			console.log(info[1]);
			if (mapID === info[1]) {
				yes = true;
			} else if (mapID.split(":")[1] === info[2].split(":")[0] && mapID.split(":")[0] === info[2].split(":")[1]) {
				yes = true;
			}
			if (yes) {
				if (justSubRegion) {
					cols = info[3]-info[4]+3;
					rows = info[6]-info[5]+3;
					console.log(textByLine.slice(i));
					map = "e";
					console.log(info[1]);
				}
			}
		}
	}
}*/
window.onload = function() {
	// Finding which map it is and behaving accordingly
	if (mapID.split(":").length > 1) {
		for (let i = 0; i < mapList.length; i++) {
			for (let j = 1; j < mapList[i].length; j++) {
				if (mapList[i][0][0]+":"+mapList[i][j][0] === mapID || mapList[i][0][1]+":"+(mapList[i][j][1].split(":")[0]) === mapID) {
					map = mapList[i][j];
				}
			}
		}
	} else {
		for (let i = 0; i < mapList.length; i++) {
			if (mapList[i][0][0] === mapID || mapList[i][0][1] === mapID) {
				map = mapList[i][0]
			}
		}
	}
	console.log(map)
	var rowMap = map[6].split("\n").slice(1)
	rows = rowMap.length;
	cols = rowMap[0].length
	if (map[6] === "\nooo\nooo\nooo"){
		alert("The region code is incorrect.");
	}
	// Sorting out the canvas
	var canvas = document.getElementById("minesweeper");
	canvas.width = 24+16*cols;
	canvas.height = 66+16*rows;
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = "#C0C0C0"
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	function draw(src, x, y) {
		var sprite = new Image();
		sprite.src = "sprites/"+src+".png";
		sprite.onload = () => ctx.drawImage(sprite, x, y);
	}
	
	// Drawing non-main-area to the canvas
	draw("tl",0,0);
	draw("tr",13+16*cols,0);
	draw("bl",0,55+16*rows);
	draw("br",13+16*cols,55+16*rows);
	for (let i = 0; i < cols; i++) {
		draw("t", 13+16*i, 0);
		draw("m", 13+16*i, 44);
		draw("b", 13+16*i, 55+16*rows);
	}
	for (let i = 0; i < rows; i++) {
		draw("l", 0, 55+16*i);
		draw("r", 13+16*cols, 55+16*i);
	}
	// drawing main-area stuff to the canvas (including borders)
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			if (rowMap[row][col] === "0" || rowMap[row][col] === "#") {
				draw("pressed",13+16*col,55+16*row);
				if (row !== 0 && col !== 0) {
					if ((rowMap[row][col] == "0" && rowMap[row-1][col-1] == "#") || (rowMap[row][col] == "#" && rowMap[row-1][col-1] == "0")) {
						draw("bord/tl",13+16*col,55+16*row);
					}
				}
				if (row !== 0) {
					if ((rowMap[row][col] == "0" && rowMap[row-1][col] == "#") || (rowMap[row][col] == "#" && rowMap[row-1][col] == "0")) {
						draw("bord/t",13+16*col,55+16*row);
					}
				}
				if (col !== 0) {
					if ((rowMap[row][col] == "0" && rowMap[row][col-1] == "#") || (rowMap[row][col] == "#" && rowMap[row][col-1] == "0")) {
						draw("bord/l",13+16*col,55+16*row);
					}
				}
				/*if (row !== 0 && col !== 0) {
					if ((rowMap[row][col] === "0" && rowMap[row-1][col] === "#" && rowMap[row][col-1] === "#") || (rowMap[row][col] === "#" && rowMap[row-1][col] === "0" && rowMap[row][col-1] === "0")) { // top and left
						draw("bord/a",13+16*col,55+16*row);
					}
				} else if (true) { // top
					draw("bord/t",13+16*col,55+16*row);
				} else if (true) { // left
					draw("bord/l",13+16*col,55+16*row);
				} else if (true) { // all 3 corners
					draw("bord/c",13+16*col,55+16*row);
				} else if (true) { // top 2 corners
					draw("bord/tc",13+16*col,55+16*row);
				} else if (true) { // left 2 corners
					draw("bord/lc",13+16*col,55+16*row);*/
			} else {
				draw("unpressed",13+16*col,55+16*row);
			}
		}
	}
	// drawing the top-left & top-right numbers
	function numBlock(num, x, y) {
		draw("numbers",x,y)
		draw("num/"+num[0],x+2,y+2);
		draw("num/"+num[1],x+15,y+2);
		draw("num/"+num[2],x+28,y+2);
	}
	score = String(score).padStart(3, '0');
	numBlock(score,16,16);
	if (time) {
		time = String(time).padStart(3, '0');
		numBlock(time,canvas.width-55,16);
	}
	// numBlock(score,x,y);
	console.log(score);
	draw("smile",((24+16*cols)/2)-13,15);
};