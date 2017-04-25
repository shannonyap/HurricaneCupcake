window.onload = function() {
  initFirebase();
  animateForm();
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

function signUp() {
  var responses = $("form#fieldForm input");
  var firstName = responses[0].value;
  var lastName = responses[1].value;
  var email = responses[2].value;
  var password = responses[3].value;
  if (firstName.length != 0 && lastName.length != 0) {
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
      showAccountCreatedPopUp();
      createUserMetaData(firstName, lastName, email);
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      if (errorCode || errorMessage) {
        console.log(errorCode);
        console.log(errorMessage);
      }
    });
  } else { console.log("no first or last name"); }
}

function back() {
  window.location.href = "home.html";
}

function createUserMetaData(firstName, lastName, email) {
  var userId = firebase.auth().currentUser.uid;
  firebase.database().ref('users/' + userId).set({
    firstName: firstName,
    lastName: lastName,
    email: email
  });
}

function showAccountCreatedPopUp() {
  var smallModal = $('<div>', {class: 'ui modal'});
  var header = $('<div>', {class: 'header'}).html("Account Successfully Created!");
  var actions = $('<div>', {class: 'actions'});
  var okayButton = $('<div>', {class: 'ui green button', onclick: 'dismissModal(this)'}).html("Okay");

  actions.append(okayButton);
  smallModal.append(header);
  smallModal.append(actions);

  $('body').append(smallModal);

  $(smallModal).modal('show');
}

function dismissModal(button) {
  var smallModal = $(button).parent().parent();
  $(smallModal).modal('hide');
  back();
}
