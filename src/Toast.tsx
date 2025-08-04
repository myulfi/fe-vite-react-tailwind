type ToastType = 'info' | 'done' | 'problem' | 'error';

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
    w-72 flex items-center justify-between px-4 py-3 rounded shadow-lg
    opacity-0 translate-y-2
    transition-all duration-300 ease-in-out
    will-change-transform
  `.trim();

    const styles = {
        info: 'bg-light-info-base dark:bg-dark-info-base text-light-info-base-line dark:text-dark-info-base-line',
        done: 'bg-light-done-base dark:bg-dark-done-base text-light-done-base-line dark:text-dark-done-base-line',
        problem: 'bg-light-problem-base dark:bg-dark-problem-base text-light-problem-base-line dark:text-dark-problem-base-line',
        error: 'bg-light-error-base dark:bg-dark-error-base text-light-error-base-line dark:text-dark-error-base-line',
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
