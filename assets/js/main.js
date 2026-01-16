
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

        if (!navList || !searchContainer) return;

        const performAdjustment = () => {
            // 현재 적용된 줌 수치 파악 (보정용)
            const zoom = parseFloat(document.body.style.zoom) || 1;

            // 1. 측정 방해 요소(Transition) 일시 제거
            const originalTransition = searchContainer.style.transition;
            searchContainer.style.transition = 'none';

            // 2. GNB 요소의 너비 측정
            const listItems = navList.querySelectorAll('li');
            if (listItems.length === 0) {
                searchContainer.style.transition = originalTransition;
                return;
            }

            const firstRect = listItems[0].getBoundingClientRect();
            const lastRect = listItems[listItems.length - 1].getBoundingClientRect();
            // 줌 수치만큼 나누어 실제 CSS 픽셀 너비 계산
            const navWidth = (lastRect.right - firstRect.left) / zoom;

            // 3. 먼저 너비를 확정 (너비가 변하면 주변 요소의 flex 배치가 변하므로 선행 필수)
            searchContainer.style.width = `${navWidth}px`;
            searchContainer.style.flex = 'none';
            searchContainer.style.marginLeft = '0px'; // 임시 초기화

            // 강제 리플로우 (변경된 너비에 맞춰 형제 요소들이 자리를 잡게 함)
            void searchContainer.offsetWidth;

            requestAnimationFrame(() => {
                // 4. 안정된 상태에서 위치 재측정
                const updatedSearchRect = searchContainer.getBoundingClientRect();

                // 목표 위치(GNB 시작점)와 현재 위치(Search 시작점)의 차이 계산 후 줌 보정
                const offset = (firstRect.left - updatedSearchRect.left) / zoom;

                // 5. 최종 오프셋 적용
                searchContainer.style.marginLeft = `${offset}px`;

                // 트랜지션 복구
                requestAnimationFrame(() => {
                    searchContainer.style.transition = originalTransition;
                });
            });
        };

        performAdjustment();
    }

    // 전역에서 접근 가능하도록 설정
    window.adjustNavWidth = adjustNavWidth;

    // 초기화 및 이벤트 관리
    if (document.fonts) {
        document.fonts.ready.then(adjustNavWidth);
    }

    // 헤더 내부 요소의 크기 변화 감시 (ResizeObserver)
    const headerInner = document.querySelector('.header-main .header-inner');
    if (headerInner && window.ResizeObserver) {
        new ResizeObserver(adjustNavWidth).observe(headerInner);
    }

    adjustNavWidth();
    window.addEventListener('resize', adjustNavWidth);
    window.addEventListener('load', () => {
        setTimeout(adjustNavWidth, 50);
    });

    // 비동기 헤더 로드 완료 이벤트 대응
    document.addEventListener('headerLoaded', () => {
        adjustNavWidth();

        // 새로 생겨난 헤더 요소를 다시 감시
        const newHeaderInner = document.querySelector('.header-main .header-inner');
        if (newHeaderInner && window.ResizeObserver) {
            new ResizeObserver(adjustNavWidth).observe(newHeaderInner);
        }

        // 바텀 시트 드래그 초기화
        initOffcanvasDrag();

        setTimeout(adjustNavWidth, 100);
    });

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

                // 높이 업데이트
                setTimeout(() => {
                    const pcSection = item.closest('.weekly-ranking');
                    const mbSection = item.closest('.ranking-carousel-container');
                    if (pcSection && typeof updatePcRankingHeight === 'function') updatePcRankingHeight();
                    if (mbSection && typeof updateMbRankingHeight === 'function') updateMbRankingHeight();
                }, 0);
            }
        });
    }

    // 주간 랭킹 더보기
    const initRankingItem = (item) => {
        const btnMore = item.querySelector('.btn-more');
        const grid = item.querySelector('.ranking-body .ranking-grid') ||
            item.querySelector('.ranking-body .product-grid-2') ||
            item.querySelector('.ranking-body [class*="product-grid"]');

        if (!btnMore || !grid || item.dataset.loadMoreInitialized) return;
        item.dataset.loadMoreInitialized = 'true';

        const updateState = () => {
            const cards = Array.from(grid.querySelectorAll('.product-card'));
            const threshold = window.innerWidth >= 1024 ? 4 : 2;
            const isExpanded = item.classList.contains('is-expanded');

            // 카드 노출 상태 업데이트
            cards.forEach((card, index) => {
                card.style.display = (isExpanded || index < threshold) ? 'flex' : 'none';
            });

            // 버튼 표시 여부 결정
            if (cards.length <= threshold) {
                btnMore.style.setProperty('display', 'none', 'important');
            } else {
                btnMore.style.display = 'flex';

                // 텍스트 업데이트
                let textNode = Array.from(btnMore.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (!textNode) {
                    textNode = document.createTextNode('');
                    btnMore.prepend(textNode);
                }
                textNode.textContent = isExpanded ? '상품 닫기 ' : '상품 더보기 ';
            }
        };

        // 외부(resize 등)에서 호출 가능하도록 함수 연결
        item.refreshState = updateState;

        btnMore.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const wasExpanded = item.classList.contains('is-expanded');
            item.classList.toggle('is-expanded');
            updateState();

            // 접을 때 상단 이동
            if (wasExpanded) {
                const header = item.querySelector('.ranking-header');
                if (header) {
                    const y = header.getBoundingClientRect().top + window.pageYOffset - 110;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }

            // 높이 동기화
            if (typeof updatePcRankingHeight === 'function') updatePcRankingHeight();
            if (typeof updateMbRankingHeight === 'function') updateMbRankingHeight();
        });

        // 초기 실행
        updateState();
    };

    // 리사이즈 대응
    window.addEventListener('resize', () => {
        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach(item => {
            if (item.refreshState) item.refreshState();
        });
    });

    // 초기 아이템 설정
    if (rankingWrapper) {
        const rankingItems = rankingWrapper.querySelectorAll('.ranking-item');
        rankingItems.forEach(item => initRankingItem(item));
    }

    // MD 추천 상품 탭 기능
    const mdTabItems = document.querySelectorAll('.tab-menu .tab-item');
    const mdTabContents = document.querySelectorAll('.md-rec-content');

    if (mdTabItems && mdTabContents.length > 0) {
        // 상품 카드 순서 섞기 함수
        const shuffleCards = (container) => {
            // 실제 카드가 담긴 그리드 컨테이너 찾기 (PC는 본인, 모바일은 하위 div)
            const gridContainer = container.classList.contains('product-grid-4') || container.classList.contains('product-grid-2')
                ? container
                : container.querySelector('.product-grid-4, .product-grid-2');

            if (!gridContainer) return;

            const cards = Array.from(gridContainer.querySelectorAll('.product-card'));
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                gridContainer.appendChild(cards[j]); // appendChild는 기존 요소를 이동시킴
            }
        };

        // 페이지 로드 시 모든 탭의 상품 순서를 물리적으로 1회 섞어서 고정
        mdTabContents.forEach(content => {
            shuffleCards(content);
        });

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
                    // 애니메이션 재실행을 위해 스타일 강제 리셋
                    content.style.animation = 'none';
                    void content.offsetWidth;
                    content.style.animation = '';
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


    // ==========================================
    // 통합 메인 슬라이더 (Unified Main Slider)
    // ==========================================
    class UnifiedMainSlider {
        constructor(rootElement, options = {}) {
            this.root = rootElement;
            if (!this.root) return;

            this.options = {
                trackSelector: '.carousel-inner',
                itemSelector: '.slider-card',
                btnPrevSelector: '.btn-prev',
                btnNextSelector: '.btn-next',
                btnPauseSelector: '.btn-pause',
                pageCurrentSelector: '.current-page',
                pageTotalSelector: '.total-page',
                contentWidth: 1360, // 0이면 Full Width
                gap: 24,            // 기본 Gap
                autoPlayInterval: 3000,
                transitionTime: 500,
                isMobile: false,
                ...options
            };

            this.track = this.root.querySelector(this.options.trackSelector);
            // ID 셀렉터 지원
            if (!this.track && this.options.trackSelector.startsWith('#')) {
                this.track = document.getElementById(this.options.trackSelector.substring(1));
            }

            if (!this.track) return;

            this.initialCards = Array.from(this.track.querySelectorAll(this.options.itemSelector));
            if (this.initialCards.length === 0) return;

            this.totalItems = this.initialCards.length;
            this.currentIndex = 0; // 0-based index for logic
            this.isPlaying = true;
            this.isAnimating = false;
            this.timer = null;

            this.cardWidth = 0;
            this.gap = this.options.gap;
            this.baseOffset = 0;
            this.prependCount = 0;

            // UI 요소
            this.btnPrev = this.root.querySelector(this.options.btnPrevSelector);
            this.btnNext = this.root.querySelector(this.options.btnNextSelector);
            this.btnPause = this.root.querySelector(this.options.btnPauseSelector);
            this.pageCurrent = this.root.querySelector(this.options.pageCurrentSelector);
            this.pageTotal = this.root.querySelector(this.options.pageTotalSelector);

            if (!this.btnPrev && this.options.isMobile) {
                // 모바일의 경우 pagination-container 내부에 있을 수 있음
                const pagination = this.root.querySelector('.pagination-container');
                if (pagination) {
                    this.btnPrev = pagination.querySelector(this.options.btnPrevSelector);
                    this.btnNext = pagination.querySelector(this.options.btnNextSelector);
                    this.btnPause = pagination.querySelector(this.options.btnPauseSelector);
                    this.pageCurrent = pagination.querySelector(this.options.pageCurrentSelector);
                    this.pageTotal = pagination.querySelector(this.options.pageTotalSelector);
                }
            }

            this.init();
        }

        init() {
            this.initSlider();
            this.updatePagination();
            this.bindEvents();

            if (this.isPlaying) this.startAutoPlay();

            window.addEventListener('resize', () => {
                this.initSlider(); // 리사이즈 시 재계산
            });
        }

        measureGap() {
            // CSS Gap 측정 시도 (모바일 등)
            const style = window.getComputedStyle(this.track);
            const gap = parseFloat(style.columnGap) || parseFloat(style.gap);
            if (!isNaN(gap) && gap > 0) {
                this.gap = gap;
            }
        }

        initSlider() {
            if (!this.track) return;

            this.measureGap();

            // 카드 크기 측정
            const tempCard = this.initialCards[0];
            // display flex, clones 상황에서도 정확한 원본 사이즈 측정을 위해 스타일 임시 초기화 필요할 수 있으나,
            // 보통 offsetWidth로 충분
            this.cardWidth = tempCard.offsetWidth || (this.options.isMobile ? window.innerWidth : 440);

            // 모바일 Full Width인 경우 (padding 제외)
            if (this.options.isMobile) {
                // 모바일 카드 너비 보정 (여백이 있는 경우)
                // 만약 카드가 100%가 아니라면 offsetWidth가 정확함.
            }

            const fullItemWidth = this.cardWidth + this.gap;

            // 시작 위치(gridStartX) 계산
            const windowWidth = Math.max(window.innerWidth, this.options.contentWidth);
            let gridStartX = 0;

            if (this.options.contentWidth > 0 && !this.options.isMobile) {
                gridStartX = (windowWidth - this.options.contentWidth) / 2;
                if (gridStartX < 0) gridStartX = 0;
            } else if (this.options.isMobile) {
                // 모바일은 track의 padding-left 등을 고려하거나, 중앙 정렬 필요시 계산
                // 현재 디자인은 좌측 정렬 + padding
                const trackStyle = window.getComputedStyle(this.track);
                const pl = parseFloat(trackStyle.paddingLeft);
                if (!isNaN(pl)) gridStartX = pl;
            }

            // 복제 개수 계산
            let neededLeft = 2;
            let neededRight = 2;

            if (!this.options.isMobile) {
                neededLeft = Math.ceil(gridStartX / fullItemWidth) + 2;
                neededRight = Math.ceil((windowWidth - (gridStartX + this.options.contentWidth)) / fullItemWidth) + 2;
            } else {
                // 모바일은 양옆 2개씩이면 충분
                neededLeft = 2;
                neededRight = 2;
            }

            // 트랙 초기화 및 복제
            this.track.innerHTML = '';

            const appendClone = (item) => {
                const clone = item.cloneNode(true);
                clone.classList.add('cloned');
                clone.removeAttribute('id');
                this.track.appendChild(clone);
            };

            this.prependCount = neededLeft;

            // 앞쪽 복제
            for (let i = neededLeft; i > 0; i--) {
                const index = (this.totalItems - (i % this.totalItems)) % this.totalItems;
                appendClone(this.initialCards[index]);
            }

            // 원본
            this.initialCards.forEach(card => this.track.appendChild(card));

            // 뒤쪽 복제
            for (let i = 0; i < neededRight; i++) {
                const index = i % this.totalItems;
                appendClone(this.initialCards[index]);
            }

            // 초기 위치 적용
            this.baseOffset = gridStartX - (this.prependCount * fullItemWidth);

            this.track.style.display = 'flex'; // Flex 강제
            this.track.style.flexWrap = 'nowrap';
            this.track.style.gap = `${this.gap}px`;
            this.track.style.overflow = 'hidden'; // 레이아웃 이탈 방지

            this.track.style.transition = 'none';
            this.track.style.transform = `translateX(${this.baseOffset}px)`;

            if (this.pageTotal) this.pageTotal.textContent = String(this.totalItems).padStart(2, '0');
        }

        moveNext() {
            if (this.isAnimating) return;
            this.isAnimating = true;

            this.currentIndex++;
            const fullItemWidth = this.cardWidth + this.gap;

            this.track.style.transition = `transform ${this.options.transitionTime}ms ease-in-out`;
            this.track.style.transform = `translateX(${this.baseOffset - (this.currentIndex * fullItemWidth)}px)`;

            const handleTransitionEnd = () => {
                if (this.currentIndex >= this.totalItems) {
                    this.currentIndex = 0;
                    this.track.style.transition = 'none';
                    void this.track.offsetWidth; // 브라우저에 transition: none 적용 강제
                    this.track.style.transform = `translateX(${this.baseOffset}px)`;
                    void this.track.offsetWidth; // 위치 변경 완료 강제
                }
                this.updatePagination();
                this.isAnimating = false;
                this.track.removeEventListener('transitionend', handleTransitionEnd);
            };

            this.track.addEventListener('transitionend', handleTransitionEnd);
        }

        movePrev() {
            if (this.isAnimating) return;
            this.isAnimating = true;

            this.currentIndex--;
            const fullItemWidth = this.cardWidth + this.gap;

            this.track.style.transition = `transform ${this.options.transitionTime}ms ease-in-out`;
            this.track.style.transform = `translateX(${this.baseOffset - (this.currentIndex * fullItemWidth)}px)`;

            const handleTransitionEnd = () => {
                if (this.currentIndex < 0) {
                    this.currentIndex = this.totalItems - 1;
                    this.track.style.transition = 'none';
                    void this.track.offsetWidth; // 브라우저에 transition: none 적용 강제
                    this.track.style.transform = `translateX(${this.baseOffset - (this.currentIndex * fullItemWidth)}px)`;
                    void this.track.offsetWidth; // 위치 변경 완료 강제
                }
                this.updatePagination();
                this.isAnimating = false;
                this.track.removeEventListener('transitionend', handleTransitionEnd);
            };

            this.track.addEventListener('transitionend', handleTransitionEnd);
        }

        updatePagination() {
            if (this.pageCurrent) {
                this.pageCurrent.textContent = String(this.currentIndex + 1).padStart(2, '0');
            }
        }

        bindEvents() {
            if (this.btnNext) this.btnNext.addEventListener('click', () => {
                this.stopAutoPlay();
                this.moveNext();
                if (this.isPlaying) this.startAutoPlay();
            });

            if (this.btnPrev) this.btnPrev.addEventListener('click', () => {
                this.stopAutoPlay();
                this.movePrev();
                if (this.isPlaying) this.startAutoPlay();
            });

            if (this.btnPause) {
                this.btnPause.addEventListener('click', () => {
                    if (this.isPlaying) {
                        this.stopAutoPlay();
                        this.isPlaying = false;
                        this.btnPause.innerHTML = `<i class="icon-slider-play"></i>`;
                    } else {
                        this.startAutoPlay();
                        this.isPlaying = true;
                        this.btnPause.innerHTML = `<i class="icon-slider-pause"></i>`;
                    }
                });
            }
        }

        startAutoPlay() {
            this.stopAutoPlay();
            this.timer = setInterval(() => {
                if (!this.isAnimating) this.moveNext();
            }, this.options.autoPlayInterval);
        }

        stopAutoPlay() {
            if (this.timer) clearInterval(this.timer);
        }

        resetPosition() {
            // 리사이즈 시 위치만 리셋하는 헬퍼
            const fullItemWidth = this.cardWidth + this.gap;
            this.track.style.transform = `translateX(${this.baseOffset}px)`;
        }
    }

    // 메인 배너 슬라이더 초기화 (PC)
    const pcSliderEl = document.getElementById('eclubMainSlider');
    if (pcSliderEl) {
        new UnifiedMainSlider(pcSliderEl, {
            trackSelector: '.carousel-inner',
            contentWidth: 1360,
            gap: 24
        });
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

    if (pcRankingSection && window.matchMedia('(min-width: 1024px)').matches && !mobileRankingContainer) {
        const pcTrack = pcRankingSection.querySelector('.ranking-carousel-track');
        const pcFirstList = pcTrack.querySelector('.ranking-list');
        const btnPrev = pcRankingSection.querySelector('.btn-prev');
        const btnNext = pcRankingSection.querySelector('.btn-next');
        const btnPause = pcRankingSection.querySelector('.btn-pause');
        const currentPageEl = pcRankingSection.querySelector('.page-count .current');
        const totalPageEl = pcRankingSection.querySelector('.page-count .total');

        if (pcTrack && pcFirstList && btnPrev && btnNext) {
            // 초기 4회 복제 (총 5개 슬라이드)
            const totalClones = 4;
            const totalItems = totalClones + 1;

            for (let i = 0; i < totalClones; i++) {
                const clone = pcFirstList.cloneNode(true);
                pcTrack.appendChild(clone);

                // 복제된 아이템 초기화
                const clonedItems = clone.querySelectorAll('.ranking-item');
                clonedItems.forEach(item => {
                    delete item.dataset.loadMoreInitialized;
                    if (typeof initRankingItem === 'function') initRankingItem(item);
                });

                // 수량 조절 초기화
                if (typeof initQuantityControl === 'function') {
                    const qtyBoxes = clone.querySelectorAll('.qty-box');
                    qtyBoxes.forEach(box => {
                        delete box.dataset.initialized;
                    });
                    initQuantityControl(clone);
                }
            }

            let currentIndex = 1;
            let isPlaying = true;
            let autoPlayTimer = null;

            if (totalPageEl) totalPageEl.textContent = String(totalItems).padStart(2, '0');
            if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');

            const updateCarousel = () => {
                pcTrack.style.transform = `translateX(-${(currentIndex - 1) * 100}%)`;
                if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');

                // 활성 슬라이드 클래스
                Array.from(pcTrack.children).forEach((slide, index) => {
                    if (index === currentIndex - 1) slide.classList.add('current');
                    else slide.classList.remove('current');
                });
                updatePcRankingHeight();
            };

            // 전역 참조를 위해 헬퍼 정의
            window.updatePcRankingHeight = () => {
                const view = pcRankingSection.querySelector('.ranking-carousel-view');
                const activeSlide = pcTrack.children[currentIndex - 1];
                if (view && activeSlide) {
                    view.style.height = activeSlide.offsetHeight + 'px';
                }
            };
            updatePcRankingHeight(); // 초기 실행

            const moveNext = () => {
                currentIndex = (currentIndex % totalItems) + 1;
                updateCarousel();
            };

            const movePrev = () => {
                currentIndex = (currentIndex - 2 + totalItems) % totalItems + 1;
                updateCarousel();
            };

            const startAutoPlay = () => {
                stopAutoPlay();
                autoPlayTimer = setInterval(moveNext, 3000);
            };

            const stopAutoPlay = () => {
                if (autoPlayTimer) clearInterval(autoPlayTimer);
            };

            btnNext.addEventListener('click', () => {
                stopAutoPlay();
                moveNext();
                if (isPlaying) startAutoPlay();
            });

            btnPrev.addEventListener('click', () => {
                stopAutoPlay();
                movePrev();
                if (isPlaying) startAutoPlay();
            });

            if (btnPause) {
                btnPause.addEventListener('click', () => {
                    isPlaying = !isPlaying;
                    if (isPlaying) {
                        startAutoPlay();
                        btnPause.innerHTML = `<i class="icon-slider-pause"></i>`;
                    } else {
                        stopAutoPlay();
                        btnPause.innerHTML = `<i class="icon-slider-play"></i>`;
                    }
                });
            }

            startAutoPlay();
        }
    }

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

                mobileRankingTrack.appendChild(clone);

                // DOM 추가 후 초기화
                // 복제 아이템 더보기 초기화
                const clonedItems = clone.querySelectorAll('.ranking-item');
                clonedItems.forEach(item => {
                    // 데이터 속성 초기화
                    delete item.dataset.loadMoreInitialized;
                    initRankingItem(item);
                });

                // 수량 조절 기능 재연결
                const qtyBoxes = clone.querySelectorAll('.qty-box');
                qtyBoxes.forEach(box => {
                    delete box.dataset.initialized;
                });
                if (typeof initQuantityControl === 'function') {
                    initQuantityControl(clone);
                }
            }

            // 페이지네이션 초기화
            if (totalPageEl) totalPageEl.textContent = String(totalItems).padStart(2, '0');
            if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');

            // 초기 클래스 설정
            Array.from(mobileRankingTrack.children).forEach((slide, index) => {
                if (index === currentIndex - 1) slide.classList.add('current');
                else slide.classList.remove('current');
            });

            const updateCarousel = () => {
                if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');

                // 활성 슬라이드 클래스 갱신
                Array.from(mobileRankingTrack.children).forEach((slide, index) => {
                    if (index === currentIndex - 1) slide.classList.add('current');
                    else slide.classList.remove('current');
                });

                // 트랙 이동
                mobileRankingTrack.style.transform = `translateX(-${(currentIndex - 1) * 100}%)`;
                updateMbRankingHeight();
            };

            // 전역 참조를 위해 헬퍼 정의
            window.updateMbRankingHeight = () => {
                const view = mobileRankingContainer.querySelector('.ranking-carousel-view') || mobileRankingContainer;
                const activeSlide = mobileRankingTrack.children[currentIndex - 1];
                if (view && activeSlide) {
                    view.style.height = activeSlide.offsetHeight + 'px';
                }
            };
            updateMbRankingHeight(); // 초기 실행

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


    // ==========================================
    // 수량 제어
    // ==========================================
    if (typeof initQuantityControl === 'function') {
        initQuantityControl(document);
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






    // 로직 초기화
    // 팝콘 배너 (UnifiedMainSlider 적용)
    const popcornBannerEl = document.querySelector('.popcorn-banner-wrapper');
    if (popcornBannerEl) {
        new UnifiedMainSlider(popcornBannerEl, {
            trackSelector: '#popcornBannerTrack',
            itemSelector: '.slide-item',
            isMobile: true,
            gap: 0,
            autoPlayInterval: 3000
        });
    }
    initOffcanvasDrag();

    // 동적 오프캔버스 감지
    if (window.MutationObserver) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // 직접 offcanvas인 경우
                        if (node.classList.contains('offcanvas')) {
                            initOffcanvasDrag(node);
                        }
                        // 내부 자식에 offcanvas가 있는 경우
                        else if (node.querySelectorAll) {
                            node.querySelectorAll('.offcanvas').forEach(el => initOffcanvasDrag(el));
                        }
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});
// 바텀 시트 드래그 종료
function initOffcanvasDrag(target) {
    // 드래그 로직 바인딩
    const attach = (offcanvasEl) => {
        if (!offcanvasEl || offcanvasEl.dataset.dragInitialized) return;
        const handle = offcanvasEl.querySelector('.offcanvas-handle');
        if (!handle) return;

        offcanvasEl.dataset.dragInitialized = 'true';

        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let startTime = 0;

        // 닫기 실행
        const closeOffcanvas = () => {
            let bsOffcanvas = null;
            if (window.bootstrap && window.bootstrap.Offcanvas) {
                // getOrCreateInstance로 안전하게 인스턴스 확보
                bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
            }
            if (bsOffcanvas) bsOffcanvas.hide();
        };

        // 드래그 시작
        const onStart = (y) => {
            startY = y;
            currentY = y;
            isDragging = true;
            startTime = new Date().getTime();
            offcanvasEl.style.transition = 'none';
        };

        // 드래그 이동
        const onMove = (y) => {
            if (!isDragging) return;
            currentY = y;
            const diff = currentY - startY;

            // 하단 드래그 이동
            if (diff > 0) {
                offcanvasEl.style.transform = `translateY(${diff}px)`;
            }
        };

        // 드래그 종료
        const onEnd = () => {
            if (!isDragging) return;

            const diff = currentY - startY;
            const timeDiff = new Date().getTime() - startTime;

            // 100px 이상 내리거나, 짧은 시간(300ms)에 50px 이상 내리면 닫기
            if (diff > 100 || (diff > 50 && timeDiff < 300)) {
                closeOffcanvas();
            } else {
                // 위치 복귀
                offcanvasEl.style.transition = 'transform 0.3s ease-out';
                offcanvasEl.style.transform = 'translateY(0)';
            }

            setTimeout(() => { isDragging = false; }, 50);
        };

        // 클릭 시 닫기 처리
        handle.addEventListener('click', (e) => {
            if (Math.abs(currentY - startY) < 5) {
                closeOffcanvas();
            }
        });

        // 터치 이벤트

        handle.addEventListener('touchstart', (e) => {
            // 핸들 터치 시 스크롤 방지 의도라면 preventDefault 사용 가능, 여기서는 드래그 로직 우선
            onStart(e.touches[0].clientY);
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (isDragging && e.cancelable) e.preventDefault(); // 드래그 중 스크롤 방지
            onMove(e.touches[0].clientY);
        }, { passive: false });

        handle.addEventListener('touchend', onEnd);

        // 마우스 이벤트 (PC 테스트)
        const onMouseMove = (e) => onMove(e.clientY);
        const onMouseUp = () => {
            onEnd();
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        handle.addEventListener('mousedown', (e) => {
            onStart(e.clientY);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // 시트가 닫히면 스타일 초기화
        offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
            offcanvasEl.style.transform = '';
            offcanvasEl.style.transition = '';
            currentY = 0;
            startY = 0;
        });
    };

    // 로직 실행 분기
    if (target) {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        if (el) attach(el);
    } else {
        // 인자가 없으면 핸들이 있는 모든 offcanvas에 적용
        document.querySelectorAll('.offcanvas').forEach(el => {
            if (el.querySelector('.offcanvas-handle')) {
                attach(el);
            }
        });
    }
}

// 검색 드롭다운 로직
const initSearchDropdown = function () {
    const searchContainer = document.querySelector('.search-container');

    if (searchContainer && !searchContainer.dataset.initialized) {
        searchContainer.dataset.initialized = 'true';

        const searchInput = searchContainer.querySelector('.search-input');
        const btnClose = searchContainer.querySelector('.btn-close-search');
        const btnDeleteAll = searchContainer.querySelector('.btn-delete-all');
        const btnsDeleteItem = searchContainer.querySelectorAll('.btn-delete-item, .recent-delete-btn');

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
            // 헤더 z-index 및 바디 스크롤 제어
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

        if (btnClear) {
            btnClear.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                searchInput.value = '';
                searchInput.focus();
                updateDropdownView();
            });
        }


        let isClickInside = false;

        searchContainer.addEventListener('mousedown', () => {
            isClickInside = true;
        });

        window.addEventListener('mouseup', () => {
            // 클릭 이벤트 처리 대기
            setTimeout(() => {
                isClickInside = false;
            }, 300);
        });

        if (searchInput) {
            const openSearch = () => {
                searchContainer.classList.add('active');
                updateDropdownView();
            };
            searchInput.addEventListener('click', openSearch);
            searchInput.addEventListener('focus', openSearch);
            searchInput.addEventListener('input', updateDropdownView);

            // 포커스 해제 시 닫기
            searchInput.addEventListener('blur', (e) => {
                const relatedTarget = e.relatedTarget;

                // 탭 이동으로 내부 요소에 포커스가 간 경우나, 현재 클릭 중인 경우 닫지 않음
                if (isClickInside || (relatedTarget && searchContainer.contains(relatedTarget))) {
                    return;
                }

                // 외부 클릭 시에는 다른 이벤트 처리를 위해 아주 약간의 지연 후 닫기
                setTimeout(() => {
                    if (!isClickInside) {
                        searchContainer.classList.remove('active');
                        updateDropdownView();
                    }
                }, 150);
            });
        }

        if (btnClose) {
            btnClose.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                searchContainer.classList.remove('active');
                updateDropdownView();
            });
        }

        const btnBackSearch = searchContainer.querySelector('.btn-back-search');
        if (btnBackSearch) {
            btnBackSearch.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                searchContainer.classList.remove('active');
                searchInput.blur(); // 키보드 닫기
                updateDropdownView();
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

        // 영역 외 클릭 시 닫기
        // 스코프 문제 해결
        document.addEventListener('click', (event) => {
            if (searchContainer.classList.contains('active')) {
                // 내부 클릭이 아니고, 플래그도 꺼져있을 때만 닫기
                if (!searchContainer.contains(event.target) && !isClickInside) {
                    searchContainer.classList.remove('active');
                    updateDropdownView();
                }
            }
        });
        // 바텀시트 초기화
        initOffcanvasDrag();
    }
};

