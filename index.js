'use strict';
require('dotenv').config()
const io = require('socket.io-client');
const clientURL = process.env.URL;

const optionMap = {}; // Map options to letters
const socket = io(clientURL); // Assuming the server is running locally on port 3000
let isCorrect = null;
let CORRECT_ANSWER = null;
let QUESTION = null;

const readline = require('readline');
const {shuffle} = require("./utility");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('fetchTriviaQuestion'); // Request a trivia question when connected
});

function clearConsole() {
    // Clear the console
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    rl.write(null, { ctrl: true, name: 'l' });
}

socket.on('timer', (timeLeft) => {
    clearConsole();
    console.log(`Time remaining: ${timeLeft} seconds`);
    console.log('Trivia Question:', QUESTION);
    // Print options
    for (const [key, value] of Object.entries(optionMap)) {
        console.log(`${key}. ${value}`);
    }
    askForGuess(CORRECT_ANSWER, optionMap);
});

socket.on('triviaQuestion', ({ question, options, correctAnswer }) => {
    CORRECT_ANSWER = correctAnswer;
    QUESTION = question;

    console.log('Trivia Question:', question);
    options.forEach((option, index) => {
        console.log(`${String.fromCharCode(65 + index)}. ${option}`);
    });
let shuffled = shuffle(options);
    console.log("SHUFFLED:", options);
    shuffled.forEach((option, index) => {
        optionMap[String.fromCharCode(65 + index)] = option;
    });

    socket.emit('timer'); // Start the timer when the question is received
    socket.off('TriviaQuestion', question);
});

socket.on('error', (message) => console.error('Error:', message));

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
        socket.emit('sendGuess', guess, isCorrect); // Send the guess and whether it's correct to the server
        process.stdin.pause(); // Pause input stream

    });
}

socket.on('guessAcknowledgment', (acknowledgment) => {
    if (isCorrect) {
        console.log('Your guess is correct!\n');
    } else {
        console.log('Incorrect guess. Better luck next time!');

    }
    socket.off('guessAcknowledgment', acknowledgment);
});


// Handle unexpected errors
process.on('uncaughtException', (error) => {
    console.error('An unexpected error occurred:', error);
});
