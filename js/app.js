import {a, s, d, f, globalDuration, keybeats} from './keybeats_test.js';

let holding = {
    a: false,
    s: false,
    d: false,
    f: false
};

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
            noteElement.dataset.spawn = key.delay - globalDuration;
            noteElement.style.animationName = 'moveNote';
            noteElement.style.animationTimingFunction = 'linear';
            noteElement.style.animationDuration = globalDuration + 'ms';
            noteElement.style.animationDelay = note.delay - globalDuration + 'ms';
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

    startTimer(keybeats.duration);
    document.querySelector('#keybeats-audio').play();
    document.querySelectorAll('.note').forEach(function(note) {
        note.style.animationPlayState = 'running';
    });
}

function startTimer(duration) {
    let timer = duration;
    let miliseconds;

    let songDurationInterval = setInterval(function() {
        
    });
}