document.addEventListener('headerLoaded', initSearchDropdown);
if (document.querySelector('.search-container')) {
    initSearchDropdown();
}
// 모바일 메인 슬라이더 초기화 (Mobile)
// 기존 스크롤 로직 대신 UnifiedMainSlider 사용
const mobileTrack = document.getElementById('mobileMainTrack');
if (mobileTrack) {
    // 모바일은 wrapper를 root로 사용 (pagination-container가 sibling이므로)
    const mobileRoot = mobileTrack.closest('.mobile-main-slider');
    if (mobileRoot) {
        new UnifiedMainSlider(mobileRoot, {
            trackSelector: '#mobileMainTrack',
            itemSelector: '.slide-item',
            contentWidth: 0, // Full Width
            isMobile: true,
            gap: 20 // 모바일 CSS Gap (필요시 조정)
        });
    }
}
// 공통 더보기 (Expandable Grids via Class Traversal)
const initExpandableGrids = () => {
    const moreButtons = document.querySelectorAll('.btn-more');

    moreButtons.forEach(btn => {
        // 이미 바인딩된 경우 스킵
        if (btn.dataset.bound) return;

        // 1. 컨텍스트 및 그리드 찾기
        let section = btn.closest('section') || btn.closest('.md-rec-content') || btn.closest('.ranking-item');
        if (!section) return;

        // 2. 초기 갯수 설정 (화면 너비 체크)
        const isWide = window.innerWidth >= 1024;
        let itemSelector = '.product-card';
        let initialCount = isWide ? 4 : 2;

        if (section.classList.contains('brand-pavilion')) {
            itemSelector = '.brand-story-item';
            initialCount = 1;
        } else if (section.classList.contains('daily-special')) {
            // 오늘의 특가 (기본값)
        }

        // 3. 그리드 컨테이너 찾기
        // 버튼 바로 위에 있는 그리드를 우선 찾음
        let grid = btn.previousElementSibling;

        // 바로 위가 아니거나 그리드 클래스가 아니면 섹션 내에서 검색
        if (!grid || (!grid.classList.contains('product-grid-2') && !grid.classList.contains('brand-story-list'))) {
            grid = section.querySelector('.product-grid-2, .brand-story-list');
        }
        if (!grid) return;

        const items = Array.from(grid.querySelectorAll(itemSelector));
        if (items.length === 0) return;

        // 4. 표시 업데이트 함수
        const updateVisibility = (expanded) => {
            const limit = expanded ? items.length : initialCount;
            items.forEach((item, idx) => {
                // 스타일을 지워서 CSS 규칙(flex/block)을 따르게 함. 숨길 때만 none.
                item.style.display = (idx < limit) ? '' : 'none';
            });

            // 버튼 상태 및 텍스트 업데이트
            btn.classList.toggle('is-expanded', expanded);
            const textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
            if (textNode) {
                const originalText = textNode.textContent.trim();
                if (itemSelector === '.brand-story-item') {
                    textNode.textContent = expanded ? '브랜드관 닫기 ' : '브랜드관 더보기 ';
                } else if (originalText.includes('상품')) {
                    textNode.textContent = expanded ? '상품 닫기 ' : '상품 더보기 ';
                }
            }
        };

        // 5. 초기 실행
        updateVisibility(false);
        btn.dataset.bound = true;

        // 6. 클릭 이벤트
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = btn.classList.contains('is-expanded');

            if (isExpanded) {
                // 닫기 (Collapse)
                updateVisibility(false);
                // 스크롤 이동
                const header = section.querySelector('.section-header') || section;
                if (header) {
                    const y = header.getBoundingClientRect().top + window.pageYOffset - 60;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            } else {
                // 모두 보기 (Expand All)
                updateVisibility(true);
            }
        });

        // 리사이즈 대응 (필요 시)
        // 브라우저 리사이즈 시 initialCount가 변해야 한다면 추가 로직 필요하지만 모바일 중심이므로 생략 가능
    });
};

