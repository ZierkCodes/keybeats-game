/**
 * ==============================================
 * KEYBEATS
 * ==============================================
 * Author: Gage Zierk
 * Created: 07/02/2021
 * http://www.gagezierk.com    
 * ?              ______________
 * ?        ,===:'.,            `-._
 * ?             `:.`---.__         `-._
 * ?               `:.     `--.         `.
 * ?                 \.        `.         `.
 * ?         (,,(,    \.         `.   ____,-`.,
 * ?      (,'     `/   \.   ,--.___`.'
 * ?  ,  ,'  ,--.  `,   \.;'         `
 * ?   `{D, {    \  :    \;
 * ?     V,,'    /  /    //
 * ?     j;;    /  ,' ,-//.    ,---.      ,
 * ?     \;'   /  ,' /  _  \  /  _  \   ,'/
 * ?           \   `'  / \  `'  / \  `.' /
 * ?            `.___,'   `.__,'   `.__,' 
* ==============================================
 */

// * =============================================================================
// * README: THINKING ABOUT GAME LOGIC
// * =============================================================================
/**
 * Before diving into the specifics of a rhythm game, let's first think about the
 * basics of any game.
 * 
 * At the very least, there are three parts to the logic of any game.
 * The first is the intialization of the game. This is based on any event that can
 * trigger the game to start, like a button click. This part of our logic will
 * set up the game, all its variables, event listeners, and anything else we need
 * to make sure the game is ready to play.
 * 
 * The second part is the bulk of our specific game logic. This is unique to any
 * game that you're playing, but ultimately, it lays out everything that needs to
 * happen for the player while they're playing the game.
 * 
 * Finally, we need a way to check to see if the game has ended. This can be 
 * based on a multitude of conditions, such as winning, losing, etc. We will also
 * need a way to reset the game after it's ended so that it can be played again
 * without having to refresh the page.
 */

// * =============================================================================
// * README: GAME LOGIC FOR THE RHYTHM GAME
// * =============================================================================
/**
 * There are a lot of things we'll need to do to set this up, but here is some of
 * the things you'll need to accomplish to get this working:
 * 
 * 1. We need a way to be able to select a song. This will include importing the
 * song maps and setting all our variables based on the selected song.
 * 
 * 2. You'll need a function that will handle the bulk of the game setup. This 
 * includes things like setting global variables, setting up all the individual
 * notes of the rhythm game, setting up the event listeners for when the control
 * keys [a, s, d, f] are pressed, and removing any necessary html elements that
 * were dynamically created in JavaScript. (Particularly when the animations end.)
 * 
 * 3. We'll need a way to resolve and grade hits. So, when a player presses a key,
 * we need to check the accuracy, and update a bunch of stuff depending on that
 * result.
 * 
 * 4. We'll also need a way to update the different variables. For
 * the rhythm game, this includes things like the different hits, combos, the
 * multiplier for the score, and all of that other stuff. It also includes things
 * like updating the tracks (removing notes), updating the UI, etc. So essentially,
 * every time a player hits a key (or misses), we need to update a bunch of
 * different moving parts.
 * 
 * 5. We'll need a way to start the game. This will begin our timers, play the song,
 * and listen for the song to end (in which case it will need a way to end the game
 * with a positive result, like showing the leaderboard.) It will also need to 
 * make sure the leaderboard has our new, final score.
 * 
 * 6. As mentioned above, we'll need a way to end the game. This includes removing
 * any leftover notes (in case of failure), stopping audio, etc.
 * 
 * This is a gross oversimplification, but we'll break it down further step by 
 * step in the sections below.
 */


