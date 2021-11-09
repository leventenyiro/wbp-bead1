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
// infók
var player
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
    divSettings.appendChild(inputPlayers)

    // játékosokként hány kincskártya beállítása
    const labelInputNumberCards = document.createElement('label')
    labelInputNumberCards.innerHTML = 'Játékosonként hány kincskártya'
    const inputNumberCards = document.createElement('input')
    inputNumberCards.type = 'number'
    inputNumberCards.min = 1
    inputNumberCards.value = 1
    labelInputPlayers.htmlFor = inputNumberCards
    divSettings.appendChild(labelInputNumberCards)
    divSettings.appendChild(inputNumberCards)

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
        player = inputPlayers.value
        numberCards = inputNumberCards.value
        startGame()
    })
    divSettings.appendChild(btnStartGame);

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
    divDesc.innerHTML = `<h1>A játék leírása</h1>
    <p>A <b>katakomba</b> szobáit egy 7x7-es négyzetrács cellái jelképezik. Minden szobában adott, hogy hány falán van ajtó. Ha két szomszédos szoba érintkező falán egy-egy ajtó van, akkor át lehet menni egyik szobából a másikba. A négyzetrács páros sorait és oszlopait el lehet tolni, a többi szoba végig rögzített a játék során. Az eltolásokkal az ajtókon keresztül utak nyílnak a szobák között, így lehet eljutni a kincsekhez. Mindegyik kérő arra törekszik, hogy a katakomba szobáinak ötletes eltolásával eljusson a kincsekhez. Aki elsőként találja meg mindahányat és kiindulópontjára sikeresen visszaérkezik az a nyertes.</p>`
    main.appendChild(divDesc)

    // btnBack
    const btnBack = document.createElement('button')
    btnBack.innerHTML = 'Vissza'
    btnBack.addEventListener('click', startScreen)
    main.appendChild(btnBack);
}

class Room {
    constructor(row, col, type, rot) {
        this.id = roomId++
        this.row = row
        this.col = col
        switch (type) {
            case 0:
                this.type = new Image()
                this.type.src = 'img/line.png'
                break;
            case 1:
                this.type = new Image()
                this.type.src = 'img/corner.png'
                break;
            case 2:
                this.type = new Image()
                this.type.src = 'img/t.png'
                break;
        }
        this.rot = rot
    }

    setGold(playerId) {
        this.gold = playerId;
    }

    setPosition(row, col) {
        this.row = row
        this.col = col
    }

    setRotate(rot) {
        this.rot = rot
    }

    getWays() {
        // merre lehet menni?
    }
}

class Player {
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
}

