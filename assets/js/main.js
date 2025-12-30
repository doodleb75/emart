// 좌측 메뉴 데이터 정의
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
                // 기존 선택 해제
                sidebarItems.forEach(i => i.classList.remove('active'));
                // 신규 항목 선택
                item.classList.add('active');

                // 하위 목록 갱신
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

    // GNB 및 검색창 너비 조정
    function adjustNavWidth() {
        const navList = document.querySelector('.gnb-list');
        const searchContainer = document.querySelector('.search-container');

        if (navList && searchContainer) {
            // 스타일 초기화
            searchContainer.style.width = '';
            searchContainer.style.marginLeft = '';

            const listItems = navList.querySelectorAll('li');
            if (listItems.length > 0) {
                const firstRect = listItems[0].getBoundingClientRect();
                const lastRect = listItems[listItems.length - 1].getBoundingClientRect();
                const navWidth = lastRect.right - firstRect.left;

                // 검색창 위치 계산
                const searchRect = searchContainer.getBoundingClientRect();

                // 좌측 여백 계산
                const offsetLeft = firstRect.left - searchRect.left;

                // 스타일 적용
                searchContainer.style.width = `${navWidth}px`;
                searchContainer.style.marginLeft = `${offsetLeft}px`;
            }
        }
    }

    // 초기화 및 리사이즈 이벤트 등록
    adjustNavWidth();
    window.addEventListener('resize', adjustNavWidth);

    // 주간 랭킹 토글
    const rankingWrapper = document.querySelector('.weekly-ranking') || document.querySelector('.ranking-carousel-container');

    if (rankingWrapper) {
        rankingWrapper.addEventListener('click', (e) => {
            const header = e.target.closest('.ranking-header');
            if (!header) return;

            const item = header.closest('.ranking-item');
            if (!item) return;

            const toggleBtn = item.querySelector('.btn-toggle-rank');
            const body = item.querySelector('.ranking-body');

            if (toggleBtn && body) {
                const isActive = item.classList.contains('active');

                // 중복 클릭 방지
                if (isActive) {
                    return;
                }

                // 다른 항목 접기
                const parentList = item.closest('.ranking-list');
                if (parentList) {
                    const siblings = parentList.querySelectorAll('.ranking-item');
                    siblings.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherBtn = otherItem.querySelector('.btn-toggle-rank');
                            const otherBody = otherItem.querySelector('.ranking-body');
                            if (otherBtn) otherBtn.classList.remove('active');
                            if (otherBody) otherBody.classList.remove('show');
                        }
                    });
                }

                // 선택 항목 펼치기
                item.classList.add('active');
                toggleBtn.classList.add('active');
                body.classList.add('show');
            }
        });
    }

    // 주간 랭킹 더보기 로직
    const initRankingItem = (item) => {
        const btnMore = item.querySelector('.btn-more');
        const grid = item.querySelector('.ranking-body .product-grid-2');

        if (btnMore && grid) {
            // 초기화 여부 확인
            if (item.dataset.loadMoreInitialized) return;
            item.dataset.loadMoreInitialized = 'true';

            const cards = grid.querySelectorAll('.product-card');
            const itemsPerView = 2; // 초기 노출 개수

            // 2개 이하 버튼 숨김
            if (cards.length <= itemsPerView) {
                btnMore.style.display = 'none';
                cards.forEach(card => card.style.display = 'flex');
                return;
            }

            // 상태 초기화
            let visibleCount = itemsPerView;

            // 노출 상태 초기화
            cards.forEach((card, index) => {
                if (index >= visibleCount) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                }
            });

            const updateButton = () => {
                let textNode = btnMore.firstChild;

                if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
                    textNode = document.createTextNode('');
                    btnMore.prepend(textNode);
                }

                const svgs = btnMore.querySelectorAll('svg');

                if (visibleCount >= cards.length) {
                    // 닫기 상태
                    textNode.textContent = '상품 닫기 ';
                    if (svgs.length > 0) {
                        svgs[0].innerHTML = '<path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="currentColor" />';
                    }
                } else {
                    // 더보기 상태
                    textNode.textContent = '상품 더보기 ';
                    if (svgs.length > 0) {
                        svgs[0].innerHTML = '<path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor" />';
                    }
                }
            };

            // 버튼 초기화
            updateButton();

            // 이벤트 리스너
            btnMore.addEventListener('click', (e) => {
                e.stopPropagation();

                if (visibleCount >= cards.length) {
                    // 닫기 동작
                    visibleCount = itemsPerView;
                    cards.forEach((card, index) => {
                        if (index >= visibleCount) card.style.display = 'none';
                    });
                    // 상단 스크롤 이동
                    const header = item.querySelector('.ranking-header');
                    if (header) {
                        const y = header.getBoundingClientRect().top + window.pageYOffset - 110;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                } else {
                    // 더보기 동작
                    const nextCount = visibleCount + 2;
                    for (let i = visibleCount; i < nextCount && i < cards.length; i++) {
                        cards[i].style.display = 'flex';
                    }
                    visibleCount = nextCount;
                }
                updateButton();
            });
        }
    };

    // 초기 아이템 설정
    if (rankingWrapper) {
        const rankingItems = rankingWrapper.querySelectorAll('.ranking-item');
        rankingItems.forEach(item => initRankingItem(item));
    }

    // MD 추천 상품 탭 기능
    const mdTabItems = document.querySelectorAll('.tab-menu .tab-item');
    const mdTabContents = document.querySelectorAll('.md-rec-content');

    if (mdTabItems && mdTabContents.length > 0) {
        mdTabItems.forEach((item) => {
            item.addEventListener('click', () => {
                const index = item.dataset.tab;

                // 기존 탭 비활성화
                mdTabItems.forEach(tab => tab.classList.remove('active'));
                // 신규 탭 활성화
                item.classList.add('active');

                // 전체 콘텐츠 숨김
                mdTabContents.forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('active');
                });

                // 선택 콘텐츠 표시
                const targetContent = document.getElementById(`md-grid-${index}`);
                if (targetContent) {
                    targetContent.style.display = 'grid';
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // 메인 배너 슬라이더 기능
    const mainCarouselEl = document.getElementById('eclubMainSlider');
    if (mainCarouselEl) {
        const track = mainCarouselEl.querySelector('.carousel-inner');
        const btnPrev = document.querySelector('.btn-prev');
        const btnNext = document.querySelector('.btn-next');
        const btnPause = document.querySelector('.btn-pause');
        const currentPageEl = document.querySelector('.current-page');
        const totalPageEl = document.querySelector('.total-page');

        // 상태 변수 초기화
        const initialCards = Array.from(track.querySelectorAll('.slider-card'));
        const totalItems = initialCards.length;
        let currentIndex = 1;
        let isPlaying = true;
        let isAnimating = false;
        let autoPlayInterval;

        // 슬라이더 설정
        const checkInterval = 3000;
        const transitionTime = 500;
        const contentWidth = 1360; // 콘텐츠 너비
        const gap = 24; // 간격

        // 동적 상태 값
        let baseOffset = 0;
        let cardWidth = 0;
        let prependCount = 0;

        function initSlider() {
            if (!track || initialCards.length === 0) return;

            // 카드 크기 측정
            const tempCard = initialCards[0];
            const computedStyle = window.getComputedStyle(tempCard);
            cardWidth = tempCard.offsetWidth || 440;
            if (cardWidth === 0) cardWidth = 437.33;

            const fullItemWidth = cardWidth + gap;

            // 시작 위치 계산
            const windowWidth = window.innerWidth;
            let gridStartX = (windowWidth - contentWidth) / 2;
            if (gridStartX < 0) gridStartX = 0;

            // 필요 복제본 수 계산
            const neededLeft = Math.ceil(gridStartX / fullItemWidth) + 2;
            const neededRight = Math.ceil((windowWidth - (gridStartX + contentWidth)) / fullItemWidth) + 2;

            // 슬라이더 트랙 초기화
            track.innerHTML = '';

            // 요소 복제 함수
            const appendClone = (item) => {
                const clone = item.cloneNode(true);
                clone.classList.add('cloned');
                track.appendChild(clone);
            };

            prependCount = neededLeft;

            // 좌측 영역 채우기
            for (let i = 0; i < neededLeft; i++) {
                let index = (totalItems - 1 - (i % totalItems));
            }

            const fragment = document.createDocumentFragment();

            // 앞쪽 복제본 추가
            for (let i = neededLeft; i > 0; i--) {
                let index = (totalItems - (i % totalItems)) % totalItems;
                appendClone(initialCards[index]);
            }

            // 원본 항목 추가
            initialCards.forEach(card => {
                track.appendChild(card);
            });

            // 뒤쪽 복제본 추가
            for (let i = 0; i < neededRight; i++) {
                let index = i % totalItems;
                appendClone(initialCards[index]);
            }

            // 초기 위치 설정
            baseOffset = gridStartX - (prependCount * fullItemWidth);

            track.style.transition = 'none';
            track.style.transform = `translateX(${baseOffset}px)`;

            if (totalPageEl) totalPageEl.textContent = String(totalItems).padStart(2, '0');
            updatePagination();
        }

        // 초기화
        initSlider();
        window.addEventListener('resize', () => {
            initSlider();
        });


        // 자동 재생 시작
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                if (!isAnimating) moveNext();
            }, checkInterval);
        }

        // 자동 재생 정지
        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        if (isPlaying) startAutoPlay();


        // 다음 슬라이드 이동
        function moveNext() {
            if (!track || isAnimating) return;
            isAnimating = true;

            const fullItemWidth = cardWidth + gap;

            track.style.transition = `transform ${transitionTime}ms ease-in-out`;
            track.style.transform = `translateX(${baseOffset - fullItemWidth}px)`;

            track.addEventListener('transitionend', function () {
                track.style.transition = 'none';

                // 첫 번째 항목 뒤로 이동
                const first = track.firstElementChild;
                track.appendChild(first);

                // 위치 재설정
                track.style.transform = `translateX(${baseOffset}px)`;

                updateCurrentIndex(true);
                isAnimating = false;
            }, { once: true });
        }

        // 이전 슬라이드 이동
        function movePrev() {
            if (!track || isAnimating) return;
            isAnimating = true;

            const fullItemWidth = cardWidth + gap;

            // 마지막 항목 앞으로 이동
            const last = track.lastElementChild;
            track.insertBefore(last, track.firstElementChild);

            // 위치 조정
            track.style.transition = 'none';
            track.style.transform = `translateX(${baseOffset - fullItemWidth}px)`;

            // 강제 리플로우 (애니메이션 초기화)
            void track.offsetWidth;

            // 슬라이드 애니메이션
            track.style.transition = `transform ${transitionTime}ms ease-in-out`;
            track.style.transform = `translateX(${baseOffset}px)`;

            track.addEventListener('transitionend', function () {
                updateCurrentIndex(false);
                isAnimating = false;
            }, { once: true });
        }

        function updateCurrentIndex(isNext) {
            if (isNext) {
                currentIndex = currentIndex >= totalItems ? 1 : currentIndex + 1;
            } else {
                currentIndex = currentIndex <= 1 ? totalItems : currentIndex - 1;
            }
            updatePagination();
        }

        function updatePagination() {
            if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');
        }

        // 이벤트 리스너 등록
        if (btnNext) btnNext.addEventListener('click', () => { stopAutoPlay(); moveNext(); if (isPlaying) startAutoPlay(); });
        if (btnPrev) btnPrev.addEventListener('click', () => { stopAutoPlay(); movePrev(); if (isPlaying) startAutoPlay(); });

        if (btnPause) {
            btnPause.addEventListener('click', () => {
                if (isPlaying) {
                    stopAutoPlay();
                    isPlaying = false;
                    btnPause.innerHTML = `
                        <svg class="icon-slider-play" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                            <path d="M0 0h24v24H0V0z" fill="none"/>
                            <path d="M8 5v14l11-7z"/>
                        </svg>`;
                } else {
                    startAutoPlay();
                    isPlaying = true;
                    btnPause.innerHTML = `
                        <svg class="icon-slider-pause" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                           <path d="M0 0h24v24H0V0z" fill="none"/>
                           <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>`;
                }
            });
        }
    }
    // ==========================================
    // 주간 랭킹 슬라이더 기능
    // ==========================================

    // 모바일 카러셀 요소
    const mobileRankingNav = document.querySelector('.ranking-nav');
    const mobileRankingContainer = document.querySelector('.ranking-carousel-container');
    const mobileRankingTrack = document.querySelector('.ranking-carousel-track');
    const mobileRankingList = document.querySelector('.ranking-list');

    // PC 버전 로직 (weekly-ranking 존재 시)
    const pcRankingSection = document.querySelector('.weekly-ranking');

    // 모바일 카러셀 로직
    if (mobileRankingNav && mobileRankingContainer && mobileRankingTrack && mobileRankingList) {
        const btnPrev = mobileRankingNav.querySelector('.nav-btn.prev');
        const btnNext = mobileRankingNav.querySelector('.nav-btn.next');
        const currentPageEl = document.getElementById('rankingCurrentPage');
        const totalPageEl = document.getElementById('rankingTotalPage');

        if (btnPrev && btnNext) {
            let currentIndex = 1;
            // 총 5개 아이템 (4개 복제)
            const totalClones = 4;
            const totalItems = totalClones + 1;

            // 랭킹 리스트 4회 복제
            for (let i = 0; i < totalClones; i++) {
                const clone = mobileRankingList.cloneNode(true);

                // 복제 아이템 더보기 로직 초기화
                const clonedItems = clone.querySelectorAll('.ranking-item');
                clonedItems.forEach(item => {
                    // 데이터 속성 초기화 및 로직 재실행
                    delete item.dataset.loadMoreInitialized;
                    initRankingItem(item);
                });

                mobileRankingTrack.appendChild(clone);
            }

            // 페이지네이션 초기화
            if (totalPageEl) totalPageEl.textContent = String(totalItems).padStart(2, '0');
            if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');

            const updateCarousel = () => {
                if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');

                // 트랙 이동
                mobileRankingTrack.style.transform = `translateX(-${(currentIndex - 1) * 100}%)`;
            };

            // 다음 버튼
            btnNext.addEventListener('click', () => {
                if (currentIndex < totalItems) {
                    currentIndex++;
                } else {
                    currentIndex = 1; // Loop back to start
                }
                updateCarousel();
            });

            // 이전 버튼
            // 버튼 활성화
            btnPrev.removeAttribute('disabled');

            btnPrev.addEventListener('click', () => {
                if (currentIndex > 1) {
                    currentIndex--;
                } else {
                    currentIndex = totalItems; // Loop to end
                }
                updateCarousel();
            });
        }
    }

    if (typeof initQuantityControl === 'function') {
        initQuantityControl(document);
    } else {
        console.warn('initQuantityControl function not found. Please load quantity-control.js');
    }
    // ==========================================
    // 수량 증감 기능 (Shared Quantity Control)
    // ==========================================
    if (typeof initQuantityControl === 'function') {
        initQuantityControl(document);
    } else {
        console.warn('initQuantityControl function not found. Please load quantity-control.js');
    }

    // ==========================================
    // 장바구니 체크박스 및 탭 기능
    // ==========================================
    const selectAll = document.getElementById('selectAll');
    const cartTabs = document.querySelectorAll('.category-tabs .tab-item');
    const sectionCheckboxes = document.querySelectorAll('.section-check');

    // 필수 요소 확인
    if (selectAll || document.querySelector('.section-check') || cartTabs.length > 0) {

        function getActiveSection() {
            return document.querySelector('.cart-content');
        }

        // 전체 선택 체크박스 동기화
        function updateSelectAllState() {
            if (!selectAll) return;

            const activeSection = getActiveSection();
            if (!activeSection) return;

            const itemsInActiveSection = activeSection.querySelectorAll('.item-check');

            if (itemsInActiveSection.length === 0) {
                selectAll.checked = false;
                return;
            }

            const allChecked = Array.from(itemsInActiveSection).every(cb => cb.checked);
            selectAll.checked = allChecked;
        }

        // 전체 선택 기능
        if (selectAll) {
            selectAll.addEventListener('change', function () {
                const isChecked = this.checked;
                const activeSection = getActiveSection();
                if (activeSection) {
                    activeSection.querySelectorAll('.item-check, .section-check').forEach(cb => {
                        cb.checked = isChecked;
                    });
                }
            });
        }

        // 개별/구역 선택 기능
        sectionCheckboxes.forEach(sectionCb => {
            const sectionContainer = sectionCb.closest('.cart-section');
            if (!sectionContainer) return;

            const itemsInSection = sectionContainer.querySelectorAll('.item-check');

            itemsInSection.forEach(itemCb => {
                itemCb.addEventListener('change', function () {
                    const allSectionItemsChecked = Array.from(itemsInSection).every(cb => cb.checked);
                    sectionCb.checked = allSectionItemsChecked;
                    updateSelectAllState();
                });
            });

            sectionCb.addEventListener('change', function () {
                const isChecked = this.checked;
                itemsInSection.forEach(cb => cb.checked = isChecked);
                updateSelectAllState();
            });
        });

        // 탭 스크롤 연동 기능
        if (cartTabs.length > 0) {
            // 탭 클릭 시 이동
            cartTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // 기존 탭 비활성화
                    cartTabs.forEach(t => t.classList.remove('active'));
                    // 신규 탭 활성화
                    tab.classList.add('active');
                    // 스크롤은 앵커 기본 동작
                });
            });

            // 스크롤 위치 감지
            const observerOptions = {
                root: null,
                rootMargin: '-20% 0px -60% 0px',
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        // 현재 섹션의 탭 찾기
                        const activeTab = document.querySelector(`.category-tabs .tab-item[href="#${id}"]`) ||
                            document.querySelector(`.category-tabs .tab-item[data-target="${id}"]`);

                        if (activeTab) {
                            cartTabs.forEach(t => t.classList.remove('active'));
                            activeTab.classList.add('active');
                        }
                    }
                });
            }, observerOptions);

            document.querySelectorAll('.cart-section').forEach(section => {
                observer.observe(section);
            });
        }
        updateSelectAllState();
    }

    // ==========================================
    // 검색 결과 전체 선택 기능
    // ==========================================
    const searchSelectAll = document.getElementById('searchSelectAll');
    if (searchSelectAll) {
        const searchItems = document.querySelectorAll('.product-grid-4 .item-check');

        // 전체 선택/해제
        searchSelectAll.addEventListener('change', (e) => {
            const isChecked = searchSelectAll.checked;
            searchItems.forEach(cb => {
                cb.checked = isChecked;
            });
        });

        // 개별 선택에 따른 전체 선택 상태 갱신
        searchItems.forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(searchItems).every(c => c.checked);
                searchSelectAll.checked = allChecked;
            });
        });
    }

    // ==========================================
    // 보기 옵션 드롭다운 기능
    // ==========================================
    const itemsPerPageTrigger = document.getElementById('itemsPerPageTrigger');
    if (itemsPerPageTrigger) {
        const dropdownWrapper = itemsPerPageTrigger.closest('.dropdown-wrapper');
        const optionsList = dropdownWrapper.querySelector('.dropdown-options');
        const options = optionsList.querySelectorAll('li');
        const selectedText = itemsPerPageTrigger.querySelector('.selected-value');

        // 드롭다운 토글
        itemsPerPageTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownWrapper.classList.toggle('active');
        });

        // 옵션 선택
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();

                // 선택값 표시 업데이트
                const valueText = option.textContent;
                if (selectedText) selectedText.textContent = valueText;

                // 활성 옵션 변경
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // 드롭다운 닫기
                dropdownWrapper.classList.remove('active');

                // Optional: Trigger Reload/Search here
                console.log(`Changed to ${option.dataset.value} items per page`);
            });
        });

        // 외부 클릭 감지 (닫기)
        document.addEventListener('click', (e) => {
            if (!dropdownWrapper.contains(e.target)) {
                dropdownWrapper.classList.remove('active');
            }
        });

        // ---------------------------------------------------------
        // 드롭다운 너비 자동 조정
        // ---------------------------------------------------------
        function adjustDropdownWidth() {
            // 텍스트 측정용 임시 요소 생성
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.fontSize = '14px'; // Match CSS rem(14)
            tempSpan.style.fontWeight = '400'; // Standard weight
            tempSpan.style.whiteSpace = 'nowrap';
            document.body.appendChild(tempSpan);

            let maxWidth = 0;
            const texts = Array.from(options).map(o => o.textContent.trim());
            // 선택된 텍스트 포함
            if (selectedText) texts.push(selectedText.textContent.trim());

            texts.forEach(text => {
                tempSpan.textContent = text;
                const w = tempSpan.offsetWidth;
                if (w > maxWidth) maxWidth = w;
            });

            document.body.removeChild(tempSpan);

            // 전체 필요 너비 계산
            const extraSpace = 32 + 12 + 20 + 4;
            const requiredWidth = maxWidth + extraSpace;

            // 최소 너비 적용
            dropdownWrapper.style.width = `${Math.max(requiredWidth, 130)}px`;
        }

        // 초기 실행
        adjustDropdownWidth();
    }

    // 찜하기 버튼 토글 기능
    document.body.addEventListener('click', (e) => {
        // 아이콘 버튼 확인
        const btn = e.target.closest('.btn-icon');
        if (btn && btn.querySelector('.icon-heart')) {
            e.preventDefault();
            btn.classList.toggle('active');

            const path = btn.querySelector('path');
            if (path) {
                if (btn.classList.contains('active')) {
                    // 활성 상태 아이콘 (채워진 하트)
                    path.setAttribute('d', 'M8.33333 15.2917L7.125 14.1917C2.83333 10.3 0 7.73333 0 4.58333C0 2.01667 2.01667 0 4.58333 0C6.03333 0 7.425 0.675 8.33333 1.74167C9.24166 0.675 10.6333 0 12.0833 0C14.65 0 16.6667 2.01667 16.6667 4.58333C16.6667 7.73333 13.8333 10.3 9.54167 14.2L8.33333 15.2917Z');
                    path.setAttribute('fill', '#FF5447');
                } else {
                    // 비활성 상태 아이콘 (빈 하트)
                    path.setAttribute('d', 'M8.33333 15.2917L7.125 14.2083C5.72222 12.9444 4.5625 11.8542 3.64583 10.9375C2.72917 10.0208 2 9.19792 1.45833 8.46875C0.916667 7.73958 0.538194 7.06944 0.322917 6.45833C0.107639 5.84722 0 5.22222 0 4.58333C0 3.27778 0.4375 2.1875 1.3125 1.3125C2.1875 0.4375 3.27778 0 4.58333 0C5.30555 0 5.99305 0.152778 6.64583 0.458333C7.29861 0.763889 7.86111 1.19444 8.33333 1.75C8.80555 1.19444 9.36805 0.763889 10.0208 0.458333C10.6736 0.152778 11.3611 0 12.0833 0C13.3889 0 14.4792 0.4375 15.3542 1.3125C16.2292 2.1875 16.6667 3.27778 16.6667 4.58333C16.6667 5.22222 16.559 5.84722 16.3437 6.45833C16.1285 7.06944 15.75 7.73958 15.2083 8.46875C14.6667 9.19792 13.9375 10.0208 13.0208 10.9375C12.1042 11.8542 10.9444 12.9444 9.54167 14.2083L8.33333 15.2917ZM8.33333 13.0417C9.66667 11.8472 10.7639 10.8229 11.625 9.96875C12.4861 9.11458 13.1667 8.37153 13.6667 7.73958C14.1667 7.10764 14.5139 6.54514 14.7083 6.05208C14.9028 5.55903 15 5.06944 15 4.58333C15 3.75 14.7222 3.05556 14.1667 2.5C13.6111 1.94444 12.9167 1.66667 12.0833 1.66667C11.4306 1.66667 10.8264 1.85069 10.2708 2.21875C9.71528 2.58681 9.33333 3.05556 9.125 3.625H7.54167C7.33333 3.05556 6.95139 2.58681 6.39583 2.21875C5.84028 1.85069 5.23611 1.66667 4.58333 1.66667C3.75 1.66667 3.05556 1.94444 2.5 2.5C1.94444 3.05556 1.66667 3.75 1.66667 4.58333C1.66667 5.06944 1.76389 5.55903 1.95833 6.05208C2.15278 6.54514 2.5 7.10764 3 7.73958C3.5 8.37153 4.18055 9.11458 5.04167 9.96875C5.90278 10.8229 7 11.8472 8.33333 13.0417Z');
                    path.setAttribute('fill', '#444444');
                }
            }
        }
    });



    // ==========================================
    // 공통 모바일 스크롤 슬라이더 (Mobile Scroll Slider)
    // ==========================================
    const initMobileScrollSlider = (wrapperSelector, trackSelector, autoPlay = true) => {
        const wrapper = document.querySelector(wrapperSelector);
        if (!wrapper) return;

        const track = wrapper.querySelector(trackSelector);
        if (!track) return;

        const slides = track.querySelectorAll('.slide-item');
        if (slides.length === 0) return;

        // Controller Elements
        const btnPrev = wrapper.querySelector('.btn-prev');
        const btnNext = wrapper.querySelector('.btn-next');
        const btnPause = wrapper.querySelector('.btn-pause');
        const currentEl = wrapper.querySelector('.page-count .current');
        const totalEl = wrapper.querySelector('.page-count .total');

        // State
        let currentIndex = 0;
        const totalSlides = slides.length;
        let isPaused = false;
        let autoPlayInterval;

        // Init Pagination
        if (totalEl) totalEl.textContent = String(totalSlides).padStart(2, '0');

        // Observer for Active Slide
        const observerOptions = {
            root: track,
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(slides).indexOf(entry.target);
                    if (index !== -1) {
                        currentIndex = index;
                        if (currentEl) currentEl.textContent = String(currentIndex + 1).padStart(2, '0');
                        updateNavButtons();
                    }
                }
            });
        }, observerOptions);

        slides.forEach(slide => observer.observe(slide));

        const updateNavButtons = () => {
            // Loop mode: buttons always active if there are multiple slides
            const hasMultipleSlides = totalSlides > 1;

            if (btnPrev) {
                btnPrev.classList.toggle('active', hasMultipleSlides);
                const path = btnPrev.querySelector('path');
                if (path) path.setAttribute('fill', hasMultipleSlides ? '#222222' : '#E3E3E3');
            }
            if (btnNext) {
                btnNext.classList.toggle('active', hasMultipleSlides);
                const path = btnNext.querySelector('path');
                if (path) path.setAttribute('fill', hasMultipleSlides ? '#222222' : '#E3E3E3');
            }
        };

        const scrollToSlide = (index) => {
            if (index < 0 || index >= totalSlides) return;
            const target = slides[index];
            const targetLeft = target.offsetLeft;
            track.scrollTo({ left: targetLeft, behavior: 'smooth' });
        };

        if (btnPrev) btnPrev.addEventListener('click', () => {
            let nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = totalSlides - 1; // Loop to last
            stopAutoPlayIfNeeded();
            scrollToSlide(nextIndex);
        });

        if (btnNext) btnNext.addEventListener('click', () => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= totalSlides) nextIndex = 0; // Loop to first
            stopAutoPlayIfNeeded();
            scrollToSlide(nextIndex);
        });

        // AutoPlay Logic
        const startAutoPlay = () => {
            if (!autoPlay) return;
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                if (isPaused) return;

                let nextIndex = currentIndex + 1;
                if (nextIndex >= totalSlides) nextIndex = 0;

                scrollToSlide(nextIndex);
            }, 3000);
        };

        const stopAutoPlay = () => {
            clearInterval(autoPlayInterval);
        };

        const stopAutoPlayIfNeeded = () => {
            stopAutoPlay();
            startAutoPlay();
        };

        if (btnPause) {
            btnPause.addEventListener('click', () => {
                isPaused = !isPaused;
                const iconPause = btnPause.querySelector('.icon-pause');
                const iconPlay = btnPause.querySelector('.icon-play');
                if (isPaused) {
                    if (iconPause) iconPause.style.display = 'none';
                    if (iconPlay) iconPlay.style.display = 'block';
                } else {
                    if (iconPause) iconPause.style.display = 'block';
                    if (iconPlay) iconPlay.style.display = 'none';
                }
            });
        }

        if (autoPlay) startAutoPlay();

        // Touch interaction pauses autoplay
        track.addEventListener('touchstart', () => stopAutoPlay());
        track.addEventListener('touchend', () => startAutoPlay());
    };

    // Initialize logic
    initMobileScrollSlider('.mobile-main-slider', '#mobileMainTrack');
    initMobileScrollSlider('.popcorn-banner-wrapper', '#popcornBannerTrack');
});
// 검색 드롭다운 로직
document.addEventListener('headerLoaded', function () {
    const searchContainer = document.querySelector('.search-container');

    if (searchContainer) {
        const searchInput = searchContainer.querySelector('.search-input');
        const btnClose = searchContainer.querySelector('.btn-close-search');
        const btnDeleteAll = searchContainer.querySelector('.btn-delete-all');
        const btnsDeleteItem = searchContainer.querySelectorAll('.btn-delete-item');

        const btnClear = searchContainer.querySelector('.btn-clear');

        const dropdownDefaultView = searchContainer.querySelector('.search-default-view');
        const dropdownAutocomplete = searchContainer.querySelector('.search-dropdown-autocomplete');

        const updateDropdownView = () => {
            if (!dropdownDefaultView || !dropdownAutocomplete) return;

            const hasText = searchInput.value.trim().length > 0;

            // X 버튼 토글
            if (btnClear) {
                btnClear.style.display = hasText ? 'flex' : 'none';
            }

            if (hasText) {
                dropdownDefaultView.style.display = 'none';
                dropdownAutocomplete.style.display = 'flex';
            } else {
                dropdownDefaultView.style.display = 'block';
                dropdownAutocomplete.style.display = 'none';
            }
        };

        if (btnClear) {
            btnClear.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                searchInput.value = '';
                searchInput.focus();
                updateDropdownView();
            });
        }


        if (searchInput) {
            const openSearch = () => {
                searchContainer.classList.add('active');
                updateDropdownView();
            };
            searchInput.addEventListener('click', openSearch);
            searchInput.addEventListener('focus', openSearch);
            searchInput.addEventListener('input', updateDropdownView);
        }

        if (btnClose) {
            btnClose.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                searchContainer.classList.remove('active');
            });
        }

        // 전체 삭제 버튼
        if (btnDeleteAll) {
            btnDeleteAll.addEventListener('click', (e) => {
                // 삭제 로직
                e.stopPropagation();
            });
        }

        // 인기검색어 탭 기능
        const rankTabs = searchContainer.querySelectorAll('.rank-tabs .tab-item');
        const rankLists = searchContainer.querySelectorAll('.popular-list');

        if (rankTabs.length > 0) {
            rankTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.stopPropagation(); // 드롭다운 닫힘 방지
                    const targetId = tab.dataset.target;

                    // 탭 활성화
                    rankTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // 리스트 표시
                    rankLists.forEach(list => {
                        if (list.id === targetId) {
                            list.style.display = 'block';
                        } else {
                            list.style.display = 'none';
                        }
                    });
                });
            });
        }

        btnsDeleteItem.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // 삭제 로직
            });
        });
    }

    // 영역 외 클릭 시 닫기
    document.addEventListener('click', function (event) {
        if (searchContainer && searchContainer.classList.contains('active')) {
            if (!searchContainer.contains(event.target)) {
                searchContainer.classList.remove('active');
            }
        }
    });
});
// 모바일 슬라이더 로직
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('mobileMainTrack');
    if (!track) return;

    // 설장 값
    let originalSlides = Array.from(track.querySelectorAll('.slide-item'));
    if (originalSlides.length < 2) return;

    const slideCount = originalSlides.length;
    const currentEl = document.getElementById('currentSlide');
    const totalEl = document.getElementById('totalSlides');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnPause = document.getElementById('btnPause');

    // 아이콘
    const iconPause = btnPause ? btnPause.querySelector('.icon-pause') : null;
    const iconPlay = btnPause ? btnPause.querySelector('.icon-play') : null;

    // 무한 루프 복제
    const cloneCount = 5;
    const firstClones = [];
    const lastClones = [];

    // 슬라이드 복제
    for (let i = 0; i < cloneCount; i++) {
        firstClones.push(originalSlides[i % slideCount].cloneNode(true));
        let index = (slideCount - 1 - (i % slideCount));
        lastClones.push(originalSlides[index].cloneNode(true));
    }

    // 뒤쪽 복제본 앞 추가
    lastClones.forEach(clone => {
        clone.classList.add('clone-last');
        track.insertBefore(clone, track.firstElementChild);
    });

    // 앞쪽 복제본 뒤 추가
    firstClones.forEach(clone => {
        clone.classList.add('clone-first');
        track.appendChild(clone);
    });

    // 슬라이드 리스트 갱신
    const allSlides = Array.from(track.querySelectorAll('.slide-item'));

    // 초기 상태
    if (totalEl) totalEl.textContent = slideCount.toString().padStart(2, '0');

    let isPlaying = true;
    let autoplayInterval;
    const autoplayDelay = 3000;

    // 치수 계산
    const getMetrics = () => {
        const realSlide = allSlides[cloneCount];
        const slideWidth = realSlide.offsetWidth;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.columnGap) || 8;
        return { slideWidth, gap, fullWidth: slideWidth + gap };
    };

    // 스크롤 위치 초기화
    const initPosition = () => {
        const { fullWidth } = getMetrics();
        track.scrollLeft = fullWidth * cloneCount;
    };

    // 레이아웃 대기
    setTimeout(initPosition, 100);

    // 페이지네이션 및 루프 체크
    const handleScroll = () => {
        const { fullWidth } = getMetrics();
        if (fullWidth === 0) return;

        const scrollLeft = track.scrollLeft;

        let rawIndex = Math.round(scrollLeft / fullWidth);
        let realIndex = rawIndex - cloneCount + 1;

        // 루프 로직
        if (rawIndex < cloneCount) {
            const newPos = (slideCount + rawIndex) * fullWidth;
            track.style.scrollSnapType = 'none';
            track.scrollTo({ left: newPos, behavior: 'instant' });
            requestAnimationFrame(() => {
                track.style.scrollSnapType = '';
            });

            realIndex = rawIndex === cloneCount - 1 ? slideCount : slideCount - 1;
        } else if (rawIndex >= slideCount + cloneCount) {
            const newPos = (rawIndex - slideCount) * fullWidth;
            track.style.scrollSnapType = 'none';
            track.scrollTo({ left: newPos, behavior: 'instant' });
            requestAnimationFrame(() => {
                track.style.scrollSnapType = '';
            });
            realIndex = 1;
        }

        // 표시 인덱스 계산
        let displayIndex = (rawIndex - cloneCount) % slideCount;
        if (displayIndex < 0) displayIndex += slideCount;
        displayIndex += 1;

        if (currentEl) currentEl.textContent = displayIndex.toString().padStart(2, '0');
    };

    let scrollTimeout;
    track.addEventListener('scroll', () => {
        // 점프/스냅 로직 디바운스
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 50);
    });

    track.addEventListener('scrollend', handleScroll);

    // 네비게이션
    const nextSlide = () => {
        const { fullWidth } = getMetrics();
        track.scrollBy({ left: fullWidth, behavior: 'smooth' });
    };

    const prevSlide = () => {
        const { fullWidth } = getMetrics();
        track.scrollBy({ left: -fullWidth, behavior: 'smooth' });
    };

    // 이벤트 리스너
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            stopAutoplay();
            nextSlide();
            if (isPlaying) startAutoplay();
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            stopAutoplay();
            prevSlide();
            if (isPlaying) startAutoplay();
        });
    }

    // 자동재생
    const startAutoplay = () => {
        stopAutoplay();
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
    };

    const stopAutoplay = () => {
        clearInterval(autoplayInterval);
    };

    if (btnPause) {
        btnPause.addEventListener('click', (e) => {
            e.stopPropagation(); // 버블링 방지
            isPlaying = !isPlaying;
            if (isPlaying) {
                startAutoplay();
                btnPause.classList.remove('paused');
                if (iconPause) iconPause.style.display = 'block';
                if (iconPlay) iconPlay.style.display = 'none';
            } else {
                stopAutoplay();
                btnPause.classList.add('paused');
                if (iconPause) iconPause.style.display = 'none';
                if (iconPlay) iconPlay.style.display = 'block';
            }
        });
    }

    // 반응형
    window.addEventListener('resize', () => {
        const { fullWidth } = getMetrics();
        if (fullWidth === 0) return;

        // 인덱스 재계산
        const index = Math.round(track.scrollLeft / fullWidth);
        track.scrollTo({ left: index * fullWidth, behavior: 'instant' });
    });

    // 모바일 MD 추천 탭
    const mdTabMenu = document.getElementById('mdTabMenu');
    if (mdTabMenu) {
        const mdTabs = mdTabMenu.querySelectorAll('.tab-btn');
        mdTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                mdTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
    }

    // 시작
    startAutoplay();
    // ==========================================
    // 오늘의 특가 더보기 기능
    // ==========================================
    const btnLoadMoreSpecial = document.getElementById('btnLoadMoreSpecial');
    if (btnLoadMoreSpecial) {
        const grid = btnLoadMoreSpecial.previousElementSibling; // .product-grid-2
        if (grid) {
            const items = grid.querySelectorAll('.product-card');
            const itemsPerView = 4;
            let visibleCount = itemsPerView;

            // 초기 상태: 4개만 표시
            items.forEach((item, index) => {
                if (index >= visibleCount) {
                    item.style.display = 'none';
                }
            });

            const updateButtonState = () => {
                const totalItems = grid.querySelectorAll('.product-card').length;
                const svgs = btnLoadMoreSpecial.querySelectorAll('svg');

                let textNode = btnLoadMoreSpecial.firstChild;
                if (textNode.nodeType !== Node.TEXT_NODE) {
                    // 텍스트 노드 확인
                    textNode = document.createTextNode('');
                    btnLoadMoreSpecial.prepend(textNode);
                }

                if (visibleCount >= totalItems) {
                    // 닫기 모드
                    textNode.textContent = '상품 닫기 ';
                    btnLoadMoreSpecial.classList.add('expanded');

                    if (svgs.length > 0) {
                        svgs[0].innerHTML = '<path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="currentColor" />';
                    }
                } else {
                    // 더보기 모드
                    textNode.textContent = '상품 더보기 ';
                    btnLoadMoreSpecial.classList.remove('expanded');

                    if (svgs.length > 0) {
                        svgs[0].innerHTML = '<path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor" />';
                    }
                }
            };

            btnLoadMoreSpecial.addEventListener('click', () => {
                const allItems = grid.querySelectorAll('.product-card');

                if (visibleCount >= allItems.length) {
                    // 닫기 동작
                    visibleCount = itemsPerView;
                    allItems.forEach((item, index) => {
                        if (index >= visibleCount) item.style.display = 'none';
                    });

                    // 섹션 상단 스크롤
                    const section = btnLoadMoreSpecial.closest('section');
                    if (section) {
                        const header = section.querySelector('.section-header');
                        if (header) {
                            // 헤더 높이 보정
                            const y = header.getBoundingClientRect().top + window.pageYOffset - 60;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                        } else {
                            section.scrollIntoView({ behavior: 'smooth' });
                        }
                    }

                } else {
                    // 더보기 동작
                    const nextCount = visibleCount + 4;
                    for (let i = visibleCount; i < nextCount && i < allItems.length; i++) {
                        allItems[i].style.display = 'flex';
                    }
                    visibleCount = nextCount;
                }
                updateButtonState();
            });

            // 초기 버튼 상태 업데이트
            updateButtonState();
        }
    }

    // ==========================================
    // 브랜드관 더보기 (Brand Pavilion Load More)
    // ==========================================
    const brandPavilion = document.querySelector('.brand-pavilion');
    if (brandPavilion) {
        const btnMore = brandPavilion.querySelector('.btn-brand-more');

        if (btnMore) {
            const items = brandPavilion.querySelectorAll('.brand-story-item');
            const itemsPerView = 1; // 초기 노출 개수

            const updateButtonStyle = () => {
                const hiddenItems = Array.from(items).filter(item => item.style.display === 'none');
                const svg = btnMore.querySelector('svg');
                let textNode = btnMore.firstChild;

                if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
                    textNode = document.createTextNode('');
                    btnMore.prepend(textNode);
                }

                if (hiddenItems.length === 0) {
                    // 모두 펼쳐진 상태 (Collapse Mode)
                    textNode.textContent = '브랜드관 닫기 ';
                    if (svg) {
                        svg.innerHTML = '<path d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z" fill="currentColor" />';
                    }
                } else {
                    // 더 펼칠 수 있는 상태 (More Mode)
                    textNode.textContent = '브랜드관 더보기 ';
                    if (svg) {
                        svg.innerHTML = '<path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" fill="currentColor" />';
                    }
                }
            };

            btnMore.addEventListener('click', function () {
                const hiddenItems = Array.from(items).filter(item => item.style.display === 'none');

                if (hiddenItems.length === 0) {
                    // 닫기 동작 (Collapse)
                    items.forEach((item, index) => {
                        if (index >= itemsPerView) item.style.display = 'none';
                    });

                    // 상단으로 스크롤 이동
                    const header = brandPavilion.querySelector('.section-header');
                    if (header) {
                        const y = header.getBoundingClientRect().top + window.pageYOffset - 60;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                } else {
                    // 펼치기 동작 (Expand 1 by 1)
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].style.display === 'none') {
                            items[i].style.display = ''; // Revert to stylesheet value (flex)
                            break; // 1개씩 펼침
                        }
                    }
                }
                updateButtonStyle();
            });

            // 초기 상태 설정
            updateButtonStyle();
        }
    }

});
