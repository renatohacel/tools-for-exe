import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

app.on('ready', () => {
    // Ejecuta el backend usando fork
    const backendPath = path.join(__dirname, 'src', 'index.js');
    const backendProcess = fork(backendPath, [], {
        stdio: 'inherit',
    });

    backendProcess.on('error', (error) => {
        console.error('Error al iniciar el backend:', error);
    });

    backendProcess.on('exit', (code, signal) => {
        console.log(`El backend terminó con el código ${code} y señal ${signal}`);
    });

    // Crea la ventana principal
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            contextIsolation: true,
        },
        autoHideMenuBar: true,  // Oculta la barra de menú automáticamente
    });

    // Alternativamente, puedes eliminar el menú completamente
    Menu.setApplicationMenu(null);

    // Carga la aplicación frontend
    mainWindow.loadURL('http://localhost:3000'); // Ajusta el puerto según tu backend

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            backendProcess.kill();  // Detiene el backend al cerrar la aplicación
            app.quit();
        }
    });
});
