/**
 * @author Owner
 */

//以下設定項目
const usesMouseEvents = (location.href.indexOf("nonogramtouch.com") == -1);
const screenWidth = 320;
const screenHeight = 480;
const marginLeft = 10;
const marginRight = 10;
const marginTop = 10;
const marginBottom = 10;
const marginLeftOfInputArea = 5;
const marginTopOfInputArea = 5;
const marginBetweenInputAreaAndBottomArea = 10;
const marginBetweenBottomAreaAndButtonArea = 10;
const continuousInputModeTime = 600;
const inputHistoryMaxCount = 10;
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
//mousemoveはボタンを押さなくても発生するので、ボタンを押しているかどうかの記録が必要
var mouseIsDown = false;

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

const upNumberColCount = inputColCount;
const upNumberRowCount = Math.ceil(inputRowCount / 2);
const leftNumberColCount = Math.ceil(inputColCount / 2);
const leftNumberRowCount = inputRowCount;

const inputCellWidth = Math.floor((screenWidth - marginLeft - marginRight - marginLeftOfInputArea) / (inputColCount + leftNumberColCount * numberCellSizeRatio));
const inputCellHeight = inputCellWidth;
const upNumberCellWidth = inputCellWidth;
const upNumberCellHeight = Math.floor(inputCellHeight * numberCellSizeRatio);
const leftNumberCellWidth = Math.floor(inputCellWidth * numberCellSizeRatio);
const leftNumberCellHeight = inputCellHeight;

const upNumberAreaWidth = upNumberCellWidth * upNumberColCount;
const upNumberAreaHeight = upNumberCellHeight * upNumberRowCount;
const leftNumberAreaWidth = leftNumberCellWidth * leftNumberColCount;
const leftNumberAreaHeight = leftNumberCellHeight * leftNumberRowCount;

const upNumberAreaStartX = marginLeft + leftNumberCellWidth * leftNumberColCount + marginLeftOfInputArea;
const upNumberAreaStartY = marginTop;
const leftNumberAreaStartX = marginLeft;
const leftNumberAreaStartY = marginTop + upNumberCellHeight * upNumberRowCount + marginTopOfInputArea;

const inputAreaStartX = upNumberAreaStartX;
const inputAreaStartY = leftNumberAreaStartY;
const inputAreaWidth = inputCellWidth * inputColCount;
const inputAreaHeight = inputCellHeight * inputRowCount;

const shrinkedInputAreaWidth = (inputCellWidth - 2) * inputColCount + 2;
const shrinkedInputAreaHeight = (inputCellHeight - 2) * inputRowCount + 2;
const shrinkedInputAreaStartX = Math.floor((screenWidth - shrinkedInputAreaWidth) / 2);
const shrinkedInputAreaStartY = inputAreaStartY + Math.floor((inputAreaHeight - shrinkedInputAreaHeight) / 2);

const bottomAreaHeight = inputCellHeight;
const bottomAreaWidth = screenWidth - marginLeft - marginRight;
const bottomAreaStartX = marginLeft;
const bottomAreaStartY = inputAreaStartY + inputAreaHeight + marginBetweenInputAreaAndBottomArea;

const mainScreenHeight = bottomAreaStartY + bottomAreaHeight + marginBetweenBottomAreaAndButtonArea;

const buttonAreaHeight = Math.floor(mainScreenHeight / 2);
const buttonAreaWidth = screenWidth - marginLeft - marginRight;
const buttonAreaStartX = marginLeft;
const buttonAreaStartY = bottomAreaStartY + bottomAreaHeight + marginBetweenBottomAreaAndButtonArea;

//const screenHeight = buttonAreaStartY + buttonAreaHeight + marginBottom;

//入力ステータス
var input = new Array(inputColCount);
for (var col = 0; col < inputColCount; col++) {
	input[col] = new Array(inputRowCount);
	for (var row = 0; row < inputRowCount; row++) {
		input[col][row] = 0;
	}
}
//入力ヒストリー
var inputHistoryCount = 0;
var inputHistory = new Array();

//正解チェック
var upNumberColCorrectness = new Array(upNumberColCount);
var leftNumberRowCorrectness = new Array(leftNumberRowCount);
for (var col = 0; col < inputColCount; col++) {
	checkCol(col);
}
for (var row = 0; row < inputRowCount; row++) {
	checkRow(row);
}
checkColAndRowCorrectness();

