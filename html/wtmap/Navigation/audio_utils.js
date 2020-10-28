const AudioUrl = 'https://gis.cx9z.com/map-server/audio/text2audio?text=';

console.log("Audio Utils");

let audio = document.createElement('audio');
let audioObj;

function playAudio(text) {
    console.log('start play:', text);
    let path = AudioUrl + text;

    if (audioObj == null) {
        audioObj = new Audio(path);
        audioObj.play();
    } else if (audioObj.ended) {
        audioObj.src = path;
        audioObj.play();
    } else {
        // console.log('not ended, ignore')
    }
    // console.log('finish play:', text);
}
