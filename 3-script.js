let points = Number(localStorage.getItem("arrowPoints")) || 0;
let level = 1;
let lives = 3;
let arrows = [];
let gameOver = false;

const board = document.getElementById("board");
const pointsText = document.getElementById("points");
const levelText = document.getElementById("level");
const livesText = document.getElementById("lives");
const message = document.getElementById("message");

const directions = [
    { symbol: "↑", row: -1, col: 0 },
    { symbol: "→", row: 0, col: 1 },
    { symbol: "↓", row: 1, col: 0 },
    { symbol: "←", row: 0, col: -1 }
];

function updateStats() {
    pointsText.textContent = points;
    levelText.textContent = level;
    livesText.textContent = lives;
    document.getElementById("levelBadge").textContent = level;

    let percentage = Math.min((points / 10000) * 100, 100);

    document.getElementById("progressBar").style.width =
        percentage + "%";

    document.getElementById("progressText").textContent =
        points.toLocaleString("en-US") + " من 10,000 نقطة";

    localStorage.setItem("arrowPoints", points);
}

function createLevel() {
    board.innerHTML = "";
    arrows = [];
    gameOver = false;

    let positions = [];

    while (positions.length < 10) {
        let position = Math.floor(Math.random() * 25);

        if (!positions.includes(position)) {
            positions.push(position);
        }
    }

    positions.forEach((position, index) => {
        let direction = directions[
            Math.floor(Math.random() * directions.length)
        ];

        arrows.push({
            id: index,
            position: position,
            direction: direction,
            removed: false
        });
    });

    for (let i = 0; i < 25; i++) {
        let arrow = arrows.find(a => a.position === i);

        let cell = document.createElement("button");
        cell.className = "arrow";

        if (arrow) {
            cell.textContent = arrow.direction.symbol;
            cell.addEventListener("click", () => moveArrow(arrow));
            cell.dataset.id = arrow.id;
        } else {
            cell.style.visibility = "hidden";
            cell.disabled = true;
        }

        board.appendChild(cell);
    }

    message.textContent = "أخرج الأسهم بالترتيب الصحيح!";
    updateStats();
}

function canExit(arrow) {
    let row = Math.floor(arrow.position / 5);
    let col = arrow.position % 5;

    let r = row + arrow.direction.row;
    let c = col + arrow.direction.col;

    while (r >= 0 && r < 5 && c >= 0 && c < 5) {
        let nextPosition = r * 5 + c;

        let blocker = arrows.find(a =>
            !a.removed && a.position === nextPosition
        );

        if (blocker) {
            return false;
        }

        r += arrow.direction.row;
        c += arrow.direction.col;
    }

    return true;
}

function moveArrow(arrow) {
    if (gameOver || arrow.removed) return;

    if (canExit(arrow)) {
        arrow.removed = true;

        let cell = document.querySelector(
            `[data-id="${arrow.id}"]`
        );

        cell.classList.add("removed");

        message.textContent = "ممتاز! السهم خرج بنجاح ✅";

        let remaining = arrows.filter(a => !a.removed);

        if (remaining.length === 0) {
            points += 10;
            level++;

            updateStats();

            message.textContent =
                "🎉 مبروك! كسبت 10 نقاط وانتقلت للمرحلة التالية";

            setTimeout(createLevel, 1200);
        }

    } else {
        lives--;

        updateStats();

        let cell = document.querySelector(
            `[data-id="${arrow.id}"]`
        );

        cell.classList.add("blocked");

        message.textContent = "السهم محاصر! حاول بسهم آخر ❌";

        setTimeout(() => {
            cell.classList.remove("blocked");
        }, 350);

        if (lives <= 0) {
            gameOver = true;
            message.textContent =
                "انتهت المحاولات! اضغط مرحلة جديدة للعب مرة أخرى.";
        }
    }
}

document.getElementById("newGame").addEventListener("click", () => {
    lives = 3;
    createLevel();
});

document.getElementById("hintBtn").addEventListener("click", () => {
    if (gameOver) return;

    let availableArrow = arrows.find(a =>
        !a.removed && canExit(a)
    );

    if (availableArrow) {
        let cell = document.querySelector(
            `[data-id="${availableArrow.id}"]`
        );

        message.textContent = "💡 جرّب السهم المضيء!";

        cell.style.background = "#f2c66d";

        setTimeout(() => {
            cell.style.background = "";
        }, 1200);
    }
});

document.getElementById("adBtn").addEventListener("click", () => {
    alert(
        "الإعلانات لم يتم ربطها بعد. لن تُضاف نقاط إلا بعد مشاهدة إعلان حقيقي والتحقق من اكتماله."
    );
});

updateStats();
createLevel();