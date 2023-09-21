import { fileURLToPath } from 'url';
import * as path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



import * as electron from "electron";

const createWindow = function()
{
  const win = new electron.BrowserWindow
  (
    {
      width: 1280,
      minWidth: 1280,
      height: 720,
      minHeight: 720,
      center: true,
      resizable: true,
      movable: true,
      minimizable: true,
      maximizable: false,
      fullscreenable: true,
      acceptFirstMouse: true,
      backgroundColor: "rgba(0, 0, 0, 1.0)", // prevents white showing when resizing window
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        devTools: true,
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        webSecurity: true,
        webgl: true,
        experimentalFeatures: true,
        scrollBounce: false,
        enableBlinkFeatures: "",
        autoplayPolicy: "no-user-gesture-required",
        spellcheck: false,
        v8CacheOptions: "code",
      },
      show: false // we need to wait until ready
    }
  );

  win.removeMenu(); // TODO: test macOS

  win.webContents.openDevTools({ mode: 'detach' });

  win.loadFile(path.join(__dirname, '../_build/index.html'));

  // waiting here prevents white flash
  win.on
  ('ready-to-show', function()
    {
      win.show();
      win.focus();
    }
  );
};

electron.app.whenReady()
.then
(function()
  {
    createWindow()

    electron.app.on('activate', () => {
      if (electron.BrowserWindow.getAllWindows().length === 0) createWindow()
    })

  }
);

electron.app.on
('window-all-closed', function()
  {
  if (process.platform !== 'darwin') electron.app.quit()
  }
);