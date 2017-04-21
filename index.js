var analyzer;
var canvas;
var ctx;

var musicPlaylist = ["DayByDay.mp3", "SummerTimeMemory.mp3", "DragonfruitSalad.mp3", "MilleFeuille.mp3", "PandaWonder.mp3"];
var musicCounter = 0;
var loopMode = 0;

window.onload = function() {
  canvas = document.createElement("canvas");
  canvas.id = "audioVisualizerCanvas";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.3;
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  setupWebAudio();
  draw();
}

function setupWebAudio() {
  var audio = document.createElement('audio');
  audio.addEventListener("ended", function(){
    if (loopMode) {
      audio.currentTime = 0;
      audio.play();
    } else {
      nextTrackInPlaylist();
      audio.src = musicPlaylist[musicCounter];
      audio.play();
    }
  });
  audio.id = 'audioPlayer'
  audio.src = musicPlaylist[musicCounter];
  audio.controls = 'true';
  document.body.appendChild(audio);
  audio.style.width = window.innerWidth * 0.4 + 'px';

  var audioContext = new AudioContext();
  analyzer = audioContext.createAnalyser();
  var source = audioContext.createMediaElementSource(audio);
  source.connect(analyzer);
  analyzer.connect(audioContext.destination);
  audio.play();
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

function restartTrack() {
  var audio = document.getElementById('audioPlayer');
  audio.currentTime = 0;
  audio.load();
  audio.play();
}

function changeMusic() {
  nextTrackInPlaylist();
  var audio = document.getElementById('audioPlayer');
  audio.src = musicPlaylist[musicCounter];
  audio.play();
}

function nextTrackInPlaylist() {
  musicCounter++;
  if (musicCounter > musicPlaylist.length - 1) {
    musicCounter = 0;
  }
}

function loop() {
  var loopButton = document.getElementById('loopButton');
  if (loopMode == 0) {
    loopMode = 1;
    loopButton.innerHTML = "Loop Off";
  } else {
    loopMode = 0;
    loopButton.innerHTML = "Loop On";
  }
}
