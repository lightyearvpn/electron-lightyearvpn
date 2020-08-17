const { ipcMain, app, BrowserWindow, Menu, Tray, Notification, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const child_process = require('child_process');
const log = require('electron-log');
const sudoPrompt = require('sudo-prompt');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const store = new Store();
const DOMAIN = 'https://lightyearapp.club'
const DOMAIN_DEFAULT = 'https://lightyearvpn.com'
const TELEGRAM = `https://t.me/lightyearvpn`;
const GITHUB = `https://github.com/lightyearvpn/LightyearVPN`;

let appConfigDir = app.getPath('userData')
let mainWindow, 
  tray, 
  logo, 
  icon, 
  icns,
  trayIcon, 
  trayIconConnected,
  sslocal,
  proxy_conf_helper,
  privoxy,
  privoxy_config,
  privoxy_config_template,
  privoxy_child,
  sslocal_child,
  vpnStatus = 'not_connected',
  app_os = process.platform,
  app_arch = isOSWin64() ? 'x64' : 'x32',
  app_version = app.getVersion(),
  appname = 'electron-lightyearvpn';

// setup file path
if (isDev) {
  if (process.platform === 'win32') {
    logo = path.join(__dirname, '../', '../', 'resources', 'assets', 'icon.png');
    icon = path.join(__dirname, '../', '../', 'resources', 'assets', 'icon.ico');
    icns = path.join(__dirname, '../', '../', 'resources', 'assets', 'icon.icns');
    trayIcon = path.join(__dirname, '../', '../', 'resources', 'assets', 'TrayWin.png');
    trayIconConnected = path.join(__dirname, '../', '../', 'resources', 'assets', 'TrayConnectedWin.png');
    sslocal = path.join(__dirname, '../', '../', 'resources', 'sslocal.exe')
    proxy_conf_helper = path.join(__dirname, '../', '../', 'resources', 'sysproxy.exe');
    privoxy = path.join(__dirname, '../', '../', 'resources', 'privoxy.exe');
    privoxy_config_template = path.join(__dirname, '../', '../', 'resources', 'privoxy_config_template.txt');
    privoxy_config = path.join(appConfigDir, 'privoxy_config.txt');
  } else if (process.platform === 'darwin') {
    logo = path.join(__dirname, '../', '../', 'resources', 'assets', 'icon.png');
    icon = path.join(__dirname, '../', '../', 'resources', 'assets', 'icon.ico');
    icns = path.join(__dirname, '../', '../', 'resources', 'assets', 'icon.icns');
    trayIcon = path.join(__dirname, '../', '../', 'resources', 'assets', 'TrayTemplate.png');
    trayIconConnected = path.join(__dirname, '../', '../', 'resources', 'assets', 'TrayConnectedTemplate.png');
    sslocal = path.join(__dirname, '../', '../', 'resources', 'sslocal');
    proxy_conf_helper = path.join(__dirname, '../', '../', 'resources', 'proxy_conf_helper');
    privoxy = path.join(__dirname, '../', '../', 'resources', 'privoxy');
    privoxy_config_template = path.join(__dirname, '../', '../', 'resources', 'privoxy_config_template.txt');
    privoxy_config = path.join(appConfigDir, 'privoxy_config.txt');
  } else if (process.platform === 'linux') {
  }
} else {
  if (process.platform === 'win32') {
    logo = path.join(__dirname, '../', '../', 'assets', 'icon.png');
    icon = path.join(__dirname, '../', '../', 'assets', 'icon.ico');
    icns = path.join(__dirname, '../', '../', 'assets', 'icon.icns');
    trayIcon = path.join(__dirname, '../', '../', 'assets', 'TrayWin.png');
    trayIconConnected = path.join(__dirname, '../', '../', 'assets', 'TrayConnectedWin.png');
    sslocal = path.join(__dirname, '../', '../', 'sslocal.exe')
    proxy_conf_helper = path.join(__dirname, '../', '../', 'sysproxy.exe');
    privoxy = path.join(__dirname, '../', '../', 'privoxy.exe');
    privoxy_config_template = path.join(__dirname, '../', '../', 'privoxy_config_template.txt');
    privoxy_config = path.join(appConfigDir, 'privoxy_config.txt');
  } else if (process.platform === 'darwin') {
    logo = path.join(__dirname, '../', '../', 'assets', 'icon.png');
    icon = path.join(__dirname, '../', '../', 'assets', 'icon.ico');
    icns = path.join(__dirname, '../', '../', 'assets', 'icon.icns');
    trayIcon = path.join(__dirname, '../', '../', 'assets', 'TrayTemplate.png');
    trayIconConnected = path.join(__dirname, '../', '../', 'assets', 'TrayConnectedTemplate.png');
    sslocal = path.join(__dirname, '../', '../', 'sslocal');
    proxy_conf_helper = path.join(__dirname, '../', '../', 'proxy_conf_helper');
    privoxy = path.join(__dirname, '../', '../', 'privoxy');
    privoxy_config_template = path.join(__dirname, '../', '../', 'privoxy_config_template.txt');
    privoxy_config = path.join(appConfigDir, 'privoxy_config.txt');
  } else if (process.platform === 'linux') {
    // todo, supports linux
  }
}

// check if single instance
const singleInstance = app.requestSingleInstanceLock()
if (!singleInstance) {
  app.quit()
}

process.on('uncaughtException', (error) => {
  log.error('uncaughtException', error)
})

// setup when app start
async function setup() {
  log.info('setup invoked')
  // fix notification in windows
  app.setAppUserModelId("com.electron.lightyearvpn");

  // setup tray and window
  createTray()
  createWindow()

  // make sure process closed
  stopSslocal()
}

function createWindow() {
  log.info('createWindow invoked')
  mainWindow = new BrowserWindow({
    backgroundColor: '#f1f1f1',
    // icon: icon,
    title: appname,
    width: 800,
    height: 600,
    center: true,
    resizable: false,
    maximizable: false,
    fullscreen: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(isDev ? `http://localhost:3000` : `file://${path.join(__dirname, '../', 'build', `index.html?`)}`);
  isDev && mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => mainWindow = null);
}

function createTray() {
  log.info('createTray invoked')
  tray = new Tray(trayIcon)
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "打开应用",
      click: () => {
        if (!mainWindow) createWindow()
        else mainWindow.show()
      }
    },
    {
      label: "打开光年VPN官网",
      click: () => {
        shell.openExternal(`${DOMAIN}`)
      }
    },
    {
      label: "打开Github",
      click: () => {
        shell.openExternal(`${GITHUB}`)
      }
    },
    {
      label: "打开Telegram",
      click: () => {
        shell.openExternal(`${TELEGRAM}`)
      }
    },
    { type: 'separator' },
    {
      label: "退出", 
      click: () => {
        app.quit();
      }
    }
  ])

  tray.setToolTip(appname)
  tray.setContextMenu(contextMenu)

  // works in windows only
  tray.on('double-click', () => {
    if (!mainWindow) createWindow()
    else mainWindow.show()
  })
  tray.on('click', () => {
    if (!mainWindow) createWindow()
    else mainWindow.show()
  })
}

