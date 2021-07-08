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
// TODO ==========================================================================
// TODO: Grab all of the necessary HTML elements and assign them to CONST variables.
// TODO ==========================================================================

const game = document.querySelector('#game') 
const track = document.querySelector('#track')
const tracks = document.querySelectorAll('.track')
const audio = document.querySelector('#audio')
const controls = document.querySelectorAll('.letters')
const progressBar = document.querySelector('#progress')
const gameOverSFX = document.querySelector('#game-over-audio')
const audioWave = document.querySelector('#audio-wave')
const scoreEl = document.querySelector('#score .number')
const comboEl = document.querySelector('#combo .number')
const hitsEl = document.querySelector('#hits')
 

// ! Your code goes here. ========================================================



// TODO ==========================================================================
// TODO: Define the other global variables. These will change, so use LET
// TODO ==========================================================================
/**
 * * Note: When creating empty variables, they are not equal to anything. For example: let empty;
 * 1.  Create an empty @var songMap
 * 2.  Create an empty @var startTime
 * 3.  Create an empty @var fadeInterval
 * 4.  Create a @var wave and set it to: new Wave();
 * 5.  Create @var scoreBoard and set it to an empty array
 * 6.  Create @var playing and set it to false
 * 7.  Create @var score and set it to 0
 */

// ! Your code goes here. ========================================================

let songMap;
let startTime;
let fadeInterval;
let wave = new Wave();
let scoreBoard = [];
let playing = false;
let score = 0;

// TODO ==========================================================================
// TODO: Define the global object variables. These will also change, so use LET
// TODO ==========================================================================
/**
 * * Note: Objects contain { KEY: VALUE } pairs.
 * 1.  Create @var keyPressed
 *     -> Create keys: a, s, d, f
 *     -> Set all their values to false
 * 2.  Create @var hits
 *     -> Create keys: perfect, good, bad, miss
 *     -> Set all their values to 0
 * 3.  Create @var multiplier
 *     -> Create keys: combo, perfect, good, bad, miss
 *     -> Set the keys respectively: 1.1, 1, 0.75, 0.5, 0
 * 4.  Create @var streaks
 *     -> Create the keys: combo, miss, top
 *     -> Set all their values to 0
 */

// ! Your code goes here. ========================================================

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
// ? SECTION 2: ADD EVENT LISTENERS
// ? =============================================================================
// TODO ==========================================================================
// TODO: Add a quick event listener to start the game.
// TODO ==========================================================================
/**
 * * Note: This will be updated to be called when a button is clicked that will pass the correct data so we don't have to manually set it.
 * 1.  Add a 'keydown' event listener to document and pass @param e as a parameter in the callback function.
 * 2.  Create an @if conditional that checks:
 *          -> If @param e.key is equal to 'Enter'
 *                  -> call @function selectSong and pass your choice of song and difficulty as a string:
 *                              SONGS:              DIFFICULTIES:
 *                              keybeats            easy
 *                              for-my-girl         normal
 *                              funk-that           hard
 *                              space-cowboy                        
 */

// ! Your code goes here. ========================================================

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        selectSong('keybeats', 'normal')
    }
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

// TODO ==========================================================================
// TODO: Define all the required functions in the red sections below.
// TODO ==========================================================================
/**
 * 1.  Create @function selectSong()
 *          Requires @param song
 *          Requires @param difficulty
 * 2.  Create @function importSongMap()
 *          Requires @param filepath
 * 3.  Create @function initializeGame()
 *          Requires @param mapModule
 * 4.  Create @function resolveHit()
 *          Requires @param index
 * 5.  Create @function grade()
 *          Requires @param accuracy
 * 6.  Create @function updateCombo()
 *          Requires @param hit
 * 7.  Create @function updateScore()
 *          Requires @param hit
 * 8.  Create @function checkGameEnd()
 * 9.  Create @function updateView()
 *          Requires @param accuracy
 * 10. Create @function startGame()
 * 11. Create @function gameOver()
 * 12. Create @function winGame()
 * 13. Create @function fadeAudio()
 */


// ! =============================================================================
// ! FUNCTION: selectSong() - Your code goes here.
// ! =============================================================================

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

