window.onload = function() {
  initFirebase();
  animateForm();
  checkCurrentUser();
}

function initFirebase() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBNHn_lpM2uCnAUIBFqts5opqa_AmQsAUQ",
    authDomain: "hurricanecupcake.firebaseapp.com",
    databaseURL: "https://hurricanecupcake.firebaseio.com",
    projectId: "hurricanecupcake",
    storageBucket: "hurricanecupcake.appspot.com",
    messagingSenderId: "325561906534"
  };
  firebase.initializeApp(config);
}

function animateForm() {
  $('.outer').transition('fade up');
}

function checkCurrentUser() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
    //  window.location.href = "player.html";
    }
  });
}
function login() {
  var responses = $("form#fieldForm input");
  var email = responses[0].value;
  var password = responses[1].value;
  firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
    window.location.href = "player.html";
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    if (errorCode || errorMessage) {
      console.log(errorCode);
      console.log(errorMessage);
    }
  });
}

function moveToSignUpPage() {
  window.location.href = "signUp.html";
}