// 초기화 실행
initExpandableGrids();

// Resize 시 재계산이 필요할 수 있음 (PC <-> Mobile 전환 등)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // 기존 바인딩 무시하고 로직만 다시 수행하려면 구조 변경 필요.
        // 여기서는 단순히 새로 추가된 요소 등을 위해 호출 (또는 리셋 로직 필요)
        // 현재는 reload 권장.
    }, 200);
});

// 브랜드관 더보기 (PC Legacy) - 제거 또는 유지 (위 로직이 커버함)
/*
const brandClubZone = document.querySelector('.brand-club-zone');
if (brandClubZone) { ... } 
*/

// ==========================================
// 브랜드관 더보기
// ==========================================
// PC 버전 토글
const brandClubZone = document.querySelector('.brand-club-zone');
if (brandClubZone) {
    const btnMore = brandClubZone.querySelector('.btn-brand-more');
    const span = btnMore?.querySelector('span');

    if (btnMore) {
        btnMore.addEventListener('click', function () {
            // 확장 클래스 토글
            const isExpanded = brandClubZone.classList.toggle('is-expanded');
            if (span) {
                span.textContent = isExpanded ? '브랜드관 닫기' : '브랜드관 더보기';
            }
        });
    }
}


// ==========================================
// 사용자 포인트 진행률 설정
// ==========================================
window.setUserPointProgress = function (percentage) {
    const fillEl = document.getElementById("userPointFill");
    if (fillEl) {
        // 0~100 사이 값 제한
        const safePercent = Math.max(0, Math.min(100, percentage));
        fillEl.style.width = safePercent + "%";
    }
};

