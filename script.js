const main = document.querySelector('#main')
// rotations
const UP = 0
const RIGHT = 1
const DOWN = 2
const LEFT = 3
// szobák típusai
const LINE = 0
const CORNER = 1
const T = 2
// játékosok
const PLAYERS = ['red', 'blue', 'green', 'purple']
// infók
var player
var numberCards

// kezdőképernyő - új játék, leírás
function startScreen() {
    main.innerHTML = ""
    // játékosszám beállítása
    const divSettings = document.createElement('div')
    divSettings.id = "settings"

    const labelInputPlayers = document.createElement('label')
    labelInputPlayers.innerHTML = "Játékosok száma"
    const inputPlayers = document.createElement('input')
    inputPlayers.type = "number"
    inputPlayers.min = 1
    inputPlayers.max = 4
    inputPlayers.value = 2
    labelInputPlayers.htmlFor = inputPlayers
    divSettings.appendChild(labelInputPlayers)
    divSettings.appendChild(inputPlayers)

    // játékosokként hány kincskártya beállítása
    const labelInputNumberCards = document.createElement('label')
    labelInputNumberCards.innerHTML = "Játékosonként hány kincskártya"
    const inputNumberCards = document.createElement('input')
    inputNumberCards.type = "number"
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
    btnStartGame.innerHTML = "Játék indítása"
    btnStartGame.addEventListener('click', (event) => {
        player = inputPlayers.value
        numberCards = inputNumberCards.value
        startGame()
    })
    divSettings.appendChild(btnStartGame);

    // leírás
    const btnDesc = document.createElement('button')
    btnDesc.innerHTML = "Leírás"
    btnDesc.addEventListener('click', desc)
    divSettings.appendChild(btnDesc);

    main.appendChild(divSettings)
}

function desc() {
    // startScreen törlése, majd újrameghívása
    main.innerHTML = ""
    const divDesc = document.createElement('div')
    divDesc.innerHTML = `<h1>A játék leírása</h1>
    <p>A <b>katakomba</b> szobáit egy 7x7-es négyzetrács cellái jelképezik. Minden szobában adott, hogy hány falán van ajtó. Ha két szomszédos szoba érintkező falán egy-egy ajtó van, akkor át lehet menni egyik szobából a másikba. A négyzetrács páros sorait és oszlopait el lehet tolni, a többi szoba végig rögzített a játék során. Az eltolásokkal az ajtókon keresztül utak nyílnak a szobák között, így lehet eljutni a kincsekhez. Mindegyik kérő arra törekszik, hogy a katakomba szobáinak ötletes eltolásával eljusson a kincsekhez. Aki elsőként találja meg mindahányat és kiindulópontjára sikeresen visszaérkezik az a nyertes.</p>`
    main.appendChild(divDesc)

    // btnBack
    const btnBack = document.createElement('button')
    btnBack.innerHTML = "Vissza"
    btnBack.addEventListener('click', startScreen)
    main.appendChild(btnBack);
}

class Room {
    constructor (row, col, type, rot) {
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

        this.rot = `rotate(${rot * 90}deg)`
    }

    setGold(playerId) {
        this.gold = playerId;
    }

