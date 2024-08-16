function initializeBoard(e) {
  const canvas = document.getElementById("board");
  const toolBar = document.getElementById("toolbar");
  canvas.style.backgroundColor = "#223";
  resize(canvas);
  if (canvas.getContext) {
    canvas.getContext("2d");
  } else {
    alert("Sorry, your browser does not support this Webpage");
    window.removeEventListener("load", drawBoard);
    return;
  }
  let paths = [];
  try {
    const savedPaths = localStorage.getItem("paths");
    if (savedPaths) {
      const parsedPaths = JSON.parse(savedPaths);
      paths = parsedPaths;
    }
  } catch (err) {
    console.log(err);
    alert("Could not retrieve saved drawing");
  }
  const drawPad = new Canvas(canvas, paths);
  const tools = new ToolBar(toolBar);
  const undo = tools.getBtn("undo");
  const redo = tools.getBtn("redo");
  const clear = tools.getBtn("clear");
  const strokeThickness = tools.getBtn("px");
  const strokeColor = tools.getBtn("color");
  const allBtns = document.querySelectorAll(".sel");
  const fullScreen = tools.getBtn("full-screen");
  const freeHand = tools.getBtn("freehand");
  const line = tools.getBtn("line");
  const poly = tools.getBtn("poly");
  const square = tools.getBtn("square");
  const circle = tools.getBtn("circle");
  const save = tools.getBtn("save");
  selectBtn(freehand);
  undo.addEventListener("click", drawPad.undo.bind(drawPad));
  redo.addEventListener("click", drawPad.redo.bind(drawPad));
  clear.addEventListener("click", drawPad.clearScreen.bind(drawPad));
  save.addEventListener("click", drawPad.save.bind(drawPad));
  window.addEventListener("resize", () => {
    resize(canvas);
    drawPad.redrawPaths();
  });
  strokeThickness.addEventListener(
    "change",
    drawPad.setStrokeThickness.bind(drawPad)
  );
  strokeColor.addEventListener(
    "input",
    drawPad.changeStrokeColor.bind(drawPad)
  );
  freeHand.addEventListener("click", (e) => {
    e.stopPropagation();
    deSelectAllBtns(allBtns);
    selectBtn(freehand);
    drawPad.drawFreeHand.bind(drawPad, e)();
  });
  line.addEventListener("click", (e) => {
    e.stopPropagation();
    deSelectAllBtns(allBtns);
    selectBtn(line);
    drawPad.drawLine.bind(drawPad, e)();
  });
  poly.addEventListener("click", (e) => {
    e.stopPropagation();
    deSelectAllBtns(allBtns);
    selectBtn(poly);
    drawPad.drawPoly.bind(drawPad, e)();
  });
  circle.addEventListener("click", (e) => {
    e.stopPropagation();
    deSelectAllBtns(allBtns);
    selectBtn(circle);
    drawPad.drawCircle.bind(drawPad, e)();
  });
  square.addEventListener("click", (e) => {
    e.stopPropagation();
    deSelectAllBtns(allBtns);
    selectBtn(square);
    drawPad.drawSquare.bind(drawPad, e)();
  });
  fullScreen.addEventListener("click", async (e) => {
    e.stopPropagation();
    selectBtn(fullScreen);
    await fullScreenRequest(fullScreen, canvas);
    drawPad.redrawPaths();
  });
}

function deSelectAllBtns(btns) {
  btns.forEach((b) => b.classList.remove("selected"));
}

function deSelectBtn(btn) {
  btn.classList.remove("selected");
}

function selectBtn(btn) {
  btn.classList.add("selected");
}

function resize(canvas) {
  canvas.width = window.innerWidth - 4;
  canvas.height = window.innerHeight - 4;
}

async function fullScreenPromise(element, requestFunc) {
  return new Promise((res, rej) => {
    if (requestFunc) {
      requestFunc.call(element).then(res).catch(rej);
    } else {
      rej(new Error("Cannot set fullscreen"));
    }
  });
}

