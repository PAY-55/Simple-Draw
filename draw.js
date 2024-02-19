function initializeBoard(e) {
 const canvas = document.getElementById("board");
 const toolBar = document.getElementById("toolbar");
 canvas.style.backgroundColor = "#223";
 resize(canvas);
 //   window.addEventListener("resize", () => resize(canvas));
 if (canvas.getContext) {
  canvas.getContext("2d");
 } else {
  alert("Sorry, your browser does not support this Webpage");
  window.removeEventListener("load", drawBoard);
  return;
 }
 const paths = [];
 const drawPad = new Canvas(canvas, paths);
 const tools = new ToolBar(toolBar);
 const undo = tools.getBtn("undo");
 const redo = tools.getBtn("redo");
 const clear = tools.getBtn("clear");
 const strokeThickness = tools.getBtn("px");
 const strokeColor = tools.getBtn("color");
 const freeHand = tools.getBtn("freehand");
 const line = tools.getBtn("line");
 undo.addEventListener("click", drawPad.undo.bind(drawPad));
 redo.addEventListener("click", drawPad.redo.bind(drawPad));
 clear.addEventListener("click", drawPad.clearScreen.bind(drawPad));
 strokeThickness.addEventListener(
  "change",
  drawPad.setStrokeThickness.bind(drawPad)
 );
 strokeColor.addEventListener("input", drawPad.changeStrokeColor.bind(drawPad));
 line.addEventListener("click", drawPad.drawLine.bind(drawPad));
}

function resize(canvas) {
 canvas.width = window.innerWidth - 4;
 canvas.height = window.innerHeight - 4;
}

class Canvas {
 constructor(canvas, paths) {
  this.canvas = canvas;
  this.paths = paths;
  this.redos = [];
  this.newTextBoxDems = { x: 0, y: 0, width: 0, height: 0 };
  this.slice = 0;
  this.ctx = this.canvas.getContext("2d");
  this.strokeColor = "#ffffff";
  this.strokeWidth = 4;
  this.ctx.lineJoin = "round";
  this.ctx.lineCap = "round";
  this.drawing = false;
  this.drawingLine = false;
  this.path = [];
  this.pathHistory = [];
  this.canvas.addEventListener("pointerdown", this.startDraw.bind(this));
  this.canvas.addEventListener("pointermove", this.draw.bind(this));
  this.canvas.addEventListener("pointerup", this.endDraw.bind(this));
  this.canvas.addEventListener("touchstart", this.startDraw.bind(this));
  this.canvas.addEventListener("touchmove", this.draw.bind(this));
  this.canvas.addEventListener("touchend", this.endDraw.bind(this));
 }

 startDraw(e) {
  this.drawing = true;
  const { x, y } = this.getMousePos(e);
  const meta = {
   thickness: this.strokeWidth,
   color: this.strokeColor
  };
  this.ctx.beginPath();
  this.ctx.moveTo(x, y);
  this.path.push({ ...meta, x, y });
 }

 draw(e) {
  if (this.drawingLine) {
   if (this.path.length > 1) {
    this.path.pop();
   }
   const { x, y } = this.getMousePos(e);
   this.ctx.lineTo(x, y);
   this.ctx.strokeStyle = this.strokeColor;
   this.ctx.lineWidth = this.strokeWidth;
   this.path.push({ x, y });
   //this.redrawPaths();
   return;
  }
  if (this.drawing) {
   const { x, y } = this.getMousePos(e);
   this.ctx.lineTo(x, y);
   this.ctx.strokeStyle = this.strokeColor;
   this.ctx.lineWidth = this.strokeWidth;
   this.ctx.stroke();
   this.path.push({ x, y });
  }
 }

 endDraw(e) {
  this.drawing = false;
  if (this.path.length < 1) {
   return;
  }
  this.paths.push(this.path);
  this.path = [];
  this.logPaths();
 }

 getMousePos(e) {
  let x, y;
  if (e.touches && e.touches.length > 0) {
   const touch = e.touches[0];
   x = touch.clientX;
   y = touch.clientY;
  } else {
   x = e.pageX;
   y = e.pageY;
  }
  return { x, y };
 }

 logPaths() {
  console.log(this.paths);
 }

 undo() {
  if (this.paths.length < 1) {
   return;
  }
  const newRedo = this.paths.pop();
  if (newRedo === null) {
   const temp = this.pathHistory;
   this.pathHistory = this.paths;
   this.paths = temp;
  }
  this.redos.push(newRedo);
  this.clearCanvas();
  this.redrawPaths();
 }

 redo() {
  if (this.redos.length < 1) {
   return;
  }
  const oldPath = this.redos.pop();
  if (oldPath === null) {
   const temp = this.pathHistory;
   this.pathHistory = this.paths;
   this.paths = temp;
   this.redos = [];
   this.clearCanvas();
   return;
  }
  this.paths.push(oldPath);
  this.clearCanvas();
  this.redrawPaths();
 }

 setStrokeThickness(e) {
  const thickness = e.target.value;
  this.strokeWidth = thickness;
 }

 changeStrokeColor(e) {
  const newColor = e.target.value;
  this.strokeColor = newColor;
 }

 clearScreen() {
  this.clearCanvas();
  this.pathHistory = this.paths;
  this.paths = [null];
 }

 drawLine() {
  this.drawingLine = true;
 }

 clearCanvas() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
 }

 redrawPaths(myPaths = this.paths) {
  myPaths.forEach(p => {
   if (p === null) {
    return;
   }
   const { color, thickness } = p[0];
   this.ctx.lineWidth = thickness;
   this.ctx.strokeStyle = color;
   this.ctx.beginPath();
   const x = p[0].x;
   const y = p[0].y;
   this.ctx.moveTo(x, y);
   p.slice(1).forEach(pnt => {
    this.ctx.lineTo(pnt.x, pnt.y);
   });
   this.ctx.stroke();
  });
 }
}

class ToolBar {
 constructor(toolBar) {
  this.toolBar = toolBar;
 }

 getBtn(btn) {
  const toolBtn = document.getElementById(btn);
  return toolBtn;
 }
}

window.addEventListener("load", initializeBoard);
