// Firebase Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, set, get, ref } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD54Jv72-E2T4Re5fE_c6ZcxMhz_tS_UIw",
    authDomain: "blackjack-a7929.firebaseapp.com",
    projectId: "blackjack-a7929",
    storageBucket: "blackjack-a7929.appspot.com",
    messagingSenderId: "599471850430",
    appId: "1:599471850430:web:70a93cbfef339fe1242fef"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


// DOM elements
const moneyTxt = document.getElementById("moneyTxt");
const betIn = document.getElementById("betIn");

const dealerScore = document.getElementById("dealerScore");
const playerScore = document.getElementById("playerScore");

const hitbtn = document.getElementById("hitbtn");
const standbtn = document.getElementById("standbtn");
const doublebtn = document.getElementById("doublebtn");

const gameResultTxt = document.getElementById("gameResTxt");
const carouselDealer = document.getElementById("dealerHand");
const carouselPlayer = document.getElementById("playerHand");

const clickSound = document.getElementById("clickSound");
const betSound = document.getElementById("betSound");
const winSound = document.getElementById("winSound");
const brokeSound = document.getElementById("brokeSound");
const bruhSound = document.getElementById("bruhSound");

// Constants and Variables
const SUITS = ["H", "D", "S", "C"];
const CARDS = ['K', 'Q', 'A', 'J', 2, 3, 4, 5, 6, 7, 8, 9, 10];
const POINTS = { 'K': 10, 'Q': 10, 'A': Math.random() < 0.5 ? 1 : 11, 'J': 10 };
const SuitToFolder = {
    "C": "Clubs",
    "D": "Diamond",
    "H": "Heart",
    "S": "Spade"
}

// Game state
const questionImage = "./Images/question.png";
let DECK = [];
let playerHand = [];
let dealerHand = [];
let money = 5000;
let dealer = 0;
let player = 0;
let betValue = 0;
let userBet = 0;

// Statistics object
const stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    moneyEarned: 0,
    totalBet: 0,
    currentMoney: money,
    hits: 0,
    stands: 0,
    doubleDowns: 0,
    brokeMoments: 0
};

function updateStatsInDatabase(updatedStats) {
    const userId = auth.currentUser.uid;
    const userRef = ref(db, `users/${userId}/gamingData`);
    
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const newStats = {
                gamesPlayed: (data.gamesPlayed || 0) + updatedStats.gamesPlayed,
                gamesWon: (data.gamesWon || 0) + updatedStats.gamesWon,
                gamesLost: (data.gamesLost || 0) + updatedStats.gamesLost,
                moneyEarned: (data.moneyEarned || 0) + updatedStats.moneyEarned,
                totalBet: (data.totalBet || 0) + updatedStats.totalBet,
                currentMoney: updatedStats.currentMoney, // This is the current money after the game
                hits: (data.hits || 0) + updatedStats.hits,
                stands: (data.stands || 0) + updatedStats.stands,
                doubleDowns: (data.doubleDowns || 0) + updatedStats.doubleDowns,
                brokeMoments: (data.brokeMoments || 0) + updatedStats.brokeMoments
            };

            // Update the database with the new values
            set(userRef, newStats).then(() => {
                console.log('Stats updated successfully!');
            }).catch((error) => {
                console.error('Error updating stats:', error);
            });
        } else {
            // If no previous data exists, set initial values
            set(userRef, updatedStats).then(() => {
                console.log('Initial stats saved to the database!');
            }).catch((error) => {
                console.error('Error saving initial stats:', error);
            });
        }
    }).catch((error) => {
        console.error('Error reading data:', error);
    });
}

function saveStatsToDatabase() {
    updateStatsInDatabase(stats);
}

// Functions
// function saveStatsToDatabase(stats) {
//     const userId = auth.currentUser.uid;
//     const userRef = ref(db, `users/${userId}/gamingData`);
//     set(userRef, stats).then(() => {
//         console.log('Stats saved to the database!');
//     }).catch((error) => {
//         console.error('Error saving stats to the database:', error);
//     });
// }

function createDeck() {
    DECK = [];
    for (let suit of SUITS) {
        for (let card of CARDS) {
            DECK.push([suit, card]);
        }
    }
}

function getCard() {
    const index = Math.floor(Math.random() * DECK.length);
    return DECK.splice(index, 1)[0];
}

function drawCard(deck, n = 1) {
    for (let i = 0; i < n; i++) {
        const card = getCard();
        if (deck === 'p') {
            playerHand.push(card);
            updatePoints(card[1], 'p');
        } else {
            dealerHand.push(card);
            updatePoints(card[1], 'd');
        }
    }
}

function updatePoints(value, user) {
    value = typeof value === 'string' ? POINTS[value] : value;
    user === 'p' ? (player += value) : (dealer += value);
}

