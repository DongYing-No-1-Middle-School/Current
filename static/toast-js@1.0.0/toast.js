/*! toast.js v1.0.0 | MIT */
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    .toastContainer {
        display: flex;
        flex-direction: column;
        position: fixed;
        bottom: 20px;
        right: 20px;
    }
    .toast {
        padding: 10px 20px;
        border-width: 1px;
        border-radius: 3px;
        min-width: 200px;
        margin: 10px;
        display: inline-block;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    @keyframes toastFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    .toast-fade-out {
        animation: toastFadeOut 0.5s;
    }
`;
document.head.appendChild(styleElement);
window.addEventListener('DOMContentLoaded', (event) => {
    const toastContainer = document.createElement('div');
    toastContainer.id = "toastContainer"
    toastContainer.classList.add('toastContainer');
    document.body.appendChild(toastContainer);
    console.log(toastContainer);
});
var newToast = (message, type = 'info', duration = 5) => {
    const colorMap = {
        'info': '#f4f4f4',
        'success': '#dff6dd',
        'warning': '#fff4ce',
        'error': '#fde7e9'
    }
    const toastId = Math.floor(Math.random() * 1000000);
    const toastElement = document.createElement('div');
    toastElement.id = `toast-${toastId}`;
    toastElement.classList.add('toast');
    toastElement.style.backgroundColor = colorMap[type];
    toastElement.innerHTML = message;
    document.getElementById('toastContainer').appendChild(toastElement);
    setTimeout(() => {
        toastElement.classList.add('toast-fade-out');
    }, duration * 1000);
    setTimeout(() => {
        toastElement.remove();
    }, duration * 1000 + 499);
}
var sendToast = {
    info: (message, duration) => {
        newToast(message, 'info', duration);
    },
    success: (message, duration) => {
        newToast(message, 'success', duration);
    },
    warning: (message, duration) => {
        newToast(message, 'warning', duration);
    },
    error: (message, duration) => {
        newToast(message, 'error', duration);
    }
}