// TODO ==========================================================================
// TODO: selectSong() LOGIC
// TODO ==========================================================================
/**
 * 1.  Create an @if statement that checks for the song name:
 *          - If @param song is equal to 'keybeats'
 *          - Else if @param song is equal to 'for-my-girl'
 *          - Else if @param song is equal to 'space-cowboy'
 *          - Else if @param song is equal to 'funk-that'
 * 2.  Inside each conditional statement, create a switch statement that accepts @param difficulty as the expression
 *     * Switch Statement (MDN): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
 * 3.  Inside each switch statement, create three cases for 'easy', 'normal', and 'hard'
 * 4.  Inside each case, call @function importSongMap() and pass the file path to the appropriate map as a string.
 *          - Example: importSongMap('./maps/keybeats-easy.js');
 * 5.  Add break; after @function importSongMap()
 * *   IMPORTANT: MAKE SURE YOUR SWITCH CASE INDENTATION IS CORRECT!
 */



// ! =============================================================================
// ! FUNCTION: importSongMap() - Your code goes here.
// ! =============================================================================

function importSongMap(filepath) {
    import(filepath).then((mapModule) => {
        initializeGame(mapModule)
    })
}



// TODO ==========================================================================
// TODO: importSongMap() LOGIC
// TODO ==========================================================================
/**
 * We will be using a Dynamic Import to get our song map. See the first code block in the reference below:
 * * Dynamic Imports (MDN): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports
 * 1.  Create the import statement.
 * 2.  Pass the @param filepath into the import.
 * 3.  In the arrow function of the .then promise, pass @param mapModule so we can access it.
 * 4.  Inside the function, call @function initializeGame() and pass the @param mapModule again.
 */



// ! =============================================================================
// ! FUNCTION: initializeGame() - Your code goes here.
// ! =============================================================================

