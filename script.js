const main = document.querySelector('#main')
// game
var turn = 0
var turnPart = 0
// rotations
const UP = 0
const RIGHT = 1
const DOWN = 2
const LEFT = 3
// rooms
const LINE = 0
const CORNER = 1
const T = 2
var roomId = 0
var prevPush = {row: -1, col: -1}
// játékosok
var arrPlayers = []
// kincsek
var goldId = 0
var arrGolds = []
// infók
var numberPlayer
var numberCards

// kezdőképernyő - új játék, leírás
function startScreen() {
    main.innerHTML = ''
    // játékosszám beállítása
    const divSettings = document.createElement('div')
    divSettings.id = 'settings'

    const labelInputPlayers = document.createElement('label')
    labelInputPlayers.innerHTML = 'Játékosok száma'
    const inputPlayers = document.createElement('input')
    inputPlayers.type = 'number'
    inputPlayers.min = 1
    inputPlayers.max = 4
    inputPlayers.value = 2
    labelInputPlayers.htmlFor = inputPlayers
    divSettings.appendChild(labelInputPlayers)
    divSettings.appendChild(document.createElement('br'))
    divSettings.appendChild(inputPlayers)

    divSettings.appendChild(document.createElement('br'))


    // játékosokként hány kincskártya beállítása
    const labelInputNumberCards = document.createElement('label')
    labelInputNumberCards.innerHTML = 'Játékosonként hány kincskártya'
    const inputNumberCards = document.createElement('input')
    inputNumberCards.type = 'number'
    inputNumberCards.min = 1
    inputNumberCards.value = 1
    inputNumberCards.max = 24 / inputPlayers.value
    labelInputPlayers.htmlFor = inputNumberCards
    divSettings.appendChild(labelInputNumberCards)
    divSettings.appendChild(document.createElement('br'))
    divSettings.appendChild(inputNumberCards)
    divSettings.appendChild(document.createElement('br'))

    // event
    inputPlayers.addEventListener('change', (e) => {
        inputNumberCards.max = 24 / inputPlayers.value
        if (inputNumberCards.value > 24 / inputPlayers.value)
            inputNumberCards.value = inputNumberCards.max
    })

    // btnStartGame
    const btnStartGame = document.createElement('button')
    btnStartGame.innerHTML = 'Játék indítása'
    btnStartGame.addEventListener('click', (event) => {
        numberPlayer = inputPlayers.value
        numberCards = inputNumberCards.value
        startGame()
        initNewGame()
        showBoard()
    })
    divSettings.appendChild(btnStartGame);
    divSettings.appendChild(document.createElement('br'))

    // btnLoadGame
    const btnLoadGame = document.createElement('button')
    btnLoadGame.innerHTML = 'Mentett játék betöltése'
    btnLoadGame.addEventListener('click', loadGame)
    btnLoadGame.disabled = window.localStorage.length == 0
    divSettings.appendChild(btnLoadGame);
    divSettings.appendChild(document.createElement('br'))

    // leírás
    const btnDesc = document.createElement('button')
    btnDesc.innerHTML = 'Leírás'
    btnDesc.addEventListener('click', desc)
    divSettings.appendChild(btnDesc);

    main.appendChild(divSettings)
}

function desc() {
    // startScreen törlése, majd újrameghívása
    main.innerHTML = ''
    const divDesc = document.createElement('div')
    divDesc.id = 'desk'
    divDesc.innerHTML = `<h1>A játék leírása</h1>
    <p>A <b>katakomba</b> szobáit egy 7x7-es négyzetrács cellái jelképezik. Minden szobában adott, hogy hány falán van ajtó. Ha két szomszédos szoba érintkező falán egy-egy ajtó van, akkor át lehet menni egyik szobából a másikba. A négyzetrács páros sorait és oszlopait el lehet tolni, a többi szoba végig rögzített a játék során. Az eltolásokkal az ajtókon keresztül utak nyílnak a szobák között, így lehet eljutni a kincsekhez. Mindegyik kérő arra törekszik, hogy a katakomba szobáinak ötletes eltolásával eljusson a kincsekhez. Aki elsőként találja meg mindahányat és kiindulópontjára sikeresen visszaérkezik az a nyertes.</p>`

    divDesc.appendChild(document.createElement('br'))
    // btnBack
    const btnBack = document.createElement('button')
    btnBack.innerHTML = 'Vissza'
    btnBack.addEventListener('click', startScreen)
    divDesc.appendChild(btnBack);

    main.appendChild(divDesc)
}

