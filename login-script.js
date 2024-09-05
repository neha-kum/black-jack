import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const showPasswordCheckbox = document.getElementById('show-password');
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
}

const showPasswordCheckbox = document.getElementById('show-password');
if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener('change', togglePasswordVisibility);
}

function updateUsernameDisplay() {
    const usernameDisplay = document.getElementById('username-display');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    usernameDisplay.textContent = userData.username;
                } else {
                    console.log('No data available');
                }
            }).catch((error) => {
                console.error('Error fetching data:', error);
            });
        }
    });
}

updateUsernameDisplay();

const login = document.getElementById('login-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

login.addEventListener('click', (e) => {
    e.preventDefault();
  
    const email = emailInput.value;
    const password = passwordInput.value;
  
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Successfully Logged In...");
            console.log(user.email, user.uid);
            window.location.href = "index.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

// Optional Data Initialization
console.log("Data initialization complete");
