// 푸터 상호작용 로직 (Footer Interaction Logic)
document.addEventListener('DOMContentLoaded', () => {
    // 사업자 정보 토글 (Company Info Toggle)
    const footerToggle = document.querySelector('.footer-info-toggle');
    const footerDetails = document.querySelector('.footer-details');

    if (footerToggle && footerDetails) {

        footerToggle.addEventListener('click', () => {
            const isExpanded = footerToggle.classList.contains('active');

            if (isExpanded) {
                // 정보 숨김 (Collapse)
                footerToggle.classList.remove('active');
                footerDetails.classList.remove('active');

                // 화살표 회전 원복 (Reset arrow rotation)
                const arrow = footerToggle.querySelector('.icon-arrow');
                if (arrow) arrow.style.transform = 'rotate(0deg)';

            } else {
                // 정보 노출 (Expand)
                footerToggle.classList.add('active');
                footerDetails.classList.add('active');

                // 화살표 회전 (Rotate arrow)
                const arrow = footerToggle.querySelector('.icon-arrow');
                if (arrow) arrow.style.transform = 'rotate(180deg)';
            }
        });
    }

    // 최상단 이동 버튼 (Scroll To Top)
    const btnTop = document.querySelector('.btn-top');
    if (btnTop) {
        btnTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

