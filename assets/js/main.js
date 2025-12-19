// Menu Data
const menuData = {
    sales: ['판매등록', '판매TR조회', '저널조회', '무이자정보', '품번매출', '점검', '정산'],
    query: ['매출조회', '영수증조회', '포인트조회', '쿠폰조회'],
    system: ['사용자관리', '기기관리', '네트워크설정', '업데이트'],
    settings: ['화면설정', '소리설정', '언어설정', '기타설정']
};

document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentList = document.querySelector('.content-list');

    if (sidebarItems && contentList) {
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                sidebarItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');

                // Update content based on menu
                const menuType = item.dataset.menu;
                if (menuType && menuData[menuType]) {
                    updateContent(menuData[menuType]);
                }
            });
        });
    }

    function updateContent(items) {
        if (contentList) {
            contentList.innerHTML = items.map(text =>
                `<li class="list-item">${text}</li>`
            ).join('');
        }
    }

    // Nav Width Calculation (네비게이션 너비 계산)
    const navList = document.querySelector('ul.nav.gap-5.justify-content-center');
    const searchContainer = document.querySelector('.search-container');

    if (navList && searchContainer) {
        const listItems = navList.querySelectorAll('li.nav-item');
        let totalLiWidth = 0;

        // Item 너비 합산 (Sum item widths)
        listItems.forEach(li => {
            totalLiWidth += li.getBoundingClientRect().width;
        });

        // Gap 스타일 계산 (Calculate gap style)
        const ulComputedStyle = window.getComputedStyle(navList);
        const gap = parseFloat(ulComputedStyle.gap) || 0;

        // 전체 Gap 너비 계산 (Calculate total gap width)
        const totalGapWidth = gap * (listItems.length > 0 ? listItems.length - 1 : 0);

        const finalWidth = totalLiWidth + totalGapWidth;

        searchContainer.style.maxWidth = `${finalWidth}px`;
        searchContainer.style.width = '100%'; // 최대 너비 설정 (Set max width)
    }
});