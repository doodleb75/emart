// 수량 조절 기능 (Quantity Control) - Event Delegation 방식
// 요소가 동적으로 추가되어도 별도 초기화 없이 동작하도록 개선

document.addEventListener('click', (e) => {
    // 수량 조절 버튼 클릭 확인
    const btn = e.target.closest('.qty-box button');
    if (!btn) return;

    const qtyBox = btn.closest('.qty-box');
    if (!qtyBox) return;

    const input = qtyBox.querySelector('input');
    const buttons = qtyBox.querySelectorAll('button');

    // 구조 유효성 검사 (버튼 2개, 인풋 1개 필수)
    if (!input || buttons.length < 2) return;

    e.preventDefault();

    // 현재 값 파싱
    let currentVal = parseInt(input.value, 10) || 0;
    // 최소값 확인 (속성이 없으면 기본 0)
    const minVal = input.hasAttribute('min') ? parseInt(input.getAttribute('min'), 10) : 0;

    // 마이너스 버튼 (첫 번째 버튼)
    if (btn === buttons[0]) {
        if (currentVal > minVal) {
            input.value = currentVal - 1;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    // 플러스 버튼 (두 번째 버튼)
    else if (btn === buttons[1]) {
        input.value = currentVal + 1;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
});

// 직접 입력 시 유효성 검사 (Input Event Delegation)
document.addEventListener('input', (e) => {
    const input = e.target;
    // qty-box 내부의 input인지 확인
    if (!input.closest('.qty-box')) return;

    const val = parseInt(input.value, 10);

    // 음수 입력 방지 (기존 로직 유지)
    if (val < 0) {
        input.value = 0;
    }
});

/**
 * [Deprecated] 수량 조절 초기화 함수
 * 이벤트 위임 방식으로 변경되어 더 이상 호출할 필요가 없으나,
 * 기존 코드(search_result.js 등)와의 호환성을 위해 빈 함수로 유지.
 */
function initQuantityControl(container) {
    // No operation needed
}
