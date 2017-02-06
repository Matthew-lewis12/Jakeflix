var webview = document.getElementById('panel-container');
var bullet = document.getElementById('drag');
var appID = 'djkbcbljoippiechcnmbeohnijifgdfk'; // this app
var insert_style = '.window-overlay::-webkit-scrollbar{height:33px;width:33px}.window-overlay::-webkit-scrollbar-thumb{min-height:50px;background:rgba(255,255,255,1);border-radius:17px;border:10px solid transparent;background-clip:padding-box}.window-overlay::-webkit-scrollbar-track-piece{background:rgba(0,0,0,.5);border:10px solid transparent;background-clip:padding-box}.window-overlay::-webkit-scrollbar-track-piece:vertical:start{border-radius:17px 17px 0 0}.window-overlay::-webkit-scrollbar-track-piece:vertical:end{border-radius:0 0 17px 17px}';
var NODE_TLS_REJECT_UNAUTHORIZED = '0'

// set some css
webview.addEventListener('loadcommit', function(e) {
    if (e.isTopLevel) {
        webview.insertCSS({
            code: insert_style,
            runAt: 'document_start'
        });
    }
});

// send new-window-links to browser
webview.addEventListener('newwindow', function(e) {
    e.stopImmediatePropagation();
    window.open(e.targetUrl);
});

// hotkeys
window.addEventListener('keydown', function(e) {
    // Ctrl+R or F5
    if (e.ctrlKey && e.keyCode == 82 || e.keyCode == 115) {
        webview.reload();
    }

    // F11
    if (e.keyCode == 122) {
        if (chrome.app.window.current().isFullscreen()) {
            chrome.app.window.current().restore();
        } else {
            chrome.app.window.current().fullscreen();
        }
    }

    // Show/hide frame
    if (e.ctrlKey && e.shiftKey && e.keyCode == 70) {
        chrome.storage.sync.get(function(items) {
            if (items.showFrame === undefined || items.showFrame === 'none') {
                frame = 'chrome';
            } else {
                frame = 'none';
            }

            chrome.storage.sync.set({ showFrame: frame });
        });

        setTimeout(function(){
            chrome.runtime.reload();
        }, 500);
    }
});

// fix webview lose focus
window.addEventListener('focus', function(e) {
    webview.focus();
});

// allow download
webview.addEventListener('permissionrequest', function(e) {
    if (e.permission === 'download') {
        e.request.allow();
    }
});

// open cached links
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (sender.id == appID) {
        webview.src = request;
    }
});

function createWindow(param) {
    chrome.app.window.create('window.html', {
        frame: 'none',
        id: 'webview',
        innerBounds: { width: 960, height: 600 },
        alwaysOnTop: true,
        resizable: true
    }, function (appwindow) {

        appwindow.contentWindow.onload = function () {

            var bodyObj = appwindow.contentWindow.document.getElementById('body'),
                buttonsObj = appwindow.contentWindow.document.getElementById('buttons'),
                closeObj = appwindow.contentWindow.document.getElementById('close-window-button'),
                unlockObj = appwindow.contentWindow.document.getElementById('unlock-window-button'),
                lockObj = appwindow.contentWindow.document.getElementById('lock-window-button'),
                backgroundObj = appwindow.contentWindow.document.getElementById('background'),
                timeout = null,
                helpOpened = false;

            closeObj.onclick = function () {
                appwindow.contentWindow.close();
            };
            lockObj.onclick = function () {
                lockObj.style.display = 'none';
                unlockObj.style.display = 'block';
                appwindow.setAlwaysOnTop(false);
            };
            unlockObj.onclick = function () {
                unlockObj.style.display = 'none';
                lockObj.style.display = 'block';
                appwindow.setAlwaysOnTop(true);
            };
            toggleFullscreen = function () {
                if (appwindow.isFullscreen()) {
                    appwindow.restore();
                } else {
                    appwindow.fullscreen();
                }
            };

            unlockObj.style.display = 'none';
            backgroundObj.style.display = 'none';

            bodyObj.onmousemove = function () {
                buttonsObj.classList.remove('fadeout');
                buttonsObj.classList.add('fadein');
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    if (false === helpOpened) {
                        buttonsObj.classList.remove('fadein');
                        buttonsObj.classList.add('fadeout');
                    }
                }, 2000);
            };
        // open welcome page
			var url = "http://www.framelessapps.com/#welcome";
			window.open(url, '_blank');  		

            chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
                if (request === 'fullscreen') {
                    toggleFullscreen();
                }
            });
        };
	
	});
}

chrome.runtime.onMessageExternal.addListener(function (request, sender) {
    if (typeof request.launch === 'undefined') {
        return;
    }

    if (sender.id === extId || sender.id === devId) {
        chrome.storage.local.set({ 'extension': true });
        hasExt = true;
    }

    if (0 === chrome.app.window.getAll().length) {
        createWindow(request);
    } else {
        var appwindow = chrome.app.window.getAll()[0];

        appwindow.close();

        setTimeout(function () {
            createWindow(request);
        }, 1000);

    }
});

chrome.app.runtime.onLaunched.addListener(function () {
    createWindow({ 'launch': 'empty' });
});

var minimized = false;

{
   "app": {
      "background": {
         "scripts": [ "scripts/background.js" ]
      }
   },
   "description": "External Frameless Window for Netflix",
   "icons": {
      "128": "assets/icon-128.png",
      "16": "assets/icon-16.png",
      "32": "assets/icon-32.png"
   },
   "manifest_version": 2,
   "minimum_chrome_version": "40",
   "name": "Jakeflix",
   "permissions": [ "webview", "alwaysOnTopWindows", "storage", "contextMenus", "notifications", "unlimitedStorage", "\u003Call_urls>", "browser", "fullscreen" ],
   "short_name": "Mattflix",
   "version": "1.0"
}
