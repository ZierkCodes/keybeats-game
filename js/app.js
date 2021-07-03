import {a, s, d, f, globalDuration, keybeats} from './keybeats_test.js';

let isPlaying = false;
let startTime;
let notes;

// Setup Event Listeners
window.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') {
        start();
    }
});

initializeNotes();

function initializeNotes() {
    let noteElement;
    let trackElement;

    // Setup Tracks
    let aTrack = document.querySelector('#a-track');
    let sTrack = document.querySelector('#s-track');
    let dTrack = document.querySelector('#d-track');
    let fTrack = document.querySelector('#f-track');

    // Setup Notes
    keybeats.controls.forEach(function(key, index) {
        key.notes.forEach(function(note) {
            noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.classList.add('note--' + index);
            noteElement.dataset.spawn = note.delay;
            noteElement.style.animationName = 'moveNote';
            noteElement.style.animationTimingFunction = 'linear';
            noteElement.style.animationDuration = globalDuration + 'ms';
            noteElement.style.animationDelay = note.delay + 'ms';
            noteElement.style.animationPlayState = 'paused';
            
            if(key.track === 'a-track') {
                trackElement = aTrack;
            } else if(key.track === 's-track') {
                trackElement = sTrack;
            } else if(key.track === 'd-track') {
                trackElement = dTrack;
            } else if(key.track === 'f-track') {
                trackElement = fTrack;
            }

            trackElement.appendChild(noteElement);
            notes = document.querySelectorAll('.note');
        });
    });
}

function start() {
    isPlaying = true;
    startTime = Date.now();
    let audio = document.querySelector('#keybeats-audio');

    startTimer(keybeats.duration);
    setTimeout(() => {
        audio.play();
    }, 2000);
    
    document.querySelectorAll('.note').forEach(function(note) {
        note.style.animationPlayState = 'running';
        console.log("Run at: " + note.dataset.spawn);
        
    });
}

function startTimer(duration) {
    let timer = duration;
    let miliseconds;

    let songDurationInterval = setInterval(function() {
        if(--timer < 0) {
            clearInterval(songDurationInterval);
        }
    }, 1);
}