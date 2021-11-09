/*let startScreen = document.querySelector('#start')

let inputPlayers = document.querySelector('#inputPlayers')
inputPlayers.addEventListener('change', (event) => {
    console.log(inputPlayers.value)
    let inputNumberCards = document.querySelector('#inputNumberCards')
    inputNumberCards.max = 24 / inputPlayers.value
    if (inputNumberCards.value > 24 / inputPlayers.value)
        inputNumberCards.value = inputNumberCards.max
})*/

/*let btnDesc = document.querySelector('#btnDesc')
btnDesc.addEventListener('click', (event) => {
    let divDesc = document.querySelector('#divDesc')
    divDesc.style.display === "none" ? divDesc.style.display = "block" : divDesc.style.display = "none";
})*/

// game
//const canvas = document.querySelector('#game')
//const ctx = canvas.getContext('2d')

let arr = []
/*for (let i = 0; i < 10; i++) {
    let rnd = random(1, 10)
    do {
        rnd = random(1, 10)
        if (!arr.includes(rnd))
            arr.push(rnd)
    } while (!arr.includes(rnd))
}*/

//console.log(arr);

/*function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

i = 0;
do {
    var row = randomEven(1,7)
    var col = random(0,7)
    var inc = includesRoom(arr, row, col)
    console.log(inc);
    if (!inc) {
        arr.push({x: row, y: col})
        i++
    }
} while (i < 32)

console.log(arr);

//arr.push({x: 5, y: 7})
//console.log(includesRoom(arr, 5, 7))

function includesRoom(arr, x, y) {
    let includes = false
    for (let e of arr) {
        if (e.x == x && e.y == y)
            includes = true
    }
    return includes
}

function randomEven(min, max) {
    const rnd = Math.floor(Math.random() * (max - min + 1) + min)
    return rnd % 2 == 1 ? rnd : randomEven(min, max)
}*/

/*let x = 1;
if (--x != 0) {
    console.log("valami");
}*/

var id = 0;
id++
console.log(id);