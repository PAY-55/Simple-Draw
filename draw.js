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
    const btnsSelected = ["freehand"];
    const drawPad = new Canvas(canvas, paths);
    const tools = new ToolBar(toolBar);
    const undo = tools.getBtn("undo");
    const redo = tools.getBtn("redo");
    const clear = tools.getBtn("clear");
    const strokeThickness = tools.getBtn("px");
    const strokeColor = tools.getBtn("color");
    undo.addEventListener("click", drawPad.undo.bind(drawPad));
    redo.addEventListener("click", drawPad.redo.bind(drawPad));
    clear.addEventListener("click", drawPad.clearScreen.bind(drawPad));
    strokeThickness.addEventListener(
        "change",
        drawPad.setStrokeThickness.bind(drawPad)
    );
    strokeColor.addEventListener(
        "input",
        drawPad.changeStrokeColor.bind(drawPad)
    );
}

function resize(canvas) {
    canvas.width = window.innerWidth - 4;
    canvas.height = window.innerHeight - 54;
}

class Canvas {
    constructor(canvas, paths) {
        this.canvas = canvas;
        this.paths = paths;
        this.redos = [];
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineJoin = "round";
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = 4;
        this.drawing = false;
        this.path = [];
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
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.path.push({ x, y });
    }

    draw(e) {
        if (this.drawing) {
            const { x, y } = this.getMousePos(e);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.path.push({ x, y });
        }
    }
    endDraw(e) {
        this.drawing = false;
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
        this.redos.push(newRedo);
        this.clearCanvas();
        this.redrawPaths();
    }
    redo() {
        if (this.redos.length < 1) {
            return;
        }
        const oldPath = this.redos.pop();
        this.paths.push(oldPath);
        this.clearCanvas();
        this.redrawPaths();
    }
    clearScreen() {
        this.clearCanvas();
    }
    setStrokeThickness(e) {
        const thickness = e.target.value;
        this.ctx.lineWidth = thickness;
    }
    changeStrokeColor(e) {
        const newColor = e.target.value;
        this.ctx.strokeStyle = newColor;
    }
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    redrawPaths() {
        this.paths.forEach(p => {
            this.ctx.beginPath();
            this.ctx.moveTo(p[0].x, p[0].y);
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
