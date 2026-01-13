// 하트(찜) 클릭 감지 및 상태 전환
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon');

    // 타겟 요소 유효성(하트 아이콘) 검증
    if (btn && btn.querySelector('.icon-heart')) {
        e.preventDefault();
        e.stopPropagation();

        const heartIcon = btn.querySelector('.icon-heart');
        const path = heartIcon.querySelector('path');

        if (!path) return;

        // 라인 형태 데이터 백업 (복구용)
        if (!path.dataset.originalD) {
            path.dataset.originalD = path.getAttribute('d');
        }

        const originalD = path.dataset.originalD;
        // 채워진 하트 형태 추출 (첫 폐곡선 데이터 활용)
        const solidD = originalD.split('Z')[0] + 'Z';

        const isActive = btn.classList.contains('active');

        if (!isActive) {
            // 활성 상태 전환 (Red Fill)
            btn.classList.add('active');

            path.setAttribute('d', solidD);
            path.setAttribute('fill', '#FF5447');
            path.style.fill = '#FF5447';

            // 알림 메시지 호출 (card-control 너비 맞춤)
            if (window.Toast) {
                const toastTarget = btn.closest('.card-control') || btn.parentElement;
                window.Toast.show('success', '관심상품에 저장되었습니다.', toastTarget, { width: 'match', align: 'auto' });
            }
        } else {
            // 비활성 상태 전환 (Gray Outline)
            btn.classList.remove('active');

            path.setAttribute('d', originalD);
            path.setAttribute('fill', '#444444');
            path.style.fill = '#444444';
        }
    }
}, true);
