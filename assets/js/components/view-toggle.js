function initViewToggle() {
    const viewToggles = document.querySelectorAll('.view-toggles .btn-toggle');
    // 모든 그리드 요소 선택 (Select all grid elements)
    const productGrids = document.querySelectorAll('.product-grid-4');

    if (!viewToggles.length || !productGrids.length) return;

    viewToggles.forEach(btn => {
        if (btn.dataset.initialized) return;
        btn.dataset.initialized = 'true';

        btn.addEventListener('click', () => {
            // 전체 버튼 비활성화 (Deactivate all buttons)
            viewToggles.forEach(b => b.classList.remove('active'));
            // 클릭 버튼 활성화 (Activate clicked button)
            btn.classList.add('active');

            const isListView = btn.classList.contains('btn-list');

            // 모든 그리드에 일괄 적용 (Apply to all grids)
            document.querySelectorAll('.product-grid-4').forEach(grid => {
                if (isListView) {
                    grid.classList.add('list-view');
                } else {
                    grid.classList.remove('list-view');
                }
            });
        });
    });

    // 초기 상태 설정 (Initial State)
    const activeBtn = document.querySelector('.view-toggles .btn-toggle.active');
    if (activeBtn) {
        const isListView = activeBtn.classList.contains('btn-list');
        productGrids.forEach(grid => {
            if (isListView) {
                grid.classList.add('list-view');
            }
        });
    }
}

// 자동 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewToggle);
} else {
    initViewToggle();
}
