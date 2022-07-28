const toggleButton = document.getElementsByClassName('toggle-button')[0];
const navbarLinks = document.getElementsByClassName('navbar-links')[0];
const draggable_list = document.getElementById('container');
const startGameButton = document.getElementById("startGame");
const checkButton = document.getElementById("check");
let containerOpen;
let rulesOpen;
let currentLevel;
let playedLevels = [];
let health;
let lvl;

initializeGame();

$.ajaxSetup({
    async: false
});

const arr = $.getJSON('./package.json', json => {
    let arr = [];
    for (let key in json) {
        if (json.hasOwnProperty(key)) {
            let item = json[key];
            arr.push({
                question: item.question,
                hint1: item.hint1,
                initialOrder: item.initialOrder,
                rightOrder: item.rightOrder
            });
        }
    }
   return arr;
});

levels = arr.responseJSON;

document.getElementById('container').addEventListener('click', () => {
    document.getElementById('wrongAnswer').style.display = 'none';
})

toggleButton.addEventListener('click', () => {
    navbarLinks.classList.toggle('active')
})

startGameButton.addEventListener("click", () => {
    startGame();
})

checkButton.addEventListener("click", () => {
    checkGame();
})

function restart() {
    localStorage.clear();
    playedLevels = [];
    initializeGame();
}

function displayWin() {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('container').style.display = 'none';
    document.getElementById('win').style.display = 'flex';
}

function displayRules() {
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('container').style.display = 'none';
    document.getElementById('hint').style.display = 'none';
    document.getElementById('solution').style.display = 'none';
    document.getElementById('rules').style.display = 'flex';
    rulesOpen = true;
}

function closeRules() {
    document.getElementById('buttons').style.display = 'flex';
    if (containerOpen) {
        document.getElementById('container').style.display = 'block';
    }
    document.getElementById('rules').style.display = 'none';
    rulesOpen = false;
}

function displayHint() {
    document.getElementById('buttons').style.display = 'none';
    document.getElementById('container').style.display = 'none';
    document.getElementById('rules').style.display = 'none';
    document.getElementById('solution').style.display = 'none';
    if (document.getElementById('hintText')) {document.getElementById('hintText').remove()}
    const hintText = document.createElement('p');
    hintText.id += "hintText";
    if (containerOpen) {
        if (levels[currentLevel].hint1) {
            hintText.innerText = levels[currentLevel].hint1;
        }
    } else {
        hintText.innerText = "No hint to be shown !";
    }
    document.getElementById('hint').insertBefore(hintText, document.getElementById('buttonClosingHint'));
    document.getElementById('hint').style.display = 'flex';
}

function closeHint() {
    document.getElementById('buttons').style.display = 'flex';
    if (containerOpen) {
        document.getElementById('container').style.display = 'block';
    }
    document.getElementById('hint').style.display = 'none';
}

function displaySolution() {
    if (health > 1) {
        document.getElementById('buttons').style.display = 'none';
        document.getElementById('container').style.display = 'none';
        document.getElementById('rules').style.display = 'none';
        document.getElementById('hint').style.display = 'none';
        if (document.getElementById('solutionText')) {
            document.getElementById('solutionText').remove()
        }
        const solutionText = document.createElement('p');
        solutionText.id += 'solutionText';
        if (containerOpen) {
            healthDown();
            if (levels[currentLevel].rightOrder) {
                levels[currentLevel].rightOrder.forEach(item => {
                    solutionText.innerHTML += item + '<br />';
                })
            }
        } else {
            solutionText.innerHTML = "No solution to be shown !";
        }
        document.getElementById('solution').insertBefore(solutionText, document.getElementById('buttonClosingSolution'));
        document.getElementById('solution').style.display = 'flex';
    }
}

function closeSolution() {
    document.getElementById('buttons').style.display = 'flex';
    if (containerOpen) {
        document.getElementById('container').style.display = 'block';
    }
    document.getElementById('solution').style.display = 'none';
}

function healthDown() {
    health -= 1;
    document.getElementById('health').innerText = "Health: " + health;
}

function levelUp() {
    lvl += 1;
    document.getElementById('level').innerText = "Level: " + lvl;
}

function getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initializeGame() {
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('buttons').style.display = 'flex';
    document.getElementById('startGame').style.display = 'block';
    document.getElementById('check').style.display = 'none';
    document.getElementById('health').style.display = 'none';
    document.getElementById('level').style.display = 'none';
    document.getElementById('container').style.display = 'none';
    document.getElementById('rules').style.display = 'none';
    document.getElementById('hint').style.display = 'none';
    document.getElementById('solution').style.display = 'none';
    document.getElementById('wrongAnswer').style.display = 'none';
    document.getElementById('loose').style.display = 'none';
    document.getElementById('win').style.display = 'none';
    document.getElementById('level').innerText = "Level: 1";
    document.getElementById('health').innerText = "Health: 7";
    containerOpen = false;
    rulesOpen = false;
    health = 7;
    lvl = 1;

    if (localStorage.getItem("currentLevel") && localStorage.getItem("playedLevels")) {
        currentLevel = localStorage.getItem("currentLevel");
        playedLevels = JSON.parse(localStorage.getItem("playedLevels"));
    } else {
        currentLevel = getRandomNumber(1, 3) - 1;
        playedLevels.push(currentLevel);
        localStorage.setItem("currentLevel", currentLevel);
        localStorage.setItem("playedLevels", JSON.stringify(playedLevels));
    }
}

function checkGame() {
    if (checkOrder()) {
        document.getElementById('wrongAnswer').style.display = 'none';
        if (chooseLevel()) {
            levelUp();
            createList(levels[currentLevel].initialOrder);
        } else {
            displayWin();
        }
    } else {
        if (health > 1) {
            document.getElementById('wrongAnswer').style.display = 'flex';
            healthDown();
        } else {
            document.getElementById('wrongAnswer').style.display = 'none';
            document.getElementById('menu').style.display = 'none';
            document.getElementById('buttons').style.display = 'none';
            document.getElementById('container').style.display = 'none';
            document.getElementById('loose').style.display = 'flex';
        }
    }
}

function checkOrder() {
    const currentOrder = [];
    const temp = document.querySelectorAll(".name");
    temp.forEach(item => {
        currentOrder.push(item.innerText);
    })
    if (localStorage.getItem("currentLevel")) {
        if (currentOrder.length === levels[localStorage.getItem("currentLevel")].rightOrder.length) {
            for (let i = 0; i < currentOrder.length; i++) {
                if (currentOrder[i] !== levels[localStorage.getItem("currentLevel")].rightOrder[i]) {
                    return false
                }
            }
            return true
        }
    }
}

function startGame() {
    createList(levels[currentLevel].initialOrder);
    document.getElementById('startGame').style.display = 'none';
    document.getElementById('check').style.display = 'block';
    document.getElementById('health').style.display = 'block';
    document.getElementById('level').style.display = 'block';
    document.getElementById('container').style.display = 'block';
    containerOpen = true;
}

function chooseLevel() {
    if (localStorage.getItem("playedLevels")) {
        if (JSON.parse(localStorage.getItem("playedLevels")).length > 9) {
            return false;
        }

        currentLevel = getRandomNumber(1, 10) - 1;
        if (localStorage.getItem("playedLevels")) {
            while (JSON.parse(localStorage.getItem("playedLevels")).find(element => element === currentLevel) !== undefined) {
                currentLevel = getRandomNumber(1, 10) - 1;
            }
        }
    }

    playedLevels.push(currentLevel);
    localStorage.setItem("playedLevels", JSON.stringify(playedLevels));
    localStorage.setItem("currentLevel", currentLevel);
    return true;
}

function createList(initialOrder) {
    if (draggable_list != null) {
        draggable_list.innerHTML = ""
    }

    [...initialOrder]
        .map(a => ({ value: a, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(a => a.value)
        .forEach((name, index) => {
            const listItem = document.createElement('p');

            listItem.setAttribute("draggable", "true");
            listItem.className += "draggable";
            listItem.innerHTML = `
                <span class="number">${index + 1}</span>
                <div class="name">${name}</div>
            `;

            draggable_list.appendChild(listItem);
        });

    const listItem = document.createElement('p');
    listItem.id += "question";
    listItem.innerHTML = levels[currentLevel].question;
    draggable_list.insertBefore(listItem, draggable_list.firstChild);

    const draggableItems = document.querySelectorAll('.draggable')
    const container = document.querySelector('.container')

    draggableItems.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
        })

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging')
        })
    })


    container.addEventListener('dragover', e => {
        e.preventDefault()
        const afterElement = getDragAfterElement(container, e.clientY)
        const draggable = document.querySelector('.dragging')
        if (afterElement == null) {
            container.appendChild(draggable)
        } else {
            container.insertBefore(draggable, afterElement)
        }
    })

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height / 2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element
    }
}

window.onbeforeprint = () => {
    document.getElementById("rules").style.display = "flex";
}

window.onafterprint = () => {
    if (!rulesOpen) {
        document.getElementById("rules").style.display = "none";
    }
}

navigator.serviceWorker.register("./serviceWorker.js")
    .then((reg) => {
        console.log("registered", reg);
    })
    .catch(err => {
        console.log("error", err);
    })