class Room {
    constructor(row, col, type, rot) {
        this.id = roomId++
        this.row = row
        this.col = col
        this.type = type
        this.rot = rot
    }

    setPosition(row, col) {
        this.row = row
        this.col = col
    }

    setRotate(rot) {
        this.rot = rot
    }

    getWays() {
        if (this.type == LINE) {
            if (this.rot == 0 || this.rot == 2)
                return [RIGHT, LEFT]
            return [UP, DOWN]
        } else if (this.type == CORNER) {
            switch (this.rot) {
                case 0: return [RIGHT, DOWN]
                case 1: return [DOWN, LEFT]
                case 2: return [LEFT, UP]
                default: return [UP, RIGHT]
            }
        } else {
            switch (this.rot) {
                case 0: return [UP, RIGHT, LEFT]
                case 1: return [UP, RIGHT, DOWN]
                case 2: return [RIGHT, DOWN, LEFT]
                default: return [DOWN, LEFT, UP]
            }
        }
    }
}

class Player { // hány kincset talált meg
    constructor(id, row, col) {
        this.row = row
        this.col = col
        this.id = id
        switch(this.id) {
            case 0: this.color = 'red'; break;
            case 1: this.color = 'blue'; break;
            case 2: this.color = 'green'; break;
            default: this.color = 'purple'; break;
        }
    }

    setPosition(row, col) {
        this.row = row
        this.col = col
    }

    getColor() {
        return this.color
    }
}

class Gold {
    constructor(playerId, row, col) {
        this.row = row
        this.col = col
        this.playerId = playerId
        this.id = goldId++
    }

    setPosition(row, col) {
        this.row = row
        this.col = col
    }
}

function getGameElement(arr, row, col) {
    for (let e of arr) {
        if (e.row == row && e.col == col)
            return e
    }
    return null
}

function initFixRooms() {
    roomId = 0
    return [
        new Room(0, 0, CORNER, UP),
        new Room(0, 6, CORNER, RIGHT),
        new Room(6, 6, CORNER, DOWN),
        new Room(6, 0, CORNER, LEFT),
    
        new Room(0, 2, T, UP),
        new Room(0, 4, T, UP),
    
        new Room(2, 0, T, LEFT),
        new Room(2, 2, T, LEFT),
        new Room(2, 4, T, UP),
        new Room(2, 6, T, RIGHT),
    
        new Room(4, 0, T, LEFT),
        new Room(4, 2, T, DOWN),
        new Room(4, 4, T, RIGHT),
        new Room(4, 6, T, RIGHT),
    
        new Room(6, 2, T, DOWN),
        new Room(6, 4, T, DOWN),
    ]
}

function startGame() {
    main.innerHTML = ''

    const game = document.createElement('div')
    game.id = 'game'

    const board = document.createElement('div')
    board.id = 'board'
    game.appendChild(board)

    const divSepar = document.createElement('div')
    divSepar.id = 'separ'
    const divSeparRoom = document.createElement('div')
    divSeparRoom.classList.add('room')
    divSeparRoom.id = 'separRoom'
    divSepar.appendChild(divSeparRoom)
    divSepar.appendChild(document.createElement('br'))

    // btnBalra
    const btnLeft = document.createElement('button')
    btnLeft.innerHTML = 'Balra'
    btnLeft.addEventListener('click', rotateLeft)
    divSepar.appendChild(btnLeft);
    divSepar.appendChild(document.createElement('br'))

    // btnJobbra
    const btnRight = document.createElement('button')
    btnRight.innerHTML = 'Jobbra'
    btnRight.addEventListener('click', rotateRight)
    divSepar.appendChild(btnRight);
    divSepar.appendChild(document.createElement('br'))

    game.appendChild(divSepar)
    main.appendChild(game)

    // játékosinfók - game gyereke lesz
    const info = document.createElement('div')
    info.id = 'info'
    main.appendChild(info)
}

