/**
 * @author Owner
 */

//以下設定項目
const usesMouseEvents = (location.href.indexOf("nonogramtouch.com") == -1);
const screenWidth = 320;
const screenHeight = 416; //iphoneのurlバーを隠した状態の表示領域
const marginLeft = 5;
const marginRight = 5;
const marginTop = 5;
const marginBottom = 5;
const nonogramAreaWidth = 310;
const nonogramAreaHeight = 310;
const marginLeftOfInputArea = 5;
const marginTopOfInputArea = 5;
const marginBetweenInputAreaAndBottomArea = 10;
const marginBetweenBottomAreaAndButtonArea = 10;
const continuousInputModeTime = 600;
const inputHistoryMaxCount = 99;
const numberCellSizeRatio = 3 / 4;

//以下非設定項目

//タッチイベントをマウスイベントで置き換え
var touchstart;
var touchmove;
var touchend;
if (usesMouseEvents) {
	touchstart = "mousedown";
	touchmove = "mousemove";
	touchend = "mouseup";
} else {
	touchstart = "touchstart";
	touchmove = "touchmove";
	touchend = "touchend";
}

var Point = function(x, y) {
	this.x = x;
	this.y = y;
};

var Cell = function(col, row) {
	this.col = col;
	this.row = row;
};

var Rect = function(top, right, bottom, left) {
	this.top = top;
	this.right = right;
	this.bottom = bottom;
	this.left = left;
	this.width = right - left + 1;
	this.height = bottom - top + 1;
};

var Margin = function(top, right, bottom, left) {
	this.top = top;
	this.right = right;
	this.bottom = bottom;
	this.left = left;
}

const STATUS_WHITE = 0;
const STATUS_BLACK = 1;
const STATUS_CROSS = 2;

var screenData = null;
var gameData = null;
var nonogramData = null;

// ===============================================
// ゲーム画面を生成
// ===============================================
$(document).ready(function() {
	setTimeout(doScroll, 100);
	initData();
	initGameScreen();
	initNonogram();
	initBottomArea();
});

function initData() {
	//最初にdata-nonogramタグからノノグラムデータ取得
	initNonogramData();
	//ノノグラムデータを元に画面デザイン用データを設定
	initScreenData();
	//画面デザイン用データを元にゲームデータを初期化
	initGameData();
}

function initNonogramData() {
	nonogramData = $("#gameScreen").data().nonogram;
	nonogramData.verticalClue = JSON.parse(nonogramData.verticalClue);
	nonogramData.horizontalClue = JSON.parse(nonogramData.horizontalClue);
	return nonogramData;
}