//プレイ中（操作可能）かどうか
var isPlaying = true;

//選択中のセル
var selectedCell = new Cell(0, 0);

const nonogramRect = new Rect(marginTop, inputAreaStartX + inputAreaWidth, inputAreaStartY + inputAreaHeight, marginLeft);

var startPoint = null;
var startCell = null;
var startTime = null;
var hasMoved = false;

//連続入力モード
var isContinuousInputMode = false;
var continuousInputStartCell = null;
var continuousInputColor = null;
var continuousInputModeTimeout = null;

//クリア画像の先読み
$('<img src="/img/clear.gif">');

// ===============================================
// ゲーム画面を生成
// ===============================================
window.onload = function() {
	setTimeout(doScroll, 100);
	initGameScreen();
	initNonogram();
	initBottomArea();
}

function initBottomArea() {
	createBottomArea();
	createUndoButton();
}

function createBottomArea() {
	$('<div id="bottomArea"></div>')
	.appendTo("#gameScreen")
	.css("position", "absolute")
	.css("top", bottomAreaStartY + "px")
	.css("left", bottomAreaStartX + "px")
	.css("width", bottomAreaWidth + "px")
	.css("height", bottomAreaHeight + "px")
	.css("text-align", "right")
	.css("line-height", bottomAreaHeight + "px");
}

function createUndoButton() {
	$('<button id="undoButton">Undo</button>')
	.appendTo("#bottomArea")
	.bind(touchstart, preventDefault);
	disableUndo();
}

function backupInput() {
	if (inputHistoryCount == inputHistoryMaxCount) {
		inputHistory.shift();
	} else {
		if (inputHistoryCount == 0) {
			enableUndo();
		}
		inputHistoryCount++;
	}
	var backup = new Array(inputColCount);
	for (var col = 0; col < inputColCount; col++) {
		backup[col] = new Array(inputRowCount);
		for (var row = 0; row < inputRowCount; row++) {
			backup[col][row] = input[col][row];
		}
	}
	inputHistory.push(backup);	
}

function initGameScreen() {
	$("#gameScreen")
	.css("width", screenWidth + "px")
	.css("height", screenHeight + "px")
	.css("font-size", Math.floor(inputCellHeight * 0.6) + "px");
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
	.css("left", upNumberAreaStartX + "px")
	.css("top", upNumberAreaStartY + "px")
	.css("width", upNumberAreaWidth + "px")
	.css("height", upNumberAreaHeight + "px");
}

function createUpNumberCells() {
	//上の数字セル
	for (var col = 0; col < upNumberColCount; col++) {
		for (var row = 0; row < upNumberRowCount; row++) {
			var id = getUpNumberCellId(col, row);
			var x = col * upNumberCellWidth;
			var y = row * upNumberCellHeight;
			var content;
			if (upNumber[col][row] == 0 && row != upNumberRowCount - 1) {
				content = "";
			} else {
				content = upNumber[col][row];
			}
			$('<div id="' + id + '"></div>')
			.appendTo("#upNumberArea")
			.addClass("numberCell")
			.css("left", x + "px")
			.css("top", y + "px")
			.css("width", upNumberCellWidth + "px")
			.css("height", upNumberCellHeight + "px")
			.css("line-height", upNumberCellHeight + "px")
			.html(content);
			if (col % 2 == 0) {
				$("#" + id).addClass("even");
			} else {
				$("#" + id).addClass("odd");
			}
		}
	}
}

function createLeftNumberArea() {
	$('<div id="leftNumberArea"></div>')
	.appendTo("#nonogram")
	.css("left", leftNumberAreaStartX + "px")
	.css("top", leftNumberAreaStartY + "px")
	.css("width", leftNumberAreaWidth + "px")
	.css("height", leftNumberAreaHeight + "px");
}

function createLeftNumberCells() {
	//左の数字セル
	for (var col = 0; col < leftNumberColCount; col++) {
		for (var row = 0; row < leftNumberRowCount; row++) {
			var id = getLeftNumberCellId(col, row);
			var x = col * leftNumberCellWidth;
			var y = row * leftNumberCellHeight;
			var content;
			if (leftNumber[col][row] == 0 && col != leftNumberColCount - 1) {
				content = "";
			} else {
				content = leftNumber[col][row];
			}
			$('<div id="' + id + '"></div>')
			.appendTo("#leftNumberArea")
			.addClass("numberCell")
			.css("left", x + "px")
			.css("top", y + "px")
			.css("width", leftNumberCellWidth + "px")
			.css("height", leftNumberCellHeight + "px")
			.css("line-height", leftNumberCellHeight + "px")
			.html(content);
			if (row % 2 == 0) {
				$("#" + id).addClass("even");
			} else {
				$("#" + id).addClass("odd");
			}
		}
	}
}