function displayHands(hideDealerHand) {
    dealerScore.innerHTML = dealer;
    playerScore.innerHTML = player;

    carouselDealer.innerHTML = '';
    for (let i = 0; i < dealerHand.length; i++) {
        const cardImage = (hideDealerHand && i === 0) ? 'question.png' : SuitToFolder[dealerHand[i][0]] + "/" + dealerHand[i][1] + '.png';

        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (i === 0) {
            carouselItem.classList.add('active');
        }

        const img = document.createElement('img');
        img.classList.add('d-block', 'w-100');
        img.src = 'Deck/' + cardImage;
        img.alt = 'card image';
        carouselItem.appendChild(img);
        carouselDealer.appendChild(carouselItem);
    }

    carouselPlayer.innerHTML = '';
    for (let i = 0; i < playerHand.length; i++) {
        const cardImage = SuitToFolder[playerHand[i][0]] + "/" + playerHand[i][1] + '.png';

        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (i === 0) {
            carouselItem.classList.add('active');
        }

        const img = document.createElement('img');
        img.classList.add('d-block', 'w-100');
        img.src = 'Deck/' + cardImage;
        img.alt = 'card image';
        carouselItem.appendChild(img);
        carouselPlayer.appendChild(carouselItem);
    }
}

function assignBet(betAmount) {
    betValue += betAmount;
    stats.totalBet += betAmount;
}

function initialState() {
    player = 0;
    dealer = 0;
    playerHand = [];
    dealerHand = [];

    createDeck();
    drawCard('p', 2);
    drawCard('d', 2);
    displayHands(true);

    displayHands(true);
    gameResultTxt.innerHTML = '';
    moneyTxt.innerHTML = money;
}

// Function to manage dealer's actions
function dealerPlay() {
    if (player <= 21) {
        while (dealer < 17) {
            drawCard("d");
        }
    }
}

// Function for the 'hit' action
function hit() {
    userBet = parseInt(betIn.value);
    if (userBet > 0) {
        drawCard('p');
        displayHands(true);
        stats.hits++;

        if (player > 21) {
            checkResult();
        }
    } else {
        alert("Choose your bet!");
    }
    clickSound.play();
}

// Function for the 'stand' action
function stand() {
    userBet = parseInt(betIn.value);
    if (userBet > 0) {
        stats.stands++;
        checkResult();
    } else {
        alert("Choose your bet!");
    }
    clickSound.play();
}

// Function for 'double down' action
function doubleDown() {
    userBet = parseInt(betIn.value);
    if (userBet > 0) {
        assignBet(betValue);
        drawCard("p");
        stats.doubleDowns++;
        checkResult();
    } else {
        alert("Choose your bet!");
    }
    clickSound.play();
}

// Function to check the result of the game
function checkResult() {
    dealerPlay();
    displayHands();

    stats.gamesPlayed++;

    let resultText;
    if (dealer > 21) {
        resultText = `Dealer busts! You win ${userBet}!`;
        gameResultTxt.innerHTML = resultText;
        gameResultTxt.style.color = "lightgreen";
        winSound.play();

        money += betValue;
        stats.moneyEarned += betValue;
        stats.gamesWon++;
    } else if (player > 21 || player < dealer) {
        resultText = `You lost!`;
        gameResultTxt.innerHTML = resultText;
        gameResultTxt.style.color = "red";
        bruhSound.play();

        money -= betValue;
        stats.gamesLost++;
    } else if (player > dealer) {
        resultText = `You won ${userBet}!`;
        gameResultTxt.innerHTML = resultText;
        gameResultTxt.style.color = "lightgreen";
        winSound.play();

        money += betValue;
        stats.moneyEarned += betValue;
        stats.gamesWon++;
    } else if (player === dealer) {
        resultText = `It is a tie, the bet is returned to you.`;
        gameResultTxt.innerHTML = resultText;
        gameResultTxt.style.color = "yellow";
        bruhSound.play();
    }

    // Check if the player has gone broke
    if (money <= 0) {
        money = 0;
        gameResultTxt.innerHTML = 'You Went Broke!!';
        moneyTxt.style.color = "red";
        brokeSound.play();
        stats.brokeMoments++;
    }

    moneyTxt.innerHTML = money;
    betIn.value = '';
    betValue = 0;

    // Update current money in stats
    stats.currentMoney = money;

    // Display updated statistics
    console.log(`Games Played: ${stats.gamesPlayed}`);
    console.log(`Games Won: ${stats.gamesWon}`);
    console.log(`Games Lost: ${stats.gamesLost}`);
    console.log(`Money Earned: ${stats.moneyEarned}`);
    console.log(`Total Bet Placed: ${stats.totalBet}`);
    console.log(`Current Money: ${stats.currentMoney}`);
    console.log(`Hits: ${stats.hits}`);
    console.log(`Stands: ${stats.stands}`);
    console.log(`Double Downs: ${stats.doubleDowns}`);
    console.log(`Broke Moments: ${stats.brokeMoments}`);

    // Update data on database
    saveStatsToDatabase(stats);
}

// Event listener for bet input
betIn.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        const userBet = parseInt(betIn.value);
        if (userBet > 0 && userBet <= money) {
            assignBet(userBet);
            initialState();
            betSound.play();
        } else {
            alert("Invalid bet value. Bet must be greater than 0 and less than or equal to total money.");
        }
    }
});

// Event listeners for game actions
hitbtn.addEventListener("click", hit);
standbtn.addEventListener("click", stand);
doublebtn.addEventListener("click", doubleDown);

// Add onAuthStateChanged callback
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userID = user.uid;
        // Load data
    } else {
        console.log('User is signed out');
    }
});

// Export stats object
export { stats };