function initScreenData() {
	screenData = {};
	screenData.inputColCount = nonogramData.width;
	screenData.inputRowCount = nonogramData.height;
	screenData.upNumberColCount = screenData.inputColCount;
	screenData.upNumberRowCount = Math.ceil(screenData.inputRowCount / 2);
	screenData.leftNumberColCount = Math.ceil(screenData.inputColCount / 2);
	screenData.leftNumberRowCount = screenData.inputRowCount;

	screenData.inputCellMaxWidth = Math.floor((nonogramAreaWidth - marginLeftOfInputArea) / (screenData.inputColCount + screenData.leftNumberColCount * numberCellSizeRatio));
	screenData.inputCellMaxHeight = Math.floor((nonogramAreaHeight - marginTopOfInputArea) / (screenData.inputRowCount + screenData.upNumberRowCount * numberCellSizeRatio));
	screenData.inputCellWidth = Math.min(screenData.inputCellMaxWidth, screenData.inputCellMaxHeight);
	screenData.inputCellHeight = screenData.inputCellWidth;
	screenData.inputAreaWidth = screenData.inputCellWidth * screenData.inputColCount;
	screenData.inputAreaHeight = screenData.inputCellHeight * screenData.inputRowCount;

	screenData.upNumberCellWidth = screenData.inputCellWidth;
	screenData.upNumberCellHeight = Math.floor(screenData.inputCellHeight * numberCellSizeRatio);
	screenData.leftNumberCellWidth = Math.floor(screenData.inputCellWidth * numberCellSizeRatio);
	screenData.leftNumberCellHeight = screenData.inputCellHeight;

	screenData.upNumberAreaWidth = screenData.upNumberCellWidth * screenData.upNumberColCount;
	screenData.upNumberAreaHeight = screenData.upNumberCellHeight * screenData.upNumberRowCount;
	screenData.leftNumberAreaWidth = screenData.leftNumberCellWidth * screenData.leftNumberColCount;
	screenData.leftNumberAreaHeight = screenData.leftNumberCellHeight * screenData.leftNumberRowCount;

	screenData.upNumberAreaStartY = marginTop + (nonogramAreaHeight - (screenData.inputAreaHeight + screenData.upNumberAreaHeight + marginTopOfInputArea)) / 2;
	screenData.leftNumberAreaStartX = marginLeft + (nonogramAreaWidth - (screenData.inputAreaWidth + screenData.leftNumberAreaWidth + marginLeftOfInputArea)) / 2;
	screenData.upNumberAreaStartX = screenData.leftNumberAreaStartX + screenData.leftNumberAreaWidth + marginLeftOfInputArea;
	screenData.leftNumberAreaStartY = screenData.upNumberAreaStartY + screenData.upNumberAreaHeight + marginTopOfInputArea;

	screenData.inputAreaStartX = screenData.upNumberAreaStartX;
	screenData.inputAreaStartY = screenData.leftNumberAreaStartY;

	screenData.shrinkedInputAreaWidth = screenData.inputAreaWidth + 2;
	screenData.shrinkedInputAreaHeight = screenData.inputAreaHeight + 2;
	screenData.shrinkedInputAreaStartX = marginLeft + Math.floor((nonogramAreaWidth - screenData.shrinkedInputAreaWidth) / 2);
	screenData.shrinkedInputAreaStartY = Math.floor((screenHeight - screenData.shrinkedInputAreaHeight) / 2);

	screenData.bottomAreaHeight = 70;
	screenData.bottomAreaWidth = nonogramAreaWidth;
	screenData.bottomAreaStartX = marginLeft;
	screenData.bottomAreaStartY = screenHeight - (marginBottom + screenData.bottomAreaHeight);

	screenData.mainScreenHeight = screenData.bottomAreaStartY + screenData.bottomAreaHeight + marginBetweenBottomAreaAndButtonArea;

	screenData.buttonAreaHeight = Math.floor(screenData.mainScreenHeight / 2);
	screenData.buttonAreaWidth = screenWidth - marginLeft - marginRight;
	screenData.buttonAreaStartX = marginLeft;
	screenData.buttonAreaStartY = screenData.bottomAreaStartY + screenData.bottomAreaHeight + marginBetweenBottomAreaAndButtonArea;

	screenData.titleAreaStartX = marginLeft;
	screenData.titleAreaStartY = marginTop;
	screenData.titleAreaWidth = nonogramAreaWidth;
	screenData.titleAreaHeight = screenHeight / 10;

	screenData.descriptionAreaStartX = marginLeft;
	screenData.descriptionAreaStartY = screenData.titleAreaStartY + screenData.titleAreaHeight;
	screenData.descriptionAreaWidth = screenData.titleAreaWidth;
	screenData.descriptionAreaHeight = screenData.titleAreaHeight;
	
	screenData.resultButtonAreaWidth = screenData.titleAreaWidth;
	screenData.resultButtonAreaHeight = screenHeight / 5;
	screenData.resultButtonAreaStartX = marginLeft;
	screenData.resultButtonAreaStartY = screenHeight - (marginBottom + screenData.resultButtonAreaHeight);
	
	screenData.nonogramRect = new Rect(screenData.upNumberAreaStartY, screenData.inputAreaStartX + screenData.inputAreaWidth, screenData.inputAreaStartY + screenData.inputAreaHeight, screenData.leftNumberAreaStartX);
}

function initGameData() {
	gameData = {};
	gameData.input = new Array(screenData.inputColCount);
	for (var col = 0; col < screenData.inputColCount; col++) {
		gameData.input[col] = new Array(screenData.inputRowCount);
		for (var row = 0; row < screenData.inputRowCount; row++) {
			gameData.input[col][row] = 0;
		}
	}
	
	//入力ヒストリー
	gameData.inputHistoryCount = 0;
	gameData.inputHistory = new Array();
	
	//正解チェック
	gameData.upNumberColCorrectness = new Array(screenData.upNumberColCount);
	gameData.leftNumberRowCorrectness = new Array(screenData.leftNumberRowCount);
	for (var col = 0; col < screenData.inputColCount; col++) {
		checkCol(col);
	}
	for (var row = 0; row < screenData.inputRowCount; row++) {
		checkRow(row);
	}
	checkColAndRowCorrectness();
	
	//プレイ中（操作可能）かどうか
	gameData.isPlaying = true;
	
	//選択中のセル
	gameData.selectedCell = new Cell(0, 0);
	
	//入力認識用データ
	gameData.startPoint = null;
	gameData.startCell = null;
	gameData.startTime = null;
	gameData.hasMoved = false;
	
	//連続入力モード
	gameData.isContinuousInputMode = false;
	gameData.continuousInputStartCell = null;
	gameData.continuousInputColor = null;
	gameData.continuousInputModeTimeout = null;
	
	//mousemoveはボタンを押さなくても発生するので、ボタンを押しているかどうかの記録が必要
	gameData.mouseIsDown = false;
}

function initBottomArea() {
	createBottomArea();
	createMenuButton();
	createUndoButton();
}

function createBottomArea() {
	$('<div id="bottomArea"></div>')
	.appendTo("#gameScreen")
	.css("top", screenData.bottomAreaStartY + "px")
	.css("left", screenData.bottomAreaStartX + "px")
	.css("width", screenData.bottomAreaWidth + "px")
	.css("height", screenData.bottomAreaHeight + "px")
	.css("line-height", screenData.bottomAreaHeight + "px");
}

function createMenuButton() {
	$('<button id="menuButton">Menu</button>')
	.appendTo("#bottomArea")
	.addClass("fadeout")
	.bind(touchstart, preventDefault);
}

