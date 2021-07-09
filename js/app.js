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

// ? =============================================================================
// ? SECTION 1: DEFINE VARIABLES
// ? =============================================================================
// * =============================================================================
// * README: VARIABLE EXPLANATIONS
// * =============================================================================
/**
 * @const selectBtns - These buttons will start the game with the chosen song and difficulty
 * @const startScreen - This is the UI that is shown at the start of the game and at the end when another song is selected
 * @const gameOverModal - This is the UI that appears once you've missed too many notes
 * @const newSongBtns - Once the gameOverModal or the leaderboard UI appears, you may select these buttons to choose a new song to play
 * @const playAgainBtns - Again, in the gameOverModal or the leaderboard these buttons allow you to play the song you selected over again
 * @const highScores - This contains an array from scoreItem, which will be used after you complete a game
 * @const resultsScreen - This UI displays highScores and buttons to play again and select new song
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
 * @var scoreItem - Holds an array of game data that will be used by highScores
 * @var rank - This keeps track of how many games you've completed
 * @var songName - This is any of the four songs you can select
 * @var songDifficulty - This is any of the three difficulties you can select
 * @var comboStreak - Contains the highest combo streak you achieved after you complete a game
 * @var finalScore = Contains your total score after you complete a game
 */

const selectBtns = document.querySelectorAll('.select-btn')
const startScreen = document.querySelector('#starting-screen')
const gameOverModal = document.querySelector('#game-over')
const newSongBtns = document.querySelectorAll('.select-new-song')
const playAgainBtns = document.querySelectorAll('.play-again')
const highScores = document.querySelector('#highscores')
const resultsScreen = document.querySelector('#results')
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
const audio = document.querySelector('#audio')

// default game state variables and objects

let wave;
let songMap;
let startTime;
let fadeInterval;
let songDurationInterval;
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
// * BUTTON EVENT LISTENERS ======================================================
selectBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        selectSong(event.target.dataset.song, event.target.dataset.difficulty)
    })
});


newSongBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        resetGame();
        startScreen.style.display = 'flex'
    })
})

playAgainBtns.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        resetGame();
        selectSong(game.dataset.song, game.dataset.difficulty)
    });
});

// * KEYPRESS EVENT LISTENERS ====================================================
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

// * ANIMATION EVENT LISTENERS ===================================================
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
 *              5. Calls the startGame() function to start the game.
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
 *              5. Displays gameOverModel
 * @function winGame()
 *      -> Description: This function handles the gameOver state when a player wins and displays the High Scores UI.
 * @function resetGame()
 *      -> Description: This function resets the game's variables, as well as any needed UI updates.
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
    songMap = mapModule;
    audio.src = songMap.song.src;
    audio.load();

    game.className = '';
    game.classList.add(songMap.song.colorScheme);
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
    let noteIndex = songMap.song.tracks[index].next;
    let note = songMap.song.tracks[index].notes[noteIndex];
    let accuracy = Math.abs(((Date.now() - startTime) / 1000) - (songMap.song.globalDuration + note.delay));
    let hit;

    if(accuracy > songMap.song.globalDuration / 5) {
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

function startGame() {
    startTime = 0;
    startTime = Date.now()

    let timer = songMap.song.duration + songMap.song.globalDuration;
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
    game.dataset.song = songMap.song.id;
    game.dataset.difficulty = songMap.song.difficulty;

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
    game.dataset.song = songMap.song.id;
    game.dataset.difficulty = songMap.song.difficulty;
    game.style.display = 'none'

    scoreBoard.forEach((score) => {
        if(score.new) {
            score.new = false
        }
    })

    scoreBoard.push({
        song: songMap.song.name,
        score: Math.floor(score),
        streak: streaks.top,
        difficulty: songMap.song.difficulty,
        new: true
    })

    let orderedScores = scoreBoard.sort((a , b) => b.score - a.score)
    
    if(highScores.hasChildNodes()) {
        highScores.innerHTML = ''
    }

    orderedScores.forEach((score, index) => {
        let scoreItem = document.createElement('div')
        scoreItem.classList.add('score-item')
        if(score.new) {
            scoreItem.classList.add('new')
        }

        let rank = document.createElement('p')
        rank.classList.add('rank-num')
        rank.innerText = '#' + (index + 1)

        let songName = document.createElement('p')
        songName.classList.add('song-name')
        songName.innerText = score.song

        let songDifficulty = document.createElement('p')
        songDifficulty.classList.add('difficulty')
        songDifficulty.innerText = score.difficulty

        let comboStreak = document.createElement('p')
        comboStreak.classList.add('combo-streak')
        comboStreak.innerText = score.streak + 'x'

        let finalScore = document.createElement('p')
        finalScore.classList.add('score')
        finalScore.innerText = score.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

        scoreItem.appendChild(rank)
        scoreItem.appendChild(songName)
        scoreItem.appendChild(songDifficulty)
        scoreItem.appendChild(comboStreak)
        scoreItem.appendChild(finalScore)

        highScores.appendChild(scoreItem)
    })

    resultsScreen.style.display = 'flex'
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
    resultsScreen.style.display = 'none'
    progressBar.style.animation = 'none'
    game.className = ''
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