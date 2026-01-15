// 푸터 상호작용 로직 
document.addEventListener('click', (e) => {
    // 사업자 정보 토글
    const footerToggle = e.target.closest('.footer-info-toggle');
    if (footerToggle) {
        const footerDetails = document.querySelector('.footer-details');
        if (footerDetails) {
            const isExpanded = footerToggle.classList.contains('active');
            const arrow = footerToggle.querySelector('.icon-arrow');

            if (isExpanded) {
                // 정보 숨김 (Collapse)
                footerToggle.classList.remove('active');
                footerDetails.classList.remove('active');
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            } else {
                // 정보 노출 (Expand)
                footerToggle.classList.add('active');
                footerDetails.classList.add('active');
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