function createUndoButton() {
	$('<button id="undoButton">Undo</button>')
	.appendTo("#bottomArea")
	.addClass("fadeout")
	.bind(touchstart, preventDefault);
	disableUndo();
}

function backupInput() {
	if (gameData.inputHistoryCount == inputHistoryMaxCount) {
		gameData.inputHistory.shift();
	} else {
		if (gameData.inputHistoryCount == 0) {
			enableUndo();
		}
		gameData.inputHistoryCount++;
	}
	var backup = new Array(screenData.inputColCount);
	for (var col = 0; col < screenData.inputColCount; col++) {
		backup[col] = new Array(screenData.inputRowCount);
		for (var row = 0; row < screenData.inputRowCount; row++) {
			backup[col][row] = gameData.input[col][row];
		}
	}
	gameData.inputHistory.push(backup);	
}

function initGameScreen() {
	$("#gameScreen")
	.css("width", screenWidth + "px")
	.css("height", screenHeight + "px")
	.css("font-size", Math.floor(screenData.inputCellHeight * 0.6) + "px");
}

function initNonogram() {
	createNonogram();
	createUpNumberArea();
	createUpNumberCells();
	createLeftNumberArea();
	createLeftNumberCells();
	createInputArea();
	createInputCells();
	createSelection();
}

function createNonogram() {
	$("#gameScreen").append('<div id="nonogram"></div>');
	$("#nonogram")
	.css("width", screenWidth)
	.css("height", screenHeight)
	.bind(touchstart, gameScreen_touchstart)
	.bind(touchmove, gameScreen_touchmove)
	.bind(touchend, gameScreen_touchend);
}

function createUpNumberArea() {
	$('<div id="upNumberArea"></div>')
	.appendTo("#nonogram")
	.addClass("fadeout")
	.css("left", screenData.upNumberAreaStartX + "px")
	.css("top", screenData.upNumberAreaStartY + "px")
	.css("width", screenData.upNumberAreaWidth + "px")
	.css("height", screenData.upNumberAreaHeight + "px");
}

function createUpNumberCells() {
	//上の数字セル
	for (var col = 0; col < screenData.upNumberColCount; col++) {
		var numbers = nondestructiveArrayReverse(nonogramData.verticalClue[col]);
		for (var row = 0; row < screenData.upNumberRowCount; row++) {
			var id = getUpNumberCellId(col, row);
			var x = col * screenData.upNumberCellWidth;
			var y = row * screenData.upNumberCellHeight;
			$('<div id="' + id + '"></div>')
			.appendTo("#upNumberArea")
			.addClass("numberCell")
			.css("left", x + "px")
			.css("top", y + "px")
			.css("width", screenData.upNumberCellWidth + "px")
			.css("height", screenData.upNumberCellHeight + "px")
			.css("line-height", screenData.upNumberCellHeight + "px");
			if (col % 2 == 0) {
				$("#" + id).addClass("even");
			} else {
				$("#" + id).addClass("odd");
			}
			if (row >= screenData.upNumberRowCount - numbers.length) {
				$("#" + id).html(numbers[screenData.upNumberRowCount - row - 1]);
			}
		}
	}
}

function createLeftNumberArea() {
	$('<div id="leftNumberArea"></div>')
	.appendTo("#nonogram")
	.addClass("fadeout")
	.css("left", screenData.leftNumberAreaStartX + "px")
	.css("top", screenData.leftNumberAreaStartY + "px")
	.css("width", screenData.leftNumberAreaWidth + "px")
	.css("height", screenData.leftNumberAreaHeight + "px");
}

function createLeftNumberCells() {
	//左の数字セル
	for (var row = 0; row < screenData.leftNumberRowCount; row++) {
		var numbers = nondestructiveArrayReverse(nonogramData.horizontalClue[row]);
		for (var col = 0; col < screenData.leftNumberColCount; col++) {
			var id = getLeftNumberCellId(col, row);
			var x = col * screenData.leftNumberCellWidth;
			var y = row * screenData.leftNumberCellHeight;
			var content;
			$('<div id="' + id + '"></div>')
			.appendTo("#leftNumberArea")
			.addClass("numberCell")
			.css("left", x + "px")
			.css("top", y + "px")
			.css("width", screenData.leftNumberCellWidth + "px")
			.css("height", screenData.leftNumberCellHeight + "px")
			.css("line-height", screenData.leftNumberCellHeight + "px");
			if (row % 2 == 0) {
				$("#" + id).addClass("even");
			} else {
				$("#" + id).addClass("odd");
			}
			if (col >= screenData.leftNumberColCount - numbers.length) {
				$("#" + id).html(numbers[screenData.leftNumberColCount - col - 1]);
			}
		}
	}
}

function createInputArea() {
	//入力エリア
	$("#nonogram").append('<div id="inputArea"></div>');
	$("#inputArea")
	.css("position", "absolute")
	.css("left", screenData.inputAreaStartX + "px")
	.css("top", screenData.inputAreaStartY + "px")
	.css("width", screenData.inputAreaWidth + "px");
}

