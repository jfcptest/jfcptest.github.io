// Sound.
const audio = document.getElementById('audio_player');
const audioContext = new AudioContext();
const audioSrc = audioContext.createMediaElementSource(audio);
export const analyser = audioContext.createAnalyser();

audioSrc.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 512;

const bufferLength = analyser.frequencyBinCount;
export const dataArray = new Uint8Array(bufferLength);

audio.src = '../assets/music/song2.mp3';
audio.load();