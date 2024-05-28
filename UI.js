const blessed = require('blessed');
const socketIOClient = require('socket.io-client');
console.log("blessed")
// Create a screen
const screen = blessed.screen({
    smartCSR: true
});

// Object to map alert severities to colors
const colors = {
    high: 'red',
    medium: 'yellow', // Changed from orange
    low: 'green'
};

// Array to store the boxes for each alert
const boxes = [];

// Function to create a new colored box based on the alert severity
const createBox = (severity) => {
    const color = getColor(severity);
    const box = createColoredBox(color);
    addBoxToScreen(box);
};

// Get color based on severity
const getColor = (severity) => colors[severity] || 'blue'; // Default to blue if severity is not recognized

// Create a colored box
const createColoredBox = (color) => {
    const boxSize = 2; // Adjusted size to create perfect squares
    return blessed.box({
        width: boxSize,
        height: boxSize,
        top: getNextBoxTopPosition(),
        left: getNextBoxLeftPosition(),
        content: ' ',
        style: {
            bg: color
        }
    });
};

// Calculate the top position of the next box
const getNextBoxTopPosition = () => {
    const currentLine = Math.floor(boxes.length / (screen.width / 2));
    return (currentLine * 2) + 1; // Adjusted to avoid overlapping with previous box
};

// Calculate the left position of the next box
const getNextBoxLeftPosition = () => {
    const totalWidth = boxes.length % (screen.width / 2) * 2; // Adjusted to handle half-width squares
    return totalWidth;
};

// Add box to the screen and store it in the array
const addBoxToScreen = (box) => {
    screen.append(box);
    boxes.push(box);
    screen.render();
};

// Create a socket connection
const socket = socketIOClient('http://localhost:3000');

// Handling alerts received from the server
socket.on('alert-dash', (alert) => {
    const severity = alert.payload.severity;
    // console.log(severity)
    createBox(severity);
});

// Quit on Escape, q, or Control-C
screen.key(['escape', 'q', 'C-c'], (ch, key) => {
    return process.exit(0);
});

// Render the screen
screen.render();
