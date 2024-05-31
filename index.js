'use strict';
require('dotenv').config();
const io = require('socket.io-client');

const clientURL = process.env.URL;
const colors = require('colors');
const he = require('he');
const readline = require('readline')

const socket = io(clientURL);
let optionMap = {}; // Map options to letters
let CORRECT_ANSWER = null;
let QUESTION = null;
let PLAYERSCORES = null;
const {shuffle} = require("./utility");

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let userName = '';
let guessToServer = ''
process.stdout.write('Enter your name: ');

process.stdin.once('data', (data) => {
    userName = data.toString().trim(); // Trim whitespace from the input

    console.log(`Welcome, ${userName}!`);

    // Define the event listener function
    function handleInput(data) {
        const guess = data.toString().trim().toUpperCase();
        console.log("Guess entered !", guess, optionMap[guess])
        guessToServer = optionMap[guess];
        if (!optionMap[guess]) {
            console.error('Invalid input. Please enter a valid option.');
            askForGuess(); // Ask for guess again
            return;
        }
        socket.emit('sendGuess', guessToServer); // Send the guess and whether it's correct to the server
    }

    // Emit 'joinRoom' event after capturing the username
    socket.emit('joinRoom', {
        roomId: 'mainRoom',
        userName: userName
    });

    // Start listening for trivia questions after joining the room
    socket.on('triviaQuestion', ({question, options, correctAnswer, playerScores}) => {
        PLAYERSCORES = playerScores;
        QUESTION = he.decode(question);
        CORRECT_ANSWER = he.decode(correctAnswer);
        clearConsole();

        askForGuess(); // Ask for guess after displaying the question
        console.log('\n-----------------------------------------------');
        displayScores(playerScores);
        console.log('Trivia Question:', question || "Waiting for Question");
        console.log('Options :');
        shuffle(options);
        options.forEach((option, index) => {
            console.log(`${String.fromCharCode(65 + index)}. ${he.decode(option)}`);
            optionMap[String.fromCharCode(65 + index)] = he.decode(option);
        });
    });

    // Handle unexpected errors
    socket.on('error', (message) => console.error('Error:', message));

    function clearConsole() {
        const blank = '\n'.repeat(process.stdout.rows);
        console.log(blank);
        console.log('\n');
        rl.write(null, {ctrl: true, name: 'l'});
    }

    socket.on('timer', (timeLeft) => {
        clearConsole();
        console.log('\n-----------------------------------------------');
        displayScores(PLAYERSCORES);
        // process.stdout.clearLine(0);
        console.log(`Time remaining: ${timeLeft} seconds`);
        console.log('Trivia Question:', QUESTION || "Waiting for Question");
        // Print options
        for (const [key, value] of Object.entries(optionMap)) {
            console.log(`${key}. ${value}`);
        }
        console.log("HINT", CORRECT_ANSWER);
    });

    function askForGuess() {
        // if (rl) {
        //     rl.close(); // Close any previous readline interface
        // }
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter your guess (A, B, C, D, etc.): ', handleInput);
    }

    socket.on('guessAcknowledgment', (USER_NAME, isCorrect) => {
        console.log("GUESS ACK", USER_NAME)
        console.log(isCorrect, "----------received")
        if (isCorrect) {
            console.log(`${USER_NAME.toUpperCase()}, ANSWERED CORRECTLY!`.bold);
        } else{
            console.log('Incorrect guess. Better luck next time!'.bold.red);
        }
    });

    process.on('uncaughtException', (error) => {
        console.error('An unexpected error occurred:', error);
    });

    function displayScores(playerScores) {
        if (playerScores) {
            console.log('\nPlayer Scores:');
            console.log('-----------------------------------------------');
            console.log('Player\t\tScore');
            console.log('-----------------------------------------------');
            Object.entries(playerScores).forEach(([player, score]) => {
                console.log(`${player}\t\t${score}`);
            });
            console.log('-----------------------------------------------\n');
        }
    }
});
