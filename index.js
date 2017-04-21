var analyzer;
var canvas;
var ctx;

var musicPlaylist = ["DayByDay.mp3", "SummerTimeMemory.mp3", "DragonfruitSalad.mp3", "MilleFeuille.mp3", "PandaWonder.mp3"];
var musicCounter = 0;
var repeatTrackMode = 0;

window.onload = function() {
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
  setInterval(function(){
    var progressPercentage = audio.currentTime / audio.duration * 100;
    var audioHandler = $('#audioSlider').children()[1];
    var audioProgress = $('#audioSlider').children()[2];

    $(audioHandler).css({left: progressPercentage + "%"});
    $(audioProgress).css({width: progressPercentage + "%"});
  }, 10);
  audio.id = 'audioPlayer'
  audio.src = musicPlaylist[musicCounter];
  $('#musicVisualizerDiv').append(audio);
  audio.style.width = window.innerWidth * 0.4 + 'px';

  var audioContext = new AudioContext();
  analyzer = audioContext.createAnalyser();
  var source = audioContext.createMediaElementSource(audio);
  source.connect(analyzer);
  analyzer.connect(audioContext.destination);
  audio.play()
}

function draw() {
  requestAnimationFrame(draw);
  var freqByteData = new Uint8Array(analyzer.frequencyBinCount);
  analyzer.getByteFrequencyData(freqByteData);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < freqByteData.length; i += 10) {
    ctx.fillStyle = '#F7567C';
    ctx.fillRect(i, canvas.height - freqByteData[i], 10, canvas.height);
    ctx.strokeRect(i, canvas.height - freqByteData[i], 10, canvas.height);
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

  var playTrackButton = createAudioButton('playTrackButton', 'pause', 'toggleAudio()');
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
  playAudio();
}

function previousTrackInPlaylist() {
  musicCounter--;
  if (musicCounter < 0) {
    musicCounter = musicPlaylist.length - 1;
  }
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
