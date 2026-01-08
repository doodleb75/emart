function initViewToggle() {
    const viewToggles = document.querySelectorAll('.view-toggles .btn-toggle');
    const productGrid = document.querySelector('.product-grid-4');

    if (!viewToggles.length || !productGrid) return;

    viewToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            // 전체 버튼 비활성화
            viewToggles.forEach(b => b.classList.remove('active'));
            // 클릭 버튼 활성화
            btn.classList.add('active');

            // 뷰 타입 확인
            if (btn.classList.contains('btn-list')) {
                // 리스트 보기 적용
                productGrid.classList.add('list-view');
                productGrid.style.gridTemplateColumns = '1fr';
            } else {
                // 그리드 보기 적용
                productGrid.classList.remove('list-view');
                productGrid.style.gridTemplateColumns = ''; // 스타일 초기화
            }
        });
    });

    // 초기 상태 설정
    const activeBtn = document.querySelector('.view-toggles .btn-toggle.active');
    if (activeBtn && activeBtn.classList.contains('btn-list')) {
        productGrid.classList.add('list-view');
        productGrid.style.gridTemplateColumns = '1fr';
    }
}

// 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewToggle);
} else {
    initViewToggle();
}