async function fullScreenRequest(btn, canvas) {
  if (!document.fullscreenEnabled) {
    alert("Full screen is not supported in your browser");
    return;
  }
  const body = document.body;
  if (document.fullscreenElement !== null) {
    console.log("full screen bitch!");
    try {
      await document.exitFullscreen();
      deSelectBtn(btn);
      resize(canvas);
    } catch (err) {
      console.log(err);
      alert("Cannot exit fullscreen");
    }
    return;
  }
  try {
    await Promise.any([
      fullScreenPromise(body, body.requestFullscreen),
      fullScreenPromise(body, body.mozRequestFullScreen),
      fullScreenPromise(body, body.webkitRequestFullscreen),
      fullScreenPromise(body, body.msRequestFullscreen),
    ]);
    resize(canvas);
  } catch (err) {
    console.log(err);
    alert("Cannot set full screen");
  }
}

class Canvas {
  constructor(canvas, paths) {
    this.canvas = canvas;
    this.paths = paths;
    this.redos = [];
    this.ctx = this.canvas.getContext("2d");
    this.strokeColor = "#ffffff";
    this.strokeWidth = 4;
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.polyStart = { x: 0, y: 0 };
    this.drawing = false;
    this.drawingLine = false;
    this.drawingPoly = false;
    this.drawingCircle = false;
    this.drawingSquare = false;
    this.path = [];
    this.pathHistory = [];
    this.canvas.addEventListener("pointerdown", this.startDraw.bind(this));
    this.canvas.addEventListener("pointermove", this.draw.bind(this));
    this.canvas.addEventListener("pointerup", this.endDraw.bind(this));
    this.canvas.addEventListener("touchstart", this.startDraw.bind(this));
    this.canvas.addEventListener("touchmove", this.draw.bind(this));
    this.canvas.addEventListener("touchend", this.endDraw.bind(this));
    if (this.paths.length > 0) {
      this.redrawPaths();
    }
  }

  save(e) {
    e.stopPropagation();
    try {
      const stringifiedPaths = JSON.stringify(this.paths);
      localStorage.setItem("paths", stringifiedPaths);
      alert("Your drawing has been saved");
    } catch (err) {
      console.log(err);
      alert("We could not save your drawing");
    }
  }

  startDraw(e) {
    this.drawing = true;
    const { x, y } = this.getMousePos(e);
    const meta = {
      type: "freehand",
      thickness: this.strokeWidth,
      color: this.strokeColor,
    };
    if (this.drawingPoly) {
      meta.type = "poly";
      if (this.path.length > 0) {
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
      } else {
        this.path.push({ ...meta, x, y });
        this.ctx.moveTo(x, y);
      }
      this.ctx.beginPath();
      return;
    }
    if (this.drawingLine) {
      meta.type = "line";
    }
    if (this.drawingCircle) {
      meta.type = "circle";
    }
    if (this.drawingSquare) {
      meta.type = "square";
    }
    this.path.push({ ...meta, x, y });
    this.ctx.moveTo(x, y);
    this.ctx.beginPath();
  }

