import { Universe, UniversePattern } from "wasm-gol";
import { memory } from "wasm-gol/wasm_gol_bg.wasm";

const fps = new (class {
    constructor() {
        this.fps = document.getElementById("fps");
        this.frames = [];
        this.lastFrameTimeStamp = performance.now();
    }

    render() {
        // Convert the delta time since the last frame render into a measure
        // of frames per second.
        const now = performance.now();
        const delta = now - this.lastFrameTimeStamp;
        this.lastFrameTimeStamp = now;
        const fps = (1 / delta) * 1000;

        // Save only the latest 100 timings.
        this.frames.push(fps);
        if (this.frames.length > 100) {
            this.frames.shift();
        }

        // Find the max, min, and mean of our 100 latest timings.
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let i = 0; i < this.frames.length; i++) {
            sum += this.frames[i];
            min = Math.min(this.frames[i], min);
            max = Math.max(this.frames[i], max);
        }
        let mean = sum / this.frames.length;

        // Render the statistics.
        this.fps.textContent = `
  Frames per Second:
           latest = ${Math.round(fps)}
  avg of last 100 = ${Math.round(mean)}
  min of last 100 = ${Math.round(min)}
  max of last 100 = ${Math.round(max)}
  `.trim();
    }
})();

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const checkElement = document.getElementById("sampleMethod");
const canvas = document.getElementById("wasm-gol-canvas");
const sizeInput = document.getElementById("sizeInputID");
let universe = Universe.new();
const ctx = canvas.getContext("2d");

let animationId = null;

const isPaused = () => {
    return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");
const playNextButton = document.getElementById("play-next");
playNextButton.textContent = "⏩";

const pause = () => {
    playPauseButton.textContent = "▶";
    cancelAnimationFrame(animationId);
    animationId = null;
};

const bitIsSet = (n, arr) => {
    const byte = Math.floor(n / 8);
    const mask = 1 << n % 8;
    return (arr[byte] & mask) === mask;
};

const drawGrid = (width, height) => {
    ctx.beginPath();
    ctx.strokeStyle = GRID_COLOR;

    // Vertical lines.
    for (let i = 0; i <= width; i++) {
        ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
        ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }

    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
        ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
        ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }

    ctx.stroke();
};


const getIndex = (row, column, width) => {
    return row * width + column;
};

const drawCells = (universe) => {
    const width = universe.width();
    const height = universe.height()
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, (width * height) / 8);

    ctx.beginPath();

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const idx = getIndex(row, col, width);

            ctx.fillStyle = bitIsSet(idx, cells) ? ALIVE_COLOR : DEAD_COLOR;

            ctx.fillRect(
                col * (CELL_SIZE + 1) + 1,
                row * (CELL_SIZE + 1) + 1,
                CELL_SIZE,
                CELL_SIZE,
            );
        }
    }
    ctx.stroke();
};

const tickSingle = (universe) => {
    universe.tick();
    drawGrid(universe.width(), universe.height());
    drawCells(universe);
};

canvas.addEventListener("click", (event) => {
    const boundingRect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;

    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), universe.height() - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), universe.width() - 1);

    universe.toggle_cell(row, col);

    drawGrid(universe.width(), universe.height());
    drawCells(universe);
});

const handleCheckBoxChange = () => {
    const checked = checkElement.checked;

    universe.fill(
        checked ? UniversePattern.Random : UniversePattern.Pattern,
        sizeInput.valueAsNumber,
        sizeInput.valueAsNumber,
    );
    const width = universe.width();
    const height = universe.height();

    canvas.height = (CELL_SIZE + 1) * height + 1;
    canvas.width = (CELL_SIZE + 1) * width + 1;

    const renderLoop = () => {
        fps.render();
        tickSingle(universe);
        animationId = requestAnimationFrame(renderLoop);
    };

    const play = () => {
        playPauseButton.textContent = "⏸";
        renderLoop();
    };

    playNextButton.addEventListener("click", (event) => {
        if (isPaused()) {
            tickSingle(universe);
        }
    });

    playPauseButton.addEventListener("click", (event) => {
        if (isPaused()) {
            play();
        } else {
            pause();
        }
    });

    play();
};
handleCheckBoxChange();

checkElement.addEventListener("change", () => {
    const checked = checkElement.checked;

    universe.fill(
        checked ? UniversePattern.Random : UniversePattern.Pattern,
        sizeInput.valueAsNumber,
        sizeInput.valueAsNumber,
    );
})
sizeInput.addEventListener("input", () => {
    const checked = checkElement.checked;

    universe = Universe.new();
    universe.fill(
        checked ? UniversePattern.Random : UniversePattern.Pattern,
        sizeInput.valueAsNumber,
        sizeInput.valueAsNumber,
    );

    tickSingle(universe);
    canvas.height = (CELL_SIZE + 1) * universe.height() + 1;
    canvas.width = (CELL_SIZE + 1) * universe.width() + 1;
})