function createInputArea() {
	//入力エリア
	$("#nonogram").append('<div id="inputArea"></div>');
	$("#inputArea")
	.css("position", "absolute")
	.css("left", inputAreaStartX + "px")
	.css("top", inputAreaStartY + "px")
	.css("width", inputAreaWidth + "px");
}

function createInputCells() {
	//入力セル
	for (var col = 0; col < inputColCount; col++) {
		for (var row = 0; row < inputRowCount; row++) {
			var id = getInputCellId(col, row);
			var x = col * inputCellWidth;
			var y = row * inputCellHeight;
			$('<div id="' + id + '"></div>')
			.appendTo("#inputArea")
			.addClass("inputCell")
			.addClass("white")
			.css("position", "absolute")
			.css("left", x + "px")
			.css("top", y + "px")
			.css("width", (inputCellWidth - 2) + "px")
			.css("height", (inputCellHeight - 2) + "px");
		}
	}
}

function createSelection() {
	//選択列
	$('<div id="selectedCol"></div>')
	.appendTo("#nonogram")
	.addClass("selection")
	.css("left", (inputAreaStartX + selectedCell.col * inputCellWidth) + "px")
	.css("top", upNumberAreaStartY + "px")
	.css("width", (inputCellWidth - 0) + "px")
	.css("height", (nonogramRect.height - 0) + "px");
	//選択行
	$('<div id="selectedRow"></div>')
	.appendTo("#nonogram")
	.addClass("selection")
	.css("left", leftNumberAreaStartX + "px")
	.css("top", (inputAreaStartY + selectedCell.row * inputCellHeight) + "px")
	.css("width", (nonogramRect.width - 0) + "px")
	.css("height", (inputCellHeight) + "px");
	//選択セル
	$('<div id="selectedCell"></div>')
	.appendTo("#nonogram")
	.addClass("selection")
	.css("left", (inputAreaStartX + selectedCell.col * inputCellWidth) + "px")
	.css("top", (inputAreaStartY + selectedCell.row * inputCellHeight) + "px")
	.css("width", (inputCellWidth - 4) + "px")
	.css("height", (inputCellHeight - 4) + "px");
}

//restore previous input (undo)
function restoreInput() {
	if (inputHistoryCount > 0) {
		var backup = inputHistory.pop();
		for (var col = 0; col < inputColCount; col++) {
			for (var row = 0; row < inputRowCount; row++) {
				setInputCellStatus(new Cell(col, row), backup[col][row]);
			}
		}
		inputHistoryCount--;
		if (inputHistoryCount == 0) {
			disableUndo();
		}
	} else {
		alert("no history");
	}
}

function gameScreen_touchstart(event) {
	event.preventDefault();
	doScroll();
	startPoint = getTouchPoint(event);
	startCell = new Cell(selectedCell.col, selectedCell.row);
	startTime = new Date().getTime();
	hasMoved = false;
	if (isContinuousInputMode) {
		continuousInputModeTimeout = setTimeout(function () {
			if (startPoint != null && !hasMoved) {
				deleteOverlapCells();
				isContinuousInputMode = false;
				continuousInputStartCell = null;
				continuousInputColor = null;
			}
		}, continuousInputModeTime);
	} else {
		continuousInputModeTimeout = setTimeout(function () {
			if (startPoint != null && !hasMoved) {
				isContinuousInputMode = true;
				continuousInputStartCell = new Cell(selectedCell.col, selectedCell.row);
				continuousInputColor = input[selectedCell.col][selectedCell.row];
				deg = 0;
				updateOverlapCells();
			}
		}, continuousInputModeTime);
	}
	if (usesMouseEvents) {
		mouseIsDown = true;
	}
}

