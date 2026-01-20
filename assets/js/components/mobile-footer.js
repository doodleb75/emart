// 푸터 상호작용 로직 
document.addEventListener('click', (e) => {
    // 사업자 정보 토글
    const footerToggle = e.target.closest('.footer-info-toggle');
    if (footerToggle) {
        const footerDetails = document.querySelector('.footer-details');
        if (footerDetails) {
            const isExpanded = footerToggle.classList.contains('active');
            const arrow = footerToggle.querySelector('.icon-chevron-down, .icon-arrow');

            if (isExpanded) {
                // 정보 숨김 (Collapse) - 높이를 0으로 변경하여 부드러운 닫힘 효과 적용
                footerDetails.style.height = footerDetails.scrollHeight + 'px';
                footerDetails.offsetHeight; // Reflow 유도

                footerToggle.classList.remove('active');
                footerDetails.classList.remove('active');

                footerDetails.style.height = '0';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            } else {
                // 정보 노출 (Expand) - 실제 콘텐츠 높이(scrollHeight)를 계산하여 애니메이션 구현
                footerToggle.classList.add('active');
                footerDetails.classList.add('active');

                const height = footerDetails.scrollHeight;
                footerDetails.style.height = '0';
                footerDetails.offsetHeight; // Reflow 유도

                footerDetails.style.height = height + 'px';

                // 애니메이션 완료 후 고정된 높이를 해제하여 유연한 대응이 가능하도록 처리
                setTimeout(() => {
                    if (footerToggle.classList.contains('active')) {
                        footerDetails.style.height = 'auto';
                    }
                }, 300);

                if (arrow) arrow.style.transform = 'rotate(180deg)';
            }
        }
    }

    // 최상단 이동 
    const btnTop = e.target.closest('.btn-top');
    if (btnTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// 플로팅 버튼 노출 제어 
window.addEventListener('scroll', () => {
    const floatingButtons = document.querySelector('.floating-buttons');
    if (!floatingButtons) return;

    if (window.scrollY > 100) {
        floatingButtons.classList.add('is-visible');
    } else {
        floatingButtons.classList.remove('is-visible');
    }
});


