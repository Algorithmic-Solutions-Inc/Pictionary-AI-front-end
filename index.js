'use strict';
require('dotenv').config();
const io = require('socket.io-client');
const clientURL = process.env.URL;

const optionMap = {}; // Map options to letters
const socket = io(clientURL); // Assuming the server is running locally on port 3000
let isCorrect = null;
let CORRECT_ANSWER = null;
let QUESTION = null;
let PLAYERSCORES = null;



const readline = require('readline');
const {shuffle} = require("./utility");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let userName = '';

    process.stdout.write('Enter your name: ');

process.stdin.once('data', (data) => {

    userName = data.toString().trim(); // Trim whitespace from the input

    console.log(`Hello, ${userName}!`);
    
    // Emit 'joinRoom' event after capturing the username
    socket.emit('joinRoom', {
        roomId: 'mainRoom',
        userName: userName
    });

    // Start listening for trivia questions after joining the room
    socket.on('triviaQuestion', ({ question, options, correctAnswer, playerScores }) => {
        PLAYERSCORES = playerScores;

        QUESTION = question;
        CORRECT_ANSWER = correctAnswer;
        console.log('-----------------------------------------------');
        console.log(playerScores);
        console.log('Trivia Question:', question);
        console.log('Options :');
        shuffle(options);
        options.forEach((option, index) => {
            console.log(`${String.fromCharCode(65 + index)}. ${option}`);
            optionMap[String.fromCharCode(65 + index)] = option;
        });
        askForGuess(correctAnswer, optionMap); // Ask for guess after displaying the question
    });

    // Handle unexpected errors
    socket.on('error', (message) => console.error('Error:', message));
});

function clearConsole() {
    // Clear the console
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    rl.write(null, { ctrl: true, name: 'l' });
}

socket.on('timer', (timeLeft) => {
    console.log('timer log');
    clearConsole();
    console.log('-----------------------------------------------');
    console.log(PLAYERSCORES);
    console.log(`Time remaining: ${timeLeft} seconds`);
    console.log('Trivia Question:', QUESTION);
    // Print options
    for (const [key, value] of Object.entries(optionMap)) {
        console.log(`${key}. ${value}`);
    }
    askForGuess(CORRECT_ANSWER, optionMap);
});


function askForGuess(correctAnswer, optionMap) {
    process.stdout.write('Enter your guess (A, B, C, D, etc.): ');
    console.log("HINT", correctAnswer)
    process.stdin.resume(); // Resume input stream
    process.stdin.once('data', (data) => {
        const guess = data.toString().trim().toUpperCase(); // Convert the guess to uppercase

        if (!optionMap[guess]) {
            console.error('Invalid input. Please enter a valid option.');
            process.stdin.pause(); // Pause input stream
            return;
        }


        isCorrect = optionMap[guess] === correctAnswer; // Compare the guess with the correct answer
        socket.emit('sendGuess', isCorrect); // Send the guess and whether it's correct to the server

        process.stdin.pause(); // Pause input stream
    });
}

socket.on('guessAcknowledgment', (acknowledgment) => {
    const userUpdate = {
        "userName": userName,
        "isCorrect":isCorrect
    }

    socket.emit('checkAnswer', userUpdate);
    socket.off('checkAnswer', userUpdate);
    if (isCorrect) {
        console.log('Your guess is correct!\n');
    } else {
        console.log('Incorrect guess. Better luck next time!');
        // askForGuess(CORRECT_ANSWER, optionMap); // option:another guess if incorrect
    }
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
    console.error('An unexpected error occurred:', error);
});