// 테스트용 초기 실행
// 10%
if (window.setUserPointProgress) window.setUserPointProgress(60);

// ==========================================
// 카테고리 전체보기 오버레이
// ==========================================

const initCategoryMenu = () => {
    const categoryLink = document.querySelector('.category-link');
    const categoryOverlay = document.querySelector('.category-overlay');
    const categoryCloseBtn = document.querySelector('.btn-category-close');

    if (categoryLink && categoryOverlay) {
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

        // 영역 외 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!categoryLink.contains(e.target) && !categoryOverlay.contains(e.target)) {
                categoryOverlay.classList.remove('active');
            }
        });

        // 상단 카테고리/브랜드 탭 전환
        const topTabs = categoryOverlay.querySelectorAll('.category-tabs .tab-btn');
        if (topTabs.length > 0) {
            topTabs.forEach(btn => {
                btn.addEventListener('click', () => {
                    topTabs.forEach(t => t.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }

        // 탭 기능
        const sidebarItems = categoryOverlay.querySelectorAll('.category-sidebar li');
        const detailContents = categoryOverlay.querySelectorAll('.category-detail');

        sidebarItems.forEach(item => {
            const switchTab = () => {
                // 탭 활성화
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // 컨텐츠 활성화
                const targetId = item.dataset.target;
                detailContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetId) {
                        content.classList.add('active');
                    }
                });
            };

            item.addEventListener('mouseenter', switchTab);
            item.addEventListener('click', switchTab);
        });
    }
};