let arrRooms = [
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

function startGame() {
    // div, jó sok divvel
    main.innerHTML = ''

    const game = document.createElement('div')
    game.id = 'game'

    // headerArrow
    /*const headerRow = document.createElement('div')
    headerRow.classList.add('row')
    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div')
        div.classList.add('room')
        if (i % 2 == 1) {
            div.classList.add('arrow')
        }
        headerRow.appendChild(div)
    }
    game.appendChild(headerRow)*/

    const board = document.createElement('div')
    board.id = 'board'

    for (let i = 0; i < 9; i++) {
        const row = document.createElement('div')
        row.classList.add('row')
        for (let j = 0; j < 9; j++) {
            const div = document.createElement('div')
            if (((i == 0 || i == 8) && j % 2 == 0 && j != 0 && j != 8) || (i % 2 == 0 && i != 0 && i != 8 && (j == 0 || j == 8))) {
                div.classList.add('arrow')
                if (i == 0)
                    div.style.transform = 'rotate(180px)'
                else if (j == 0)
                    div.style.transform = 'rotate(90px)'
                else if (j == 8)
                    div.style.transform = 'rotate(270px)'
            } else if (i > 0 && i < 8 && j > 0 && j < 8)
                div.classList.add('room')
            else
                div.classList.add('empty')
            row.appendChild(div)
        }
        board.appendChild(row)
    }
    game.appendChild(board)

    const divSepar = document.createElement('div')
    divSepar.id = 'separ'
    const divSeparRoom = document.createElement('div')
    divSeparRoom.classList.add('room')
    divSeparRoom.id = 'separRoom'
    divSepar.appendChild(divSeparRoom)

    // btnBalra
    const btnLeft = document.createElement('button')
    btnLeft.innerHTML = 'Balra'
    btnLeft.addEventListener('click', rotateLeft)
    divSepar.appendChild(btnLeft);

    // btnJobbra
    const btnRight = document.createElement('button')
    btnRight.innerHTML = 'Jobbra'
    btnRight.addEventListener('click', rotateRight)
    divSepar.appendChild(btnRight);

    // labelRotate
    const labelRotate = document.createElement('label')
    labelRotate.innerHTML = 'Forgatás'
    divSepar.appendChild(labelRotate)

    game.appendChild(divSepar)
    main.appendChild(game)

    // random szobák generálása
    randomRooms()

    // játékosok létrehozása
    for (let i = 0; i < player; i++) {
        arrPlayers.push(new Player(i, arrRooms[i].row, arrRooms[i].col))
    }

    // kártyák behelyettesítése
    //showBoard()

    // kincsek kiosztása
    let playerId = 0;
    let numberCardsPerPlayer = 0
    for (let i = 0; i < numberCards; i++) {
        let rndRoom = random(4, 48)
        while (arrRooms[rndRoom].gold != undefined) {
            rndRoom = random(4, 48)
        }
        arrRooms[rndRoom].gold = playerId

        if (numberCardsPerPlayer == numberCards / player) {
            playerId++
            numberCardsPerPlayer = 0
        }
    }

    // kincsek mutatása - teszt
    //showGold(0)

    // játékosinfók - game gyereke lesz
    showInfo()
}

function randomRooms() {
    let types = [13, 15, 6]
    
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            if (getRoom(i, j) == null) {
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

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRoom(row, col) {
    for (let e of arrRooms) {
        if (e.row === row && e.col === col)
            return e
    }
    return null
}

function showBoard() {
    const board = main.querySelector('#game #board')
    // szobák mutatása
    for (let e of arrRooms) {
        if (e.row != -1) {
            var room = board.querySelectorAll('.row')[e.row].querySelectorAll('.room')[e.col]
            room.removeEventListener('click', pushRoom)
            if ((e.row != prevPush.row || e.col != prevPush.col) && ((e.row % 2 == 1 && (e.col == 0 || e.col == 6)) || (e.col % 2 == 1 && (e.row == 0 || e.row == 6)))) {
                room.classList.add('selectPush')
                room.addEventListener('click', pushRoom)
            } else {
                room.classList.remove('selectPush')
            }
        } else
            var room = document.querySelector('#separRoom')

        room.style.backgroundImage = `url(${e.type.src})`
        room.style.transform = `rotate(${e.rot * 90}deg)`
        room.dataset.id = e.id
    }

    // játékosok mutatása
    for (e of arrPlayers) {
        const divPlayer = document.createElement('div')
        divPlayer.classList.add('player')
        if (turn == e.id) {
            setInterval(() => {
                divPlayer.style.transition = '0.2s'
                if (!divPlayer.style.boxShadow)
                    divPlayer.style.boxShadow = `0 0 0 8px white`
                else
                    divPlayer.style.boxShadow = null
            }, 450)

        }
        divPlayer.style.backgroundColor = e.color
        board.querySelectorAll('.row')[e.row].querySelectorAll('.room')[e.col].appendChild(divPlayer)
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
    const separ = getRoom(-1, -1)
    separ.setRotate(separ.rot == 0 ? 3 : separ.rot - 1) // mennyi az annyi?
    showBoard()
}

function rotateRight() {
    const separ = getRoom(-1, -1)
    separ.setRotate(separ.rot == 3 ? 0 : separ.rot + 1) // mennyi az annyi?
    showBoard()
}

function pushRoom(event) {
    const e = arrRooms[event.target.dataset.id]
    direction = e.row % 2 == 1 ? (e.col == 0 ? LEFT : RIGHT) : (e.row == 0 ? UP : DOWN)

    const board = main.querySelector('#game #board')
    if (direction % 2 == 0) { // col fix
        const multiply = direction == 0 ? 1 : -1

        prevPush.row = e.row + multiply * 6
        prevPush.col = e.col

        for (let i = 0; i < 7; i++) {
            const room = board.querySelectorAll('.row')[i].querySelectorAll('.room')[e.col]
            arrRooms[room.dataset.id].setPosition(i + multiply, e.col)
            //room.style.transition = '2s'
        }
        getRoom(-1, -1).setPosition(multiply == 1 ? 0 : 6, e.col)
        getRoom(multiply == 1 ? 7 : -1, e.col).setPosition(-1, -1)
    } else { // row fix
        const multiply = direction == 3 ? 1 : -1

        prevPush.row = e.row
        prevPush.col = e.col + multiply * 6
        
        const rooms = board.querySelectorAll('.row')[e.row].querySelectorAll('.room')
        for (let i = 0; i < 7; i++) {
            const room = rooms[i]
            arrRooms[room.dataset.id].setPosition(e.row, i + multiply)
            //room.style.transition = '2s'
        }
        getRoom(-1, -1).setPosition(e.row, multiply == 1 ? 0 : 6)
        getRoom(e.row, multiply == 1 ? 7 : -1).setPosition(-1, -1)
    }

    showBoard()
}

function showGold(playerId) {
    for (let e of arrRooms) {
        if (e.gold == playerId) {
            const divGold = document.createElement('div')
            divGold.classList.add('gold')
            main.querySelector('#game #board').querySelectorAll('.row')[e.row].querySelectorAll('.room')[e.col].appendChild(divGold)
        }
    }
}

function showInfo() {
    const info = document.createElement('div')
    info.id = 'info'
    
    const divPlayers = document.createElement('div')
    divPlayers.id = 'divPlayers'
    for (let i = 0; i < player; i++) {
        const divPlayer = document.createElement('div');
        divPlayer.innerHTML = `
            <h2>Player ${i + 1}</h2>
            <p>Found</p>
        `
        divPlayers.appendChild(divPlayer)
    }
    info.appendChild(divPlayers)
    main.appendChild(info)
}

startScreen()