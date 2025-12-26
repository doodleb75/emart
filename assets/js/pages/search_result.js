document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid-4.search-result-grid');
    const tabItems = document.querySelectorAll('.tab-menu .tab-item');
    const itemsPerPageTrigger = document.getElementById('itemsPerPageTrigger');
    const itemsPerPageOptions = document.querySelectorAll('.dropdown-options li');
    const dropdownWrapper = document.querySelector('.dropdown-wrapper');
    const totalCountEl = document.querySelector('.total-count-row .count');
    const searchSelectAll = document.getElementById('searchSelectAll');

    if (!productGrid) return;

    // 탭 선택 상태 관리
    const tabStates = {};
    let activeTabId = '0'; // 초기 활성 탭

    // 초기 템플릿 저장
    // 원본 카드 요소 복사
    const originalCards = Array.from(productGrid.querySelectorAll('.product-card'));
    let currentLimit = 20; // 페이지당 표시 수

    // 난수 생성 함수
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // 수량 입력 박스 초기화
    const initQtyBoxes = (container) => {
        const qtyBoxes = container.querySelectorAll('.qty-box');
        qtyBoxes.forEach(box => {
            const buttons = box.querySelectorAll('button');
            const minusBtn = buttons[0];
            const plusBtn = buttons[1];
            const countInput = box.querySelector('input');

            if (minusBtn && plusBtn && countInput) {
                minusBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let currentCount = parseInt(countInput.value, 10) || 0;
                    if (currentCount > 0) {
                        countInput.value = currentCount - 1;
                    }
                });

                plusBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    let currentCount = parseInt(countInput.value, 10) || 0;
                    countInput.value = currentCount + 1;
                });
            }
        });
    };

    // 상품 그리드 렌더링
    const renderGrid = (limit) => {
        productGrid.innerHTML = ''; // 목록 초기화

        // 현재 탭 전체 선택 상태 확인
        const isTabAllSelected = tabStates[activeTabId] || false;

        // 전체 선택 UI 갱신
        if (searchSelectAll) {
            searchSelectAll.checked = isTabAllSelected;
        }

        const newCards = [];

        // 상품 카드 생성
        for (let i = 0; i < limit; i++) {
            // 랜덤 상품 템플릿 선택
            const template = originalCards[getRandomInt(0, originalCards.length - 1)];
            const clone = template.cloneNode(true);

            // 체크박스 초기화 및 상태 적용
            const checkboxes = clone.querySelectorAll('custom-checkbox');
            checkboxes.forEach(cb => {
                cb.innerHTML = '';
                // 탭별 체크 상태 적용
                if (isTabAllSelected) {
                    cb.setAttribute('checked', '');
                    cb.checked = true;
                } else {
                    cb.removeAttribute('checked');
                    cb.checked = false;
                }
            });

            newCards.push(clone);
        }

        // DOM 요소 추가
        newCards.forEach(card => productGrid.appendChild(card));

        // 수량 박스 이벤트 등록
        initQtyBoxes(productGrid);

        // 총 상품 수 갱신
        if (totalCountEl) {
            totalCountEl.textContent = limit;
        }

        // 개별 체크박스 이벤트 등록
        if (searchSelectAll) {
            const newItems = productGrid.querySelectorAll('.item-check');
            newItems.forEach(cb => {
                cb.addEventListener('change', () => {
                    // 전체 선택 상태 재계산
                    const allChecked = Array.from(newItems).every(c => c.checked);
                    searchSelectAll.checked = allChecked;

                    // 선택 상태 저장
                    tabStates[activeTabId] = allChecked;
                });
            });
        }
    };

    // 탭 전환 이벤트
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            // 탭 활성화 처리
            tabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 활성 탭 ID 갱신
            activeTabId = tab.dataset.tab;

            // 탭 변경 시 목록 갱신
            renderGrid(currentLimit);
        });
    });

    // 보기 옵션 드롭다운
    if (itemsPerPageOptions.length > 0) {
        itemsPerPageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // 표시 개수 설졍 변경
                const value = option.getAttribute('data-value');
                currentLimit = parseInt(value, 10);

                // 옵션 변경 시 전체 선택 해제
                tabStates[activeTabId] = false;

                // 목록 갱신
                renderGrid(currentLimit);
            });
        });
    }

    // 전체 선택 기능
    if (searchSelectAll) {
        searchSelectAll.addEventListener('change', (e) => {
            const isChecked = e.target.checked;

            // 선택 상태 저장
            tabStates[activeTabId] = isChecked;

            // 현재 목록 체크박스 조회
            const currentItems = productGrid.querySelectorAll('.item-check');
            currentItems.forEach(cb => {
                cb.checked = isChecked;
            });
        });
    }

    // 초기 화면 렌더링
    // 기본 목록 로드
    if (originalCards.length > 0) {
        // 초기 활성 탭 설정
        const activeTab = document.querySelector('.tab-menu .tab-item.active');
        if (activeTab) {
            activeTabId = activeTab.dataset.tab;
        }
        renderGrid(currentLimit);
    }
});
