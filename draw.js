function initializeBoard(e) {
    const canvas = document.getElementById("board");
    canvas.style.backgroundColor = "#223";
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight - 50}px`;
    if (canvas.getContext) {
        canvas.getContext("2d");
    } else {
        alert("Sorry, your browser does not support this Webpage");
        window.removeEventListener("load", drawBoard);
        return;
    }
    const paths = [];
    const drawPad = new Canvas(canvas, paths);
}

class Canvas {
    constructor(canvas, paths) {
        this.canvas = canvas;
        this.paths = paths;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.strokeStyle = "white";
        this.ctx.lineCap = "round";
        this.ctx.lineWidth = 4;
        this.path = [];
        this.canvas.addEventListener("pointerdown", this.startDraw.bind(this));
        this.canvas.addEventListener("pointermove", this.draw.bind(this));
        this.canvas.addEventListener("pointerup", this.endDraw.bind(this));
        this.canvas.addEventListener("touchstart", this.startDraw.bind(this));
        this.canvas.addEventListener("touchmove", this.draw.bind(this));
        this.canvas.addEventListener("touchend", this.endDraw.bind(this));
    }

    startDraw(e) {
        const { x, y } = this.getMousePos(e);
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.path.push({ x, y });
    }

    draw(e) {
        const { x, y } = this.getMousePos(e);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.path.push({ x, y });
    }
    endDraw(e) {
        this.paths.push(this.path);
        this.path = [];
        this.logPaths();
    }
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let x, y;
        if (e.touches && e.touches.length > 0) {
            const touch = e.touches[0];
            const xOffset =
                window.pageXOffset || document.documentElement.scrollLeft;
            const offsetY =
                window.pageYOffset || document.documentElement.scrollTop;
            x = touch.clientX - rect.left;
            y = touch.clientY - rect.top;
            return { x, y };
        } else {
            x = e.clientX + rect.left;
            y = e.clientY + rect.top;
        }
        return { x, y };
    }
    logPaths() {
        console.log(this.paths);
    }
}

window.addEventListener("load", initializeBoard);