    setRoom(row, col, rot) {
        this.row = row
        this.col = col
        this.rot = rot
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
    main.innerHTML = ""

    const game = document.createElement('div')
    game.id = 'game'

    const board = document.createElement('div')
    board.id = 'board'

    for (let i = 0; i < 7; i++) {
        const row = document.createElement('div')
        row.classList.add('row')
        for (let j = 0; j < 7; j++) {
            const div = document.createElement('div')
            div.classList.add('room')
            row.appendChild(div)
        }
        board.appendChild(row)
    }
    game.appendChild(board)
    main.appendChild(game)

    // random szobák generálása
    randomRooms()

    // kártyák behelyettesítése
    showBoard()

    // amit beilleszthetsz - szeparált room
    const divSeparRoom = document.createElement('div')
    divSeparRoom.style.backgroundImage = `url(${arrRooms[arrRooms.length - 1].type.src})`
    divSeparRoom.classList.add('room')
    divSeparRoom.dataset.id = arrRooms.length - 1
    game.appendChild(divSeparRoom)

    // játékosok rögzítése
    for (let i = 0; i < player; i++) {
        const divPlayer = document.createElement('div')
        divPlayer.classList.add('player')
        divPlayer.style.backgroundColor = PLAYERS[i]
        board.querySelectorAll('.row')[arrRooms[i].row].querySelectorAll('.room')[arrRooms[i].col].appendChild(divPlayer)
    }

    // kincsek kiosztása
    let playerId = 0;
    let numberCardsPerPlayer = 0
    for (let i = 0; i < numberCards; i++) {
        let rndRoom = random(4, 49)
        while (arrRooms[rndRoom].gold != undefined) {
            rndRoom = random(4, 49)
        }
        arrRooms[rndRoom].gold = playerId

        if (numberCardsPerPlayer == numberCards / player) {
            playerId++
            numberCardsPerPlayer = 0
        }
    }

    // kincsek mutatása - teszt
    showGold(0)

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
    let i = 0;
    for (let e of arrRooms) {
        if (e.row != -1) {
            let room = main.querySelector('#game #board').querySelectorAll('.row')[e.row].querySelectorAll('.room')[e.col]
            if ((e.row % 2 == 1 && (e.col == 0 || e.col == 6)) || (e.col % 2 == 1 && (e.row == 0 || e.row == 6))) {
                room.classList.add('selectPush')
                room.addEventListener('click', (event) => {
                    pushRoom(e.row, e.col, e.row % 2 == 1 ? (e.col == 0 ? LEFT : RIGHT) : (e.row == 0 ? UP : DOWN))
                })
            } else {
                room.classList.remove('selectPush')
            }
            room.style.backgroundImage = `url(${e.type.src})`
            room.style.transform = e.rot
            room.dataset.id = i
            i++
        }
    }
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

function pushRoom(row, col, direction) {
    /*if (direction % 2 == 0) { // col fix
        const multiply = direction == 0 ? 1 : -1;
        //const row = main.querySelector('#game #board').querySelectorAll('.row')[row]
        for (let i = 0; i < 7; i++) {
            // (2,1), (2,2), (2,3)...
            const room = main.querySelector('#game #board').querySelectorAll('.row')[i].querySelectorAll('.room')[col]
            arrRooms[room.dataset.id].setRoom(row + multiply, col, arrRooms[room.dataset.id].rot)
        }
        const oldSeparate = getRoom(-1, -1)
        oldSeparate.setRoom(multiply == 1 ? 0 : 6, col, oldSeparate.rot)
        const newSeparate = getRoom(multiply == 1 ? 7 : -1, col)
        newSeparate.setRoom(-1, -1, newSeparate.rot)
    } else { // row fix
        const multiply = direction == 1 ? -1 : 1;
        const divRow = main.querySelector('#game #board').querySelectorAll('.row')[row]
        for (let i = 0; i < 7; i++) {
            const room = row.querySelectorAll('.room')[i]
            arrRooms[room.dataset.id].setRoom(row, col + multiply, arrRooms[room.dataset.id].rot)
        }
        // a kilökődött elem megkapása, és a régi beillesztése
        const oldSeparate = getRoom(-1, -1)
        oldSeparate.setRoom(row, multiply == 1 ? 6 : 0, oldSeparate.rot)
        const newSeparate = getRoom(row, multiply == 1 ? -1 : 7)
        newSeparate.setRoom(-1, -1, newSeparate.rot)
    }*/
    //console.log(row + " " + col + " " + direction);
    if (direction % 2 == 0) {
        //console.log(arrRooms);
        const multiply = direction == 0 ? 1 : -1
        for (let i = 0; i < 7; i++) {
            //const room = main.querySelector('#game #board')[i].querySelectorAll('.room')[col]
            //console.log(main.querySelector('#game #board').querySelectorAll('.row')[i].querySelectorAll('.room')[col])
            const room = main.querySelector('#game #board').querySelectorAll('.row')[i].querySelectorAll('.room')[col]
            console.log(arrRooms[room.dataset.id].row)
            //arrRooms[room.dataset.id].setRoom((row + 1), col, arrRooms[room.dataset.id].rot)
        }
        //const oldSeparate = getRoom(-1, -1)
        //oldSeparate.setRoom(multiply == 1 ? 0 : 6, col, oldSeparate.rot)
        const newSeparate = getRoom(multiply == 1 ? 7 : -1, col)
        //console.log(arrRooms);
        newSeparate.setRoom(-1, -1, newSeparate.rot)
    } else {

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