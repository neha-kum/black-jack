// Firebase Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, get, ref } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

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

function readUserData(userID) {
    const userRef = ref(db, 'users/' + userID + '/gamingData');
    get(userRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log(data);
                updateUI(data); // Update the UI with the fetched data
            } else {
                console.log("No data available");
            }
        })
        .catch((error) => {
            console.error("Error reading data:", error);
        });
}

function updateUI(data) {
    document.getElementById('gamesPlayedValue').textContent = data.gamesPlayed;
    document.getElementById('gamesWonValue').textContent = data.gamesWon;
    document.getElementById('gamesLostValue').textContent = data.gamesLost;
    document.getElementById('moneyEarnedValue').textContent = `$${data.moneyEarned}`;
    document.getElementById('totalBetValue').textContent = `$${data.totalBet}`;
    document.getElementById('currentMoneyValue').textContent = `$${data.currentMoney}`;
    document.getElementById('hitsValue').textContent = data.hits;
    document.getElementById('standsValue').textContent = data.stands;
    document.getElementById('doubleDownsValue').textContent = data.doubleDowns;
    document.getElementById('brokeMomentsValue').textContent = data.brokeMoments > 0 ? `Yes (${data.brokeMoments} times)` : 'None';
}

function init() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            readUserData(user.uid);
    }
});
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);