type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
    type?: ToastType;
    message: string;
    duration?: number;
}

const toastContainerId = 'toast-container';

function getToastContainer(): HTMLElement {
    let container = document.getElementById(toastContainerId);
    if (!container) {
        container = document.createElement('div');
        container.id = toastContainerId;
        container.className = 'fixed top-5 right-5 z-50 flex flex-col space-y-2';
        document.body.appendChild(container);
    }
    return container;
}

function getToastClasses(type: ToastType): string {
    const base = `
    toast
    w-72 flex items-center justify-between px-4 py-3 rounded shadow-lg border
    opacity-0 translate-y-2
    transition-all duration-300 ease-in-out
    will-change-transform
  `.trim();

    const styles = {
        success: 'bg-green-100 border-green-300 text-green-800',
        error: 'bg-red-100 border-red-300 text-red-800',
        info: 'bg-blue-100 border-blue-300 text-blue-800',
        warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    };

    return `${base} ${styles[type]}`;
}

function fadeOutAndRemove(toastEl: HTMLElement) {
    toastEl.classList.add('opacity-0', 'translate-y-2');

    toastEl.addEventListener('transitionend', () => {
        toastEl.remove();
    });
}

const toast = {
    show({ type = 'info', message, duration = 3000 }: ToastOptions) {
        const container = getToastContainer();

        const toastEl = document.createElement('div');
        toastEl.className = getToastClasses(type);

        toastEl.innerHTML = `
      <span class="mr-4">${message}</span>
      <button class="ml-auto font-bold text-lg leading-none">&times;</button>
    `;

        toastEl.querySelector('button')?.addEventListener('click', () => {
            fadeOutAndRemove(toastEl);
        });

        container.appendChild(toastEl);

        // Trigger fade-in + slide-up
        requestAnimationFrame(() => {
            toastEl.classList.remove('opacity-0', 'translate-y-2');
        });

        setTimeout(() => {
            fadeOutAndRemove(toastEl);
        }, duration);
    },
};

export default toast;