function createInputCells() {
	//入力セル
	for (var col = 0; col < screenData.inputColCount; col++) {
		for (var row = 0; row < screenData.inputRowCount; row++) {
			var id = getInputCellId(col, row);
			var x = col * screenData.inputCellWidth;
			var y = row * screenData.inputCellHeight;
			$('<div id="' + id + '"></div>')
			.appendTo("#inputArea")
			.addClass("inputCell")
			.addClass("white")
			.css("position", "absolute")
			.css("left", x + "px")
			.css("top", y + "px")
			.css("width", (screenData.inputCellWidth - 2) + "px")
			.css("height", (screenData.inputCellHeight - 2) + "px");
		}
	}
}

function createSelection() {
	//選択列
	$('<div id="selectedCol"></div>')
	.appendTo("#nonogram")
	.addClass("selection")
	.addClass("fadeout")
	.css("left", (screenData.inputAreaStartX + gameData.selectedCell.col * screenData.inputCellWidth) + "px")
	.css("top", screenData.upNumberAreaStartY + "px")
	.css("width", (screenData.inputCellWidth - 0) + "px")
	.css("height", (screenData.nonogramRect.height - 0) + "px");
	//選択行
	$('<div id="selectedRow"></div>')
	.appendTo("#nonogram")
	.addClass("selection")
	.addClass("fadeout")
	.css("left", screenData.leftNumberAreaStartX + "px")
	.css("top", (screenData.inputAreaStartY + gameData.selectedCell.row * screenData.inputCellHeight) + "px")
	.css("width", (screenData.nonogramRect.width - 0) + "px")
	.css("height", (screenData.inputCellHeight) + "px");
	//選択セル
	$('<div id="selectedCell"></div>')
	.appendTo("#nonogram")
	.addClass("selection")
	.addClass("fadeout")
	.css("left", (screenData.inputAreaStartX + gameData.selectedCell.col * screenData.inputCellWidth) + "px")
	.css("top", (screenData.inputAreaStartY + gameData.selectedCell.row * screenData.inputCellHeight) + "px")
	.css("width", (screenData.inputCellWidth - 4) + "px")
	.css("height", (screenData.inputCellHeight - 4) + "px");
}

//restore previous input (undo)
function restoreInput() {
	if (gameData.inputHistoryCount > 0) {
		var backup = gameData.inputHistory.pop();
		for (var col = 0; col < screenData.inputColCount; col++) {
			for (var row = 0; row < screenData.inputRowCount; row++) {
				setInputCellStatus(new Cell(col, row), backup[col][row]);
			}
		}
		gameData.inputHistoryCount--;
		if (gameData.inputHistoryCount == 0) {
			disableUndo();
		}
	} else {
		alert("no history");
	}
}

function gameScreen_touchstart(event) {
	if (gameData.isPlaying) {}
	event.preventDefault();
	var touchPoint = getTouchPoint(event);
	//alert("x:" + touchPoint.x + " y:" + touchPoint.y + " scroll:" + document.body.scrollTop);
	var windowY = touchPoint.y - document.body.scrollTop;
	if (windowY < 20) {
		window.scrollTo(0, 0);
	} else if (windowY > document.documentElement.clientHeight - 20) {
		window.scrollTo(0, 999);
	} else {
		doScroll();
		gameData.startPoint = getTouchPoint(event);
		gameData.startCell = new Cell(gameData.selectedCell.col, gameData.selectedCell.row);
		gameData.startTime = new Date().getTime();
		gameData.hasMoved = false;
		if (gameData.isContinuousInputMode) {
			gameData.continuousInputModeTimeout = setTimeout(function () {
				if (gameData.startPoint != null && !gameData.hasMoved) {
					deleteOverlapCells();
					gameData.isContinuousInputMode = false;
					gameData.continuousInputStartCell = null;
					gameData.continuousInputColor = null;
				}
			}, continuousInputModeTime);
		} else {
			gameData.continuousInputModeTimeout = setTimeout(function () {
				if (gameData.startPoint != null && !gameData.hasMoved) {
					gameData.isContinuousInputMode = true;
					gameData.continuousInputStartCell = new Cell(gameData.selectedCell.col, gameData.selectedCell.row);
					gameData.continuousInputColor = gameData.input[gameData.selectedCell.col][gameData.selectedCell.row];
					deg = 0;
					updateOverlapCells();
				}
			}, continuousInputModeTime);
		}
		if (usesMouseEvents) {
			gameData.mouseIsDown = true;
		}
	}
}

function gameScreen_touchend(event) {
	event.preventDefault();
	//$("#timer").html(event.originalEvent.touches.length);
	if (usesMouseEvents) {
		gameData.mouseIsDown = false;
	}
	var currentTime = new Date().getTime();
	clearTimeout(gameData.continuousInputModeTimeout);
	if (!gameData.hasMoved) {
		if (currentTime - gameData.startTime < continuousInputModeTime) {
			backupInput();
			if (gameData.isContinuousInputMode) {
				var fromCol = Math.min(gameData.continuousInputStartCell.col, gameData.selectedCell.col);
				var toCol = Math.max(gameData.continuousInputStartCell.col, gameData.selectedCell.col);
				var fromRow = Math.min(gameData.continuousInputStartCell.row, gameData.selectedCell.row);
				var toRow = Math.max(gameData.continuousInputStartCell.row, gameData.selectedCell.row);
				for (var col = fromCol; col <= toCol; col++) {
					for (var row = fromRow; row <= toRow; row++) {
						setInputCellColor(col, row, gameData.continuousInputColor);
					}
				}
				deleteOverlapCells();
				gameData.isContinuousInputMode = false;
				gameData.continuousInputStartCell = null;
				gameData.continuousInputColor = null;
			} else {
				changeSelectedCellColor();
			}
		}
	}
	gameData.hasMoved = false;
	gameData.startPoint = null;
	gameData.startCell = null;
	gameData.startTime = null;
}

