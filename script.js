let game = document.querySelector('#game')
// rotations
const UP = 0
const RIGHT = 1
const DOWN = 2
const LEFT = 3
// szobák
const LINE = 0
const CORNER = 1
const T = 2

// kezdőképernyő - új játék, leírás
function startScreen() {
    game.innerHTML = ""
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
    btnStartGame.addEventListener('click', startGame)
    divSettings.appendChild(btnStartGame);

    // leírás
    const btnDesc = document.createElement('button')
    btnDesc.innerHTML = "Leírás"
    btnDesc.addEventListener('click', desc)
    divSettings.appendChild(btnDesc);

    game.appendChild(divSettings)
}

function desc() {
    // startScreen törlése, majd újrameghívása
    game.innerHTML = ""
    const divDesc = document.createElement('div')
    divDesc.innerHTML = `<h1>A játék leírása</h1>
    <p>A <b>katakomba</b> szobáit egy 7x7-es négyzetrács cellái jelképezik. Minden szobában adott, hogy hány falán van ajtó. Ha két szomszédos szoba érintkező falán egy-egy ajtó van, akkor át lehet menni egyik szobából a másikba. A négyzetrács páros sorait és oszlopait el lehet tolni, a többi szoba végig rögzített a játék során. Az eltolásokkal az ajtókon keresztül utak nyílnak a szobák között, így lehet eljutni a kincsekhez. Mindegyik kérő arra törekszik, hogy a katakomba szobáinak ötletes eltolásával eljusson a kincsekhez. Aki elsőként találja meg mindahányat és kiindulópontjára sikeresen visszaérkezik az a nyertes.</p>`
    game.appendChild(divDesc)

    // btnBack
    const btnBack = document.createElement('button')
    btnBack.innerHTML = "Vissza"
    btnBack.addEventListener('click', startScreen)
    game.appendChild(btnBack);
}

class Room {
    constructor (x, y, type, rot) {
        this.x = x
        this.y = y
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
    }
}

const basedRooms = [
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
    game.innerHTML = ""
    const board = document.createElement('div')
    board.id = 'board'
    // ide jönnek majd a panelek

    for (let i = 0; i < 7; i++) {
        const row = document.createElement('div')
        row.classList.add('row')
        for (let j = 0; j < 7; j++) {
            const div = document.createElement('div')
            //div.style.backgroundColor = 'red'
            row.appendChild(div)
        }
        board.appendChild(row)
    }
    game.appendChild(board)

    //board = new Room(0, 0, CORNER, rotation)
    // kártyák behelyettesítése
    for (let e of basedRooms) {
        room = document.querySelectorAll('.row')[e.x].querySelectorAll('div')[e.y]
        room.style.backgroundImage = `url(${e.type.src})`
    }
}



startScreen()