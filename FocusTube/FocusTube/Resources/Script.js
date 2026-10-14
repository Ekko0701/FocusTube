document.getElementById('open-settings').addEventListener('click', () => {
    webkit.messageHandlers.controller.postMessage('open-settings');
});