function gameScreen_touchend(event) {
	event.preventDefault();
	//$("#timer").html(event.originalEvent.touches.length);
	if (usesMouseEvents) {
		mouseIsDown = false;
	}
	var currentTime = new Date().getTime();
	clearTimeout(continuousInputModeTimeout);
	if (!hasMoved) {
		if (currentTime - startTime < continuousInputModeTime) {
			backupInput();
			if (isContinuousInputMode) {
				var fromCol = Math.min(continuousInputStartCell.col, selectedCell.col);
				var toCol = Math.max(continuousInputStartCell.col, selectedCell.col);
				var fromRow = Math.min(continuousInputStartCell.row, selectedCell.row);
				var toRow = Math.max(continuousInputStartCell.row, selectedCell.row);
				for (var col = fromCol; col <= toCol; col++) {
					for (var row = fromRow; row <= toRow; row++) {
						setInputCellColor(col, row, continuousInputColor);
					}
				}
				deleteOverlapCells();
				isContinuousInputMode = false;
				continuousInputStartCell = null;
				continuousInputColor = null;
			} else {
				changeSelectedCellColor();
			}
		}
	}
	hasMoved = false;
	startPoint = null;
	startCell = null;
	startTime = null;
}

function changeSelectedCellColor() {
	setInputCellStatus(selectedCell, getNextInputColor(input[selectedCell.col][selectedCell.row]));
}

function updateSelection(newCell) {
	//選択範囲
	$("#selectedCol")
	.css("left", (inputAreaStartX + selectedCell.col * inputCellWidth) + "px")
	.css("top", upNumberAreaStartY + "px");
	
	$("#selectedRow")
	.css("left", leftNumberAreaStartX + "px")
	.css("top", (inputAreaStartY + selectedCell.row * inputCellHeight) + "px");
	
	$("#selectedCell")
	.css("left", (inputAreaStartX + selectedCell.col * inputCellWidth) + "px")
	.css("top", (inputAreaStartY + selectedCell.row * inputCellHeight) + "px");
	
}

function deleteOverlapCells() {
	var fromCol = Math.min(continuousInputStartCell.col, selectedCell.col);
	var toCol = Math.max(continuousInputStartCell.col, selectedCell.col);
	var fromRow = Math.min(continuousInputStartCell.row, selectedCell.row);
	var toRow = Math.max(continuousInputStartCell.row, selectedCell.row);
	for (var col = fromCol; col <= toCol; col++) {
		for (var row = fromRow; row <= toRow; row++) {
			$("#" + getOverlapCellId(col, row)).remove();
		}
	}
}

