// This is the main code, which I have put into a separate file because Github
// The version number is as follows (use dashes instead of dots, and use semver (M.m.b). Don't use letters.
const VERSION = "1-0-1";
// defining defaults for variables
var cols = 3;
var rows = 3;
var score = 0;
var time = 0;
// Getting info from the hyperlink (after the ? but before the &)
var val=document.URL;
function getLinkInfo(key,equals) { // very cheaty way to get info submitted by form (after ?)
	try {
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
			if (find === -1) {
				find = val.search("&"+key);
			}
			if (find === -1) {
				return false;
			} else {
				return true;
			}
		}
	} catch(err) {
		return undefined;
	}
}
function pairwise(arr){
	let outarr = [];
	try {
		for(var i=0; i < arr.length - 1; i+=2){
			outarr.push(arr[i]+", "+arr[i+1]);
		}
		return outarr;
	} catch (err) {
		return outarr;
	}
}
// Variables based on above function
var mapID = getLinkInfo("region",true);
// Checking if ABOUT is true
// Getting the correct map from maps.txt
var map = ["","","0","2","0","2","\nooo\nooo\nooo"];
//var smallMap = undefined;
var yes = false;
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
/*var textByLine = txt.split("\n").slice(1,-1);
for (let i = 0; i < textByLine.length; i++) {
	if (i < textByLine.length-1) {
		if ((textByLine[i][0] === "0" || textByLine[i][0] === "#" || textByLine[i][0] === "o") && textByLine[i][-1] !== ";") {
			let j = i+1;
			let stopp = false;
			while (!stopp) {
				if (textByLine[j][-1] === ";") {
					console.log("stopping");
					stopp = true;
				}
				console.log(textByLine[j][-1]);
				textByLine[i] = textByLine[i] + "\n" + textByLine[j];
				//console.log(textByLine[i]+"\n======");
				textByLine.splice(j,1);
			}
			//console.log(i);
		}
	}
}*/
//console.log(textByLine);
console.log(mapList);

