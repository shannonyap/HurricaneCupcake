var analyzer;
var canvas;
var ctx;

var musicPlaylist = ["Perfume!.mp3", "DayByDay.mp3", "SummerTimeMemory.mp3", "DragonfruitSalad.mp3", "MilleFeuille.mp3", "PandaWonder.mp3"];
var musicCounter = 0;
var repeatTrackMode = 0;

window.onload = function() {
  initFirebase();
  displayWelcomeMessage();
  canvas = document.createElement("canvas");
  canvas.id = "audioVisualizerCanvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.3;
  $('#musicVisualizerDiv').append(canvas);
  ctx = canvas.getContext('2d');
  setupAudioScrubber();
  setupAudioControls();
  setupWebAudio();
  draw();
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

function displayWelcomeMessage() {
  var smallModal = $('<div>', {class: 'ui modal'});
  var header = $('<div>', {class: 'header'});
  $(header).css({"text-align": "center"});
  var actions = $('<div>', {class: 'actions'});
  var startListeningButton = $('<div>', {class: 'ui green button', onclick: 'dismissModal(this)'}).html("Start Listening!");

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var currentUserUid = firebase.auth().currentUser.uid;
      return firebase.database().ref('/users/' + currentUserUid).once('value').then(function(snapshot) {
        var firstName = snapshot.val().firstName;
        var lastName = snapshot.val().lastName;
        $(header).html("Welcome " + firstName + " " + lastName + "!");
      });
    }
  });

  actions.append(startListeningButton);
  smallModal.append(header);
  smallModal.append(actions);

  $('body').append(smallModal);

  $(smallModal).modal('show');
}

function dismissModal(button) {
  var smallModal = $(button).parent().parent();
  $(smallModal).modal('hide');
  toggleAudio();
}

function setupWebAudio() {
  var audio = document.createElement('audio');
  audio.addEventListener("ended", function(){
    if (repeatTrackMode) {
      audio.currentTime = 0;
      audio.play();
    } else {
      nextTrackInPlaylist();
      audio.src = musicPlaylist[musicCounter];
      audio.play();
    }
  });

  audio.ontimeupdate = function() {
    updateProgressBar(audio);
    setupAudioTimingControls(audio);
  };

  audio.id = 'audioPlayer'
  audio.src = musicPlaylist[musicCounter];

  getTrackMetadata();

  $('#musicVisualizerDiv').append(audio);
  audio.style.width = window.innerWidth * 0.4 + 'px';

  var audioContext = new AudioContext();
  analyzer = audioContext.createAnalyser();
  var source = audioContext.createMediaElementSource(audio);
  source.connect(analyzer);
  analyzer.connect(audioContext.destination);
}

function updateProgressBar(audio) {
    var progressPercentage = audio.currentTime / audio.duration * 100;
    var audioHandler = $('#audioSlider').children()[1];
    var audioProgress = $('#audioSlider').children()[2];

    $(audioHandler).css({left: progressPercentage + "%"});
    $(audioProgress).css({width: progressPercentage + "%"});
}

function draw() {
  requestAnimationFrame(draw);
  var freqByteData = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteFrequencyData(freqByteData);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < freqByteData.length; i += 10) {
    ctx.fillStyle = '#D62828';
    ctx.fillRect(i, canvas.height - freqByteData[i], 10, canvas.height);
    ctx.strokeRect(i, canvas.height - freqByteData[i], 10, canvas.height);
  }
}

function setupAudioTimingControls(audio) {
  $('#totalTimeHeader').html("0:00");
  var elapsedSeconds = Math.floor(audio.currentTime) % 60;
  var elapsedMinutes = Math.floor(audio.currentTime/ 60);
  var totalSeconds = Math.floor(audio.duration) % 60;
  var totalMinutes = Math.floor(audio.duration / 60);
  if (!isNaN(elapsedMinutes) && !isNaN(elapsedSeconds)) {
    if (elapsedSeconds < 10) {
      elapsedSeconds = "0" + elapsedSeconds;
    }
    $('#timeElapsedHeader').html(elapsedMinutes + ":" + elapsedSeconds);
  }
  if (!isNaN(totalMinutes) && !isNaN(totalSeconds)) {
    if (totalSeconds < 10) {
      totalSeconds = "0" + totalSeconds;
    }
    $('#totalTimeHeader').html(totalMinutes + ":" + totalSeconds);
  }
}