function initNewGame() {
    turn = 0
    turnPart = 0
    prevPush = {row: -1, col: -1}

    // random szobák generálása
    randomRooms()

    // játékosok létrehozása
    arrPlayers = []
    for (let i = 0; i < numberPlayer; i++) {
        arrPlayers.push(new Player(i, arrRooms[i].row, arrRooms[i].col))
    }

    // kincsek kiosztása
    randomGolds()
}

function initRooms() {
    const board = document.querySelector('#game #board')
    board.innerHTML = ''
    for (let i = 0; i < 9; i++) {
        const row = document.createElement('div')
        row.classList.add('row')
        for (let j = 0; j < 9; j++) {
            const div = document.createElement('div')
            if (((i == 0 || i == 8) && j % 2 == 0 && j != 0 && j != 8) || (i % 2 == 0 && i != 0 && i != 8 && (j == 0 || j == 8))) {
                div.classList.add('arrow')
                if (i == 0) {
                    div.style.transform = 'rotate(180deg)'
                    div.dataset.row = 0
                    div.dataset.col = j - 1
                } else if (j == 0) {
                    div.style.transform = 'rotate(90deg)'
                    div.dataset.row = i - 1
                    div.dataset.col = 0
                } else if (j == 8) {
                    div.style.transform = 'rotate(270deg)'
                    div.dataset.row = i - 1
                    div.dataset.col = 6
                } else {
                    div.dataset.row = 6
                    div.dataset.col = j - 1
                }
            } else if (i > 0 && i < 8 && j > 0 && j < 8)
                div.classList.add('room')
            else
                div.classList.add('empty')
            row.appendChild(div)
        }
        board.appendChild(row)
    }
}

function randomRooms() {
    arrRooms = initFixRooms()
    let types = [13, 15, 6]
    
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (getGameElement(arrRooms, i, j) == null) {
                let rndType = random(0, 2)
                while (types[rndType] == 0) {
                    rndType = random(0, 2)
                }
                arrRooms.push(new Room(i, j, rndType, random(0, 3)))
                types[rndType]--
            }
        }
    }
    arrRooms.push(new Room(-1, -1, types.findIndex((e) => e > 0), random(0, 3)))
}

