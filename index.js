'use strict';
require('dotenv').config();
const io = require('socket.io-client');
const clientURL = process.env.URL;

const optionMap = {}; // Map options to letters
const socket = io(clientURL); // Assuming the server is running locally on port 3000
let isCorrect = null;
let CORRECT_ANSWER = null;

process.stdout.write('Enter your name: ');

let userName = '';

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
        CORRECT_ANSWER = correctAnswer;
        console.log('-----------------------------------------------');
        console.log(playerScores);
        console.log('Trivia Question:', question);
        console.log('Options :');
        options.forEach((option, index) => {
            console.log(`${String.fromCharCode(65 + index)}. ${option}`);
            optionMap[String.fromCharCode(65 + index)] = option;
        });
        askForGuess(correctAnswer, optionMap); // Ask for guess after displaying the question
    });

    // Handle unexpected errors
    socket.on('error', (message) => console.error('Error:', message));
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
        socket.emit('sendGuess', guess); // Send the guess and whether it's correct to the server
        const userUpdate = {
            "userName": userName,
            "isCorrect":isCorrect

        }
        socket.emit('checkAnswer', userUpdate)
        process.stdin.pause(); // Pause input stream
    });
}

socket.on('guessAcknowledgment', (acknowledgment) => {
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