function setupAudioScrubber() {
  var audioBar = $("<div>", {id: "audioBar"});
  var audioSlider = $("<div>", {id: "audioSlider", class: "ui-slider ui-corner-all ui-slider-horizontal ui-widget ui-widget-content"});
  var slider = $("<div>", {class: "ui-slider-range ui-corner-all ui-widget-header ui-slider-range-min"});
  slider.css({width: "0%"});
  var sliderHandle = $("<span>", {tabindex: "0", class: "ui-slider-handle ui-corner-all ui-state-default"});
  sliderHandle.css({left: "0%"});

  audioSlider.append(slider);
  audioSlider.append(sliderHandle);
  audioBar.append(audioSlider);

  $('#musicVisualizerDiv').append(audioBar);

  $("#audioSlider").slider({
    	min: 0,
    	max: 100,
    	value: 0,
  		range: "min",
    	slide: function(event, ui) {
        var audio = document.getElementById('audioPlayer');
        audio.currentTime = ui.value * audio.duration / 100;
    	}
  });
}

function setupAudioControls() {
  var audioControls = $("<div>", {class: "audioControls"});
  $('#musicVisualizerDiv').append(audioControls);

  var muteTrackButton = createAudioButton('muteTrackButton', 'mute', 'muteTrackInPlaylist()');
  audioControls.append(muteTrackButton);

  var previousTrackButton = createAudioButton('previousTrackButton', 'backward', 'previousTrackInPlaylist()');
  audioControls.append(previousTrackButton);

  var playTrackButton = createAudioButton('playTrackButton', 'play', 'toggleAudio()');
  audioControls.append(playTrackButton);

  var nextTrackButton = createAudioButton('nextTrackButton', 'forward', 'nextTrackInPlaylist()');
  audioControls.append(nextTrackButton);

  var repeatTrackButton = createAudioButton('repeatTrackButton', 'repeat', 'repeatTrackInPlaylist()');
  audioControls.append(repeatTrackButton);
}

function createAudioButton(id, icon, onclick) {
  var audioButton = $("<button>", {class: 'ui massive icon button', id: id, onclick: onclick});
  var audioIcon = $("<i>", {class: icon + ' icon'});
  audioButton.css({'background-color': 'rgba(0,0,0,0)'});
  audioButton.append(audioIcon);

  return audioButton;
}

function nextTrackInPlaylist() {
  musicCounter++;
  if (musicCounter > musicPlaylist.length - 1) {
    musicCounter = 0;
  }
  getTrackMetadata();
  playAudio();
}

function previousTrackInPlaylist() {
  musicCounter--;
  if (musicCounter < 0) {
    musicCounter = musicPlaylist.length - 1;
  }
  getTrackMetadata();
  playAudio();
}

function playAudio() {
  var audio = document.getElementById('audioPlayer');
  audio.src = musicPlaylist[musicCounter];
  audio.play();
}

function toggleAudio() {
  var audio = document.getElementById('audioPlayer');
  var icon = $('#playTrackButton').children()[0];
  if (!audio.paused) {
    // if audio is playing, then pause it
    $(icon).removeClass('pause');
    $(icon).addClass('play');
    audio.pause();
  } else {
    $(icon).removeClass('play');
    $(icon).addClass('pause');
    audio.play();
  }
}

function repeatTrackInPlaylist() {
  var repeatTrackButton = document.getElementById('repeatTrackButton');
  var repeatIcon = $(repeatTrackButton).children()[0];

  if (repeatTrackMode == 0) {
    repeatTrackMode = 1;
    $(repeatIcon).css({'color': '#5B85AA'});
  } else {
    repeatTrackMode = 0;
    $(repeatIcon).css({'color': '#696562'});
  }
}

function muteTrackInPlaylist() {
  var audio = document.getElementById('audioPlayer');
  var icon = $('#muteTrackButton').children()[0];
  if ($(icon).hasClass('mute')) {
    $(icon).removeClass('mute');
    $(icon).addClass('unmute');
    audio.volume = 0;
  } else {
    $(icon).removeClass('unmute');
    $(icon).addClass('mute');
    audio.volume = 1;
  }
}

function showMetaData(data) {
  musicmetadata(data, function (err, result) {
    if (err) {
      throw err;
    }
    console.log(result);
    $('#currentTrackName').html(result.title);
    if (result.album != "") {
      console.log("FFFF");
      $('#currentTrackAlbum').html(result.album);
    } else {
      $('#currentTrackAlbum').html("Unknown Album");
    }
    if (result.picture.length > 0) {
      var picture = result.picture[0];
      var url = URL.createObjectURL(new Blob([picture.data], {'type': 'image/' + picture.format}));
      var image = document.getElementById('albumImage').children[0];
      image.src = url;
    }

    /*
    if (result.picture.length > 0) {
      var picture = result.picture[0];
      var url = URL.createObjectURL(new Blob([picture.data], {'type': 'image/' + picture.format}));
      var image = document.getElementById('myimg');
      image.src = url;
    }
    var div = document.getElementById('info');
    div.innerText = JSON.stringify(result, undefined, 2);*/
  });
}

function getTrackMetadata() {
    var xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.open("get", musicPlaylist[musicCounter], true);
    xhr.onload = function(e) {
      showMetaData(e.target.response);
    }
    xhr.send();
}
