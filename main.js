// main.js - The heart of your Electron application
const { app, BrowserWindow } = require('electron');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  // and load the index.html of the app.
  win.loadFile('src/index.html');
}

// This method will be called when Electron has finished initialization.
app.whenReady().then(createWindow)