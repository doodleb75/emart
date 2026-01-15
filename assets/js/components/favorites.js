// 하트(찜) 클릭 감지 및 상태 전환
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon');

    // 타겟 요소 유효성(하트 아이콘) 검증
    if (btn && btn.querySelector('.icon-heart')) {
        e.preventDefault();
        e.stopPropagation();

        const isActive = btn.classList.contains('active');

        if (!isActive) {
            // 활성 상태 전환
            btn.classList.add('active');

            // 알림 메시지 호출 (card-control 너비 맞춤)
            if (window.Toast) {
                const toastTarget = btn.closest('.card-control') || btn.parentElement;
                window.Toast.show('success', '관심상품에 저장되었습니다.', toastTarget, { width: 'match', align: 'auto' });
            }
        } else {
            // 비활성 상태 전환
            btn.classList.remove('active');
        }
    }
}, true);
