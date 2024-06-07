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
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
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
        'info': 'rgb(219, 234, 254)',
        'success': 'rgb(214, 238, 213)',
        'warning': 'rgb(255, 243, 205)',
        'error': 'rgb(253, 230, 230)'
    }
    const svgs = {
        'info': `
<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
</svg>
`,
        'success': `
<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
</svg>
`,
        'warning': `
<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
</svg>
`,
        'error': `
<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
</svg>
`
    }
    const toastId = Math.floor(Math.random() * 1000000);
    const toastElement = document.createElement('div');
    toastElement.id = `toast-${toastId}`;
    toastElement.classList.add('toast');
    toastElement.style.backgroundColor = colorMap[type];
    var svgdom = document.createElement('div');
    svgdom.innerHTML = svgs[type];
    var messdom = document.createElement('p');
    messdom.innerHTML = message;
    toastElement.appendChild(svgdom);
    toastElement.appendChild(messdom);
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