function changeSelectedCellColor() {
	setInputCellStatus(gameData.selectedCell, getNextInputColor(gameData.input[gameData.selectedCell.col][gameData.selectedCell.row]));
}

function updateSelection(newCell) {
	//選択範囲
	$("#selectedCol")
	.css("left", (screenData.inputAreaStartX + gameData.selectedCell.col * screenData.inputCellWidth) + "px")
	.css("top", screenData.upNumberAreaStartY + "px");
	
	$("#selectedRow")
	.css("left", screenData.leftNumberAreaStartX + "px")
	.css("top", (screenData.inputAreaStartY + gameData.selectedCell.row * screenData.inputCellHeight) + "px");
	
	$("#selectedCell")
	.css("left", (screenData.inputAreaStartX + gameData.selectedCell.col * screenData.inputCellWidth) + "px")
	.css("top", (screenData.inputAreaStartY + gameData.selectedCell.row * screenData.inputCellHeight) + "px");
}

function deleteOverlapCells() {
	var fromCol = Math.min(gameData.continuousInputStartCell.col, gameData.selectedCell.col);
	var toCol = Math.max(gameData.continuousInputStartCell.col, gameData.selectedCell.col);
	var fromRow = Math.min(gameData.continuousInputStartCell.row, gameData.selectedCell.row);
	var toRow = Math.max(gameData.continuousInputStartCell.row, gameData.selectedCell.row);
	for (var col = fromCol; col <= toCol; col++) {
		for (var row = fromRow; row <= toRow; row++) {
			$("#" + getOverlapCellId(col, row)).remove();
		}
	}
}

function updateOverlapCells() {
	if (gameData.isContinuousInputMode) {
		var fromCol = Math.min(gameData.continuousInputStartCell.col, gameData.selectedCell.col);
		var toCol = Math.max(gameData.continuousInputStartCell.col, gameData.selectedCell.col);
		var fromRow = Math.min(gameData.continuousInputStartCell.row, gameData.selectedCell.row);
		var toRow = Math.max(gameData.continuousInputStartCell.row, gameData.selectedCell.row);
		for (var col = 0; col < screenData.inputColCount; col++) {
			for (var row = 0; row < screenData.inputRowCount; row++) {
				if (col >= fromCol && col <= toCol && row >= fromRow && row <= toRow) {
					if ($("#" + getOverlapCellId(col, row)).size() == 0) {
						createOverlapCell(col, row, gameData.continuousInputColor);
					}
				} else {
					if ($("#" + getOverlapCellId(col, row)).size() > 0) {
						deleteOverlapCell(col, row);
					}
				}
			}
		}
	}
}

function deleteOverlapCell(col, row) {
	//alert("delete " + getOverlapCellId(col, row));
	$("#" + getOverlapCellId(col, row)).remove();
}

function createOverlapCellCanvasId(cell) {
	return "overlapCellCanvas_" + cell.col + "_" + cell.row;
}

function createOverlapCell(col, row, color) {
	var id = getOverlapCellId(col, row);
	$('<div id="' + id + '"></div>')
	.appendTo("#nonogram")
	.addClass("overlapCell")
	.css("left", (screenData.inputAreaStartX + col * screenData.inputCellWidth + 3) + "px")
	.css("top", (screenData.inputAreaStartY + row * screenData.inputCellHeight + 3) + "px")
	.css("width", (screenData.inputCellWidth - 8) + "px")
	.css("height", (screenData.inputCellHeight - 8) + "px");
	switch (color) {
	case STATUS_WHITE:
		$("#" + id).addClass("white");
		break;
	case STATUS_BLACK:
		$("#" + id).addClass("black");
		break;
	case STATUS_CROSS:
		$("#" + id).addClass("cross");
		var canvasId = createOverlapCellCanvasId(new Cell(col, row));
		$("#" + id).append('<canvas id="' + canvasId + '" width="' + (screenData.inputCellWidth - 7) + '" height="' + (screenData.inputCellHeight - 7) + '"></canvas>');
		var canvas = $("#" + canvasId).get(0);
		//Canvas要素の対応チェック
		if (canvas && canvas.getContext) {
			var ctx = canvas.getContext('2d');
			ctx.lineWidth = 1;
			ctx.strokeStyle = "rgba(127, 127, 127, 0.8)";
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(screenData.inputCellWidth - 8, screenData.inputCellHeight - 8);
			ctx.moveTo(0, screenData.inputCellHeight - 8);
			ctx.lineTo(screenData.inputCellWidth - 8, 0);
			ctx.closePath();
			ctx.stroke();
		}
		break;
	}
}

