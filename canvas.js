(function () {
    const canvas = document.getElementById("pacmanCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    /* =============================
       Canvas + Layout Setup
    ============================= */
    let navHeight = 80;
    let wallSize = 40;
    let cols, rows;
    let topOffset = navHeight;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / wallSize);
        rows = Math.floor((canvas.height - topOffset) / wallSize);
    }
    window.addEventListener("resize", resize);
    resize();

    const BLINKY = "#ff3b30";
    const PINKY = "#ff9ed5";
    const INKY = "#4fc3f7";
    const CLYDE = "#ffb347";

    /* =============================
       Navigation Setup
    ============================= */
    const navItems = [
        { label: "Back", action: "back" },
        { label: "Scene 1", action: 0 },
        { label: "Scene 2", action: 1 }
    ];
    const navButtons = [];
    navItems.forEach((item, i) => {
        navButtons.push({
            x: 20 + i * 180,
            y: 20,
            w: 160,
            h: 40,
            action: item.action,
            label: item.label
        });
    });

    canvas.addEventListener("click", e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        navButtons.forEach(btn => {
            if (mx > btn.x && mx < btn.x + btn.w && my > btn.y && my < btn.y + btn.h) {
                if (btn.action === "back") window.location.href = "index.html";
                else changeScene(btn.action);
            }
        });
    });

    let currentScene = 0; // 0 = maze, 1 = art
    let targetScene = 0;
    let transitionOffset = 0;
    const transitionSpeed = 20;
    function changeScene(scene) {
        if (scene !== currentScene) {
            targetScene = scene;
        }
    }

    /* =============================
       Scene 1 Maze (Original Recursive Backtracker)
    ============================= */
    let maze = [];
    let emptyCells = [];

    function generateMaze() {
        const grid = [];
        for (let y = 0; y < rows; y++) {
            grid[y] = [];
            for (let x = 0; x < cols; x++) {
                grid[y][x] = {
                    x,
                    y,
                    visited: false,
                    walls: { top: true, right: true, bottom: true, left: true }
                };
            }
        }

        function neighbors(cell) {
            const { x, y } = cell;
            const list = [];
            if (y > 0) list.push(grid[y - 1][x]);
            if (x < cols - 1) list.push(grid[y][x + 1]);
            if (y < rows - 1) list.push(grid[y + 1][x]);
            if (x > 0) list.push(grid[y][x - 1]);
            return list.filter(n => !n.visited);
        }

        function removeWalls(a, b) {
            if (a.x === b.x) {
                if (a.y > b.y) { a.walls.top = false; b.walls.bottom = false; }
                else { a.walls.bottom = false; b.walls.top = false; }
            } else {
                if (a.x > b.x) { a.walls.left = false; b.walls.right = false; }
                else { a.walls.right = false; b.walls.left = false; }
            }
        }

        const stack = [];
        let current = grid[0][0];
        current.visited = true;

        while (true) {
            const nextList = neighbors(current);
            if (nextList.length > 0) {
                const next = nextList[Math.floor(Math.random() * nextList.length)];
                stack.push(current);
                removeWalls(current, next);
                current = next;
                current.visited = true;
            } else if (stack.length > 0) current = stack.pop();
            else break;
        }

        maze = grid;

        // empty cells for Pac-Man and ghosts
        emptyCells = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                emptyCells.push({
                    x: x * wallSize + wallSize / 2,
                    y: topOffset + y * wallSize + wallSize / 2
                });
            }
        }
    }
    generateMaze();

    const ghosts1 = [
        { color: BLINKY, phase: 0 },
        { color: PINKY, phase: 1 },
        { color: INKY, phase: 2 },
        { color: CLYDE, phase: 3 }
    ];
    ghosts1.forEach(g => {
        const c = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        g.x = c.x - 20; g.y = c.y - 20;
    });
    const pacCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let pacX1 = pacCell.x, pacY1 = pacCell.y;
    let mouthOpen1 = 0, mouthDir1 = 0.02;

    /* =============================
       Scene 2 Pac-Man Art
       (Centered horizontally and vertically)
    ============================= */
    const ghosts2 = [
        { x: 150, color: BLINKY, phase: 0 },
        { x: 280, color: PINKY, phase: 1 },
        { x: 410, color: INKY, phase: 2 },
        { x: 540, color: CLYDE, phase: 3 },
    ];
    let pacY2 = canvas.height / 2;
    let mouthOpen2 = 0, mouthDir2 = 0.02;

    /* =============================
       Draw Functions
    ============================= */
    function drawNav() {
        navButtons.forEach(btn => {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(btn.x, btn.y, btn.w, btn.h);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(btn.x, btn.y, btn.w, btn.h);
            ctx.fillStyle = "#fff";
            ctx.font = "22px Arial";
            ctx.fillText(btn.label, btn.x + 20, btn.y + 28);
        });
    }

    function drawMazeScene(offsetX = 0) {
        ctx.fillStyle = "#000";
        ctx.fillRect(offsetX, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#00f";
        ctx.lineWidth = 4;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = maze[y][x];
                const px = x * wallSize;
                const py = topOffset + y * wallSize;
                ctx.beginPath();
                if (cell.walls.top) ctx.moveTo(offsetX + px, py), ctx.lineTo(offsetX + px + wallSize, py);
                if (cell.walls.right) ctx.moveTo(offsetX + px + wallSize, py), ctx.lineTo(offsetX + px + wallSize, py + wallSize);
                if (cell.walls.bottom) ctx.moveTo(offsetX + px, py + wallSize), ctx.lineTo(offsetX + px + wallSize, py + wallSize);
                if (cell.walls.left) ctx.moveTo(offsetX + px, py), ctx.lineTo(offsetX + px, py + wallSize);
                ctx.stroke();
            }
        }

        // Pac-Man
        ctx.fillStyle = "#F7D51D";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(offsetX + pacX1, pacY1);
        ctx.arc(offsetX + pacX1, pacY1, 25, mouthOpen1 * Math.PI, (2 - mouthOpen1) * Math.PI, false);
        ctx.lineTo(offsetX + pacX1, pacY1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(offsetX + pacX1 + 6, pacY1 - 7, 3, 0, Math.PI * 2);
        ctx.fill();

        // ghosts
        ghosts1.forEach(g => {
            const ghostY = g.y + Math.sin(Date.now() / 500 + g.phase) * 10;
            ctx.fillStyle = g.color;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(offsetX + g.x, ghostY + 20);
            ctx.quadraticCurveTo(offsetX + g.x, ghostY, offsetX + g.x + 20, ghostY);
            ctx.quadraticCurveTo(offsetX + g.x + 40, ghostY, offsetX + g.x + 40, ghostY + 20);
            ctx.lineTo(offsetX + g.x + 40, ghostY + 40);
            ctx.lineTo(offsetX + g.x + 32, ghostY + 35);
            ctx.lineTo(offsetX + g.x + 24, ghostY + 40);
            ctx.lineTo(offsetX + g.x + 16, ghostY + 35);
            ctx.lineTo(offsetX + g.x + 8, ghostY + 40);
            ctx.lineTo(offsetX + g.x, ghostY + 35);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(offsetX + g.x + 10, ghostY + 10, 5, 0, Math.PI * 2);
            ctx.arc(offsetX + g.x + 30, ghostY + 10, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#222";
            ctx.beginPath();
            ctx.arc(offsetX + g.x + 10, ghostY + 10, 2, 0, Math.PI * 2);
            ctx.arc(offsetX + g.x + 30, ghostY + 10, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawArtScene(offsetX = 0) {
    ctx.fillStyle = "#000";
    ctx.fillRect(offsetX, 0, canvas.width, canvas.height);

    const pacDiameter = 90; // Pac-Man diameter
    const ghostWidth = 80;  // approx ghost width
    const spacing = 20;     // gap between Pac-Man and first ghost

    // total width = pac + spacing + all ghosts
    const totalGhostWidth = ghosts2.length * ghostWidth;
    const totalWidth = pacDiameter + spacing + totalGhostWidth;

    // center start X
    const startX = canvas.width / 2 - totalWidth / 2 + offsetX;
    const centerY = canvas.height / 2;

    // --- Draw Pac-Man ---
    const pacX = startX + pacDiameter / 2;
    ctx.fillStyle = "#F7D51D";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pacX, centerY);
    ctx.arc(pacX, centerY, 45, mouthOpen2 * Math.PI, (2 - mouthOpen2) * Math.PI, false);
    ctx.lineTo(pacX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(pacX + 8, centerY - 20, 6, 0, Math.PI * 2);
    ctx.fill();

    // --- Draw Ghosts ---
    ghosts2.forEach((g, i) => {
        const ghostX = startX + pacDiameter + spacing + i * ghostWidth;
        const ghostY = centerY - 48 + Math.sin(Date.now() / 500 + g.phase) * 10;

        ctx.fillStyle = g.color;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(ghostX, ghostY + 60);
        ctx.quadraticCurveTo(ghostX, ghostY, ghostX + 40, ghostY);
        ctx.quadraticCurveTo(ghostX + 80, ghostY, ghostX + 80, ghostY + 60);
        ctx.lineTo(ghostX + 80, ghostY + 95);
        ctx.lineTo(ghostX + 65, ghostY + 82);
        ctx.lineTo(ghostX + 50, ghostY + 95);
        ctx.lineTo(ghostX + 35, ghostY + 82);
        ctx.lineTo(ghostX + 20, ghostY + 95);
        ctx.lineTo(ghostX + 5, ghostY + 82);
        ctx.lineTo(ghostX, ghostY + 95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ghostX + 25, ghostY + 38, 14, 0, Math.PI * 2);
        ctx.arc(ghostX + 55, ghostY + 38, 14, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.arc(ghostX + 30, ghostY + 38, 7, 0, Math.PI * 2);
        ctx.arc(ghostX + 60, ghostY + 38, 7, 0, Math.PI * 2);
        ctx.fill();
    });
}



    /* =============================
       Animation
    ============================= */
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        mouthOpen1 += mouthDir1; if (mouthOpen1 > 0.25 || mouthOpen1 < 0) mouthDir1 *= -1;
        mouthOpen2 += mouthDir2; if (mouthOpen2 > 0.25 || mouthOpen2 < 0) mouthDir2 *= -1;

        if (currentScene !== targetScene) {
            const dir = targetScene > currentScene ? -1 : 1;
            transitionOffset = (transitionOffset || 0) + transitionSpeed * dir;
            if ((dir === -1 && transitionOffset <= -canvas.width) || (dir === 1 && transitionOffset >= canvas.width)) {
                currentScene = targetScene;
                transitionOffset = 0;
            }
        }

        if (currentScene === 0) {
            drawMazeScene(transitionOffset);
            drawArtScene(transitionOffset + canvas.width);
        } else {
            drawArtScene(transitionOffset);
            drawMazeScene(transitionOffset - canvas.width);
        }

        drawNav();
        requestAnimationFrame(animate);
    }

    animate();
})();
