// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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


// Get the form elements
const signUpForm = document.querySelector('form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const signUpButton = document.getElementById('signup-btn');

// Add an event listener to the sign up button
signUpButton.addEventListener('click', (e) => {
  e.preventDefault();
  // alert('hi')

  // Get the user input values
  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Validate the user input
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  console.log(password)

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // Initialize user data in the database
    const userRef = ref(db, 'users/' + user.uid);
    set(userRef, {
      email: email,
      username: username,
      gamingData: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        moneyEarned: 0,
        totalBet: 0,
        currentMoney: 5000,
        hits: 0,
        stands: 0,
        doubleDowns: 0,
        brokeMoments: 0
      }  
    }).then(() => {
      console.log('User data initialized!');
      alert("Successfully Signed Up! Redirecting to login...");
      window.location.href = "login.html";
    }).catch((error) => {
      console.error('Error initializing user data:', error);
    });
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
  });
});

  // Send a POST request to the /signup route
  fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message) {
        alert(data.message);
      } else {
        // Redirect to the login page
        window.location.href = 'login.html';
      }
    })
    .catch((err) => console.error(err));



// Delete below line
function updateUsernameDisplay() {
  const usernameDisplay = document.getElementById('username-display');
  
  // Check authentication state
  onAuthStateChanged(auth, (user) => {
      if (user) {
          // User is signed in
          usernameDisplay.textContent = user.email;
      }
  });
}

// Call the function to update username display
updateUsernameDisplay();