function randomGolds() {
    arrGolds = []
    for (let i = 0; i < numberPlayer; i++) {
        for (let j = 0; j < numberCards; j++) {
            let rndRoom = random(4, 48)
            while (getGameElement(arrGolds, arrRooms[rndRoom].row, arrRooms[rndRoom].col) != null) {
                rndRoom = random(4, 48)
            }
            arrGolds.push(new Gold(i, arrRooms[rndRoom].row, arrRooms[rndRoom].col))
        }
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function showBoard() {
    showInfo()
    initRooms()
    showGold(turn)
    const board = main.querySelector('#game #board')
    for (let e of arrRooms) {
        if (e.row != -1) {
            var room = board.querySelectorAll('.row')[e.row + 1].querySelectorAll('.room')[e.col]
        } else
            var room = document.querySelector('#separRoom')

        room.style.backgroundImage = `url(img/room${e.type}.png)`
        room.style.transform = `rotate(${e.rot * 90}deg)`
        room.dataset.id = e.id
    }

    // játékosok mutatása
    for (e of arrPlayers) {
        const divPlayer = document.createElement('div')
        divPlayer.classList.add('player')
        if (turn === e.id) {
            setInterval(() => {
                divPlayer.style.transition = '0.2s'
                if (!divPlayer.style.boxShadow)
                    divPlayer.style.boxShadow = `0 0 0 8px white`
                else
                    divPlayer.style.boxShadow = null
            }, 450)

        }
        divPlayer.style.backgroundColor = e.color
        var room = board.querySelectorAll('.row')[e.row + 1].querySelectorAll('.room')[e.col]
        room.appendChild(divPlayer)
    }
    if (turnPart == 0) {
        // nyilakra kattintás
        for (let e of board.querySelectorAll('.arrow')) {
            e.removeEventListener('click', pushRoom)
            if (parseInt(e.dataset.row) !== prevPush.row || parseInt(e.dataset.col) !== prevPush.col) {
                e.addEventListener('click', pushRoom)
                e.classList.add('arrowEnabled')
            } else {
                e.classList.remove('arrowEnabled')
            }
        }
    } else {
        // lépés
        showAvailableRooms(arrPlayers[turn].row, arrPlayers[turn].col, arrPlayers[turn])
    }
}

function deleteGold() {
    for (let e of arrGolds) {
        if (e.playerId == turn && arrPlayers[turn].row == e.row && arrPlayers[turn].col == e.col) {
            arrGolds.splice(arrGolds.indexOf(e) , 1)
            break;
        }
    }
}

// available rooms
arrAvailableRooms = []
function getAvailableRooms(row, col, player) {
    const actual = getGameElement(arrRooms, row, col)
    const ways = actual.getWays()
    arrAvailableRooms.push(actual)
    if (ways.includes(0) && row - 1 >= 0 && getGameElement(arrRooms, row - 1, col).getWays().includes(2) && !arrAvailableRooms.includes(getGameElement(arrRooms, row - 1, col)))
        getAvailableRooms(row - 1, col, 2, player)
    if (ways.includes(1) && col + 1 <= 6 && getGameElement(arrRooms, row, col + 1).getWays().includes(3) && !arrAvailableRooms.includes(getGameElement(arrRooms, row, col + 1)))
        getAvailableRooms(row, col + 1, 3, player)
    if (ways.includes(2) && row + 1 <= 6 && getGameElement(arrRooms, row + 1, col).getWays().includes(0) && !arrAvailableRooms.includes(getGameElement(arrRooms, row + 1, col)))
        getAvailableRooms(row + 1, col, 0, player)
    if (ways.includes(3) && col - 1 >= 0 && getGameElement(arrRooms, row, col - 1).getWays().includes(1) && !arrAvailableRooms.includes(getGameElement(arrRooms, row, col - 1)))
        getAvailableRooms(row, col - 1, 1, player)
}

function showAvailableRooms(row, col, player) {
    arrAvailableRooms = []
    getAvailableRooms(row, col, player)
    for (let e of arrAvailableRooms) {
        const room = document.querySelector('#game #board').querySelectorAll('.row')[e.row + 1].querySelectorAll('.room')[e.col]
        room.classList.add('availablePath')
        room.addEventListener('click', () => {
            player.setPosition(e.row, e.col)
            deleteGold()
            showInfo()
            turn = turn + 1 < numberPlayer ? turn + 1 : 0
            turnPart = 0
            showBoard()
            isWon()
        })
    }
}

// rotate
document.addEventListener('keydown', (event) => {
    if (event.key == 'ArrowLeft')
        rotateLeft()
    else if (event.key == 'ArrowRight')
        rotateRight()
})

function rotateLeft() {
    const separ = getGameElement(arrRooms, -1, -1)
    separ.setRotate(separ.rot == 0 ? 3 : separ.rot - 1)
    showBoard()
}

function rotateRight() {
    const separ = getGameElement(arrRooms, -1, -1)
    separ.setRotate(separ.rot == 3 ? 0 : separ.rot + 1)
    showBoard()
}

function pushRoom(event) {
    const e = event.target.dataset
    direction = parseInt(e.row) % 2 == 1 ? (parseInt(e.col) == 0 ? LEFT : RIGHT) : (parseInt(e.row) == 0 ? UP : DOWN)

    const board = main.querySelector('#game #board')
    if (direction % 2 == 0) { // col fix
        const multiply = direction == 0 ? 1 : -1

        prevPush.row = parseInt(e.row) + multiply * 6
        prevPush.col = parseInt(e.col)

        for (let i = 0; i < 7; i++) {
            const room = board.querySelectorAll('.row')[i + 1].querySelectorAll('.room')[parseInt(e.col)]
            arrRooms[room.dataset.id].setPosition(i + multiply, parseInt(e.col))
        }

        // játékos tolása
        for (let p of arrPlayers) {
            if (p.col == parseInt(e.col)) {
                board.querySelectorAll('.row')[p.row + 1].querySelectorAll('.room')[p.col].innerHTML = ''
                p.setPosition(p.row + multiply, p.col)
            }
        }

        // kincs tolása
        for (let g of arrGolds) {
            if (g.col == parseInt(e.col)) {
                board.querySelectorAll('.row')[g.row + 1].querySelectorAll('.room')[g.col].innerHTML = ''
                g.setPosition(g.row + multiply, g.col)
            }
        }
        
        getGameElement(arrRooms, -1, -1).setPosition(multiply == 1 ? 0 : 6, parseInt(e.col))
        const newSeparate = getGameElement(arrRooms, multiply == 1 ? 7 : -1, parseInt(e.col))
        // játékos tolása
        for (let p of arrPlayers) {
            if (p.row == newSeparate.row && p.col == newSeparate.col)
                p.setPosition(multiply == 1 ? 0 : 6, p.col)
        }
        // kincs tolása
        for (let g of arrGolds) {
            if (g.row == newSeparate.row && g.col == newSeparate.col)
                g.setPosition(multiply == 1 ? 0 : 6, g.col)
        }
        newSeparate.setPosition(-1, -1)
    } else { // row fix
        const multiply = direction == 3 ? 1 : -1
        prevPush.row = parseInt(e.row)
        prevPush.col = parseInt(e.col) + multiply * 6
        
        const rooms = board.querySelectorAll('.row')[parseInt(e.row) + 1].querySelectorAll('.room')
        for (let i = 0; i < 7; i++) {
            const room = rooms[i]
            arrRooms[room.dataset.id].setPosition(parseInt(e.row), i + multiply)
        }

        // játékos tolása
        for (let p of arrPlayers) {
            if (p.row == parseInt(e.row)) {
                rooms[p.col].innerHTML = ''
                p.setPosition(p.row, p.col + multiply)
            }
        }

        // kincs tolása
        for (let g of arrGolds) {
            if (g.row == parseInt(e.row)) {
                rooms[g.col].innerHTML = ''
                g.setPosition(g.row, g.col + multiply)
            }
        }
        
        getGameElement(arrRooms, -1, -1).setPosition(parseInt(e.row), multiply == 1 ? 0 : 6)
        const newSeparate = getGameElement(arrRooms, parseInt(e.row), multiply == 1 ? 7 : -1)
        // játékos letolása
        for (let p of arrPlayers) {
            if (p.row == newSeparate.row && p.col == newSeparate.col) {
                p.setPosition(p.row, multiply == 1 ? 0 : 6)
            }
        }
        // kincs letolása
        for (let g of arrGolds) {
            if (g.row == newSeparate.row && g.col == newSeparate.col) {
                g.setPosition(g.row, multiply == 1 ? 0 : 6)
            }
        }
        newSeparate.setPosition(-1, -1)
    }
    turnPart++
    showBoard()
}

function showGold(playerId) {
    for (let e of arrGolds) {
        if (e.playerId == playerId) {
            const divGold = document.createElement('div')
            divGold.classList.add('gold')
            main.querySelector('#game #board').querySelectorAll('.row')[e.row + 1].querySelectorAll('.room')[e.col].appendChild(divGold)
        }
    }
}

function getFoundGolds(player) {
    let goldsOfPlayer = 0
    for (let e of arrGolds) {
        if (e.playerId == player.id)
            goldsOfPlayer++
    }
    return numberCards - goldsOfPlayer
}

function showInfo() {
    const info = document.querySelector('#info')
    info.innerHTML = ''
    const divPlayers = document.createElement('div')
    divPlayers.id = 'divPlayers'
    for (let e of arrPlayers) {
        const divPlayer = document.createElement('div')
        divPlayer.innerHTML = `
            <h2 style='color:${e.getColor()}'>${getHungarianColorName(e.getColor())} játékos</h2>
            <p>Found ${getFoundGolds(e)} / ${numberCards}</p>
        `
        divPlayers.appendChild(divPlayer)
    }
    info.appendChild(divPlayers)

    // settings
    const divSettings = document.createElement('div')
    
    const btnSave = document.createElement('button')
    btnSave.innerHTML = 'Mentés és kilépés'
    btnSave.addEventListener('click', saveGame)
    divSettings.appendChild(btnSave)
    divSettings.appendChild(document.createElement('br'))

    const btnNewGame = document.createElement('button')
    btnNewGame.innerHTML = 'Új játék'
    btnNewGame.addEventListener('click', startScreen)
    divSettings.appendChild(btnNewGame)

    info.appendChild(divSettings)
}

function isWon() {
    for (let e of arrPlayers) {
        if (e.row == arrRooms[e.id].row && e.col == arrRooms[e.id].col && getFoundGolds(e) == numberCards) {
            turnPart = 2
            showWin(e)
        }
    }
}

function getHungarianColorName(color) {
    switch (color) {
        case 'red': return 'Piros'
        case 'blue': return 'Kék'
        case 'green': return 'Zöld'
        default: return 'Lila'
    }
}

function showWin(player) {
    let str = `${getHungarianColorName(player.getColor())} játékos nyert!`
    alert(str)
    startScreen()
}

function saveGame() {
    saveStorage = window.localStorage
    saveStorage.clear()
    saveStorage.setItem('turn', turn)
    saveStorage.setItem('turnPart', turnPart)
    saveStorage.setItem('prevPush', JSON.stringify(prevPush))
    saveStorage.setItem('arrRooms', JSON.stringify(arrRooms))
    saveStorage.setItem('arrPlayers', JSON.stringify(arrPlayers))
    saveStorage.setItem('arrGolds', JSON.stringify(arrGolds))
    saveStorage.setItem('numberPlayer', numberPlayer)
    saveStorage.setItem('numberCards', numberCards)
    startScreen()
}

function loadGame() {
    startGame()
    saveStorage = window.localStorage
    turn = parseInt(saveStorage.getItem('turn'))
    turnPart = parseInt(saveStorage.getItem('turnPart'))
    prevPush = JSON.parse(saveStorage.getItem('prevPush'))
    roomId = 0
    arrRooms = []
    for (let e of JSON.parse(saveStorage.getItem('arrRooms'))) {
        arrRooms.push(new Room(e.row, e.col, e.type, e.rot))
    }
    playerId = 0
    arrPlayers = []
    for (let e of JSON.parse(saveStorage.getItem('arrPlayers'))) {
        arrPlayers.push(new Player(e.id, e.row, e.col))
    }
    goldId = 0
    arrGolds = []
    for (let e of JSON.parse(saveStorage.getItem('arrGolds'))) {
        arrGolds.push(new Gold(e.playerId, e.row, e.col))
    }
    numberPlayer = parseInt(saveStorage.getItem('numberPlayer'))
    numberCards = parseInt(saveStorage.getItem('numberCards'))
    showBoard()
}

startScreen()