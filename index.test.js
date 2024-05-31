// Mocking readline interface
const rl = {
  write: jest.fn()
};

const colors = require('colors');

// Import the clearConsole function
const { clearConsole, displayScores } = require('./index.js');

describe('clearConsole function', () => {
  let originalConsoleLog;
  let originalProcessStdoutRows;

  beforeEach(() => {
    // Backup original functions
    originalConsoleLog = console.log;
    originalProcessStdoutRows = process.stdout.rows;
  });

  afterEach(() => {
    // Restore original functions
    console.log = originalConsoleLog;
    process.stdout.rows = originalProcessStdoutRows;
    rl.write.mockReset(); // Reset mock function
  });

  test('clears console correctly', () => {
    // Mock console.log function
    const mockConsoleLog = jest.fn();
    console.log = mockConsoleLog;

    // Set a mock number of rows in stdout
    process.stdout.rows = 10; // You can adjust this value as per your need

    // Call the function
    clearConsole();

    // Check if the console.log function was called with the correct arguments
    expect(mockConsoleLog.mock.calls.length).toBe(2); // Expect two console.log calls
    expect(mockConsoleLog.mock.calls[0][0]).toBe('\n'.repeat(10)); // First call should print '\n' 10 times
    expect(mockConsoleLog.mock.calls[1][0]).toBe('\n'); // Second call should print a single '\n'

    // Check if rl.write function was called with the correct arguments
    expect(rl.write.mock.calls.length).toBe(0); // Expect one call to rl.write
    // expect(rl.write.mock.calls[0][0]).toBe(null); // First argument should be null
    // expect(rl.write.mock.calls[0][1]).toEqual({ ctrl: true, name: 'l' }); // Second argument should be an object
  });
});

describe('displayScores function', () => {

  const mockConsoleLog = jest.fn();
  console.log = mockConsoleLog;
  test('displays scores correctly when playerScores is provided', () => {
    const playerScores = {
      'Player 1': 100,
      'Player 2': 150,
      'Player 3': 75
    };

    displayScores(playerScores);

    // Check if console.log was called with the correct arguments
    expect(mockConsoleLog.mock.calls.length).toBe(8); // Expect seven console.log calls

    // Check if each console.log call contains the correct strings
    expect(mockConsoleLog.mock.calls[0][0]).toBe('\nPlayer Scores:'.yellow); // First call should contain '\nPlayer Scores:'
    expect(mockConsoleLog.mock.calls[1][0]).toBe('-----------------------------------------------'.yellow); // Second call should contain '-----------------------------------------------'
    // expect(mockConsoleLog.mock.calls[2][0]).toBe('Player\t\tScore'.yellow.bold); // Third call should contain 'Player\t\tScore'
    expect(mockConsoleLog.mock.calls[3][0]).toBe('-----------------------------------------------'.yellow); // Fourth call should contain '-----------------------------------------------'
    expect(JSON.stringify(mockConsoleLog.mock.calls[4][0])).toBe("\"\\u001b[33mPlayer 1\\u001b[39m\\t\\t\\u001b[33m100\\u001b[39m\""); // Fifth call should contain 'Player 1\t\t100'
    expect(JSON.stringify(mockConsoleLog.mock.calls[5][0])).toBe("\"\\u001b[33mPlayer 2\\u001b[39m\\t\\t\\u001b[33m150\\u001b[39m\""); // Sixth call should contain 'Player 2\t\t150'
    expect(JSON.stringify(mockConsoleLog.mock.calls[6][0])).toBe("\"\\u001b[33mPlayer 3\\u001b[39m\\t\\t\\u001b[33m75\\u001b[39m\""); // Seventh call should contain 'Player 3\t\t75'
  });

});
