// 푸터 상호작용 로직 (Footer Interaction Logic)
document.addEventListener('click', (e) => {
    // 사업자 정보 토글 (Company Info Toggle)
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

    // 최상단 이동 버튼 (Scroll To Top) - inline onclick이 없는 경우를 대비한 백업
    const btnTop = e.target.closest('.btn-top');
    if (btnTop && !btnTop.onclick) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});

