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

    // 주간 랭킹 토글 기능
    const rankingWrapper = document.querySelector('.weekly-ranking');

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
    const rankingSection = document.querySelector('.weekly-ranking');
    if (rankingSection) {
        const rankingTrack = rankingSection.querySelector('.ranking-carousel-track');
        const rankingList = rankingSection.querySelector('.ranking-list');
        const rBtnPrev = rankingSection.querySelector('.ranking-control-area .btn-prev');
        const rBtnNext = rankingSection.querySelector('.ranking-control-area .btn-next');
        const rBtnPause = rankingSection.querySelector('.ranking-control-area .btn-pause');
        const rCurrentPageEl = rankingSection.querySelector('.page-count .current');
        const rTotalPageEl = rankingSection.querySelector('.page-count .total');

        if (rankingTrack && rankingList) {
            // 설정
            let rCurrentIndex = 1;
            const rTotalItems = 5;
            let rIsAnimating = false;
            let rIsPlaying = true;
            let rAutoPlayInterval;

            // 무한 스크롤용 리스트 복제
            for (let i = 0; i < 4; i++) {
                const clone = rankingList.cloneNode(true);
                rankingTrack.appendChild(clone);
            }

            // 페이지 번호 갱신
            if (rTotalPageEl) rTotalPageEl.textContent = String(rTotalItems).padStart(2, '0');

            function rStartAutoPlay() {
                rAutoPlayInterval = setInterval(rMoveNext, 3000);
            }

            function rStopAutoPlay() {
                clearInterval(rAutoPlayInterval);
            }

            if (rIsPlaying) rStartAutoPlay();

            // 다음 슬라이드 이동
            function rMoveNext() {
                if (rIsAnimating) return;
                rIsAnimating = true;

                const firstItem = rankingTrack.firstElementChild;
                const itemWidth = firstItem.offsetWidth;

                rankingTrack.style.transition = 'transform 0.5s ease-in-out';
                rankingTrack.style.transform = `translateX(-${itemWidth}px)`;

                rankingTrack.addEventListener('transitionend', () => {
                    rankingTrack.style.transition = 'none';
                    rankingTrack.style.transform = 'translateX(0)';
                    rankingTrack.appendChild(firstItem);
                    rUpdatePagination(true);
                    rIsAnimating = false;
                }, { once: true });
            }

            // 이전 슬라이드 이동
            function rMovePrev() {
                if (rIsAnimating) return;
                rIsAnimating = true;

                const lastItem = rankingTrack.lastElementChild;
                const itemWidth = lastItem.offsetWidth;

                rankingTrack.style.transition = 'none';
                rankingTrack.insertBefore(lastItem, rankingTrack.firstElementChild);
                rankingTrack.style.transform = `translateX(-${itemWidth}px)`;

                // 리플로우
                void rankingTrack.offsetWidth;

                rankingTrack.style.transition = 'transform 0.5s ease-in-out';
                rankingTrack.style.transform = 'translateX(0)';

                rankingTrack.addEventListener('transitionend', () => {
                    rUpdatePagination(false);
                    rIsAnimating = false;
                }, { once: true });
            }

            function rUpdatePagination(isNext) {
                if (isNext) {
                    rCurrentIndex = rCurrentIndex >= rTotalItems ? 1 : rCurrentIndex + 1;
                } else {
                    rCurrentIndex = rCurrentIndex <= 1 ? rTotalItems : rCurrentIndex - 1;
                }
                if (rCurrentPageEl) rCurrentPageEl.textContent = String(rCurrentIndex).padStart(2, '0');
            }

            // 이벤트 리스너 등록
            if (rBtnNext) {
                rBtnNext.addEventListener('click', () => {
                    rStopAutoPlay();
                    rMoveNext();
                    if (rIsPlaying) rStartAutoPlay();
                });
            }

            if (rBtnPrev) {
                rBtnPrev.addEventListener('click', () => {
                    rStopAutoPlay();
                    rMovePrev();
                    if (rIsPlaying) rStartAutoPlay();
                });
            }

            if (rBtnPause) {
                rBtnPause.addEventListener('click', () => {
                    if (rIsPlaying) {
                        rStopAutoPlay();
                        rIsPlaying = false;
                        rBtnPause.innerHTML = `
                            <svg class="icon-slider-play" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                                <path d="M0 0h24v24H0V0z" fill="none"/>
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        `;
                    } else {
                        rStartAutoPlay();
                        rIsPlaying = true;
                        rBtnPause.innerHTML = `
                            <svg class="icon-slider-pause" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                                <path d="M0 0h24v24H0V0z" fill="none"/>
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        `;
                    }
                });
            }
        }
    }

    // ==========================================
    // 수량 증감 기능
    // ==========================================
    const qtyBoxes = document.querySelectorAll('.qty-box');
    qtyBoxes.forEach(box => {
        const buttons = box.querySelectorAll('button');
        const minusBtn = buttons[0];
        const plusBtn = buttons[1];
        const countInput = box.querySelector('input');

        if (minusBtn && plusBtn && countInput) {
            minusBtn.addEventListener('click', (e) => {
                e.preventDefault(); // 기본 이벤트 차단
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


});