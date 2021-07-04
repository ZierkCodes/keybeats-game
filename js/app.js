/**
 * KeyBeats – app.js
 * 
 * @credits
 * Wave.js     https://foobar404.github.io/Wave.js
 * Author      Foobar404
 * 
 *              
 */

import {a, s, d, f, globalDuration, keybeats} from './keybeats_test.js';

let audio = document.querySelector('#keybeats-audio');
let canvas = document.querySelector('#output');

let wave = new Wave();
// audio wave from https://foobar404.github.io/Wave.js/?wave=orbs#/
// document.addEventListener('click', (e) => {
//     console.log(e.currentTarget);
    
// });











// Setup Variables
let songPosition;
let songDuration;

// Adding Event Listeners

audio.addEventListener("timeupdate", function() {
    songPosition = parseInt(audio.currentTime * 1000);
    songDuration = audio.duration;
}, false);

// Other Variables 
let keyPress = {
    a: false,
    s: false,
    d: false,
    f: false
}

let hits = {
    perfect: 0,
    good: 0,
    bad: 0,
    miss: 0
};

let multiplier = {
    perfect: 1,
    good: 0.75,
    bad: 0.5,
    miss: 0
};

let songIsPlaying = false;
let score = 0;
let startTime = null;
let trackContainer = document.querySelector('#track');
let tracks = [
    {
        track: 'a',
        element: document.querySelector('#a-track')
    },
    {
        track: 's',
        element: document.querySelector('#s-track')
    },
    {
        track: 'd',
        element: document.querySelector('#d-track')
    },
    {
        track: 'f',
        element: document.querySelector('#f-track')
    }
];

// let keyButtons = document.querySelectorAll('.keyButtons'); // A, S, D, F

initializeNotes();
setupControls();
setupMiss();

function initializeNotes() {
    let noteElement;

    keybeats.controls.forEach(function(key, index) {
        key.notes.forEach(function(note) {
            noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.classList.add('note--' + index);
            noteElement.style.animationName = 'moveNote';
            noteElement.style.animationTimingFunction = 'linear';
            noteElement.style.animationDuration = globalDuration + 'ms';
            noteElement.style.animationDelay = note.delay + 'ms';
            noteElement.style.animationPlayState = 'paused';
            tracks[index].element.appendChild(noteElement);
        });
    });
}

function start() {
    startTime = Date.now();
    startTimer(keybeats.duration);
    console.log("AUDIO DURATION: " + audio.duration*1000);
    console.log("KEYBEATS DURATION:" + keybeats.duration);

    setTimeout(() => {
        wave.fromElement("keybeats-audio", "output", {
            type: "dualbars",
            colors: ["#a0d8ff"]
        });
        audio.play();
        songIsPlaying = true;
    }, 2100);
    
    document.querySelectorAll('.note').forEach(function(note) {
        note.style.animationPlayState = 'running';        
    });
}

function startTimer(duration) {
    let timer = duration;
    let miliseconds;

    let songDurationInterval = setInterval(function() {
        if(--timer < 0) {
            clearInterval(songDurationInterval);
            showResults();
        }
    }, 1);
}

function showResults() {
    console.log("PERFECT: " + hits.perfect);
    console.log("GOOD: " + hits.good);
    console.log("BAD: " + hits.bad);
    console.log("MISS: " + hits.miss);
    console.log("SCORE: " + score);
}

function setupMiss() {
    trackContainer.addEventListener('animationend', function(e) {
        let index = e.target.classList.item(1)[6];
        // Remove note from track
        displayAccuracy('miss');
        updateHits('miss');
        removeNoteFromTrack(e.target.parentNode, e.target);
        updateNext(index);
    });
}

function setupControls() {
    window.addEventListener('keydown', function(e) {
        if(e.key === 'Enter') {
            start();
        } else {

            // 1. Set the index for the key that was pressed.
            let index = geyKeyIndex(e.key);

            if(Object.keys(keyPress).indexOf(e.key) !== -1 && !keyPress[e.key]) {
                keyPress[e.key] = true;
                // Update the corresponding key button's style to show it is pressed.
                if(songIsPlaying && tracks[index].element.firstChild) {
                    scoreHit(index);
                }
            }
        }
    });

    window.addEventListener('keyup', function(e) {
        if(Object.keys(keyPress).indexOf(e.key) !== -1) {
            let index = geyKeyIndex(e.key);
            keyPress[e.key] = false;
            // Remove the button styling to show the key is not being pressed anymore.
        }
    });
}

function geyKeyIndex(key) {
    switch(key) {
        case "a":
            return 0;
            break;
        case "s":
            return 1;
            break;
        case "d":
            return 2;
            break;
        case "f":
            return 3;
            break;
    }
}