// ? =============================================================================
// ? SECTION 1: DEFINE VARIABLES
// ? =============================================================================
// * =============================================================================
// * README: VARIABLE EXPLANATIONS
// * =============================================================================
/**
 * @const game - We will need this to update the color scheme of the UI
 * @const track - We will need this to listen for animationend events (for the notes)
 * @const tracks - We will need this to iterate for all tracks, notes, etc.
 * @const audio - We need to access this to dynamically set the source and control audio events
 * @const controls - We will need these to update the style when the controls / keys are being pressed
 * @const progressBar - We will need to set the animation of this dynamically to match the duration of the song
 * @const gameOverSFX - We will need to play this if (when?) the user fails
 * @const audioWave - We will need to access the audioWave HTML to initialize the audio wave
 * @const scoreEl - We will need this HTML element to display and update the score
 * @const comboEl - We will need this HTML element to display and update the combo streak
 * @const hitsEl - We will need this to display the grade of the hit: perfect, good, bad, miss
 * @var songMap - Very important. This has all the data to make everything work. Take a look at it.
 * @var startTime - This will set the time the song has officially started. We use it to calculate accuracy.
 * @var fadeInterval - This just handles the audio fade out interval if a user fails. We need it as a global to remove it later.
 * @var wave - This is our Wave object! Makes shiny effects.
 * @var scoreBoard - Self explanatory, but will hold all the win results from a single session. (Not the fails.)
 * @var playing - A quick variable to reference to check whether or not our song is actively playing.
 * @var score - Just our score counter. ¯\_(ツ)_/¯
 * @var keyPressed - This object tells us whether or not a key is actively being pressed.
 * @var hits - This will keep track of each individual hit and count.
 * @var multiplier - This tells us how much to multiply the score by. The only reason this isn't a const is because we update the combo multiplier based on successive hits.
 * @var streaks - Allows us to keep track of our streaks. Miss streaks tell us if the player is going to fail, and combo streaks keep track of our multiplier.
 */

const selectBtns = document.querySelectorAll('.select-btn')
const startScreen = document.querySelector('#starting-screen')
const gameOverModal = document.querySelector('#game-over')
const newSongBtns = document.querySelectorAll('.select-new-song')
const playAgainBtns = document.querySelectorAll('.play-again')

const game = document.querySelector('#game') 
const track = document.querySelector('#track')
const tracks = document.querySelectorAll('.track')
const controls = document.querySelectorAll('.letters')
const progressBar = document.querySelector('#progress')
const gameOverSFX = document.querySelector('#game-over-audio')
const audioWave = document.querySelector('#audio-wave')
const scoreEl = document.querySelector('#score .number')
const comboEl = document.querySelector('#combo .number')
const hitsEl = document.querySelector('#hits')

let audio = document.querySelector('#audio')

let songMap;
let startTime;
let fadeInterval;
let wave;
let scoreBoard = [];
let playing = false;
let score = 0;



let keyPressed = {
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
}

let multiplier = {
    combo: 1.1,
    perfect: 1,
    good: 0.75,
    bad: 0.5,
    miss: 0
}

let streaks = {
    combo: 0,
    miss: 0,
    top: 0 
}

// ? =============================================================================
// ? SECTION 2: EVENT LISTENERS
// ? =============================================================================

selectBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        selectSong(event.target.dataset.song, event.target.dataset.difficulty)
    })
});

newSongBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        resetGame();
        // Leaderboard dispaly none
        startScreen.style.display = 'flex'
    })
})

playAgainBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        resetGame();
        // If high scores screen .display, hide it
        selectSong(gameOverModal.dataset.song, gameOverModal.dataset.difficulty)
        // selectSong(songMap.song.id, songMap.song.difficulty);
    });
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'a' && keyPressed.a === false) {
        keyPressed.a = true
        controls[0].classList.add('pressed');
        if(playing && tracks[0].firstChild) {
            resolveHit(0);
        }
    } else if(e.key === 's' && keyPressed.s === false) {
        keyPressed.s = true
        controls[1].classList.add('pressed');
        if(playing && tracks[1].firstChild) {
            resolveHit(1);
        }
    } else if(e.key === 'd' && keyPressed.d === false) {
        keyPressed.d = true
        controls[2].classList.add('pressed');
        if(playing && tracks[2].firstChild) {
            resolveHit(2);
        }
    } else if(e.key === 'f' && keyPressed.f === false) {
        keyPressed.f = true
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

track.addEventListener('animationend' , (e) => {
    updateCombo('miss')
    updateView('miss')
    e.target.remove()
    songMap.song.tracks[e.target.dataset.trackIndex].next++;
});

hitsEl.addEventListener('animationend', (e) => {
    e.target.remove()
});

// ? =============================================================================
// ? SECTION 3: DEFINE FUNCTIONS
// ? =============================================================================
// * =============================================================================
// * README: FUNCTION EXPLANATIONS
// * =============================================================================
/**
 * @function selectSong()
 *      -> Requires @param song
 *      -> Requires @param difficulty
 *      -> Description: This will pull the correct Song Map based on the difficulty.
 * @function importSongMap()
 *      -> Requires @param filepath
 *      -> Description: This function uses a promise to import our map module. It then passes the map module into
 *         the intializeGame function so that we can set it as a global variable.
 * @function intializeGame()
 *      -> Requires @param mapModule
 *      -> Description: This function sets up our game:
 *              1. Sets the global songMap variable using the mapModule
 *              2. Sets the audio source.
 *              3. Sets the game's color scheme.
 *              4. Creates all the notes based on the songMap
 *              5. Adds the event listeners for all the controls (as well as corresponding logic)
 *              6. Sets up the event listener for animationend on the main track (as well as corresponding logic)
 *              7. Sets up the event listener for the hits element that displays the grade of the hit
 *              8. Calls the startGame() function to start the game.
 * @function resolveHit()
 *      -> Requires @param index
 *      -> Description: This function handles all the logic to determine the success of a hit when a control key is pressed:
 *              1. Grabs the noteIndex from the track in the songMap.
 *              2. Grabs the current note object from the songMap track [a, s, d, f] using the noteIndex. This is how we get our delay for the current note.
 *              3. Calculates the accuracy. This one is a bit long, so we'll break it down:
 *                      - Get the current time stamp, minus the time the song started, divided by 1000 (because it starts in milliseconds)
 *                      - That gives us the exact time the key was pressed.
 *                      - This value is very close to our note's recorded delay (plus the global duration time allotted for the animation)
 *                      - We subtract that from the time our key was pressed to get our accuracy.
 *              4. We check to see if the note has gone down 3/4 of the track before we allow it to be pressed. (If not, nothing happens.)
 *              5. Then, we grade the accuracy: perfect, good, bad, miss
 *              6. Update the hits based on whatever the grade was.
 *              7. Update the combo.
 *              8. Update the score.
 *              9. Update the view (UI).
 *              10.Remove the note from the track.
 *              11.Increment the index in the songMap.
 * @function grade()
 *      -> Requires @param accuracy
 *      -> Description: A relatively simple function that returns the grade of the hit based on the accuracy.
 * @function updateCombo()
 *      -> Requires @param hit
 *      -> Description: Based on the graded hit, it updates our global variables:
 *              1. streaks.combo
 *              2. multiplier.combo
 *              3. streaks.top
 *              4. streaks.miss
 *         * Note: It will also reset the combo / multiplier on a bad hit or a missed hit.
 * @function updateScore()
 *      -> Requires @param hit
 *      -> Description: A simple function that updates our score using the multipliers.
 * @function checkGameEnd()
 *      -> Description: This is called each time a player misses. It checks to see if the miss streak is equal to the maxMiss value in the songMap
 *         If so, it calls the gameOver function. Otherwise, it returns the function, and allows the game to keep playing.
 * @function updateView()
 *      -> Requires @param accuracy
 *      -> Description: This function handles the bulk of our logic when it comes to updating our view.
 *              1. It updates the score HTML
 *              2. It updates the combo HTML
 *              3. It updates the game's color scheme to black when a user is in the middle of a miss streak (based on difficulty)
 *              4. It updates the game's color scheme when they break out of the miss streak.
 *              5. It creates the 'hit' elements that display the graded hit: perfect, good, bad, miss
 * @function startGame()
 *      -> Description: This function handles everything needed to actually start the game:
 *              1. Sets the start time.
 *              2. Creates a timer.
 *              3. Creates a songDurationInterval variable that will track the remaining time of the song.
 *                 When the song is over, it clears the interval and calls the winGame() function.
 *              4. It dynamically sets the progressBar's styling to animate according to the duration of the song.
 *              5. It sets a timeout according to the globalDuration specified in the songMap * 1000 (to get MS, which is what timeouts run on)
 *              6. Inside the interval, we:
 *                      - Play the audio
 *                      - Set the playing global variable to true
 *                      - Initialize the audio wave
 *              7. Then, it loops through all the notes and sets them to running at the same time. (They have a delay that makes them come down at the right time.)
 * @function gameOver()
 *      -> Description: This function handles the gameOver state when a player fails.
 *              1. Sets the fade interval so the audio will fade out.
 *              2. Pauses the progressBar.
 *              3. Plays the game over sound fx (gameOverSFX)
 *              4. Fades out all the notes and removes them from the track.
 *         * Note: We will need to add more to this function later.
 * @function winGame()
 *      -> Description: This function handles the gameOver state when a player wins.
 *         Currently, is is just pushing data to the scoreBoard.
 *         * We will need to loop through the scoreboard and make sure there are no "new" objects before pushing the new one.
 *         * We will be adding more to this function later, as well.
 * @function fadeAudio()
 *      -> This function just handles the volume on the audio fade out, as well as clears the interval when the volume reaches 0.
 */


function selectSong(song, difficulty) {
    if(song === 'keybeats') {
        switch (difficulty) {
            case 'easy':
                importSongMap('./maps/keybeats-easy.js')
                break;
            case 'normal':
                importSongMap('./maps/keybeats-normal.js')
                break;
            case 'hard':
                importSongMap('./maps/keybeats-hard.js')
                break;
        }
} else if(song === 'for-my-girl') {
        switch (difficulty) {
            case 'easy':
                importSongMap('./maps/for-my-girl-easy.js')
                break;
            case 'normal':
                importSongMap('./maps/for-my-girl-normal.js')
                break;
            case 'hard':
                importSongMap('./maps/for-my-girl-hard.js')
                break;
        }
    } else if (song === 'space-cowboy') {
        switch (difficulty) {
            case 'easy':
                importSongMap('./maps/space-cowboy-easy.js')
                break;
            case 'normal':
                importSongMap('./maps/space-cowboy-normal.js')
                break;
            case 'hard':
                importSongMap('./maps/space-cowboy-hard.js')
                break;
        }
    } else if (song === 'funk-that') {
        switch (difficulty) {
            case 'easy':
                importSongMap('./maps/funk-that-easy.js')
                break;
            case 'normal':
                importSongMap('./maps/funk-that-normal.js')
                break;
            case 'hard':
                importSongMap('./maps/funk-that-hard.js')
                break;
        }
    }
}

function importSongMap(filepath) {
    import(filepath).then((mapModule) => {
        initializeGame(mapModule)
    })
}

function initializeGame(mapModule) {
    console.log("INITIALIZING GAME");
    songMap = mapModule;
    audio.src = songMap.song.src;
    audio.load();
    console.log(audio);

    game.className = '';
    game.classList.add(songMap.song.colorScheme);

    // Remove Hidden Attribute of Start Screen
    startScreen.style.display = 'none';
    game.style.display = 'block';

    // create the notes
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

    setTimeout(() => {
        startGame();
    }, 1000)
};

function resolveHit(index) {
    console.log("RESOLVING HIT")
    let noteIndex = songMap.song.tracks[index].next;
    let note = songMap.song.tracks[index].notes[noteIndex];
    let accuracy = Math.abs(((Date.now() - startTime) / 1000) - (songMap.song.globalDuration + note.delay));
    let hit;
    console.log(noteIndex);
    console.log(accuracy + " > " + songMap.song.globalDuration / 5);
    console.log((Date.now() - startTime) / 1000);
    console.log(songMap.song.globalDuration + note.delay);
    console.log(songMap.song.globalDuration)
    console.log(note.delay);
    if(accuracy > songMap.song.globalDuration / 5) {
        console.log("RETURNING");
        return
    };

    hit = grade(accuracy);
    hits[hits]++;
    updateCombo(hit);
    updateScore(hit);
    updateView(hit);
    tracks[index].firstChild.remove();
    songMap.song.tracks[index].next++;
};


function grade(accuracy) {
    if(accuracy < 0.1) {
        return 'perfect'
    } else if(accuracy < 0.2) {
        return 'good'
    } else if(accuracy < 0.3) {
        return 'bad'
    } else {
        return 'miss'
    }
}

function updateCombo(hit) {
    if(hit === 'bad' || hit === 'miss') {
        streaks.combo = 0
        multiplier.combo = 1.1

        if(hit === 'miss') {
            console.log("MISSED!");
            hits.miss++
            streaks.miss++;
            checkGameEnd()
        }
    } else {
        streaks.combo ++
        multiplier.combo += 0.1

        if(streaks.combo > streaks.top) {
        streaks.top = streaks.combo
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
    console.log("STREAKS: " + streaks.miss);
    console.log("MAX MISS: " + songMap.song.maxMiss);
    if(streaks.miss >= songMap.song.maxMiss) {
        gameOver()
    } else {
        return;
    }
}


function updateView(accuracy) {
    scoreEl.innerText = Math.floor(score)
    comboEl.innerText = streaks.combo + 'x'
    if(songMap.song.difficulty === 'easy') {
        if(streaks.miss >= 6) {
            game.className = ''
            game.classList.add('black')
        } else {
            game.className = ''
            game.classList.add(songMap.song.colorScheme)
        }
    } else if(songMap.song.difficulty === 'normal') {
        if(streaks.miss >= 3) {
            game.className = ''
            game.classList.add('black')
        } else {
            game.className = ''
            game.classList.add(songMap.song.colorScheme)
        }
    } else if(songMap.song.difficulty === 'hard') {
        if(streaks.miss >= 1) {
            game.className = ''
            game.classList.add('black')
        } else {
            game.className = ''
            game.classList.add(songMap.song.colorScheme)
        }
    }

    let hitEl = document.createElement('div')
    hitEl.classList.add('hit')
    hitEl.innerText = accuracy
    hitEl.style.animationName = 'fadeHit'
    hitEl.style.animationDuration = '500ms'
    hitEl.style.animationPlayState = 'running'
    hitsEl.appendChild(hitEl)
}

let songDurationInterval;

function startGame() {
    startTime = 0;
    startTime = Date.now()

    let timer = songMap.song.duration;
    let min;
    let sec;

    songDurationInterval = setInterval(() => {
        min = Math.floor(timer / 60);
        sec = timer % 60
        min = min < 10 ? '0' + min : min;
        sec = sec < 10 ? '0' + sec : sec;
    
    
        if(--timer < 0) {
            clearInterval(songDurationInterval);
            winGame()
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
        
    }, songMap.song.globalDuration * 1000)

    wave = new Wave()
    wave.fromElement('audio', 'audio-wave', {
        type: 'dualbars',
        colors: [songMap.song.waveColor]
    });

    document.querySelectorAll('.note').forEach((note) => {
        note.style.animationPlayState = 'running'
    });
}


function gameOver() {
    fadeInterval = setInterval(fadeAudio, 75);
    clearInterval(songDurationInterval);
    progressBar.style.animationPlayState = 'paused';
    gameOverSFX.play();

    gameOverModal.style.display = 'flex'
    gameOverModal.dataset.song = songMap.song.id;
    gameOverModal.dataset.difficulty = songMap.song.difficulty;

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

function resetGame() {
    hits.perfect = 0;
    hits.good = 0;
    hits.bad = 0;
    hits.miss = 0;
    multiplier.combo = 1.1
    multiplier.perfect = 1
    multiplier.good = 0.75
    multiplier.bad = 0.5
    multiplier.miss = 0
    streaks.combo = 0
    streaks.miss = 0
    streaks.top = 0
    score = 0
    audio.currentTime = 0
    audio.volume = 1
    songMap.song.tracks[0].next = 0;
    songMap.song.tracks[1].next = 0;
    songMap.song.tracks[2].next = 0;
    songMap.song.tracks[3].next = 0;
    scoreEl.innerText = 0;
    comboEl.innerText = '0x';
    game.style.display = 'none'
    gameOverModal.style.display = 'none';
    progressBar.style.animation = 'none'
    game.className = ''
}

function winGame() {
    console.log("RESULTS!");
    console.log("PERFECT: " + hits.perfect);
    console.log("GOOD: " + hits.good);
    console.log("BAD: " + hits.bad);
    console.log("MISS: " + hits.miss);
    console.log("SCORE: " + Math.floor(score));
    console.log("TOP STREAK: " + streaks.top);

    newScore.push({
        song: songMap.song.name,
        score: Math.floor(score),
        streak: streaks.top,
        new: true
    })
}

function fadeAudio() {
    let volume = audio.volume - 0.1
    if(volume >= 0) {
        audio.volume = volume
    } else {
        clearInterval(fadeInterval)
        audio.volume = 0
        audio.pause()
        audio.currentTime = 0
    }
}