// 入力セルがタッチされたとき
function inputCell_touchstart(event) {
	if (gameData.isPlaying) {
		if (usesMouseEvents) {
			gameData.mouseIsDown = true;
		}
		event.preventDefault();
		var col = event.data.col;
		var row = event.data.row;
		switch (gameData.input[col][row]) {
		case 0:
			black(col, row);
			break;
		case 1:
			batsu(col, row);
			break;
		case 2:
			white(col, row);
			break;
		}
	}
}

//n<minならminを、min<=n<=maxならnを、max<nならmaxを返す
function clip(n, min, max) {
	if (n > max) {
		return max;
	} else if (n < min) {
		return min;
	} else {
		return n;
	}
}

// タッチ後に動かしたとき
function gameScreen_touchmove(event) {
	event.preventDefault();
	if (!usesMouseEvents || gameData.mouseIsDown) {
		var currentPoint = getTouchPoint(event);
		var xChange = currentPoint.x - gameData.startPoint.x;
		var yChange = currentPoint.y - gameData.startPoint.y;
		if (Math.abs(xChange) > Math.abs(yChange) * 3) {
			yChange = 0;
		} else if (Math.abs(yChange) > Math.abs(xChange) * 3) {
			xChange = 0;
		}
		var colChange = Math.floor(xChange / 30);
		var rowChange = Math.floor(yChange / 30);
		if (colChange != 0 || rowChange != 0) {
			gameData.hasMoved = true;
		}
		var oldSelectedCell = new Cell(gameData.selectedCell.col, gameData.selectedCell.row);
		gameData.selectedCell.col = clip(gameData.startCell.col + colChange, 0, screenData.upNumberColCount - 1);
		gameData.selectedCell.row = clip(gameData.startCell.row + rowChange, 0, screenData.leftNumberRowCount - 1);
		if (oldSelectedCell.col != gameData.selectedCell.col || oldSelectedCell.row != gameData.selectedCell.row) {
			updateSelection();
			updateOverlapCells();
		}
	}
}

function getTouchPoint(event) {
	if (usesMouseEvents) {
		return new Point(event.originalEvent.pageX, event.originalEvent.pageY);
	} else {
		return new Point(event.originalEvent.touches[0].pageX, event.originalEvent.touches[0].pageY);
	}
}

function getNextInputColor(color) {
	switch (color) {
	case 0:
		return 1;
	case 1:
		return 2;
	case 2:
		return 0;
	}
}

function setInputCellColor(col, row, color) {
	setInputCellStatus(new Cell(col, row), color);
}

function createInputCellCanvasId(cell) {
	return "inputCellCanvas_" + cell.col + "_" + cell.row;
}

function setInputCellStatus(cell, status) {
	var oldStatus = gameData.input[cell.col][cell.row];
	console.log("oldStatus:" + oldStatus + " newStatus:" + status);
	var id = getInputCellId(cell.col, cell.row);
	if (oldStatus != status) {
		switch (oldStatus) {
		case STATUS_WHITE:
			$("#" + id).removeClass("white");
			break;
		case STATUS_BLACK:
			$("#" + id).removeClass("black");
			break;
		case STATUS_CROSS:
			$("#" + id).removeClass("cross");
			//canvas要素を消す
			$("#" + createInputCellCanvasId(cell)).remove();
			break;
		}
		switch (status) {
		case STATUS_WHITE:
			$("#" + id).addClass("white");
			break;
		case STATUS_BLACK:
			$("#" + id).addClass("black");
			break;
		case STATUS_CROSS:
			$("#" + id).addClass("cross");
			//canvas要素でxを書く
			var canvasId = createInputCellCanvasId(cell);
			$("#" + id).append('<canvas id="' + canvasId + '" width="' + screenData.inputCellWidth + '" height="' + screenData.inputCellHeight + '"></canvas>');
			$("#" + canvasId).addClass("fadeout");
			var canvas = $("#" + canvasId).get(0);
			//Canvas要素の対応チェック
			if (canvas && canvas.getContext) {
				var ctx = canvas.getContext('2d');
				ctx.lineWidth = 1;
				ctx.strokeStyle = "rgba(0, 0, 0)";
				ctx.beginPath();
				ctx.moveTo(3, 3);
				ctx.lineTo(screenData.inputCellWidth - 5, screenData.inputCellHeight - 5);
				ctx.moveTo(3, screenData.inputCellHeight - 5);
				ctx.lineTo(screenData.inputCellWidth - 5, 3);
				ctx.closePath();
				ctx.stroke();
			}
			break;
		}
		gameData.input[cell.col][cell.row] = status;
		checkColAndRow(cell.col, cell.row);
	}
}

function getInputCellId(col, row) {
	return "inputCell_" + col + "_" + row;
}

function getOverlapCellId(col, row) {
	return "overlapCell_" + col + "_" + row;
}

function getUpNumberCellId(col, row) {
	return "upNumberCell_" + col + "_" + row;
}

function getLeftNumberCellId(col, row) {
	return "leftNumberCell_" + col + "_" + row;
}