function scoreHit(index) {
    let timeInMS = (Date.now() - startTime);
    let noteIndex = keybeats.controls[index].next;
    let note = keybeats.controls[index].notes[noteIndex];
    let perfectTime = globalDuration + note.delay;
    let accuracy = timeInMS - perfectTime;
    // let accuracy = Math.abs(songPosition - perfectTime);
    let hitScore;

    if(accuracy > (globalDuration / 4)) {
        console.log("TOO EARLY");
        return;
    }

    hitScore = getScore(accuracy, note.delay);
    displayAccuracy(hitScore);
    showHitEffect(index);
    updateHits(hitScore);
    calculateScore(hitScore);
    removeNoteFromTrack(tracks[index].element, tracks[index].element.firstChild);
    updateNext(index);

    // If note has not travelled far enough, ignore keypress
    // if(accuracy > globalDuration / 4) {
    //     return;
    // }

    // KEEP THESE VARIABLES
    // let accuracy = keyPressTime - startTime;
    //let accuracy = songPosition;

    // if(accuracy + note.delay > globalDuration / 4) {
    //     console.log("NOTE DELAY: " + note.delay);
    //     console.log("ACCURACY: " + accuracy);
    //     console.log("SONG POSITION: " + songPosition);
    //     console.log("TOO EARLY!");
    //     return;
    // }

    // console.log("IS " + accuracy + " < " + (note.delay + globalDuration / 4));
    // console.log("IS " + accuracy + " < " + (note.delay + 100));

    // console.log("NOTE DELAY: " + note.delay);
    // console.log("ACCURACY: " + accuracy);
    // console.log("SONG POSITION: " + songPosition);
    // console.log("DURATION / 4: " + (globalDuration / 4));
    // console.log("TOO EARLY: " + (note.delay + globalDuration / 4));
    // console.log("PERFECT: " + (note.delay + 100));
    // console.log("GOOD: " + (note.delay + 200));
    // console.log("BAD: " + (note.delay + 300));

    // KEEP BELOW
    // if(accuracy < note.delay) {
    //     console.log("TOO EARLY");
    //     return;
    // } else {
    //     if(accuracy < note.delay + 200) {
    //         console.log("PERFECT");
    //     } else if(accuracy < note.delay + 400) {
    //         console.log("GOOD");
    //     } else if(accuracy < note.delay + 600) {
    //         console.log("BAD");
    //     } else {
    //         console.log("MISS");
    //         console.log("ACCURACY: " + accuracy);
    //         console.log("SONG POS: " + songPosition);
    //         console.log("NOTE DELAY: " + note.delay);
    //     }
        
    // }

    // THIS ONE BELOW IS SORT OF OKAY

    // console.log("PART 1: " + accuracy + " > " + (note.delay + 300));
    // console.log("PART 2: " + accuracy + " < " + (note.delay + globalDuration / 4));

    // if(accuracy > note.delay + 300 && accuracy < note.delay + globalDuration / 4) {
    //     console.log("TOO EARLY");
    //     return;
    // } else {
    //     if(accuracy < note.delay + 100) {
    //         console.log("PERFECT");
    //     } else if(accuracy < note.delay + 200) {
    //         console.log("GOOD");
    //     } else if(accuracy < note.delay + 300) {
    //         console.log("BAD");
    //     } else {
    //         console.log("MISS");
    //     }
    // }


    // if(accuracy < note.delay + globalDuration / 4) {
    //     console.log("TOO EARLY");
    //     return;
    // } else if(accuracy < note.delay + 100) {

    //     console.log("PERFECT");
    // } else if(accuracy < note.delay + 200) {
    //     console.log("GOOD");
    // } else if(accuracy < note.delay + 300) {
    //     console.log("BAD");
    // } else {
    //     console.log("MISS");
    // }
}

function getScore(accuracy, delay) {
    if(accuracy < delay + 200) {
        return 'perfect';
    } else if(accuracy < delay + 400) {
        return 'good';
    } else if(accuracy < delay + 600) {
        return 'bad';
    } else {
        return 'miss';
    }
}

function displayAccuracy(accuracy) {
    console.log(accuracy);
}

function showHitEffect(index) {
    let note = document.querySelectorAll('.note')[index];
    console.log(note);
}

function updateHits(judgement) {
    hits[judgement]++;
}

function calculateScore(judgement) {
    score += 1000 * multiplier[judgement];
}

function removeNoteFromTrack(parent, child) {
    parent.removeChild(child);
}

function updateNext(index) {
    keybeats.controls[index].next++;
}

