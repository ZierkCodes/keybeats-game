/**
 * KEYBEATS
 * =========================
 * Author: Gage Zierk
 * Created: 07/02/2021
 * http://www.gagezierk.com
 * 
 * @credits
 * Wave.js     https://foobar404.github.io/Wave.js
 * Author      Foobar404              
 */

// ? =============================================================================
// ? DEFINE VARIABLES
// ? =============================================================================
const game = document.querySelector('#game');
const track = document.querySelector('#track');
const tracks = document.querySelectorAll('.track');
const audio = document.querySelector('#audio');
const controls = document.querySelectorAll('.letters');
const progressBar = document.querySelector('#progress');
const gameOverSFX = document.querySelector('#game-over-audio');
const audioWave = document.querySelector('#audio-wave');
const scoreEl = document.querySelector('#score .number');
const comboEl = document.querySelector('#combo .number');
const hitsEl = document.querySelector('#hits');

let songMap;
let startTime;
let fadeInterval;
let wave = new Wave();
let scoreBoard = [];
let playing = false;
let score = 0;

let keyPressed = {
    a: false,
    s: false,
    d: false,
    f: false
};

let hits = {
    perfect: 0,
    good: 0,
    bad: 0,
    miss: 0
};

let multiplier = {
    combo: 1.1,
    perfect: 1,
    good: 0.75,
    bad: 0.5,
    miss: 0
};

let streaks = {
    combo: 0,
    miss: 0,
    top: 0
};


// ? =============================================================================
// ? ADD EVENT LISTENERS
// ? =============================================================================
document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        selectSong('funk-that', 'hard');
    }
});


// ? =============================================================================
// ? SETUP FUNCTIONS
// ? =============================================================================
function selectSong(song, difficulty) {
    if(song === 'keybeats') {
        switch(difficulty) {
            case 'easy':
                importSongMap('./maps/keybeats-easy.js');
                break;
            case 'normal':
                importSongMap('./maps/keybeats-normal.js');
                break;
            case 'hard':
                importSongMap('./maps/keybeats-hard.js');
                break;
        }
    } else if(song === 'for-my-girl') {
        switch(difficulty) {
            case 'easy':
                importSongMap('./maps/for-my-girl-easy.js');
                break;
            case 'normal':
                importSongMap('./maps/for-my-girl-normal.js');
                break;
            case 'hard':
                importSongMap('./maps/for-my-girl-hard.js');
                break;
        }
    } else if(song === 'space-cowboy') {
        switch(difficulty) {
            case 'easy':
                importSongMap('./maps/space-cowboy-easy.js');
                break;
            case 'normal':
                importSongMap('./maps/space-cowboy-normal.js');
                break;
            case 'hard':
                importSongMap('./maps/space-cowboy-hard.js');
                break;
        }
    } else if(song === 'funk-that') {
        switch(difficulty) {
            case 'easy':
                importSongMap('./maps/funk-that-easy.js');
                break;
            case 'normal':
                importSongMap('./maps/funk-that-normal.js');
                break;
            case 'hard':
                importSongMap('./maps/funk-that-hard.js');
                break;
        }
    }
}


function importSongMap(filepath) {
    import(filepath).then((mapModule) => {
        initializeGame(mapModule);
    });
}