  draw(e) {
    if (this.path.length < 1) {
      return;
    }
    if (this.drawingSquare) {
      if (this.path.length > 1) {
        this.path.pop();
      }
      const { x, y } = this.getMousePos(e);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.strokeWidth;
      this.path.push({ x, y });
      this.drawSquarePath();
      return;
    }
    if (this.drawingPoly) {
      if (this.path.length > 1) {
        this.path.pop();
      }
      const { x, y } = this.getMousePos(e);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.strokeWidth;
      this.path.push({ x, y });
      this.drawPolyPath();
      return;
    }
    if (this.drawingLine) {
      if (this.path.length > 1) {
        this.path.pop();
      }
      const { x, y } = this.getMousePos(e);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.strokeWidth;
      this.path.push({ x, y });
      this.drawPath();
      return;
    }
    if (this.drawingCircle) {
      if (this.path.length > 1) {
        this.path.pop();
      }
      const { x, y } = this.getMousePos(e);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.strokeWidth;
      this.path.push({ x, y });
      this.drawCirclePath();
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
    if (this.drawingPoly) {
      const lastCoordinates = this.path[1];
      this.paths.push(this.path);
      this.path = [];
      this.path.push(lastCoordinates);
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

  undo(e) {
    e.stopPropagation();
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

  redo(e) {
    e.stopPropagation();
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

  clearScreen(e) {
    e.stopPropagation();
    this.clearCanvas();
    this.pathHistory = this.paths;
    this.paths = [null];
  }

  drawFreeHand() {
    this.drawingLine = false;
    this.drawingPoly = false;
    this.drawingCircle = false;
    this.drawingSquare = false;
    this.path = [];
  }

  drawLine() {
    this.drawingLine = true;
    this.drawingPoly = false;
    this.drawingCircle = false;
    this.drawingSquare = false;
    this.path = [];
  }

  drawPoly() {
    this.drawingPoly = true;
    this.drawingLine = false;
    this.drawingCircle = false;
    this.drawingSquare = false;
  }

  drawCircle() {
    this.drawingLine = false;
    this.drawingPoly = false;
    this.drawingCircle = true;
    this.drawingSquare = false;
    this.path = [];
  }

  drawSquare() {
    this.drawingLine = false;
    this.drawingPoly = false;
    this.drawingCircle = false;
    this.drawingSquare = true;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPath() {
    if (this.path.length < 1) {
      return;
    }
    this.clearCanvas();
    this.ctx.beginPath();
    const begin = this.path[0];
    const end = this.path[1];
    this.ctx.moveTo(begin.x, begin.y);
    this.ctx.lineCap = "round";
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    this.redrawPaths();
  }

  drawSquarePath() {
    if (this.path.length < 1) {
      return;
    }
    this.clearCanvas();
    this.ctx.beginPath();
    const begin = this.path[0];
    const end = this.path[1];
    let sideLength;
    sideLength = begin.x - end.x;
    if (sideLength < 0) {
      sideLength = end.x - begin.x;
    }
    this.ctx.moveTo(begin.x, begin.y);
    this.ctx.strokeRect(begin.x, begin.y, sideLength, sideLength);
    this.redrawPaths();
  }

  drawPolyPath() {
    if (this.path.length < 1) {
      return;
    }
    this.clearCanvas();
    this.ctx.beginPath();
    const begin = this.path[0];
    const end = this.path[1];
    this.ctx.moveTo(begin.x, begin.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
    this.redrawPaths();
  }

  drawCirclePath() {
    if (this.path.length < 1) {
      return;
    }
    this.clearCanvas();
    this.ctx.beginPath();
    const centerX = this.path[0].x;
    const centerY = this.path[0].y;
    let radius;
    radius = centerX - this.path[1].x;
    if (radius <= 0) {
      radius = this.path[1].x - centerX;
    }
    this.ctx.moveTo(centerX, centerY);
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.redrawPaths();
  }

  redrawPaths(myPaths = this.paths) {
    myPaths.forEach((p) => {
      if (p === null) {
        return;
      }
      const { color, thickness, type } = p[0];
      this.ctx.lineWidth = thickness;
      this.ctx.strokeStyle = color;
      this.ctx.beginPath();
      const x = p[0].x;
      const y = p[0].y;
      this.ctx.moveTo(x, y);
      p.slice(1).forEach((pnt) => {
        if (type === "circle") {
          let radius;
          radius = x - p[1].x;
          if (radius <= 0) {
            radius = p[1].x - x;
          }
          this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        } else if (type === "square") {
          let sideLength;
          sideLength = p[1].x - x;
          if (sideLength < 0) {
            sideLength = x - p[1].x;
          }
          this.ctx.strokeRect(x, y, sideLength, sideLength);
        } else {
          this.ctx.lineTo(pnt.x, pnt.y);
        }
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
