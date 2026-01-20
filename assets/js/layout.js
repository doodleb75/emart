// 레이아웃 전반 (헤더, 사이드바, 카테고리 메뉴 등) 제어

// 1. GNB/검색창 너비 동적 조정 (Observer 등)
window.initHeaderLayout = function () {
    if (!window.adjustNavWidth) return; // utils.js 필수

    if (document.fonts) {
        document.fonts.ready.then(window.adjustNavWidth);
    }

    // 헤더 크기 감시
    const headerInner = document.querySelector('.header-main .header-inner');
    if (headerInner && window.ResizeObserver) {
        new ResizeObserver(window.adjustNavWidth).observe(headerInner);
    }

    // 초기 실행
    window.adjustNavWidth();
    window.addEventListener('resize', window.adjustNavWidth);
    window.addEventListener('load', () => setTimeout(window.adjustNavWidth, 50));

    // 비동기 헤더 로드 대응
    document.addEventListener('headerLoaded', () => {
        window.adjustNavWidth();
        // 신규 요소 재감시
        const newInner = document.querySelector('.header-main .header-inner');
        if (newInner && window.ResizeObserver) {
            new ResizeObserver(window.adjustNavWidth).observe(newInner);
        }
    });
};

// 2. 카테고리 메뉴 오버레이 초기화
window.initCategoryMenu = function () {
    const categoryLink = document.querySelector('.category-link');
    const categoryOverlay = document.querySelector('.category-overlay');
    const categoryCloseBtn = document.querySelector('.btn-category-close');

    if (!categoryLink || !categoryOverlay) return;

    // 토글
    categoryLink.addEventListener('click', (e) => {
        e.preventDefault();
        categoryOverlay.classList.toggle('active');
    });

    // 닫기
    if (categoryCloseBtn) {
        categoryCloseBtn.addEventListener('click', () => {
            categoryOverlay.classList.remove('active');
        });
    }

    // 외부 영역 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (!categoryLink.contains(e.target) && !categoryOverlay.contains(e.target)) {
            categoryOverlay.classList.remove('active');
        }
    });

    // 상단 탭 전환
    const topTabs = categoryOverlay.querySelectorAll('.category-tabs .tab-btn');
    topTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            topTabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // 사이드바 카테고리 탭 (Hover/Click)
    const sidebarItems = categoryOverlay.querySelectorAll('.category-sidebar li');
    const detailContents = categoryOverlay.querySelectorAll('.category-detail');

    sidebarItems.forEach(item => {
        const switchTab = () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.dataset.target;
            detailContents.forEach(content => {
                content.classList.toggle('active', content.id === targetId);
            });
        };

        item.addEventListener('mouseenter', switchTab);
        item.addEventListener('click', switchTab);
    });
};

// 3. 사이드바 (마이페이지 등) 메뉴 초기화
window.initSidebar = function () {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentList = document.querySelector('.content-list');

    if (!sidebarItems || !contentList) return;

    const updateContent = (items) => {
        if (contentList) {
            contentList.innerHTML = items.map(text =>
                `<li class="list-item">${text}</li>`
            ).join('');
        }
    };

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const menuType = item.dataset.menu;
            if (menuType && typeof menuData !== 'undefined' && menuData[menuType]) {
                updateContent(menuData[menuType]);
            }
        });
    });
};