// 헤더 로드 완료 시 실행
document.addEventListener('headerLoaded', initCategoryMenu);
if (document.querySelector('.category-link')) {
    initCategoryMenu();
}




// 수량 마이너스 버튼 클릭 시 최소 수량(1) 경고 및 장바구니 삭제 유도 모달
document.addEventListener('click', (e) => {
    const minusBtn = e.target.closest('.qty-box button:first-of-type');
    if (minusBtn) {
        const qtyBox = minusBtn.closest('.qty-box');
        const input = qtyBox?.querySelector('input');
        if (input) {
            const currentVal = parseInt(input.value, 10) || 0;
            const isInCart = qtyBox.dataset.inCart === 'true';

            // 장바구니 담긴 상태에서 1 -> 0 시도 시 모달 표시
            if (currentVal === 1 && isInCart) {
                e.preventDefault();
                e.stopImmediatePropagation(); // quantity-control.js 실행 차단

                const modalEl = document.getElementById('cartWarningModal');
                if (modalEl) {
                    // 위치 계산 오류 방지
                    if (modalEl.parentElement !== document.body) {
                        document.body.appendChild(modalEl);
                    }

                    // 모달 옵션 및 생성
                    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
                        backdrop: false,
                        keyboard: true
                    });

                    // 현재 카드의 장바구니 버튼 또는 클릭한 마이너스 버튼 기준
                    const cardControl = minusBtn.closest('.card-control') || minusBtn.closest('.product-card');
                    const cartBtn = cardControl?.querySelector('.icon-cart')?.closest('button') || cardControl?.querySelector('.btn-cart');

                    positionLayerPopup(cartBtn || minusBtn, modalEl, { align: 'right' });
                    modal.show(cartBtn || minusBtn); // 트리거 전달하여 포커스 관리 개선
                }
            } else if (currentVal === 0) {
                // 최소 수량 알림
                e.preventDefault();
                e.stopImmediatePropagation();
                if (window.Toast) {
                    const toastTarget = qtyBox.closest('.card-control') || qtyBox;
                    window.Toast.show('warning', '최소 수량은 1입니다.', toastTarget, { width: 'match', align: 'left' });
                }
            }
        }
    }
}, true);