// sslocal
async function startSslocal(data) {
  log.info('startSslocal invoked')

  try {
    startProxy(data)
    startPrivoxy(data)

    const mode = data.mode;
    const localAddress = data.localAddress;
    const localPort = data.localPort;

    // run sslocal
    let args = [
      "-s", data.ip,
      "-p", data.port,
      "-k", data.password,
      "-m", data.method,
      "-b", localAddress,
      "-l", localPort,
    ]

    /*SSR libev params*/
    // example ./ss-local -s nihao123.ml -p 443 -m chacha20 -k qhjyJZCRDLlD -l 1080 --plugin ./v2ray-plugin --plugin-opts "tls;host=nihao123.ml"
    log.info('sslocal starting', `${mode}`, `${localAddress}:${localPort}`)
    sslocal_child = child_process.execFile(sslocal, args, (error, stdout, stderr) => {
      if (stdout) log.info(`startSslocal stdout`, stdout)
      if (error) log.error(`startSslocal error`, error)
      if (stderr) log.error(`startSslocal stderr`, stderr)
    })

    // output
    sslocal_child.stdout.on('data', (body) => {
      log.info('sslocal_child stdout', body.toString()); 
    });
    
    // error
    sslocal_child.stderr.on('data', (body) => {
      log.error('sslocal_child stderr', body.toString()); 
    });
  } catch (error) {
    log.error('startSslocal error', error)
    throw error;
  }
}