function updateOverlapCells() {
	if (isContinuousInputMode) {
		var fromCol = Math.min(continuousInputStartCell.col, selectedCell.col);
		var toCol = Math.max(continuousInputStartCell.col, selectedCell.col);
		var fromRow = Math.min(continuousInputStartCell.row, selectedCell.row);
		var toRow = Math.max(continuousInputStartCell.row, selectedCell.row);
		for (var col = 0; col < inputColCount; col++) {
			for (var row = 0; row < inputRowCount; row++) {
				if (col >= fromCol && col <= toCol && row >= fromRow && row <= toRow) {
					if ($("#" + getOverlapCellId(col, row)).size() == 0) {
						createOverlapCell(col, row, continuousInputColor);
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
	.css("left", (inputAreaStartX + col * inputCellWidth + 3) + "px")
	.css("top", (inputAreaStartY + row * inputCellHeight + 3) + "px")
	.css("width", (inputCellWidth - 8) + "px")
	.css("height", (inputCellHeight - 8) + "px");
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
		$("#" + id).append('<canvas id="' + canvasId + '" width="' + (inputCellWidth - 7) + '" height="' + (inputCellHeight - 7) + '"></canvas>');
		var canvas = $("#" + canvasId).get(0);
		//Canvas要素の対応チェック
		if (canvas && canvas.getContext) {
			var ctx = canvas.getContext('2d');
			ctx.lineWidth = 1;
			ctx.strokeStyle = "rgba(127, 127, 127, 0.8)";
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(inputCellWidth - 8, inputCellHeight - 8);
			ctx.moveTo(0, inputCellHeight - 8);
			ctx.lineTo(inputCellWidth - 8, 0);
			ctx.closePath();
			ctx.stroke();
		}
		break;
	}
}

// 入力セルがタッチされたとき
function inputCell_touchstart(event) {
	if (isPlaying) {
		if (usesMouseEvents) {
			mouseIsDown = true;
		}
		event.preventDefault();
		var col = event.data.col;
		var row = event.data.row;
		switch (input[col][row]) {
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
	if (!usesMouseEvents || mouseIsDown) {
		var currentPoint = getTouchPoint(event);
		var xChange = currentPoint.x - startPoint.x;
		var yChange = currentPoint.y - startPoint.y;
		if (Math.abs(xChange) > Math.abs(yChange) * 3) {
			yChange = 0;
		} else if (Math.abs(yChange) > Math.abs(xChange) * 3) {
			xChange = 0;
		}
		var colChange = Math.floor(xChange / 30);
		var rowChange = Math.floor(yChange / 30);
		if (colChange != 0 || rowChange != 0) {
			hasMoved = true;
		}
		var oldSelectedCell = new Cell(selectedCell.col, selectedCell.row);
		selectedCell.col = clip(startCell.col + colChange, 0, upNumberColCount - 1);
		selectedCell.row = clip(startCell.row + rowChange, 0, leftNumberRowCount - 1);
		if (oldSelectedCell.col != selectedCell.col || oldSelectedCell.row != selectedCell.row) {
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
	var oldStatus = input[cell.col][cell.row];
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
			$("#" + id).append('<canvas id="' + canvasId + '" width="' + inputCellWidth + '" height="' + inputCellHeight + '"></canvas>');
			var canvas = $("#" + canvasId).get(0);
			//Canvas要素の対応チェック
			if (canvas && canvas.getContext) {
				var ctx = canvas.getContext('2d');
				ctx.lineWidth = 1;
				ctx.strokeStyle = "rgba(0, 0, 0)";
				ctx.beginPath();
				ctx.moveTo(3, 3);
				ctx.lineTo(inputCellWidth - 5, inputCellHeight - 5);
				ctx.moveTo(3, inputCellHeight - 5);
				ctx.lineTo(inputCellWidth - 5, 3);
				ctx.closePath();
				ctx.stroke();
			}
			break;
		}
		input[cell.col][cell.row] = status;
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
	var inputColChunk = new Array(upNumberRowCount);
	for (var inputColChunkNumber = 0; inputColChunkNumber < upNumberRowCount; inputColChunkNumber++) {
		inputColChunk[inputColChunkNumber] = 0;
	}
	for (var row = 0, inputColChunkNumber = 0; row < inputRowCount; row++) {
		if (input[col][row] == 1) {
			inputColChunk[inputColChunkNumber]++;
		} else if (inputColChunk[inputColChunkNumber] > 0) {
			inputColChunkNumber++;
		}
	}
	upNumberColCorrectness[col] = false;
	var upNumberRow = 0;
	var inputColChunkNumber = 0
	while (upNumberRow < upNumberRowCount - 1 && upNumber[col][upNumberRow] == 0) {
		upNumberRow++;
	}
	while (upNumber[col][upNumberRow] == inputColChunk[inputColChunkNumber]) {
		if (upNumberRow == upNumberRowCount - 1) {
			if (inputColChunkNumber == upNumberRowCount - 1 || inputColChunk[inputColChunkNumber + 1] == 0) {
				upNumberColCorrectness[col] = true;
				checkColAndRowCorrectness();
			}
			break;
		} else {
			upNumberRow++;
			inputColChunkNumber++;
		}
	}
}

//行の正しさチェック
function checkRow(row) {
	var inputRowChunk = new Array(leftNumberColCount);
	for (var inputRowChunkNumber = 0; inputRowChunkNumber < leftNumberColCount; inputRowChunkNumber++) {
		inputRowChunk[inputRowChunkNumber] = 0;
	}
	for (var col = 0, inputRowChunkNumber = 0; col < inputRowCount; col++) {
		if (input[col][row] == 1) {
			inputRowChunk[inputRowChunkNumber]++;
		} else if (inputRowChunk[inputRowChunkNumber] > 0) {
			inputRowChunkNumber++;
		}
	}
	leftNumberRowCorrectness[row] = false;
	var leftNumberCol = 0;
	var inputRowChunkNumber = 0
	while (leftNumberCol < leftNumberColCount - 1 && leftNumber[leftNumberCol][row] == 0) {
		leftNumberCol++;
	}
	while (leftNumber[leftNumberCol][row] == inputRowChunk[inputRowChunkNumber]) {
		if (leftNumberCol == leftNumberColCount - 1) {
			if (inputRowChunkNumber == leftNumberColCount - 1 || inputRowChunk[inputRowChunkNumber + 1] == 0) {
				leftNumberRowCorrectness[row] = true;
				checkColAndRowCorrectness();
			}
			break;
		} else {
			leftNumberCol++;
			inputRowChunkNumber++;
		}
	}
}

//行と列の正しさチェック
function checkColAndRow(col, row) {
	checkCol(col);
	checkRow(row);
}

//すべての列と行について正しいとされているかチェック
function checkColAndRowCorrectness() {
	for (var col = 0; col < inputColCount; col++) {
		if (!upNumberColCorrectness[col]) {
			return;
		}
	}
	for (var row = 0; row < inputRowCount; row++) {
		if (!leftNumberRowCorrectness[row]) {
			return;
		}
	}
	clear();
}

var currentframe = 0;

//クリア画面を表示
function clear() {
	var rand = Math.floor(Math.random() * 3);
	var fadingOutTime = 8;
	var showingResultTime;
	if (rand == 2) {
		showingResultTime = inputColCount + inputRowCount - 1;
	} else {
		showingResultTime = inputColCount;
	}
	var intervalId = setInterval(function () {
		if (currentframe < fadingOutTime - 1) {
			var opacity = 1.0 -  (currentframe + 1) / fadingOutTime;
			$("#upNumberArea").css("opacity", opacity);
			$("#leftNumberArea").css("opacity", opacity);
			$("#selectedCol").css("opacity", opacity);
			$("#selectedRow").css("opacity", opacity);
			$("#selectedCell").css("opacity", opacity);
			$("#bottomArea").css("opacity", opacity);
			for (var col = 0; col < inputColCount; col++) {
				for (var row = 0; row < inputRowCount; row++) {
					if (input[col][row] == STATUS_CROSS) {
						$("#" + createInputCellCanvasId(new Cell(col, row))).css("opacity", opacity);
					}
				}
			}
		} else if (currentframe == fadingOutTime - 1) {
			$("#upNumberArea").remove();
			$("#leftNumberArea").remove();
			$("#selectedCol").remove();
			$("#selectedRow").remove();
			$("#selectedCell").remove();
			$("#bottomArea").remove();
			for (var col = 0; col < inputColCount; col++) {
				for (var row = 0; row < inputRowCount; row++) {
					if (input[col][row] == STATUS_CROSS) {
						$("#" + createInputCellCanvasId(new Cell(col, row))).remove();
					}
				}
			}
		} else if (currentframe < fadingOutTime + showingResultTime) {
			var inputAreaX = inputAreaStartX + (shrinkedInputAreaStartX - inputAreaStartX) / 10 * (currentframe - 9);
			var inputAreaY = inputAreaStartY + (shrinkedInputAreaStartY - inputAreaStartY) / 10 * (currentframe - 9);
			/*
			$("#inputArea")
			.css("left", inputAreaX + "px")
			.css("top", inputAreaX + "px");
			*/
			if (rand == 0) {
				var row = currentframe - fadingOutTime;
				for (var col = 0; col < inputColCount; col++) {
					convertInputCellToResultCell(new Cell(col, row));
				}
			} else if (rand == 1) {
				var col = currentframe - fadingOutTime;
				for (var row = 0; row < inputRowCount; row++) {
					convertInputCellToResultCell(new Cell(col, row));
				}
			} else if (rand == 2) {
				var offset = currentframe - fadingOutTime;
				for (var col = Math.max(0, offset - inputColCount + 1); col <= Math.min(inputColCount - 1, offset); col++) {
					var row = offset - col;
					convertInputCellToResultCell(new Cell(col, row));
				}
			}
		}
		currentframe++;
	}, 100);
}

function convertInputCellToResultCell(cell) {
	obj = $("#" + getInputCellId(cell.col, cell.row))
	obj
	.addClass("resultCell")
	.css("width", inputCellWidth + "px")
	.css("height", inputCellHeight + "px");
	if (cell.col == 0) {
		obj
		.addClass("left")
		.css("left", addPx(obj.css("left"), -1));
	} else if (cell.col == inputColCount - 1) {
		obj.addClass("right");
	}
	if (cell.row == 0) {
		obj
		.addClass("top")
		.css("top", addPx(obj.css("top"), -1));
	} else if (cell.row == inputRowCount - 1) {
		obj.addClass("bottom");
	}
}

function addPx(pxString, n) {
	var pxNumber = new Number(pxString.replace(/[^-0-9\s]+/g, ''));
	return (n + pxNumber) + "px";
}

function doScroll() {
	if(window.pageYOffset === 0) {
		window.scrollTo(0,1);
	}
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