//列の正しさチェック
function checkCol(col) {
	var inputColChunks = [];
	var isInChunk = false;
	for (var row = 0, inputColChunkNumber = 0; row < screenData.inputRowCount; row++) {
		if (gameData.input[col][row] == 1) {
			if (!isInChunk) {
				isInChunk = true;
				inputColChunks.push(1);
			} else {
				inputColChunks[inputColChunks.length - 1]++;
			}
		} else if (isInChunk) {
			isInChunk = false;
		}
	}
	if (inputColChunks.length == 0) {
		inputColChunks.push(0);
	}
	var lastCorrectness = gameData.upNumberColCorrectness[col];
	if (inputColChunks.length == nonogramData.verticalClue[col].length) {
		gameData.upNumberColCorrectness[col] = true;
		for (var i = 0; i < nonogramData.verticalClue[col].length; i++) {
			if (inputColChunks[i] != nonogramData.verticalClue[col][i]) {
				gameData.upNumberColCorrectness[col] = false;
				break;
			}
		}
	} else {
		gameData.upNumberColCorrectness[col] = false;
	}
	if (!lastCorrectness && gameData.upNumberColCorrectness[col]) {
		checkColAndRowCorrectness();
	}
	/*
	while (upNumber[col][upNumberRow] == inputColChunk[inputColChunkNumber]) {
		if (upNumberRow == screenData.upNumberRowCount - 1) {
			if (inputColChunkNumber == screenData.upNumberRowCount - 1 || inputColChunk[inputColChunkNumber + 1] == 0) {
				gameData.upNumberColCorrectness[col] = true;
				checkColAndRowCorrectness();
			}
			break;
		} else {
			upNumberRow++;
			inputColChunkNumber++;
		}
	}
	*/
}

//行の正しさチェック
function checkRow(row) {
	/*
	var inputRowChunk = new Array(screenData.leftNumberColCount);
	for (var inputRowChunkNumber = 0; inputRowChunkNumber < screenData.leftNumberColCount; inputRowChunkNumber++) {
		inputRowChunk[inputRowChunkNumber] = 0;
	}
	for (var col = 0, inputRowChunkNumber = 0; col < screenData.inputColCount; col++) {
		if (gameData.input[col][row] == 1) {
			inputRowChunk[inputRowChunkNumber]++;
		} else if (inputRowChunk[inputRowChunkNumber] > 0) {
			inputRowChunkNumber++;
		}
	}
	gameData.leftNumberRowCorrectness[row] = false;
	var leftNumberCol = 0;
	var inputRowChunkNumber = 0
	while (leftNumberCol < screenData.leftNumberColCount - 1 && leftNumber[leftNumberCol][row] == 0) {
		leftNumberCol++;
	}
	while (leftNumber[leftNumberCol][row] == inputRowChunk[inputRowChunkNumber]) {
		if (leftNumberCol == screenData.leftNumberColCount - 1) {
			if (inputRowChunkNumber == screenData.leftNumberColCount - 1 || inputRowChunk[inputRowChunkNumber + 1] == 0) {
				gameData.leftNumberRowCorrectness[row] = true;
				checkColAndRowCorrectness();
			}
			break;
		} else {
			leftNumberCol++;
			inputRowChunkNumber++;
		}
	}
	*/
	var inputRowChunks = [];
	var isInChunk = false;
	for (var col = 0, inputRowChunkNumber = 0; col < screenData.inputColCount; col++) {
		if (gameData.input[col][row] == 1) {
			if (!isInChunk) {
				isInChunk = true;
				inputRowChunks.push(1);
			} else {
				inputRowChunks[inputRowChunks.length - 1]++;
			}
		} else if (isInChunk) {
			isInChunk = false;
		}
	}
	if (inputRowChunks.length == 0) {
		inputRowChunks.push(0);
	}
	//alert(inputRowChunks + " " + nonogramData.horizontalClue[row]);
	var lastCorrectness = gameData.leftNumberRowCorrectness[row];
	if (inputRowChunks.length == nonogramData.horizontalClue[row].length) {
		gameData.leftNumberRowCorrectness[row] = true;
		for (var i = 0; i < nonogramData.horizontalClue[row].length; i++) {
			if (inputRowChunks[i] != nonogramData.horizontalClue[row][i]) {
				gameData.leftNumberRowCorrectness[row] = false;
				break;
			}
		}
	} else {
		gameData.leftNumberRowCorrectness[row] = false;
	}
	if (!lastCorrectness && gameData.leftNumberRowCorrectness[row]) {
		checkColAndRowCorrectness();
	}
}

//行と列の正しさチェック
function checkColAndRow(col, row) {
	checkCol(col);
	checkRow(row);
}

//すべての列と行について正しいとされているかチェック
function checkColAndRowCorrectness() {
	for (var col = 0; col < screenData.inputColCount; col++) {
		if (!gameData.upNumberColCorrectness[col]) {
			return;
		}
	}
	for (var row = 0; row < screenData.inputRowCount; row++) {
		if (!gameData.leftNumberRowCorrectness[row]) {
			return;
		}
	}
	clear();
}

var currentframe = 0;

