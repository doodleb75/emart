// ==========================================
// 토스트 알림 컴포넌트
// ==========================================
class ToastManager {
    static getIcon(type) {
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<g clip-path="url(#clip0_618_4802)">
<path d="M10.0003 1.66797C5.40032 1.66797 1.66699 5.4013 1.66699 10.0013C1.66699 14.6013 5.40032 18.3346 10.0003 18.3346C14.6003 18.3346 18.3337 14.6013 18.3337 10.0013C18.3337 5.4013 14.6003 1.66797 10.0003 1.66797ZM8.33366 14.168L4.16699 10.0013L5.34199 8.8263L8.33366 11.8096L14.6587 5.48463L15.8337 6.66797L8.33366 14.168Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_618_4802">
  <rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>`,
            danger: `<svg class="toast-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#ffffff"/></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<g clip-path="url(#clip0_618_7143)">
<path d="M0.833008 17.5013H19.1663L9.99968 1.66797L0.833008 17.5013ZM10.833 15.0013H9.16634V13.3346H10.833V15.0013ZM10.833 11.668H9.16634V8.33464H10.833V11.668Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_618_7143">
  <rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>`,
            info: `<svg class="toast-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="#ffffff"/></svg>`
        };
        return icons[type] || icons.success;
    }

    static show(type, message, target = null, options = {}) {
        let container;
        const isCustomPosition = !!target;

        if (isCustomPosition) {
            container = document.createElement('div');
            container.className = 'custom-toast-container position-absolute';
            document.body.appendChild(container);

            // 현재 적용된 줌 수치 파악
            const zoom = parseFloat(document.body.style.zoom) || 1;
            const rect = target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            // 줌 보정된 좌표 계산
            let top = (rect.bottom + scrollTop) / zoom + 10;
            let left = (rect.left + scrollLeft + (rect.width / 2)) / zoom;
            let transform = 'translateX(-50%)';

            // 화면 내 위치 계산
            const viewportWidth = window.innerWidth / zoom;
            const targetCenterX = (rect.left + rect.width / 2) / zoom;
            const isRightSide = targetCenterX > (viewportWidth / 2);
            const align = options.align === 'auto' ? (isRightSide ? 'right' : 'left') : (options.align || 'center');

            if (align === 'start' || align === 'left') {
                left = (rect.left + scrollLeft) / zoom;
                transform = 'none';
                container.style.justifyContent = 'flex-start';
            } else if (align === 'end' || align === 'right') {
                left = (rect.right + scrollLeft) / zoom;
                transform = 'translateX(-100%)';
                container.style.justifyContent = 'flex-end';
            }

            if (options.width === 'match') {
                container.style.minWidth = `${rect.width / zoom}px`;
                container.style.width = 'auto';
            }

            container.style.top = `${top}px`;
            container.style.left = `${left}px`;
            container.style.transform = transform;

        } else {
            container = document.querySelector('.custom-toast-container.global');
            if (!container) {
                container = document.createElement('div');
                container.className = 'custom-toast-container global';
                document.body.appendChild(container);
            }
        }

        const toastEl = document.createElement('div');
        toastEl.className = `custom-toast toast-${type}`;
        toastEl.innerHTML = `
            ${this.getIcon(type)}
            <span>${message}</span>
        `;

        if (isCustomPosition && options.width === 'match') {
            toastEl.style.minWidth = '100%';
            toastEl.style.width = 'max-content';
            toastEl.style.justifyContent = 'center';
        }

        container.appendChild(toastEl);
        requestAnimationFrame(() => {
            toastEl.classList.add('show');
        });

        setTimeout(() => {
            toastEl.classList.remove('show');
            toastEl.addEventListener('transitionend', () => {
                toastEl.remove();
                if (isCustomPosition && container.children.length === 0) {
                    container.remove();
                }
            }, { once: true });
        }, 2000);
    }
}

// 전역 객체 할당
window.Toast = ToastManager;