window.onload = function() {
	var canvas = document.getElementById("minesweeper");
	var ctx = canvas.getContext("2d");
	var about = document.getElementById("pre-canvas");
	var postc = document.getElementById("post-canvas");
	try {
		var hashes = pairwise(getLinkInfo("visited",true).split("."));
	} catch (err) {
		var hashes = [];
	}
	try {
		var home = pairwise(getLinkInfo("home",true).split("."))[0];
	} catch (err) {
		var home = "";
	}
	
	function draw(src, x, y) {
		var sprite = new Image();
		sprite.src = "sprites/"+src+".png";
		sprite.onload = () => ctx.drawImage(sprite, x, y);
	}
	function getCoords(row,col,north,west) {
		// This function took me W A Y too long to write.
		var alat;
		var alon;
		var mr = parseInt(north); // map[2]
		var mc = parseInt(west); // map[4]
		if (north[0] !== "-" && row === mr+1) {
			alat = "-0";
		} else if (north[0] !== "-" && row > mr+1) {
			alat = (mr-row-1).toString();
		} else {
			alat = (mr-row).toString();
		}
		if (west[0] === "-" && col === Math.abs(mc)) {
			alon = "-0";
		} else if (west[0] === "-" && col > Math.abs(mc)) {
			alon = (mc+col-1).toString();
		} else {
			alon = (mc+col).toString();
		}
		return alat + ", " + alon;
	}
	function getPos(alat,alon,north,west) {
		var rowa;
		var cola;
		var mw = parseInt(west); //map[4]
		var mn = parseInt(north); //map[2]
		var mlat = parseInt(alat);
		var mlon = parseInt(alon);
		if (north === "0") {
			if (alat === "0") {
				rowa = 0;
			} else {
				rowa = 1 - mlat;
			}
		} else if (north[0] != "-" && alat[0] === "-") {
			rowa = mn - mlat + 1;
		} else {
			rowa = mn - mlat;
		}
		if (west === "-0") {
			if (alon === "0") {
				cola = 0;
			} else {
				cola = mlon + 1;
			}
		} else if (west[0] === "-" && alon[0] != "-") {
			cola = mlon - mw + 1;
		} else {
			cola = mlon - mw;
		}
		return [rowa,cola];
	}
	/*function searchMap(mapCode,searchLevel=[],large="") {
		for (let i = 0; i < mapList.length; i++) {
			console.log("this func is incomplete"); // this func is incomplete
		}
	}*/
	var cherry = false;
	var blue = false;
	var sung = false;
	if (getLinkInfo("cherry",false)) {
		cherry = true;
	}
	if (getLinkInfo("blue",false)) {
		blue = true;
	}
	if (getLinkInfo("sunglasses",false) || getLinkInfo("sun",false) || getLinkInfo("glasses",false)) {
		sung = true;
	}
	if (getLinkInfo("version",false)) {
		canvas.width = 13*VERSION.length
		canvas.height = 23
		ctx.fillStyle = "#000000"
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		about.innerHTML = "<h2>Version:</h2>";
		for (let i = 0; i < VERSION.length; i++) {
			draw("num/"+VERSION[i],1+13*i,1);
		}
	} else if (getLinkInfo("about",false)) {
		var abt = "<h2>All regions available:</h2>\n<table>\n<tr>\n<th>Region</th>\n<th>Subregion</th>\n</tr>\n"
		for (let i = 0; i < mapList.length; i++) {
			var sub = "<td>";
			abt += "<tr>\n<td>"+mapList[i][0][0].replace(/_/g," ")+" ("+mapList[i][0][1]+")</td>\n";
			for (let j = 1; j < mapList[i].length; j++) {
				sub += mapList[i][j][0].replace(/_/g," ")+" ("+mapList[i][j][1].split(":")[0]+")";
				if (j != mapList[i].length-1) {
					sub += ", ";
				}
			}
			sub += "</td>\n";
			abt += sub + "</tr>";
		}
		abt += "</table>\n<p><a href=\"https://github.com/TheXXOs/regiohash\">GitHub page here</a></p>"
		about.innerHTML = abt;
	} else if (getLinkInfo("help",false)) {
		about.innerHTML = `<h2>How to use:</h2>
<a href="https://thexxos.github.io/regiohash/README.md">GitHub README</a><br/>
<a href="https://geohashing.site/geohashing/User:XXOs/Regiohashing">Geohashing Wiki Page</a>`;
	} else {
		// Finding which map it is and behaving accordingly
		about.innerHTML = "<h2>Your map:</h2>";
		postc.innerHTML = "<p><i>To download the image, right click > Save image as...</i></p>\n<p><i>If something hasn't shown up properly, reload the page.</i></p>";
		if (mapID) {
			if (mapID === "W") {
				var mapp;
				for (let i = 0; i < 178; i++) {
					for (let j = 0; j < 358; j++) {
						mapp += "0";
					}
					mapp += "\n";
				}
				mapp = mapp.slice(0,-1);
				map = ["W","W","89","-89","-179","179",mapp];
			} else {
				if (mapID.split(":").length > 1) { // second level map
					for (let i = 0; i < mapList.length; i++) {
						for (let j = 1; j < mapList[i].length; j++) {
							if (mapList[i][0][0]+":"+mapList[i][j][0] === mapID || mapList[i][0][1]+":"+(mapList[i][j][1].split(":")[0]) === mapID) {
								map = mapList[i][j];
							}
						}
					}
				} else { // top level map
					for (let i = 0; i < mapList.length; i++) {
						if (mapList[i][0][0] === mapID || mapList[i][0][1] === mapID) {
							map = mapList[i][0];
						}
					}
				} //*/
			}
		}
		var rowMap = map[6].split("\n").slice(1);
		rows = rowMap.length;
		cols = rowMap[0].length;
		if (map[6] === "\nooo\nooo\nooo"){
			alert("The region code is incorrect.");
		}
		// Sorting out the canvas
		canvas.width = 24+16*cols;
		canvas.height = 66+16*rows;
		ctx.fillStyle = "#C0C0C0";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
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
		// drawing main-area stuff to the canvas (including the yellow border)
		var eight = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]];
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (rowMap[row][col] === "0" || rowMap[row][col] === "#") {
					let latlong = getCoords(row,col,map[2],map[4]);
					if (hashes.includes(latlong)) {
						if (home === latlong) {
							draw("home",13+16*col,55+16*row);
						} else {
							draw("flag",13+16*col,55+16*row);
						}
					} else {
						if (rowMap[row][col] === "#" || !(map[6].includes("#"))) {
							score += 1;
						}
						if (!cherry) {
							var count = 0;
							for (let i = 0; i < 8; i++) {
								try {
									if (hashes.includes(getCoords(row+eight[i][0],col+eight[i][1],map[2],map[4])) && rowMap[row+eight[i][0]][col+eight[i][1]] !== "o") {
										count += 1
									}
								} catch (err) {}
							}
							if (count == 0) {
								draw("pressed",13+16*col,55+16*row);
							} else {
								if (count == 8 && sung) {
									draw("sun",13+16*col,55+16*row);
								} else {
									draw(count.toString(),13+16*col,55+16*row);
								}
							}
						} else {
							draw("cherry",13+16*col,55+16*row);
						}
					}
				} else {
					if (!blue) {
						draw("unpressed",13+16*col,55+16*row);
					} else {
						draw("blue",13+16*col,55+16*row);
					}
				}
			}
		}
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
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
			}
		}
		// drawing the top-left & top-right numbers
		function numBlock(num, x, y) {
			draw("numbers",x,y);
			draw("num/"+num[0],x+2,y+2);
			draw("num/"+num[1],x+15,y+2);
			draw("num/"+num[2],x+28,y+2);
		}
		score = String(score).padStart(3, '0');
		numBlock(score,16,16);
		startDate = getLinkInfo("started",true);
		if (startDate) {
			try {
				var startD = new Date(startDate);
				var endD = new Date();
				time = Math.round((endD.getTime() - startD.getTime()) / (1000 * 3600 * 24));
				time = String(time).padStart(3, '0');
				numBlock(time,canvas.width-55,16);
			} catch (err) {}
		}
		// draw the smile. This is the last thing drawn, so if it is there, the drawing should be complete.
		draw("smile",((24+16*cols)/2)-13,15);
	}
};