// 장바구니 버튼 클릭 시 수량 설정
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon');
    const cartBtn = (btn && btn.querySelector('.icon-cart')) ? btn : e.target.closest('.btn-cart');

    if (cartBtn) {
        // 인접한 qty-box 탐색
        const container = cartBtn.closest('.card-control') || cartBtn.closest('.product-card') || cartBtn.parentElement;
        const qtyBox = container.querySelector('.qty-box');

        if (qtyBox) {
            e.preventDefault();
            const input = qtyBox.querySelector('input');
            if (input) {
                const currentVal = parseInt(input.value, 10) || 0;
                if (currentVal === 0) {
                    input.value = 1; // 0일 경우 1로 설정
                }
                qtyBox.dataset.inCart = 'true'; // 장바구니 상태 저장

                // 장바구니 토스트 표시
                if (window.Toast) {
                    const toastTarget = cartBtn.closest('.card-control') || cartBtn;
                    const finalQty = input.value;
                    window.Toast.show('success', `장바구니에 ${finalQty}개가 담겼습니다.`, toastTarget, { width: 'match', align: 'left' });
                }
            }
        }
    }
}, true);

// ==========================================
// 공통 드롭다운 토글
// ==========================================
const initDropdowns = () => {
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.dropdown-wrapper .select-wrap');
        const wrapper = trigger?.closest('.dropdown-wrapper');

        // 드롭다운 토글
        if (trigger && wrapper) {
            e.preventDefault();
            e.stopPropagation();

            // 타 드롭다운 닫기
            document.querySelectorAll('.dropdown-wrapper.active').forEach(w => {
                if (w !== wrapper) w.classList.remove('active');
            });

            wrapper.classList.toggle('active');
        } else {
            // 외부 클릭 시 전체 닫기
            document.querySelectorAll('.dropdown-wrapper.active').forEach(w => {
                w.classList.remove('active');
            });
        }

        // 옵션 선택
        const option = e.target.closest('.dropdown-wrapper .dropdown-options li');
        if (option) {
            const wrap = option.closest('.dropdown-wrapper');
            const selectedVal = wrap?.querySelector('.selected-value');
            const allOptions = wrap?.querySelectorAll('.dropdown-options li');

            if (selectedVal) {
                selectedVal.textContent = option.textContent;
            }

            allOptions?.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            wrap?.classList.remove('active');

            // 커스텀 이벤트 발생
            const event = new CustomEvent('dropdownChange', {
                detail: {
                    value: option.dataset.value || option.textContent,
                    text: option.textContent
                }
            });
            wrap?.dispatchEvent(event);
        }
    });
};