function stopSslocal() {
  log.info('stopSslocal invoked')
  updateStatus('not_connected')
  stopProxy()
  stopPrivoxy()

  if (process.platform === 'win32') {
    child_process.execFile("taskkill.exe", ["/F", "/IM", "sslocal.exe"]);
    child_process.execFile("taskkill.exe", ["/F", "/IM", "sslocal.exe"]);
    child_process.execFile("taskkill.exe", ["/F", "/IM", "sslocal.exe"]);
  } else if (process.platform === 'darwin') {
    child_process.execFile("killall", ["sslocal"]);
    child_process.execFile("killall", ["sslocal"]);
    child_process.execFile("killall", ["sslocal"]);
  } else {
    // todo, linux
  }

  sslocal_child = null;
}

// privoxy
function startPrivoxy(data) {
  log.info('startPrivoxy invoked')

  try {
    const localPort = data.localPort;
    const privoxyPort = data.privoxyPort;
    // update privoxy config file for dynamic ports
    let config = fs.readFileSync(privoxy_config_template, 'utf8')
    config = config.replace(/{LOCAL_PORT}/g, localPort);
    config = config.replace(/{PRIVOXY_PORT}/g, privoxyPort);
    fs.writeFileSync(privoxy_config, config, 'utf8');
    log.info('startPrivoxy config', config)

    privoxy_child = child_process.execFile(privoxy, 
      [privoxy_config], 
      { detached: true, shell: false, windowsHide: true }
    );

    // output
    privoxy_child.stdout.on('data', (body) => {
      log.info('privoxy_child stdout', body.toString()); 
    });
    // error
    privoxy_child.stderr.on('data', (body) => {
      log.error('privoxy_child stderr', body.toString()); 
    });
  } catch (error) {
    log.error('startPrivoxy error', error)
    throw error;
  }
}

function stopPrivoxy() {
  log.info('stopPrivoxy invoked')
  if (process.platform === 'win32') {
    child_process.execFile("taskkill.exe", ["/F", "/IM", "privoxy.exe"]);
    child_process.execFile("taskkill.exe", ["/F", "/IM", "privoxy.exe"]);
    child_process.execFile("taskkill.exe", ["/F", "/IM", "privoxy.exe"]);
  } else {
    child_process.execFile("killall", ["privoxy"]);
    child_process.execFile("killall", ["privoxy"]);
    child_process.execFile("killall", ["privoxy"]);
  }
  privoxy_child = null;
}

// proxy
function startProxy(data) {
  log.info('startProxy invoked')
  const localPort = data.localPort;
  const privoxyPort = data.privoxyPort;
  const mode = data.mode;

  log.info('startProxy config', localPort, privoxyPort, mode)
  checkProxyConfHelperPermission(() => {
    if (process.platform === 'win32') {
      child_process.execFile(proxy_conf_helper, ['global', `${localAddress}:${privoxyPort}`], (e,a,b) => child_callback(e,a,b,'startProxy'));  
    } else if (process.platform === 'darwin') {  
      child_process.execFile(proxy_conf_helper, ['-m', 'global', '-p', localPort], (e,a,b) => child_callback(e,a,b,'startProxy'));  
    } else {
      log.warn("not implemented")
    }
  })
}

function stopProxy() {
  log.info('stopProxy invoked')

  checkProxyConfHelperPermission(() => {
    // check permission before stop proxy
    if (process.platform === 'win32') {
      child_process.execFile(proxy_conf_helper, ['pac', `""`], (e,a,b) => child_callback(e,a,b,'stopProxy'));  
      child_process.execFile(proxy_conf_helper, ['pac', `""`], (e,a,b) => child_callback(e,a,b,'stopProxy'));  
      child_process.execFile(proxy_conf_helper, ['pac', `""`], (e,a,b) => child_callback(e,a,b,'stopProxy'));  
    } else if (process.platform === 'darwin') {  
      child_process.execFile(proxy_conf_helper, ['-m', 'off' ], (e,a,b) => child_callback(e,a,b,'stopProxy'));
      child_process.execFile(proxy_conf_helper, ['-m', 'off' ], (e,a,b) => child_callback(e,a,b,'stopProxy'));
      child_process.execFile(proxy_conf_helper, ['-m', 'off' ], (e,a,b) => child_callback(e,a,b,'stopProxy'));
    } else {
      log.warn("not implemented")
    }
  })
}