//クリア画面を表示
function clear() {
	gameData.isPlaying = false;
	$("#nonogram")
	.unbind(touchstart, gameScreen_touchstart)
	.unbind(touchmove, gameScreen_touchmove)
	.unbind(touchend, gameScreen_touchend);
	$("#undoButton").unbind(touchstart, undoButton_touchstart);
	var rand = null;
	var frameNum = null;
	if (screenData.inputColCount < screenData.inputRowCount) {
		rand = 0;
		frameNum = screenData.inputRowCount;
	} else if (screenData.inputColCount > screenData.inputRowCount) {
		rand = 1;
		frameNum = screenData.inputColCount;
	} else {
		rand = 2;
		frameNum = screenData.inputColCount + screenData.inputRowCount - 1;
	}
	$(".fadeout").animate({opacity: 0.0}, 1000, "linear", function() {
		$(this).remove();
	});
	setTimeout(function () {
		animateWithFrame(frameNum, 100, function (frame) {
			if (rand == 0) {
				var row = frame;
				for (var col = 0; col < screenData.inputColCount; col++) {
					convertInputCellToResultCell(new Cell(col, row));
				}
			} else if (rand == 1) {
				var col = frame;
				for (var row = 0; row < screenData.inputRowCount; row++) {
					convertInputCellToResultCell(new Cell(col, row));
				}
			} else if (rand == 2) {
				var offset = frame;
				for (var col = Math.max(0, offset - screenData.inputColCount + 1); col <= Math.min(screenData.inputColCount - 1, offset); col++) {
					var row = offset - col;
					convertInputCellToResultCell(new Cell(col, row));
				}
			}
		}, function() {
			$("#inputArea").animate({left: screenData.shrinkedInputAreaStartX, top: screenData.shrinkedInputAreaStartY}, 1000, "linear", function () {
				createResultTexts();
				createResultButtons();
			});
		});
	}, 1000);
}

function createResultTexts () {
	$('<div id="title"></div>')
	.appendTo("#nonogram")
	.addClass("fadein")
	.css({
		left: screenData.titleAreaStartX,
		top: screenData.titleAreaStartY,
		width: screenData.titleAreaWidth + "px",
		height: screenData.titleAreaHeight + "px",
		lineHeight: screenData.titleAreaHeight + "px",
		opacity: 0
	})
	.append(nonogramData.title);
	
	$('<div id="message"></div>')
	.appendTo("#nonogram")
	.addClass("fadein")
	.css({
		left: screenData.descriptionAreaStartX,
		top: screenData.descriptionAreaStartY,
		width: screenData.descriptionAreaWidth + "px",
		height: screenData.descriptionAreaHeight + "px",
		opacity: 0
	})
	.append(nonogramData.message);
	
	$(".fadein").animate({
		opacity: 1
	}, 1000);
}

function createResultButtons () {
	$("#bottomArea").css({textAlign: "center"});
	$('<button>List of puzzles</button>')
	.appendTo("#bottomArea")
	.addClass("resultButton")
	.css({opacity: 0})
	.animate({opacity: 1}, 1000, "linear", function () {
	})
	$('<button>Next puzzle</button>')
	.appendTo("#bottomArea")
	.addClass("resultButton")
	.css({opacity: 0})
	.animate({opacity: 1}, 1000, "linear", function () {
	})
}

function animateWithFrame(n, ms, f, callback) {
	var frame = 0;
	var id = setInterval(
		function () {
			f(frame);
			frame++;
			if (frame >= n) {
				clearInterval(id);
				callback();
			}
		},
		ms
	);
}

function convertInputCellToResultCell(cell) {
	obj = $("#" + getInputCellId(cell.col, cell.row))
	obj
	.addClass("resultCell")
	.css("width", screenData.inputCellWidth + "px")
	.css("height", screenData.inputCellHeight + "px");
	if (cell.col == 0) {
		obj
		.addClass("left")
		.css("left", addPx(obj.css("left"), -1));
	}
	if (cell.col == screenData.inputColCount - 1) {
		obj.addClass("right");
	}
	if (cell.row == 0) {
		obj
		.addClass("top")
		.css("top", addPx(obj.css("top"), -1));
	}
	if (cell.row == screenData.inputRowCount - 1) {
		obj.addClass("bottom");
	}
}

function addPx(pxString, n) {
	var pxNumber = new Number(pxString.replace(/[^-0-9\s]+/g, ''));
	return (n + pxNumber) + "px";
}

function doScroll() {
	if(window.pageYOffset === 0) {
		window.scrollTo(0, 0);
	}
		//alert("width:" + document.documentElement.clientWidth + " height:" + document.documentElement.clientHeight);
}

function undoButton_touchstart(event) {
	restoreInput();
}

function enableUndo() {
	$("#undoButton")
	.removeAttr("disabled")
	.bind(touchstart, undoButton_touchstart);
}

function disableUndo() {
	$("#undoButton")
	.attr("disabled", "disabled")
	.unbind(touchstart, undoButton_touchstart);
}

function preventDefault(event) {
	event.preventDefault();
}

function nondestructiveArrayReverse(array) {
	var result = new Array(array.length);
	for (var i = 0; i < array.length; i++) {
		result[i] = array[array.length - 1 - i];
	}
	return result;
}
