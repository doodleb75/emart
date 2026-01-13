document.addEventListener('DOMContentLoaded', () => {
    // 상품 그리드 및 더보기 버튼/페이지네이션 (Product Grid, Load More, Pagination)
    const grid = document.getElementById('md-grid-0');
    const btnLoadMore = document.getElementById('btnLoadMoreMD'); // Mobile 전용
    const paginationContainer = document.querySelector('.pagination-container'); // PC 전용
    if (!grid) return;

    // 1. 초기 상태 및 데이터 확장
    let isExpanded = false;
    let threshold = 5; // PC 기본 20개씩 보기
    let currentPage = 1;
    const totalItemsCount = 41; // HTML에 표시된 '총 41개'와 동기화

    // 0. 선택 초기화 함수 (Reset Selection)
    const selectAllBtn = document.getElementById('searchSelectAll');
    const resetSelection = () => {
        if (selectAllBtn) selectAllBtn.checked = false;
        const grid = document.getElementById('md-grid-0');
        if (grid) {
            grid.querySelectorAll('.item-check').forEach(check => {
                check.checked = false;
            });
        }
    };
    // 데이터 확장을 위한 복제 
    const prepareMockData = () => {
        const originalItems = Array.from(grid.querySelectorAll('.product-card'));
        if (originalItems.length === 0) return;

        // 원본 아이템에도 구매횟수 데이터 추가 
        originalItems.forEach((item, idx) => {
            if (!item.dataset.purchases) {
                item.dataset.purchases = (100 + (idx * 43) % 400); // 분산된 구매횟수 (Distributed purchase counts)
            }
        });

        let currentCount = originalItems.length;
        while (currentCount < totalItemsCount) {
            originalItems.forEach(item => {
                if (currentCount >= totalItemsCount) return;
                const clone = item.cloneNode(true);
                // 중복 ID 방지 (체크박스 등)
                clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
                // 초기화 상태 리셋 
                clone.querySelectorAll('.qty-box').forEach(box => {
                    delete box.dataset.initialized;
                });

                // 커스텀 체크박스 상태 리셋 
                const itemCheck = clone.querySelector('.item-check');
                if (itemCheck) {
                    itemCheck.removeAttribute('checked');
                    if (itemCheck.input) itemCheck.input.checked = false;
                }

                // 일반적인 룰에 따라 데이터가 겹치지 않도록 분산 배분 (Spread values to avoid identical sorting)
                const mockIndex = currentCount;
                const salesValue = (100 + (mockIndex * 71) % 900); // 100~1000 사이
                const purchasesValue = (50 + (mockIndex * 37) % 450); // 50~500 사이
                const priceValue = (12000 + (mockIndex * 157) % 23000); // 12,000~35,000 사이
                const day = 1 + (mockIndex * 13) % 28;
                const dateValue = `2024-01-${String(day).padStart(2, '0')}`;

                clone.dataset.sales = salesValue;
                clone.dataset.purchases = purchasesValue;
                clone.dataset.price = priceValue;
                clone.dataset.date = dateValue;

                // 가격 텍스트 업데이트 
                const priceEl = clone.querySelector('.price');
                if (priceEl) priceEl.textContent = priceValue.toLocaleString();

                grid.appendChild(clone);
                currentCount++;
            });
        }
    };
    prepareMockData();

    // 초기 수량 조절 초기화
    if (typeof initQuantityControl === 'function') {
        initQuantityControl(grid);
    }

    // 상품 리스트 실시간 조회
    const getProductItems = () => Array.from(grid.querySelectorAll('.product-card'));

    // 화면 업데이트 함수 (Main Display Logic)
    const updateDisplay = () => {
        const items = getProductItems();

        // 정렬/페이지네이션 적용 
        if (btnLoadMore && btnLoadMore.offsetParent !== null) {
            // Mobile: 더보기 방식
            items.forEach((item, index) => {
                if (isExpanded) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = index < 4 ? 'flex' : 'none'; // Mobile 기본 5개
                }
            });
            updateLoadMoreButton(items.length);
        } else {
            // PC: 페이지네이션 방식 
            const start = (currentPage - 1) * threshold;
            const end = start + threshold;

            items.forEach((item, index) => {
                if (index >= start && index < end) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
            updatePaginationUI(items.length);
        }
    };

    // 더보기 버튼 상태 업데이트 (Mobile Only)
    const updateLoadMoreButton = (total) => {
        if (!btnLoadMore) return;
        const mobileThreshold = 5;
        if (total <= mobileThreshold) {
            btnLoadMore.style.display = 'none';
        } else {
            btnLoadMore.style.display = 'flex';
            const btnText = btnLoadMore.querySelector('span') || btnLoadMore.firstChild;
            if (isExpanded) {
                if (btnText.nodeType === 3) btnLoadMore.firstChild.textContent = '상품 닫기 ';
                else btnText.textContent = '상품 닫기';
                btnLoadMore.querySelector('svg').style.transform = 'rotate(180deg)';
            } else {
                if (btnText.nodeType === 3) btnLoadMore.firstChild.textContent = '상품 더보기 ';
                else btnText.textContent = '상품 더보기';
                btnLoadMore.querySelector('svg').style.transform = 'rotate(0deg)';
            }
        }
    };

    // 페이지네이션 UI 업데이트 (PC Only)
    const updatePaginationUI = (total) => {
        if (!paginationContainer) return;
        const totalPages = Math.ceil(total / threshold);
        const navItems = paginationContainer.querySelectorAll('.btn-pagination:not(.btn-prev):not(.btn-next):not(.btn-prev-end):not(.btn-next-end)');

        navItems.forEach((btn, idx) => {
            const pageNum = idx + 1;
            if (pageNum > totalPages) {
                btn.style.display = 'none';
            } else {
                btn.style.display = '';
                if (pageNum === currentPage) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    };

    // 더보기 버튼 클릭 이벤트 
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            isExpanded = !isExpanded;
            updateDisplay();
            if (selectAllBtn) selectAllBtn.checked = false; // 보이기/숨기기 시 전체 선택 해제 (Uncheck Select All on toggle)

            if (!isExpanded) {
                const headerOffset = 150;
                const elementPosition = grid.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    }

    // 페이지네이션 클릭 이벤트 
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-pagination');
            if (!btn) return;
            e.preventDefault();

            if (btn.classList.contains('btn-prev-end')) currentPage = 1;
            else if (btn.classList.contains('btn-prev')) currentPage = Math.max(1, currentPage - 1);
            else if (btn.classList.contains('btn-next')) currentPage = Math.min(Math.ceil(totalItemsCount / threshold), currentPage + 1);
            else if (btn.classList.contains('btn-next-end')) currentPage = Math.ceil(totalItemsCount / threshold);
            else {
                const pageNum = parseInt(btn.textContent);
                if (!isNaN(pageNum)) currentPage = pageNum;
            }
            resetSelection(); // 페이지 이동 시 선택 초기화
            updateDisplay();
            window.scrollTo({ top: grid.offsetTop - 200, behavior: 'smooth' });
        });
    }

    // 2. 정렬 기능 
    const sortProducts = (criteria) => {
        const items = getProductItems();

        items.sort((a, b) => {
            const priceA = parseInt(a.dataset.price) || 0;
            const priceB = parseInt(b.dataset.price) || 0;
            const salesA = parseInt(a.dataset.sales) || 0;
            const salesB = parseInt(b.dataset.sales) || 0;
            const purchasesA = parseInt(a.dataset.purchases) || 0;
            const purchasesB = parseInt(b.dataset.purchases) || 0;
            const dateA = new Date(a.dataset.date || '2000-01-01').getTime();
            const dateB = new Date(b.dataset.date || '2000-01-01').getTime();

            switch (criteria) {
                case '판매순': return salesB - salesA;
                case '많은 구매횟수': return purchasesB - purchasesA;
                case '낮은가격순': return priceA - priceB;
                case '높은가격순': return priceB - priceA;
                case '신상품순': return dateB - dateA;
                default: return 0;
            }
        });

        items.forEach(item => grid.appendChild(item));

        // 수량 조절 재초기화 
        if (typeof initQuantityControl === 'function') {
            initQuantityControl(grid);
        }

        updateDisplay();
    };

    // 탭 메뉴 정렬 
    const tabMenu = document.querySelector('.tab-menu');
    if (tabMenu) {
        const tabItems = tabMenu.querySelectorAll('.tab-item');
        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                tabItems.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentPage = 1; // 정렬 시 1페이지로 리셋
                resetSelection(); // 탭 변경 시 선택 초기화
                sortProducts(tab.textContent.trim());
            });
        });
    }

    // 3. 드롭다운 기능 통합 관리 
    const initDropdowns = () => {
        const dropdownWrappers = document.querySelectorAll('.dropdown-wrapper');

        dropdownWrappers.forEach(wrap => {
            const trigger = wrap.querySelector('.select-wrap');
            const optionsArea = wrap.querySelector('.dropdown-options');
            const selectedValueLabel = wrap.querySelector('.selected-value');

            if (!trigger || !optionsArea) return;

            // 드롭다운 토글
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownWrappers.forEach(other => {
                    if (other !== wrap) other.classList.remove('active');
                });
                wrap.classList.toggle('active');
            });

            // 옵션 선택
            optionsArea.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                if (li) {
                    const text = li.textContent.trim();
                    const val = li.dataset.value;

                    optionsArea.querySelectorAll('li').forEach(item => item.classList.remove('active'));
                    li.classList.add('active');
                    if (selectedValueLabel) selectedValueLabel.textContent = text;
                    wrap.classList.remove('active');

                    if (trigger.id === 'itemsPerPageTrigger') {
                        threshold = parseInt(val) || 20;
                        currentPage = 1; // 개수 변경 시 1페이지로 리셋
                        isExpanded = false;
                        resetSelection(); // 개수 변경 시 선택 초기화
                        updateDisplay();
                    } else {
                        // 모바일 정렬 드롭다운일 때만 선택 초기화
                        if (btnLoadMore && btnLoadMore.offsetParent !== null) {
                            resetSelection();
                        }
                        sortProducts(text);
                    }
                }
            });
        });

        document.addEventListener('click', () => {
            dropdownWrappers.forEach(wrap => wrap.classList.remove('active'));
        });
    };
    initDropdowns();

    // 4. 체크박스 제어 
    if (selectAllBtn) {
        selectAllBtn.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const isMobile = btnLoadMore && btnLoadMore.offsetParent !== null;

            grid.querySelectorAll('.item-check').forEach(check => {
                const card = check.closest('.product-card');

                if (isMobile) {
                    // 모바일일 때는 보이는 것만 체크 
                    if (card && card.style.display !== 'none') {
                        check.checked = isChecked;
                    }
                } else {
                    // PC는 기존 로직 유지 
                    check.checked = isChecked;
                }
            });
        });

        grid.addEventListener('change', (e) => {
            if (e.target.closest('.item-check')) {
                const isMobile = btnLoadMore && btnLoadMore.offsetParent !== null;
                const itemChecks = Array.from(grid.querySelectorAll('.item-check'));

                if (isMobile) {
                    // 모바일: 보이는 상품의 체크박스 상태만 확인 
                    const visibleChecks = itemChecks.filter(check => {
                        const card = check.closest('.product-card');
                        return card && card.style.display !== 'none';
                    });
                    selectAllBtn.checked = visibleChecks.length > 0 && visibleChecks.every(c => c.checked);
                } else {
                    // PC: 기존 로직 유지
                    selectAllBtn.checked = itemChecks.every(c => c.checked);
                }
            }
        });
    }

    // 5. 수량 조절 초기화
    if (typeof initQuantityControl === 'function') {
        initQuantityControl(grid);
    }



    // 초기 실행 (Initial execution)
    const activeTab = document.querySelector('.tab-menu .tab-item.active');
    const activeOption = document.querySelector('.dropdown-options li.active');

    if (activeTab) {
        sortProducts(activeTab.textContent.trim());
    } else if (activeOption) {
        sortProducts(activeOption.textContent.trim());
    } else {
        // 기본 정렬 기준 강제 적용 (판매순)
        sortProducts('판매순');
    }
});
