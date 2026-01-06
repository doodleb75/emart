document.addEventListener('DOMContentLoaded', () => {
    const grid0 = document.getElementById('md-grid-0');
    if (!grid0) return;

    const tabItems = document.querySelectorAll('.tab-menu .tab-item');
    const itemsPerPageOptions = document.querySelectorAll('.dropdown-options li');
    const totalCountEl = document.querySelector('.total-count-row .count');
    const searchSelectAll = document.getElementById('searchSelectAll');

    // 그리드 컨테이너 설정 (Grid Container)
    const gridParent = grid0.parentNode;
    const grids = [grid0];
    const tabCount = tabItems.length; // 탭 개수 (4개)

    // 상태 관리 (State)
    let currentLimit = 20;
    let activeTabId = '0';
    const tabCheckStates = {}; // 탭별 체크박스 상태

    // UI에서 초기 제한 설정 (Initialize Limit)
    const activeOption = document.querySelector('.dropdown-options li.active');
    if (activeOption) {
        currentLimit = parseInt(activeOption.dataset.value || '20', 10);
    }

    // 배열 섞기 (Shuffle Helper)
    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // 아이템 늘리기 (Increase Items for testing)
    const increaseItems = () => {
        const originalCards = Array.from(grid0.children);
        if (originalCards.length === 0) return;

        const targetCount = 60; // 목표 개수
        let currentCount = originalCards.length;

        while (currentCount < targetCount) {
            originalCards.forEach(card => {
                if (currentCount >= targetCount) return;
                const clone = card.cloneNode(true);

                // 체크박스 초기화
                clone.querySelectorAll('custom-checkbox').forEach(cb => {
                    cb.innerHTML = '';
                    cb.removeAttribute('checked');
                });

                // 수량 조절 버튼 재초기화
                clone.querySelectorAll('.qty-box').forEach(box => {
                    delete box.dataset.initialized;
                });

                // 수량 초기화
                const qtyInput = clone.querySelector('.qty-box input');
                if (qtyInput) qtyInput.value = 0;

                grid0.appendChild(clone);
                currentCount++;
            });
        }
    };

    // 초기 아이템 증식 실행
    increaseItems();

    // 표시 아이템 수 및 총 개수 업데이트 (Update Visibility)
    const updateVisibility = () => {
        // 모든 그리드에 대해 가시성 업데이트 (탭 전환 시 상태 유지 위해)
        grids.forEach(grid => {
            const cards = Array.from(grid.children);
            cards.forEach((card, index) => {
                if (index < currentLimit) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        if (totalCountEl) {
            totalCountEl.textContent = currentLimit;
        }
    };

    // 그리드별 체크박스 이벤트 연결 (Attach Checkbox Events)
    const attachCheckboxEvents = (grid, tabId) => {
        const checks = grid.querySelectorAll('.item-check');
        checks.forEach(check => {
            check.addEventListener('change', () => {
                // 현재 탭인 경우 전체 선택 상태 동기화
                if (activeTabId === tabId && searchSelectAll) {
                    const allChecked = Array.from(checks).every(c => c.checked);
                    searchSelectAll.checked = allChecked;
                    tabCheckStates[tabId] = allChecked;
                }
            });
        });
    };

    // 1. 그리드 복제 생성 (Create Duplicated Grids)
    // 0번(기본)은 이미 존재하므로 1번부터 생성
    const paginationContainer = document.querySelector('.pagination-container');

    for (let i = 1; i < tabCount; i++) {
        const clone = grid0.cloneNode(true);
        clone.id = `md-grid-${i}`;
        clone.classList.remove('active');
        clone.style.display = 'none'; // 초기 숨김 처리

        // 커스텀 체크박스 재초기화 (Reset Custom Checkbox)
        clone.querySelectorAll('custom-checkbox').forEach(cb => {
            cb.innerHTML = '';
        });

        // 수량 조절 버튼 재초기화
        clone.querySelectorAll('.qty-box').forEach(box => {
            delete box.dataset.initialized;
        });

        // 자식 요소 섞기 (Shuffle Children)
        const children = Array.from(clone.children);
        const shuffled = shuffle(children);
        clone.innerHTML = '';
        shuffled.forEach(child => clone.appendChild(child));

        // 페이지네이션 이전에 추가하여 순서 유지
        if (paginationContainer) {
            gridParent.insertBefore(clone, paginationContainer);
        } else {
            gridParent.appendChild(clone);
        }
        grids.push(clone);
    }

    // 2. 모든 그리드 이벤트 초기화 (Init Events)
    grids.forEach((grid, index) => {
        const tabId = index.toString();

        // 수량 조절 기능 초기화 (Quantity Control)
        if (typeof initQuantityControl === 'function') {
            initQuantityControl(grid);
        }

        // 체크박스 이벤트 연결
        attachCheckboxEvents(grid, tabId);
    });

    // 3. 탭 전환 로직 (Tab Switching)
    tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            if (activeTabId === targetId) return;

            // 탭 UI 업데이트
            tabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 그리드 표시 상태 업데이트
            grids.forEach((g, index) => {
                if (index == targetId) {
                    g.classList.add('active');
                    g.style.display = 'grid';
                } else {
                    g.classList.remove('active');
                    g.style.display = 'none';
                }
            });

            activeTabId = targetId;

            // 전체 선택 상태 복원 (Restore Select All)
            if (searchSelectAll) {
                // 현재 그리드의 체크 상태 확인
                const currentGrid = grids[targetId];
                const checks = currentGrid.querySelectorAll('.item-check');
                // 실제 체크박스 상태로 확인
                const allChecked = checks.length > 0 && Array.from(checks).every(c => c.checked);
                searchSelectAll.checked = allChecked;
            }
        });
    });

    // 4. 전체 선택 로직 (Select All Logic)
    if (searchSelectAll) {
        searchSelectAll.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            tabCheckStates[activeTabId] = isChecked;

            const activeGrid = grids[activeTabId];
            if (activeGrid) {
                const checks = activeGrid.querySelectorAll('.item-check');
                checks.forEach(c => c.checked = isChecked);
            }
        });
    }

    // 5. 페이지당 아이템 수 로직 (Items Per Page)
    if (itemsPerPageOptions.length > 0) {
        itemsPerPageOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                currentLimit = parseInt(value, 10);
                updateVisibility();

                // 드롭다운 활성 상태 업데이트
                itemsPerPageOptions.forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
    }

    // 초기 가시성 설정 (Initial Visibility)
    updateVisibility();
});
