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