function initializeGame(mapModule) {
    songMap = mapModule;
    audio.src = songMap.song.src;
    game.classList.add(songMap.song.colorScheme);

    // create the notes

    let html;
    songMap.song.tracks.forEach((key, index) => {
        key.notes.forEach((note) => {
            html = document.createElement('div')
            html.classList.add('note')
            html.dataset.trackIndex = index
            html.style.animation = 'movenote'
            html.style.animationTimingFunction = 'linear'
            html.style.animationDuration = songMap.song.globalDuration + 's'
            html.style.animationDelay = note.delay + 's'
            html.style.animationPlayState = 'paused'
            tracks[index].appendChild(html)
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

    track.addEventListener(('animationend') , (e) => {
        streaks.miss++
        hits.miss++
        checkGameEnd()
        updateCombo('miss')
        updateView('miss')
        e.target.remove()
        songMap.song.tracks[e.target.dataset.trackIndex].next++;
    });

    hitsEl.addEventListener(('animationend'), (e) => {
        e.target.remove
    });

    startGame();
};



// TODO ==========================================================================
// TODO: initializeGame() LOGIC
// TODO ==========================================================================
/**
 * TODO: Set the global variables.
 * 1.  Set @var songMap global to @param mapModule
 * 2.  Set @var audio.src to @var songMap.song.src
 *     * Wondering what songMap.song.src is coming from? Check the files in /js/maps/
 * 3.  Set the classList of @var game to @var songMap.song.colorScheme
 * 
 * TODO: Create the notes
 * 1.  Create an empty @var html
 * 2.  Use a @forEach loop to iterate through @var songMap.song.tracks
 *          - Pass @param key and @param index in the arrow function
 * 3.  Inside the loop, create another @forEach loop to iterate through @param key.notes
 *          - Pass @param note in the arrow function
 * 4.  Inside the second loop, we need to do the following:
 *          - Set @var html to a div element created using the DOM
 *          - Set @var html classList to 'note'
 *          - Set @var html.dataset.trackIndex to @param index
 *          - Set @var html.style.animationName to 'moveNote'
 *          - Set @var html.style.animationTimingFunction to 'linear'
 *          - Set @var html.style.animationDuration to @var songMap.song.globalDuration + 's'
 *          - Set @var html.style.animationDelay to @param note.delay + 's'
 *          - Set @var html.style.animationPlayState to 'paused'
 * 5.  After you set all the html styles, append the HTML.
 *          - Hint: You can use index to select the right track from @var tracks
 *          - After that, you're all done with the loops.
 * 
 * TODO: Create the keydown event listener for the controls.
 * 1.  Add a 'keydown' event listener to the document. Pass @param e in the callback function.
 * 2.  Inside the callback function, we will need to create a conditional statement:
 *          - If @param e.key is equal to 'a' AND @var keyPressed.a is false
 *          - Else if @param e.key is equal to 's' AND @var keyPressed.s is false
 *          - Else if @param e.key is equal to 'd' AND @var keyPressed.d is false
 *          - Else if @param e.key is equal to 'f' AND @var keyPressed.f is false
 * 3. Inside each conditional, we need to set the appropriate key in @var keyPressed to true (because the event told us it's being pressed!)
 *          - Example: @var keyPressed.a = true;
 * 4. Now we need to add the pressed class to show the buttons in the UI being pressed:
 *          - For a: add 'pressed' to @var controls[0].classList
 *          - For s: add 'pressed' to @var controls[1].classList
 *          - For d: add 'pressed' to @var controls[2].classList
 *          - For f: add 'pressed' to @var controls[3].classList
 * 5. After that we need an @if statement to check if the song is playing, and a note exists:
 *          - If @var playing is true AND @var tracks[0].firstChild
 *          * Note: You will need to do this for each track in its corresponding conditional. For Example:
 *                  - tracks[0].firstChild
 *                  - tracks[1].firstChild
 *                  - Etc.
 *          - Inside this conditional, we need to call @function resolveHit()
 *                  * Note: Pass our 'known' index as a parameter. For Example:
 *                  - resolveHit(0)
 *                  - resolveHit(1)
 *                  - Etc.
 * 
 * TODO: Create the keyup event listener for the controls.
 * 1.  Add a 'keyup' event listener to the document. Pass @param e in the callback function.
 * 2.  Inside the callback function, we will need to create a conditional statement very similar to the previous one:
 *          - If @param e.key is equal to 'a'
 *          - Else if @param e.key is equal to 's'
 *          - Else if @param e.key is equal to 'd'
 *          - Else if @param e.key is equal to 'f'
 * 3. Inside each conditional, we need to set the appropriate key in @var keyPressed to false, since the player is no longer holding the key
 *          - Example: @var keyPressed.a = false;
 * 4. Now, we need to remove the pressed class to show the buttons in the UI no longer being pressed:
 *          - For a: remove 'pressed' from @var controls[0].classList
 *          - For s: remove 'pressed' from @var controls[1].classList
 *          - For d: remove 'pressed' from @var controls[2].classList
 *          - For f: remove 'pressed' from @var controls[3].classList
 * 
 * TODO: Create the 'animationend' event listener for the notes.
 * 1.  Add an 'animationend' event listener to @var track. Pass @param e in the callback function.
 *     * Note: This indicates the note reached the end of its animation, so the user missed the key.
 * 2.  Increment @var streaks.miss by 1
 * 3.  Increment @var hits.miss by 1
 *     * Hint: You can use ++ to increment by 1.
 * 4.  Call @function checkGameEnd()
 * 5.  Call @function updateCombo() and pass @param 'miss'
 * 6.  Call @function updateView() and pass @param 'miss'
 * 7.  Remove the note: e.target.remove()
 * 8.  Move on to the next note by incrementing the @var songMap.song.tracks[].next by 1:
 *          - Use @param e.target.dataset.trackIndex as the index for @var songMap.song.tracks[].next
 * 
 * TODO: Add the 'animationend' event listener for the graded hits text.
 * 1.  Add an 'animationend' event listener to @var hitsEl. Pass @param e in the callback function.
 * 2.  Remove the hitText: e.target.remove()
 * 
 * TODO: Start the game!
 * 1. Call @function startGame()
 */



// ! =============================================================================
// ! FUNCTION: resolveHit() - Your code goes here.
// ! =============================================================================

function resolveHit(index) {
    let noteIndex = songMap.song.tracks[index].next;
    let note = songMap.song.tracks[index].notes[noteIndex];
    let accuracy = Math.abs(((Date.now() - startTime) / 1000) - (songMap.song.globalDuration + note.delay));
    let hit;

    if(accuracy > songMap.song.globalDuration / 4) {
        return
    };

    hit = grade(accuracy);
    hits[hits]++;
    updateCombo(hit);
    updateScore(hit);
    updateView(hit);
    tracks[index.firstChild].remove();
    songMap.song.tracks[index].next++;
};

// TODO ==========================================================================
// TODO: resolveHit() LOGIC
// TODO ==========================================================================
/**
 * TODO: Define some variables.
 * 1.  Create @var noteIndex and set it to @var songMap.song.tracks[@param index].next
 * 2.  Create @var note and set it to @var songMap.song.tracks[@param index].notes[@var noteIndex]
 * 3.  Create @var accuracy and set it to...
 *          - Math.abs(((Date.now() - @var startTime) / 1000) - (@var songMap.song.globalDuration + @var note.delay));
 *          * ((Date.now() - startTime) / 1000): This gets the exact time the key was pressed.
 *          * (songMap.song.globalDuration + note.delay): This gets the perfect timing of the note.
 *          * Math.abs() converts this into an absolute number to be used for our accuracy.
 * 4.  Create an empty @var hit
 * 
 * TODO: Prevent the player from pressing notes too early.
 * 1.  Create an @if conditional that checks:
 *          - If @var accuracy is greather than @var songMap.song.globalDuration / 4
 * 2.  Inside the if conditional: return
 * 
 * TODO: Process the hit.
 * 1.  Set @var hit to @function grade(@param accuracy)
 * 2.  Increment @var hits[@var hit] by 1
 * 3.  Call @function updateCombo and pass @var hit as the parameter.
 * 4.  Call @function updateScore and pass @var hit as the parameter.
 * 5.  Call @function updateView and pass @var hit as the parameter.
 * 6.  Remove the note from @var tracks[@param index].firstChild
 *          IMPORTANT: Don't confuse @param index with @var noteIndex 
 * 7.  Move on to the next note by incrementing @var songMap.song.tracks[@param index].next by 1
 */


// ! =============================================================================
// ! FUNCTION: grade() - Your code goes here.
// ! =============================================================================

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

// TODO ==========================================================================
// TODO: grade() LOGIC
// TODO ==========================================================================
/**
 * 1. Create an @if conditional that checks:
 *      -> If @param accuracy is less than 0.1
 *              -> Then return 'perfect'
 *      -> Else if @param accuracy is less than 0.2
 *              -> Then return 'good'
 *      -> Else if @param accuracy is less than 0.3
 *              -> Then return 'bad'
 *      -> Else then return 'miss'
 */


// ! =============================================================================
// ! FUNCTION: updateCombo() - Your code goes here.
// ! =============================================================================

function updateCombo(hit) {
    if(hit === 'bad' || hit === 'miss') {
        streaks.combo = 0
        multiplier.combo = 1.1
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

// TODO ==========================================================================
// TODO: updateCombo() LOGIC
// TODO ==========================================================================
/**
 * 1.  Create an @if conditional that checks:
 *          -> If @param hit is 'bad' or @param hit is 'miss'
 *                  -> Set @var streaks.combo to 0
 *                  -> Set @var multiplier.combo to 1.1
 *          -> Else
 *                  -> Increment @var streaks.combo by 1
 *                  -> Add 0.1 to the current value of @var multiplier.combo 
 *                  -> Create another @if conditional that checks:
 *                          -> If @var streaks.combo is greater than @var streaks.top
 *                                  -> Set @var streaks.top to @var streaks.combo
 *                  -> Create another @if conditional that checks:
 *                          -> If @var streaks.miss is greater than 0
 *                                  -> Decrement @var streaks.miss by 1
 */


// ! =============================================================================
// ! FUNCTION: updateScore() - Your code goes here.
// ! =============================================================================

function updateScore(hit) {
    if(streaks.combo > 0) {
        score += 100 * multiplier[hit] * multiplier.combo;
    } else {
        score += 100 * multiplier[hit];
    }
}

// TODO ==========================================================================
// TODO: updateScore() LOGIC
// TODO ==========================================================================
/**
 * 1.  Create an @if conditional that checks:
 *          -> If @var streaks.combo is greater than 0
 *                  -> Add 100 * @var multiplier[@param hit] * @var multiplier.combo to the current value of @var score
 *          -> Else add 100 * @var multiplier[@param hit] to the current value of @var score
 */

// ! =============================================================================
// ! FUNCTION: checkGameEnd() - Your code goes here.
// ! =============================================================================

function checkGameEnd() {
    if(streaks.miss === songMap.song.maxMiss) {
        gameOver()
    } else {
        return;
    }
}

// TODO ==========================================================================
// TODO: checkGameEnd() LOGIC
// TODO ==========================================================================
/**
 * 1.  Create an @if conditional that checks:
 *          -> If @var streaks.miss is equal to @var songMap.song.maxMiss
 *                  -> Call @function gameOver()
 *          -> Else return
 */


// ! =============================================================================
// ! FUNCTION: updateView() - Your code goes here.
// ! =============================================================================

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
    hitEl.style.animationName = 'fadehit'
    hitEl.style.animationDuration = '500ms'
    hitEl.style.animationPlayState = 'running'
    hitsEl.appendChild(hitEl)
}

// TODO ==========================================================================
// TODO: updateView() LOGIC
// TODO ==========================================================================
/**
 * TODO: Logic to update the score / combo text.
 * 1.  Set the inner text of @var scoreEl to Math.floor(@var score)
 * 2.  Set the inner text of @var comboEl to @var streaks.combo + 'x'
 * 
 * TODO: Logic to update the view if the player is in a miss streak.
 * * Note: This is a nested conditional.
 * 1.  Create an @ifelse conditional that checks:
 *          -> If @var songMap.song.difficulty is equal to 'easy', 'normal', or 'hard'
 * 2.  Inside each of the corresponding conditionals, we need another set of @ifelse statements:
 *          -> If @var streaks.miss is greater than or equal to...
 *                  -> 6 for easy
 *                  -> 3 for normal
 *                  -> 1 for hard
 * 3.  Inside the "if" part of the second set of conditionals:
 *          -> Set @var game.className to ''
 *          -> Add 'black' to @var game.classList
 * 4.  In the "else" part of the second set of conditionals:
 *          -> Set @var game.className to ''
 *          -> Add @var songMap.song.colorScheme to @var game.ClassList
 * 5.  Do this for each difficulty.
 * 
 * TODO: Logic to add the graded hit text.
 * 1.  Use the DOM to create a div element and assign it to a variable called @var hitEl
 * 2.  Add 'hit' to @var hitEl.classList
 * 3.  Set the inner text of @var hitEl to @param accuracy
 * 4.  Update styles for @var hitEl:
 *          -> animationName = 'fadeHit'
 *          -> animationDuration = '500ms'
 *          -> animationPlayState = 'running'
 * 5.  Append @var hitEl to @var hitEls <-- Note the multiples.
 */


// ! =============================================================================
// ! FUNCTION: startGame() - Your code goes here.
// ! =============================================================================

function startGame() {
    startTime = Date.now()

    let timer = songMap.song.duration;
    let min;
    let sec;

    let songDurationInterval = setInterval(() => {
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
        wave.fromElement("audio", "audio-wave", {
            type: "dualbars",
            colors: [songMap.song.waveColor]
        })}
    ), songMap.song.globalDuration * 1000;

        document.querySelectorAll('.note').forEach((note) => {
            note.style.animationPlayState = 'running'
        });
}

// TODO ==========================================================================
// TODO: startGame() LOGIC
// TODO ==========================================================================
/**
 * TODO: Set some variables.
 * 1.  Set @var startTime to Date.now()
 * 2.  Create @var timer and set it to @var songMap.song.duration
 * 3.  Create an empty @var min
 * 4.  Create an empty @var sec
 * 
 * TODO: Create the songDurationInterval.
 * * Note: This will track how much time we have left in the song. When it's over, it calls winGame()
 * * Set Interval (W3Schools): https://www.w3schools.com/jsref/met_win_setinterval.asp
 * 1.  Create @var songDurationInterval and assign it to setInterval(...)
 * 2.  Set the interval to 1000
 * 3.  Inside the interval:
 *          -> Set @var min to Math.floor(@var timer / 60)
 *          -> Set @var sec to timer % 60
 *          -> Set @var min to @var min < 10 ? '0' + @var min : @var min
 *          -> Set @var sec to @var sec < 10 ? '0' + @var sec : @var sec
 *          * Note: All this is doing is getting our timer in minutes and seconds format.
 *          -> Create an @if conditional that checks:
 *                  -> If --timer is less than 0
 *                          -> Call @function clearInterval and pass @var songDurationInterval as the parameter.
 *                          -> Call @function winGame()
 * 
 * TODO: Update the progressBar's style.
 * 1.  Set the following styles for @var progressBar:
 *          -> Set animationName to 'progressBar'
 *          -> Set animationTimingFunction to 'linear'
 *          -> Set animationFillMode to 'both'
 *          -> set animationDuration to @var songMap.song.duration + 's'
 *          -> set animationDelay to @var songMap.song.globalDuration + 's'
 *          -> set animationPlayState to 'running'
 * 
 * TODO: Set a timeout for starting the audio.
 * * setTimeout (MDN): https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
 * 1.  Create a setTimeout using a wrapper function (use arrow function syntax)
 * 2.  Inside the wrapper function:
 *          -> Call the play method from @var audio
 *          -> Set @var playing to true
 *          -> Initialize Wave.js:
 *                  -> wave.fromElement("audio", "audio-wave", {type: "dualbars", colors: [songMap.song.waveColor]});
 * 3.  Set the timeout value to: @var songMap.song.globalDuration * 1000
 * 
 * TODO: LET THE NOTES LOOSE! BE FREEEE!!!~~
 * 1.  Use the DOM to select ALL '.note' elements and use a @forEach loop to iterate through them.
 * 2.  Pass @param note in the callback function as a parameter.
 * 3.  Inside the callback function, set @param note.style.animationPlayState to 'running'
 */


// ! =============================================================================
// ! FUNCTION: gameOver() - Your code goes here.
// ! =============================================================================

function gameOver() {
    fadeInterval = setInterval(fadeAudio, 75)
    progressBar.style.animationPlayState = 'paused'
    gameOverSFX()

    document.querySelectorAll('.note').forEach((note) => {
        note.style.opacity = 1
        setInterval(function() {
            note.style.opactiy -= 1
                if(note.style.opacity <= 0.0) {
                    note.remove()
            }
        })
    })
}

// TODO ==========================================================================
// TODO: gameOver() LOGIC
// TODO ==========================================================================
/**
 * 1.  Set @var fadeInterval to setInterval(fadeAudio, 75)
 * 2.  Set the animationPlayState of @var progressBar to 'paused'
 * 3.  Play @var gameOverSFX
 * 4.  Use the DOM to select ALL '.note' elements and use a @forEach loop to iterate through them.
 *          -> Pass @param note in the callback funtion as a parameter.
 * 5.  Inside the callback function:
 *          -> Set the opacity of @param note to 1
 *          -> Set an interval with 75ms
 * 6.  Inside the interval:
 *          -> Set the opacity of @param note to -= 1
 *          -> Create an @if conditional that checks:
 *                  -> If @param note opacity is less than or equal to 0.0:
 *                          -> Remove @param note
 */


// ! =============================================================================
// ! FUNCTION: winGame() - Your code goes here.
// ! =============================================================================

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

// TODO ==========================================================================
// TODO: winGame() LOGIC
// TODO ==========================================================================
/**
 * Challenge: See if you can figure out what variables to use for this data on your own!
 * 1.  Create @var newScore with the following key : value pairs:
 *          -> song: The name of the song
 *          -> score: Make sure it's not a decimal!
 *          -> streak: Their top streak
 *          -> new: true
 * 2.  Push the @var newScore into the @var scoreBoard array.
 * 3. Console log:
 *          -> The number of perfect hits.
 *          -> The number of good hits.
 *          -> The number of bad hits.
 *          -> The number of missed hits.
 *          -> The score.
 *          -> The top streak.
 * * Note: We will need to work on this function more when we get the leaderboard screen running.
 */


// ! =============================================================================
// ! FUNCTION: fadeAudio() - Your code goes here.
// ! =============================================================================

function fadeAudio() {
    volume = audio.volume - 0.1
    if(volume >= 0) {
        audio.volume = volume
    } else {
        clearInterval(fadeInterval)
        audio.volume = 0
        audio.pause()
        audiocurrentTime = 0
    }
}

// TODO ==========================================================================
// TODO: fadeAudio() LOGIC
// TODO ==========================================================================
/**
 * 1.  Create @var volume and set it to @var audio.volume - 0.1
 * 2.  Create an @ifelse conditional statement that checks:
 *          -> If @var volume is greater than or equal to 0:
 *                  -> Set @var audio.volume to @var volume
 *          -> Else:
 *                  -> clearInterval(@var fadeInterval)
 *                  -> Set @var audio.volume to 0
 *                  -> Pause @var audio
 *                  -> Set @var audio.currentTime to 0
 * 
 */