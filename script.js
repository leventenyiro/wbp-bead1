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
        this.type = type
        switch (type) {
            case 0:
                this.img = new Image()
                this.img.src = 'img/line.png'
                break;
            case 1:
                this.img = new Image()
                this.img.src = 'img/corner.png'
                break;
            case 2:
                this.img = new Image()
                this.img.src = 'img/t.png'
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
        // merre lehet menni? - a másik oldal is ugyanolyan?
        // UP RIGHT DOWN LEFT
        // egy listát ad vissza
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

function getGold(row, col) { // ez lehetne egyesíteni a másik keresőssel
    for (let e of arrGolds) {
        if (e.row == row && e.col == col) {
            return e
        }
    }
    return null
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

    // kincsek kiosztása
    randomGolds()

    // kártyák behelyettesítése
    showBoard()

    // kincsek mutatása - teszt
    //showGold(0)

    // játékosinfók - game gyereke lesz
    showInfo()
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
                    div.dataset.row = i -1
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

function randomGolds() {
    for (let i = 0; i < player; i++) {
        for (let j = 0; j < numberCards; j++) {
            let rndRoom = random(4, 48)
            while (getGold(arrRooms[rndRoom].row, arrRooms[rndRoom].col) != null) {
                rndRoom = random(4, 48)
            }
            arrGolds.push(new Gold(i, arrRooms[rndRoom].row, arrRooms[rndRoom].col))
        }
    }
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
    initRooms()
    showGold(turn)
    const board = main.querySelector('#game #board')
    for (let e of arrRooms) {
        if (e.row != -1) {
            var room = board.querySelectorAll('.row')[e.row + 1].querySelectorAll('.room')[e.col]
        } else
            var room = document.querySelector('#separRoom')

        room.style.backgroundImage = `url(${e.img.src})`
        room.style.transform = `rotate(${e.rot * 90}deg)`
        room.dataset.id = e.id
    }

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
        room.innerHTML = ''
        room.appendChild(divPlayer)
    }

    // lépés
    let player = arrPlayers[0]

    /*path = showAvailableNeighbours(player.row, player.col)
    for (let e of path) {
        const room = board.querySelectorAll('.row')[e.row + 1].querySelectorAll('.room')[e.col]
        room.classList.add('availablePath')
        room.addEventListener('click', () => {
            player.setPosition(e.row, e.col)
            showBoard() // inkább changePos
        })
    }*/

    // utak mutatása - később, ha turnPart == 1
    //let ways = showAvailableRooms(0, 5)
    //console.log(ways)

    /*document.addEventListener('keydown', (e) => {
        console.log(e.key);
        if (e.key == 'f') {
            player.setPosition(2,0)
            showBoard()
        }
    })*/
    showAvailableRooms(player.row, player.col, -1, player)
}

function showAvailableNeighbours(row, col) {
    let path = []
    for (let e of getRoom(row, col).getWays()) {
        if (e == 0 && row - 1 >= 0 && getRoom(row - 1, col).getWays().includes(2))
            path.push(getRoom(row - 1, col))
        if (e == 1 && col + 1 <= 6 && getRoom(row, col + 1).getWays().includes(3))
            path.push(getRoom(row, col + 1))
        if (e == 2 && row + 1 <= 6 && getRoom(row + 1, col).getWays().includes(0))
            path.push(getRoom(row + 1, col))
        if (e == 3 && col - 1 >= 0 && getRoom(row, col - 1).getWays().includes(1))
            path.push(getRoom(row, col - 1))
    }
    return path
}

function getAvailableRooms(row, col, from) {
    //if (from == null)
    //    from = 0
    // rekurzív hívás
    // 4 irány
    //console.log(getRoom(row, col).id)
    const ways = getRoom(row, col).getWays()
    //console.log(ways);
    const actual = getRoom(row, col).id
    console.log(actual);
    let arr = []
        if (from != 0 && ways.includes(0) && row - 1 >= 0 && getRoom(row - 1, col).getWays().includes(2))
            arr.push(showAvailableRooms(row - 1, col, 2))
        if (from != 1 && ways.includes(1) && col + 1 <= 6 && getRoom(row, col + 1).getWays().includes(3))
            arr.push(showAvailableRooms(row, col + 1, 3))
        if (from != 2 && ways.includes(2) && row + 1 <= 6 && getRoom(row + 1, col).getWays().includes(0))
            arr.push(showAvailableRooms(row + 1, col, 0))
        if (from != 3 && ways.includes(3) && col - 1 >= 0 && getRoom(row, col - 1).getWays().includes(1))
            arr.push(showAvailableRooms(row, col - 1, 1))

        //arr = [arr, getRoom(row, col).id]
        let newArr = []
        for (let e of arr) {
            newArr.push(e)
        }
        newArr.push(actual)
        return newArr
}

function showAvailableRooms(row, col, from, player) {
    const ways = getRoom(row, col).getWays()
    const actual = getRoom(row, col)
    if (from != 0 && ways.includes(0) && row - 1 >= 0 && getRoom(row - 1, col).getWays().includes(2))
        showAvailableRooms(row - 1, col, 2, player)
    if (from != 1 && ways.includes(1) && col + 1 <= 6 && getRoom(row, col + 1).getWays().includes(3))
        showAvailableRooms(row, col + 1, 3, player)
    if (from != 2 && ways.includes(2) && row + 1 <= 6 && getRoom(row + 1, col).getWays().includes(0))
        showAvailableRooms(row + 1, col, 0, player)
    if (from != 3 && ways.includes(3) && col - 1 >= 0 && getRoom(row, col - 1).getWays().includes(1))
        showAvailableRooms(row, col - 1, 1, player)
    
    // műveletek
    const room = document.querySelector('#game #board').querySelectorAll('.row')[actual.row + 1].querySelectorAll('.room')[actual.col]
    room.classList.add('availablePath')
    room.addEventListener('click', () => {
        player.setPosition(row, col)
        showBoard() // inkább changePos
    })
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
    separ.setRotate(separ.rot == 0 ? 3 : separ.rot - 1)
    showBoard()
}

function rotateRight() {
    const separ = getRoom(-1, -1)
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
            //room.style.transition = '2s'
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
        
        getRoom(-1, -1).setPosition(multiply == 1 ? 0 : 6, parseInt(e.col))
        const newSeparate = getRoom(multiply == 1 ? 7 : -1, parseInt(e.col))
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
            //room.style.transition = '2s'
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
        
        getRoom(-1, -1).setPosition(parseInt(e.row), multiply == 1 ? 0 : 6)
        const newSeparate = getRoom(parseInt(e.row), multiply == 1 ? 7 : -1)
        // játékos letolása
        for (let p of arrPlayers) {
            if (p.row == newSeparate.row && p.col == newSeparate.col) {
                p.setPosition(p.row, multiply == 1 ? 0 : 6)
            }
        }
        // kincs letolása
        for (let g of arrPlayers) {
            if (g.row == newSeparate.row && g.col == newSeparate.col) {
                g.setPosition(g.row, multiply == 1 ? 0 : 6)
            }
        }
        newSeparate.setPosition(-1, -1)
    }
    showBoard()
}

function showGold(playerId) {
    /*for (let e of arrRooms) {
        if (e.gold == playerId) {
            const divGold = document.createElement('div')
            divGold.classList.add('gold')
            main.querySelector('#game #board').querySelectorAll('.row')[e.row].querySelectorAll('.room')[e.col].appendChild(divGold)
        }
    }*/
    for (let e of arrGolds) {
        if (e.playerId == playerId) {
            const divGold = document.createElement('div')
            divGold.classList.add('gold')
            main.querySelector('#game #board').querySelectorAll('.row')[e.row + 1].querySelectorAll('.room')[e.col].appendChild(divGold)
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