initDropdowns();



// ==========================================
// 모달 독점 표시
// ==========================================
document.addEventListener('show.bs.modal', (event) => {
    const targetModal = event.target;
    // 현재 열려있는 다른 모달 닫기
    document.querySelectorAll('.modal.show').forEach(modal => {
        if (modal !== targetModal) {
            // getOrCreateInstance를 사용하여 인스턴스가 없으면 생성 후 제어
            const instance = bootstrap.Modal.getOrCreateInstance(modal);
            instance.hide();
        }
    });
});

document.addEventListener('shown.bs.modal', (e) => {
    // 레이어 팝업인 경우 바디 스크롤 유지를 위해 스타일 초기화 (CSS !important와 병행)
    if (e.target.classList.contains('layer-popup')) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
});

// 모달 닫기 시 내부 포커스 해제 (aria-hidden 경고 방지)
document.addEventListener('hide.bs.modal', (e) => {
    if (document.activeElement && e.target.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

/**
 * 사용자 줌 설정 저장 (나중에 DB 연동 시 API 호출로 교체)
 */
async function saveUserZoom(zoomValue) {
    // 로컬 저장소 우선 저장
    localStorage.setItem('pageZoom', zoomValue);

    // TODO: 로그인 상태라면 서버 DB에 저장하는 API 호출 로직 추가 예정
    // if (isLoggedIn) {
    //     await fetch('/api/user/settings/zoom', { method: 'POST', body: JSON.stringify({ zoom: zoomValue }) });
    // }
}

/**
 * 사용자 줌 설정 로드 (나중에 DB 연동 시 API 호출로 교체)
 */
function loadUserZoom() {
    // DB 연동 전까지는 localStorage에서 값 반환
    const savedZoom = localStorage.getItem('pageZoom');
    return savedZoom ? parseFloat(savedZoom) : 1;
}

/**
 * 화면 확대/축소 기능
 */
async function initZoomControl() {
    // 저장된 설정 로드
    let currentZoom = loadUserZoom();

    const step = 0.05;
    const maxZoom = 1.2; // 120% 제한
    const minZoom = 0.7; // 70% 제한
    // 줌 적용 로직 (PC용 화면인 경우에만 적용)
    const applyZoom = () => {
        // 모바일 경로(/mobile/)가 포함되지 않은 경우를 PC 화면으로 판별
        const isPCPage = !window.location.pathname.includes('/emart/mobile/');
        document.body.style.zoom = isPCPage ? currentZoom : 1;

        // GNB 너비 재계산 호출
        if (isPCPage && window.adjustNavWidth) window.adjustNavWidth();
    };

    // 초기 적용 및 리사이즈 대응
    applyZoom();
    window.addEventListener('resize', applyZoom);

    const zoomInBtn = document.getElementById('btnZoomIn');
    const zoomOutBtn = document.getElementById('btnZoomOut');
    const zoomResetBtn = document.getElementById('btnZoomReset');
    const zoomDisplay = document.getElementById('zoomDisplay');

    // UI 요소가 없으면 리턴
    if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn || !zoomDisplay) return;

    // UI 및 상태 업데이트
    const updateZoomDisplay = async () => {
        const percent = Math.round(currentZoom * 100);
        zoomDisplay.textContent = `${percent}%`;

        // 줌 적용
        applyZoom();

        // 데이터 저장 (비동기)
        await saveUserZoom(currentZoom);
    };

    // 확대
    zoomInBtn.addEventListener('click', async () => {
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(maxZoom, parseFloat((currentZoom + step).toFixed(2)));
            await updateZoomDisplay();
        }
    });

    // 축소
    zoomOutBtn.addEventListener('click', async () => {
        if (currentZoom > minZoom) {
            currentZoom = Math.max(minZoom, parseFloat((currentZoom - step).toFixed(2)));
            await updateZoomDisplay();
        }
    });

    // 리셋
    zoomResetBtn.addEventListener('click', async () => {
        currentZoom = 1;
        await updateZoomDisplay();
    });

    // 초기 UI 수치 동기화
    const percent = Math.round(currentZoom * 100);
    zoomDisplay.textContent = `${percent}%`;
}

// 레이어 팝업 위치 지정
function positionLayerPopup(trigger, modalEl, options = { align: 'center' }) {
    const dialog = modalEl.querySelector('.modal-dialog');
    if (dialog) {
        const zoom = parseFloat(document.body.style.zoom) || 1;
        const rect = trigger.getBoundingClientRect();
        const margin = 50;

        // 스타일 초기 설정
        dialog.style.margin = '0';
        dialog.style.position = 'fixed';
        // 줌 보정된 상단 위치
        dialog.style.top = `${(rect.bottom / zoom) + 12}px`;
        dialog.style.zIndex = '2000';

        // 정확한 너비 측정을 위해 임시 노출
        const originalDisplay = modalEl.style.display;
        const originalVisibility = modalEl.style.visibility;
        modalEl.style.display = 'block';
        modalEl.style.visibility = 'hidden';
        const dialogWidth = dialog.offsetWidth;
        modalEl.style.display = originalDisplay;
        modalEl.style.visibility = originalVisibility;

        let leftPos;

        if (options.align === 'right') {
            // 우측 정렬 (줌 보정)
            leftPos = (rect.right / zoom) - dialogWidth;
        } else {
            // 중앙 정렬 (줌 보정)
            leftPos = (rect.left / zoom) + ((rect.width / zoom) / 2) - (dialogWidth / 2);
        }

        // 화면 영역 이탈 방지 (줌 보정된 뷰포트 기준)
        const viewportWidth = window.innerWidth / zoom;
        if (leftPos + dialogWidth > viewportWidth - margin) {
            leftPos = viewportWidth - margin - dialogWidth;
        }
        if (leftPos < margin) {
            leftPos = margin;
        }

        dialog.style.left = `${leftPos}px`;
        dialog.style.transform = 'none'; // Bootstrap transform 충돌 방지

        // Sticky 요소 재계산 유도를 위한 미세 스크롤 보정 트리거 (필요 시)
        // window.scrollBy(0, 0); 
    }
}

function initLayerPopup(triggerSelector, modalId) {
    const setupModal = () => {
        // 부트스트랩 로드 확인
        if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
            setTimeout(setupModal, 50);
            return;
        }

        const selector = triggerSelector.startsWith('.') || triggerSelector.startsWith('#')
            ? triggerSelector
            : `#${triggerSelector}, .${triggerSelector}`;

        // 이벤트 위임
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest(selector);
            if (!trigger) return;

            e.preventDefault();
            const modalEl = document.getElementById(modalId);

            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
                    backdrop: false,
                    keyboard: true
                });
                positionLayerPopup(trigger, modalEl);
                modal.show(trigger); // 트리거 전달하여 포커스 복원 위치 지정
            }
        });
    };
    setupModal();
}

// 헤더 로딩 후 팝업 초기화 
const initAllHeaderPopups = () => {
    initLayerPopup('minOrderTrigger', 'minOrderModal');
    initLayerPopup('monthPurchaseTrigger', 'monthPurchaseModal');
    initLayerPopup('logOutTrigger', 'logOutModal');
    initLayerPopup('productDeleteTrigger', 'productDeleteModal');

    // 확대/축소 초기화
    initZoomControl();

    // 앱 다운로드 바텀시트 확인
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openAppDownload') === 'true') {
        const appDownloadModal = document.getElementById('appDownloadOffcanvas');
        if (appDownloadModal && window.bootstrap && window.bootstrap.Offcanvas) {
            const bsOffcanvas = new bootstrap.Offcanvas(appDownloadModal);
            bsOffcanvas.show();
            // 파라미터 제거
            // history.replaceState(null, '', window.location.pathname);
        }
    }
};

document.addEventListener('headerLoaded', initAllHeaderPopups);

// 로드 완료 시 대응
if (document.getElementById('monthPurchaseTrigger') || document.getElementById('btnZoomIn')) {
    initAllHeaderPopups();
}