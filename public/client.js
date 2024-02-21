let feedback = "0.5";
window.onload = (event) => {
  const slider = document.querySelector('input');
  slider.onchange = function() {
    feedback = this.value;
  }
};
let context;
let joiny = 0;
let player;
let synth;
let now;
let socket = io();
let isPlaying = false;
//sampler params
let mix;
//voice allocater
let harmPlayers = [];
let harmPlayerCount = 0; 
let bowPlayers = [];
let bowPlayerCount = 0;
//effect chains
let reverbs = [];
let delays = [];
let bowReverb;
let bowDelay;
// helper functions
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
//prevent reverb tail bug
const silentPlayer = new Tone.Player("sounds/silence.m4a");
const vol = new Tone.Volume(-70).toDestination();
const samples = new Tone.ToneAudioBuffers({
  0 : "sounds/harms/harm1.wav",
  1 : "sounds/harms/harm2.wav",
  2 : "sounds/harms/harm3.wav",
  3 : "sounds/harms/harm4.wav",
  4 : "sounds/harms/harm5.wav",
  5 : "sounds/harms/harm6.wav",
  6 : "sounds/harms/harm7.wav",
  7 : "sounds/harms/harm8.wav",
  8 : "sounds/harms/harm9.wav",
  9 : "sounds/harms/harm10.wav",
  10 : "sounds/harms/harm11.wav",
  11 : "sounds/harms/harm12.wav",
  12 : "sounds/harms/harm13.wav",
  13 : "sounds/harms/harm14.wav",
  14 : "sounds/harms/harm15.wav",
  15 : "sounds/harms/harm16.wav",
  16 : "sounds/bows/bow1.mp3",
  17 : "sounds/bows/bow2.mp3",
  18 : "sounds/bows/bow3.mp3",
  19 : "sounds/bows/bow4.mp3",
  20 : "sounds/bows/bow5.mp3",
  21 : "sounds/bows/bow6.mp3",
  22 : "sounds/bows/bow7.mp3",
  23 : "sounds/bows/bow8.mp3",
  24 : "sounds/bows/bow9.mp3",
  25 : "sounds/bows/bow10.mp3",
  26 : "sounds/bows/bow11.mp3",
  27 : "sounds/bows/bow12.mp3",
  28 : "sounds/bows/bow13.mp3",
  29 : "sounds/bows/bow14.mp3",
  30 : "sounds/bows/bow15.mp3",
  31 : "sounds/bows/bow16.mp3",
  32 : "sounds/bows/bow17.mp3",
  33 : "sounds/bows/bow18.mp3",
  34 : "sounds/bows/bow19.mp3",
  35 : "sounds/bows/bow20.mp3",
  36 : "sounds/bows/bow21.mp3",
  37 : "sounds/bows/bow22.mp3",
  38 : "sounds/bows/bow23.mp3",
  39 : "sounds/bows/bow24.mp3",
  40 : "sounds/bows/bow25.mp3",
  41 : "sounds/bows/bow26.mp3",
  42 : "sounds/bows/bow27.mp3",
  43 : "sounds/bows/bow28.mp3",
  44 : "sounds/bows/bow29.mp3",
  45 : "sounds/bows/ending.mp3"
}, () => {
  silentPlayer.loop = true;
  for (let x = 0; x < 15; x++) {
    reverbs.push(new Tone.Reverb({decay: 9, wet: .6}).connect(vol));
    delays.push(new Tone.FeedbackDelay(.250, 0.6).connect(reverbs[x]));
    harmPlayers.push(new Tone.Player().connect(delays[x])); 
  }
  bowReverb = new Tone.Reverb({decay: 9, wet: .6}).connect(vol);
  bowDelay = new Tone.FeedbackDelay(.250, 0.6).connect(bowReverb);
  silentPlayer.connect(bowReverb);
  for (let x = 0; x < 8; x++) {
    bowPlayers.push(new Tone.Player().connect(bowDelay));
  }
  document.querySelector(".button").innerHTML = "play";
});

//pluck parameters from server
socket.on('pluckParams', (params) => {
  harmPlayerCount++;
  if (harmPlayerCount >= harmPlayers.length) {
    harmPlayerCount = 0;
  }
  delays[harmPlayerCount].feedback.value = feedback;
  delays[harmPlayerCount].delayTime.value = params.delayTime;
  harmPlayers[harmPlayerCount].playbackRate = params.rate;
  reverbs[harmPlayerCount].wet.value = params.mix;
  harmPlayers[harmPlayerCount].buffer = samples.get(params.sample);
  harmPlayers[harmPlayerCount].volume.value = -2;
  harmPlayers[harmPlayerCount].start();
});

//bow parameters from server
socket.on('bowParams', (params) => {
  bowPlayerCount++;
  if (bowPlayerCount >= bowPlayers.length) {
    bowPlayerCount = 0;
  }
  bowDelay.feedback.value = feedback;
  bowPlayers[bowPlayerCount].playbackRate = params.rate;
  bowPlayers[bowPlayerCount].buffer = samples.get(params.sample);
  bowPlayers[bowPlayerCount].start();
});

socket.on('disconnected', (lefty) => {
  el = document.querySelector('.user-state');
  el.innerHTML = lefty;
});

socket.on('numUsers', (joiny) => {
  el = document.querySelector('.user-state');
  if (joiny > 1) {
    el.innerHTML = 'there are ' + joiny + ' users online';
  } else {
    el.innerHTML = 'you are the only person here, send someone the link to join the party...';
  }  
});

socket.on('time', (time) => {
  timey = document.getElementById('time-point');
  timey.innerHTML = 'cloud sync ' + time + ' / 120'; 
});

function start(){
  if (!isPlaying) {
    isPlaying = true;
    Tone.start();
    silentPlayer.start();
    document.querySelector(".buttonText").innerHTML = "mute";
    socket.emit('isPlaying', isPlaying);
    vol.volume.value = -12;
  }
  else {
    isPlaying = false;
    vol.volume.value = -70;
    document.querySelector(".buttonText").innerHTML = "listen";
    socket.emit('isPlaying', isPlaying);
  }        
}