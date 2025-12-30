/**
 * 수량 조절 기능 초기화 (Initialize Quantity Control)
 * @param {HTMLElement} container - 수량 박스를 검색할 컨테이너 (Container to search for quantity boxes)
 */
function initQuantityControl(container) {
    const qtyBoxes = container.querySelectorAll('.qty-box');

    qtyBoxes.forEach(box => {
        // 이미 초기화된 경우 건너뛰기 
        if (box.dataset.initialized === 'true') return;

        const buttons = box.querySelectorAll('button');
        if (buttons.length < 2) return;

        const minusBtn = buttons[0];
        const plusBtn = buttons[1];
        const countInput = box.querySelector('input');

        if (minusBtn && plusBtn && countInput) {
            // 중복 초기화 방지를 위한 플래그 설정
            box.dataset.initialized = 'true';

            // 최소값 설정 (Set minimum value)
            if (!countInput.hasAttribute('min')) {
                countInput.setAttribute('min', '0');
            }

            // 마이너스 버튼 클릭 (Decrease)
            minusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let currentCount = parseInt(countInput.value, 10) || 0;
                if (currentCount > 0) {
                    countInput.value = currentCount - 1;
                    // change 이벤트 발생 (필요 시)
                    countInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });

            // 플러스 버튼 클릭 (Increase)
            plusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let currentCount = parseInt(countInput.value, 10) || 0;
                countInput.value = currentCount + 1;
                // change 이벤트 발생 (필요 시)
                countInput.dispatchEvent(new Event('change', { bubbles: true }));
            });

            // 직접 입력 시 음수 방지 (Prevent negative input)
            countInput.addEventListener('input', () => {
                let val = parseInt(countInput.value, 10);
                if (val < 0) {
                    countInput.value = 0;
                }
            });
        }
    });
}