function initializeGame(mapModule) {
    songMap = mapModule;
    audio.src = songMap.song.src;

    // ! Set the color scheme.
    game.classList.add(songMap.song.colorScheme);

    // ! Create the notes.
    let html;
    songMap.song.tracks.forEach((key, index) => {
        key.notes.forEach((note) => {
            html = document.createElement('div');
            html.classList.add('note');
            html.dataset.trackIndex = index;
            html.style.animationName = 'moveNote';
            html.style.animationTimingFunction = 'linear';
            html.style.animationDuration = songMap.song.globalDuration + 's';
            html.style.animationDelay = note.delay + 's';
            html.style.animationPlayState = 'paused';
            tracks[index].appendChild(html);
        });
    });

    // ! Create the event listeners for the controls.
    document.addEventListener('keydown', (e) => {
        if(e.key === 'a' && keyPressed.a === false) {
            keyPressed.a = true;
            controls[0].classList.add('pressed');
            if(playing && tracks[0].firstChild) {
                resolveHit(0);
            }
        } else if(e.key === 's' && keyPressed.s === false) {
            keyPressed.s = true;
            controls[1].classList.add('pressed');
            if(playing && tracks[1].firstChild) {
                resolveHit(1);
            }
        } else if(e.key === 'd' && keyPressed.d === false) {
            keyPressed.d = true;
            controls[2].classList.add('pressed');
            if(playing && tracks[2].firstChild) {
                resolveHit(2);
            }
        } else if(e.key === 'f' && keyPressed.f === false) {
            keyPressed.f = true;
            controls[3].classList.add('pressed');
            if(playing && tracks[3].firstChild) {
                resolveHit(3);
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if(e.key === 'a') {
            keyPressed.a = false;
            controls[0].classList.remove('pressed');
        } else if(e.key === 's') {
            keyPressed.s = false;
            controls[1].classList.remove('pressed');
        } else if(e.key === 'd') {
            keyPressed.d = false;
            controls[2].classList.remove('pressed');
        } else if(e.key === 'f') {
            keyPressed.f = false;
            controls[3].classList.remove('pressed');
        }
    });

    // ! Setup miss
    track.addEventListener('animationend', (e) => {
        streaks.miss++;
        hits.miss++;
        checkGameEnd();
        updateCombo('miss');
        updateView('miss');
        e.target.remove();
        songMap.song.tracks[e.target.dataset.trackIndex].next++;
    });

    hitsEl.addEventListener('animationend', (e) => {
        e.target.remove();
    });

    startGame();
}

function resolveHit(index) {
    let noteIndex = songMap.song.tracks[index].next;
    let note = songMap.song.tracks[index].notes[noteIndex];
    let accuracy = Math.abs(((Date.now() - startTime) / 1000) - (songMap.song.globalDuration + note.delay));
    let hit;

    if(accuracy > songMap.song.globalDuration / 4) {
        return;
    }

    hit = grade(accuracy);
    hits[hit]++;
    updateCombo(hit);
    updateScore(hit);
    updateView(hit);
    tracks[index].firstChild.remove();
    songMap.song.tracks[index].next++;
}

function grade(accuracy) {
    if(accuracy < 0.1) { return 'perfect' }
    else if(accuracy < 0.2) { return 'good' }
    else if(accuracy < 0.3) { return 'bad' }
    else { return 'miss' }
}

function updateCombo(hit) {
    if(hit === 'bad' || hit === 'miss') {
        streaks.combo = 0;
        multiplier.combo = 1.1;
    } else {
        streaks.combo++;
        multiplier.combo += .1;

        if(streaks.combo > streaks.top) {
        streaks.top = streaks.combo;
        }

        if(streaks.miss > 0) {
        streaks.miss--
        }
    }
}

function updateScore(hit) {
    if(streaks.combo > 0) {
        score += 100 * multiplier[hit] * multiplier.combo;
    } else {
        score += 100 * multiplier[hit];
    }
}

function checkGameEnd() {
    if(streaks.miss === songMap.song.maxMiss) {
        gameOver();
    } else {
        return;
    }
}

function updateView(accuracy) {
    scoreEl.innerText = Math.floor(score);
    comboEl.innerText = streaks.combo + 'x';

    if(songMap.song.difficulty === 'easy') {
        if(streaks.miss >= 6) {
            game.className = '';
            game.classList.add('black');
        } else {
            game.className = '';
            game.classList.add(songMap.song.colorScheme);
        }
    } else if(songMap.song.difficulty === 'normal') {
        if(streaks.miss >= 3) {
            game.className = '';
            game.classList.add('black');
        } else {
            game.className = '';
            game.classList.add(songMap.song.colorScheme);
        }
    } else if(songMap.song.difficulty === 'hard') {
        if(streaks.miss >= 1) {
            game.className = '';
            game.classList.add('black');
        } else {
            game.className = '';
            game.classList.add(songMap.song.colorScheme);
        }
    }

    let hitEl = document.createElement('div');
    hitEl.classList.add('hit');
    hitEl.innerText = accuracy;
    hitEl.style.animationName = 'fadeHit';
    hitEl.style.animationDuration = '500ms';
    hitEl.style.animationPlayState = 'running';
    hitsEl.appendChild(hitEl);
}

function startGame() {
    startTime = Date.now();

    let timer = songMap.song.duration;
    let min;
    let sec;

    let songDurationInterval = setInterval(() => {
        min = Math.floor(timer/60);
        sec = timer % 60;
        min = min < 10 ? '0' + min : min;
        sec = sec < 10 ? '0' + sec : sec;
        

        if(--timer < 0) {
            clearInterval(songDurationInterval);
            winGame();
        }
    }, 1000);

    progressBar.style.animationName = 'progressBar';
    progressBar.style.animationTimingFunction = 'linear';
    progressBar.style.animationFillMode = 'both';
    progressBar.style.animationDuration = songMap.song.duration + 's';
    progressBar.style.animationDelay = songMap.song.globalDuration + 's';
    progressBar.style.animationPlayState = 'running';

    setTimeout(() => {
        audio.play();
        playing = true;
        wave.fromElement("audio", "audio-wave", {
            type: "dualbars",
            colors: [songMap.song.waveColor]
        });
    }, songMap.song.globalDuration * 1000);

    document.querySelectorAll('.note').forEach((note) => {
        note.style.animationPlayState = 'running';
    });
}

function gameOver() {
    // ! The player missed too many times and lost the game.
    fadeInterval = setInterval(fadeAudio, 75);
    progressBar.style.animationPlayState = 'paused';
    gameOverSFX.play();

    document.querySelectorAll('.note').forEach((note) => {
        note.style.opacity = 1;
        setInterval(function() {
            note.style.opacity -= 1;
            if(note.style.opacity <= 0.0) {
                note.remove();
            }
        }, 75);
    });
}

function winGame() {
    console.log("RESULTS!");
    console.log("PERFECT: " + hits.perfect);
    console.log("GOOD: " + hits.good);
    console.log("BAD: " + hits.bad);
    console.log("MISS: " + hits.miss);
    console.log("SCORE: " + Math.floor(score));
    console.log("TOP STREAK: " + streaks.top);
    // Make sure to loop through scoreboard and set all new to false before pushing the new one.
    scoreBoard.push({song: songMap.song.name, score: Math.floor(score), streak: streaks.top, new: true});
}

function fadeAudio() {
    let volume = audio.volume - 0.1;

    if(volume >= 0) {
        audio.volume = volume;
    } else {
        clearInterval(fadeInterval);
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
    }
}