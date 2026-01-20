// 검색창 드롭다운 및 관련 기능 제어
window.initSearchDropdown = function () {
    const searchContainer = document.querySelector('.search-container');

    // 이미 초기화되었거나 검색창이 없으면 중단
    if (!searchContainer || searchContainer.dataset.initialized) return;
    searchContainer.dataset.initialized = 'true';

    const searchInput = searchContainer.querySelector('.search-input');
    const btnClose = searchContainer.querySelector('.btn-close-search');
    const btnDeleteAll = searchContainer.querySelector('.btn-delete-all');
    const btnsDeleteItem = searchContainer.querySelectorAll('.btn-delete-item, .recent-delete-btn');
    const btnClear = searchContainer.querySelector('.btn-clear');
    const btnBackSearch = searchContainer.querySelector('.btn-back-search');

    const dropdownDefaultView = searchContainer.querySelector('.search-default-view');
    const dropdownAutocomplete = searchContainer.querySelector('.search-dropdown-autocomplete');

    // UI 상태 업데이트
    const updateDropdownView = () => {
        if (!dropdownDefaultView || !dropdownAutocomplete) return;

        const hasText = searchInput.value.trim().length > 0;

        // 텍스트 삭제 버튼 노출 제어
        if (btnClear) {
            btnClear.style.display = hasText ? 'flex' : 'none';
        }

        const isSearchActive = searchContainer.classList.contains('active');
        const dropdownMain = searchContainer.querySelector('.search-dropdown');

        if (dropdownMain) {
            dropdownMain.style.display = isSearchActive ? 'block' : 'none';
        }

        if (hasText) {
            dropdownDefaultView.style.display = 'none';
            dropdownAutocomplete.style.display = 'flex';
        } else {
            dropdownDefaultView.style.display = 'block';
            dropdownAutocomplete.style.display = 'none';
            if (dropdownMain && isSearchActive) dropdownMain.style.display = 'block';
        }

        // 모바일 헤더 및 본문 스크롤 제어
        const mobileHeader = searchContainer.closest('.mobile-header');
        if (mobileHeader) {
            if (isSearchActive) {
                mobileHeader.classList.add('search-active');
                document.body.style.overflow = 'hidden';
            } else {
                mobileHeader.classList.remove('search-active');
                document.body.style.overflow = '';
            }
        }
    };

    // 이벤트: 입력 텍스트 삭제
    if (btnClear) {
        btnClear.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            searchInput.value = '';
            searchInput.focus();
            updateDropdownView();
        });
    }

    // 클릭 감지 (드롭다운 내부 클릭 시 닫기 방지용)
    let isClickInside = false;

    searchContainer.addEventListener('mousedown', () => {
        isClickInside = true;
    });

    window.addEventListener('mouseup', () => {
        setTimeout(() => {
            isClickInside = false;
        }, 300);
    });

    // 이벤트: 검색창 포커스 및 입력
    if (searchInput) {
        const openSearch = () => {
            searchContainer.classList.add('active');
            updateDropdownView();
        };

        searchInput.addEventListener('click', openSearch);
        searchInput.addEventListener('focus', openSearch);
        searchInput.addEventListener('input', updateDropdownView);

        // 포커스 아웃 시 드롭다운 닫기 (지연 처리)
        searchInput.addEventListener('blur', (e) => {
            const relatedTarget = e.relatedTarget;

            // 내부 요소로 포커스 이동 시 유지
            if (isClickInside || (relatedTarget && searchContainer.contains(relatedTarget))) {
                return;
            }

            // 외부 클릭 시 닫기
            setTimeout(() => {
                if (!isClickInside) {
                    searchContainer.classList.remove('active');
                    updateDropdownView();
                }
            }, 150);
        });
    }

    // 이벤트: 닫기 버튼
    if (btnClose) {
        btnClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            searchContainer.classList.remove('active');
            updateDropdownView();
        });
    }

    // 이벤트: 뒤로가기 (모바일)
    if (btnBackSearch) {
        btnBackSearch.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            searchContainer.classList.remove('active');
            if (searchInput) searchInput.blur();
            updateDropdownView();
        });
    }

    // 이벤트: 전체 삭제 (기능 미구현, 전파 방지만)
    if (btnDeleteAll) {
        btnDeleteAll.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // 인기검색어 탭 전환
    const rankTabs = searchContainer.querySelectorAll('.rank-tabs .tab-item');
    const rankLists = searchContainer.querySelectorAll('.popular-list');

    if (rankTabs.length > 0) {
        rankTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = tab.dataset.target;

                // 탭 UI 갱신
                rankTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // 리스트 교체
                rankLists.forEach(list => {
                    list.style.display = list.id === targetId ? 'block' : 'none';
                });
            });
        });
    }

    // 개별 삭제 버튼 (전파 방지)
    btnsDeleteItem.forEach(btn => {
        btn.addEventListener('click', (e) => e.stopPropagation());
    });

    // 외부 영역 클릭 시 닫기
    document.addEventListener('click', (event) => {
        if (searchContainer.classList.contains('active')) {
            if (!searchContainer.contains(event.target) && !isClickInside) {
                searchContainer.classList.remove('active');
                updateDropdownView();
            }
        }
    });

    // 바텀시트 드래그 기능 연결 (utils.js 의존)
    if (window.initOffcanvasDrag) window.initOffcanvasDrag();
};