function child_callback(error, stdout, stderr, name) {
  if (stdout) log.info(`${name} stdout`, stdout)
  if (error) {
    log.error(`${name} error`, error)
  }
  if (stderr) {
    log.error(`${name} stderr`, stderr)
  }
}

// update status and tray icon
function updateStatus(status) {
  log.info('updateStatus invoked', status)
  vpnStatus = status
  if (status === 'connected') {
    tray.setImage(trayIconConnected);
  } else {
    tray.setImage(trayIcon);
  }
}

// general message box, types: "none", "info", "error", "question" or "warning"
function showMessageBox(type, title, message) {
  if (!type || !title || !message) return;
  dialog.showMessageBox({ type, title, message, icon: logo })
}

function showNotification(title, message) {
  let myNotification = new Notification({
    title: title,
    body: message,
  })
  myNotification.show()
}

// check permission (mac only)
function checkProxyConfHelperPermission(next) {
  if (process.platform !== "darwin") return next();
  log.info("checkProxyConfHelperPermission invoked")

  // check permission
  child_process.execFile("ls", ["-l", proxy_conf_helper], (err, stdout, stderr) => { 
    // proxy_conf_helper needs root and admin permission
    if (!stdout.includes("root") || !stdout.includes("admin")) {
      const postinstall = `chown root:admin ${proxy_conf_helper} && chmod a+rx ${proxy_conf_helper} && chmod +s ${proxy_conf_helper}`
      sudoPrompt.exec(postinstall, {
        name: 'LightyearVPN',
        icns: icns,
      }, (error, stdout, stderr) => {
        if (stdout) log.info(`checkProxyConfHelperPermission stdout`, stdout)
        if (error) log.error(`checkProxyConfHelperPermission error`, error)
        next()
      });  
    } else {
      next()
    }
  });
}

function isOSWin64() {
  return process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
}

// ALL EVENTS
// manage sslocal
ipcMain.on('startSslocal', (event, arg) => {
  if (sslocal_child) {
    log.warn('sslocal is running')
    return;
  }

  updateStatus("connecting")
  let { config } = arg
  if (!config) {
    updateStatus('not_connected')
    stopSslocal()
    event.reply('startSslocal-reply', { error: 'config missing' })
    log.error('startSslocal error', 'config is missing')
    return;
  }

  startSslocal(config)
  .then(() => {
    updateStatus('connected')
    event.reply('startSslocal-reply', { status: 'connected'})
  })
  .catch((error) => {
    updateStatus('not_connected')
    stopSslocal()
    event.reply('startSslocal-reply', { error })
    log.error('startSslocal error', error)
  })
})

ipcMain.on('stopSslocal', (event, arg) => {
  updateStatus('not_connected')
  stopSslocal()
  event.reply('stopSslocal-reply', { status: 'not_connected'})
})

 // general store get and set methods
ipcMain.on('getItem', (event, arg) => {
  event.returnValue = store.get(arg.key)
})

ipcMain.on('setItem', (event, arg) => {
  event.returnValue = store.set(arg.key, arg.item)
})

ipcMain.on('deleteItem', (event, arg) => {
  event.returnValue = store.delete(arg.key)
})

// current connection status
ipcMain.on('getStatus', (event, arg) => {
  event.returnValue = vpnStatus
})

ipcMain.on('setStatus', (event, arg) => {
  updateStatus(arg.status)
})

// get local log file
ipcMain.on('getLog', (event, arg) => {
  log.info('getLog invoked')
  let logPath = log.transports.file.findLogPath()
  let logContent = fs.readFileSync(logPath, "utf8")
  log.transports.file.clear();
  event.returnValue = logContent
})

ipcMain.on('show-error', (event, arg) => {
  showMessageBox('error', arg.title, arg.message)
})

ipcMain.on('show-notification', (event, arg) => {
  showNotification(arg.title, arg.message)
})

ipcMain.on('show-message', (event, arg) => {
  showMessageBox(arg.type, arg.title, arg.message)
})

ipcMain.on('appQuit', (event, arg) => {
  app.quit();
})

app.whenReady().then(() => {
  setup()
  app.on('activate', function () {
    if (mainWindow === null) createWindow()
    if (trayIcon === null) createTray()
  })
})

app.on('window-all-closed', () => {
  log.info('window-all-closed')
});

app.on('before-quit', () => {
  log.info('before-quit')
  stopSslocal()
})
