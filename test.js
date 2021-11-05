let startScreen = document.querySelector('#start')

let inputPlayers = document.querySelector('#inputPlayers')
inputPlayers.addEventListener('change', (event) => {
    console.log(inputPlayers.value)
    let inputNumberCards = document.querySelector('#inputNumberCards')
    inputNumberCards.max = 24 / inputPlayers.value
    if (inputNumberCards.value > 24 / inputPlayers.value)
        inputNumberCards.value = inputNumberCards.max
})

/*let btnDesc = document.querySelector('#btnDesc')
btnDesc.addEventListener('click', (event) => {
    let divDesc = document.querySelector('#divDesc')
    divDesc.style.display === "none" ? divDesc.style.display = "block" : divDesc.style.display = "none";
})*/

// game
//const canvas = document.querySelector('#game')
//const ctx = canvas.getContext('2d')