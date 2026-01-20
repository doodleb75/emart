
// PC/모바일 메인 슬라이더 로직 통합 관리
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
            contentWidth: 1360, // 0일 때 Full Width 처리
            gap: 24,            // 기본 간격
            autoPlayInterval: 3000,
            transitionTime: 500,
            autoPlay: true,
            isMobile: false,
            adaptiveHeight: false, // 높이 자동 조절
            onClone: null,       // 클론 생성 콜백
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
        this.currentIndex = 0; // 로직용 인덱스 (0부터 시작)
        this.isPlaying = this.options.autoPlay;
        this.isAnimating = false;
        this.timer = null;

        this.cardWidth = 0;
        this.gap = this.options.gap;
        this.baseOffset = 0;
        this.prependCount = 0;

        // 드래그 변수
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCurrentX = 0;
        this.dragDist = 0;
        this.isDragging = false;
        this.dragStartTime = 0;

        // UI 요소
        this.btnPrev = this.root.querySelector(this.options.btnPrevSelector);
        this.btnNext = this.root.querySelector(this.options.btnNextSelector);
        this.btnPause = this.root.querySelector(this.options.btnPauseSelector);
        this.pageCurrent = this.root.querySelector(this.options.pageCurrentSelector);
        this.pageTotal = this.root.querySelector(this.options.pageTotalSelector);

        if (!this.btnPrev && this.options.isMobile) {
            // 모바일 페이지네이션 컨테이너 내부 요소 탐색
            const pagination = this.root.querySelector('.pagination-container');
            if (pagination) {
                this.btnPrev = pagination.querySelector(this.options.btnPrevSelector);
                this.btnNext = pagination.querySelector(this.options.btnNextSelector);
                this.btnPause = pagination.querySelector(this.options.btnPauseSelector);
                this.pageCurrent = pagination.querySelector(this.options.pageCurrentSelector);
                this.pageTotal = pagination.querySelector(this.options.pageTotalSelector);
            }
        }

        if (document.readyState === 'complete') {
            this.init();
        } else {
            window.addEventListener('load', () => this.init());
        }
    }

    init() {
        requestAnimationFrame(() => {
            this.initSlider();
            this.updatePagination();
            this.bindEvents();

            if (this.isPlaying) this.startAutoPlay();

            window.addEventListener('resize', () => {
                this.initSlider();
                this.updatePagination();
            });
        });
    }

    measureGap() {
        if (!this.track) return;
        const style = window.getComputedStyle(this.track);
        const gapVal = parseFloat(style.columnGap) || parseFloat(style.gap);
        if (!isNaN(gapVal) && gapVal > 0) {
            this.gap = gapVal;
        } else {
            if (this.gap === 0) return;
            this.gap = this.options.isMobile ? 8 : 24;
        }
    }

    initSlider() {
        if (!this.track || this.initialCards.length === 0) return;

        this.measureGap();

        // 카드 크기 측정 및 예외 처리
        let measuredWidth = this.initialCards[0].offsetWidth;
        if (!measuredWidth && this.options.isMobile) {
            measuredWidth = (this.options.contentWidth === 0) ? window.innerWidth : (window.innerWidth - 42);
        }

        this.cardWidth = measuredWidth || (this.options.isMobile ? window.innerWidth : 440);
        const fullItemWidth = this.cardWidth + this.gap;

        const windowWidth = window.innerWidth;
        const trackStyle = window.getComputedStyle(this.track);
        const pl = parseFloat(trackStyle.paddingLeft) || 0;
        let gridStartX = pl;

        if (!this.options.isMobile && this.options.contentWidth > 0) {
            gridStartX = Math.max(0, (windowWidth - this.options.contentWidth) / 2);
        }

        let neededLeft = 2;
        let neededRight = 2;

        if (!this.options.isMobile) {
            neededLeft = Math.ceil(windowWidth / fullItemWidth) + 1;
            neededRight = neededLeft;
        }

        this.prependCount = neededLeft;
        const currentTransition = this.track.style.transition;
        this.track.style.transition = 'none';
        this.track.innerHTML = '';

        const appendClone = (item) => {
            const clone = item.cloneNode(true);
            clone.classList.add('cloned');
            clone.removeAttribute('id');
            // 클론 요소 접근성 처리용
            // clone.setAttribute('aria-hidden', 'true');

            this.track.appendChild(clone);

            // 클론 생성 후 콜백 실행
            if (typeof this.options.onClone === 'function') {
                this.options.onClone(clone);
            }
        };

        for (let i = neededLeft; i > 0; i--) {
            const index = (this.totalItems - (i % this.totalItems)) % this.totalItems;
            appendClone(this.initialCards[index]);
        }

        this.initialCards.forEach(card => this.track.appendChild(card));

        for (let i = 0; i < neededRight; i++) {
            const index = i % this.totalItems;
            appendClone(this.initialCards[index]);
        }

        this.baseOffset = gridStartX - (this.prependCount * fullItemWidth);

        this.track.style.display = 'flex';
        this.track.style.flexWrap = 'nowrap';
        this.track.style.gap = `${this.gap}px`;
        this.track.style.transform = `translateX(${this.baseOffset - (this.currentIndex * fullItemWidth)}px)`;

        if (this.pageTotal) this.pageTotal.textContent = String(this.totalItems).padStart(2, '0');

        setTimeout(() => {
            if (this.track) this.track.style.transition = currentTransition;
        }, 50);

        this.updateHeight();

    }

    updateHeight() {
        if (!this.options.adaptiveHeight) return;

        // 현재 활성 슬라이드 탐색 (prependCount + currentIndex)
        const activeIndex = this.prependCount + this.currentIndex;
        const activeSlide = this.track.children[activeIndex];

        if (activeSlide) {
            const wrapper = this.track.parentElement;
            if (wrapper) {
                // 부드러운 높이 전환 처리
                wrapper.style.transition = 'height 0.3s ease';
                wrapper.style.height = `${activeSlide.offsetHeight}px`;
            }
        }
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
                void this.track.offsetWidth;
                this.track.style.transform = `translateX(${this.baseOffset}px)`;
                void this.track.offsetWidth;
            }
            this.updatePagination();
            this.updateHeight();
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
                void this.track.offsetWidth;
                this.track.style.transform = `translateX(${this.baseOffset - (this.currentIndex * fullItemWidth)}px)`;
                void this.track.offsetWidth;
            }
            this.updatePagination();
            this.updateHeight();
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
        this.bindDragEvents();
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
        const fullItemWidth = this.cardWidth + this.gap;
        this.track.style.transform = `translateX(${this.baseOffset}px)`;
        this.updateHeight();
    }

    bindDragEvents() {
        // Touch Events
        this.track.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: false });
        this.track.addEventListener('touchend', (e) => this.onDragEnd(e));

        // Mouse Events
        this.track.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'IMG') e.preventDefault();
            this.onDragStart(e);
        });

        // 드래그 후 클릭 방지
        this.track.addEventListener('click', (e) => {
            if (Math.abs(this.dragDist) > 5) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { capture: true });
    }

    getEventX(e) {
        return e.touches ? e.touches[0].clientX : e.clientX;
    }

    getEventY(e) {
        return e.touches ? e.touches[0].clientY : e.clientY;
    }

    onDragStart(e) {
        if (this.isAnimating) return;

        const isTouch = e.type === 'touchstart';
        if (!isTouch && e.button !== 0) return;

        this.isDragging = true;
        this.dragStartX = this.getEventX(e);
        this.dragStartY = this.getEventY(e);
        this.dragCurrentX = this.dragStartX;
        this.dragDist = 0;
        this.dragStartTime = new Date().getTime();
        this.isScrolling = undefined;

        this.stopAutoPlay();
        this.track.style.transition = 'none';

        if (!isTouch) {
            this.boundOnMouseMove = this.onDragMove.bind(this);
            this.boundOnMouseUp = this.onDragEnd.bind(this);
            document.addEventListener('mousemove', this.boundOnMouseMove);
            document.addEventListener('mouseup', this.boundOnMouseUp);
        }
    }

    onDragMove(e) {
        if (!this.isDragging) return;

        const x = this.getEventX(e);
        const y = this.getEventY(e);
        const dx = x - this.dragStartX;
        const dy = y - this.dragStartY;

        if (e.type === 'touchmove') {
            if (typeof this.isScrolling === 'undefined') {
                this.isScrolling = Math.abs(dy) > Math.abs(dx);
            }
            if (this.isScrolling) {
                this.isDragging = false;
                return;
            }
            if (e.cancelable) e.preventDefault();
        }

        this.dragCurrentX = x;
        this.dragDist = dx;

        const fullItemWidth = this.cardWidth + this.gap;
        const currentTransform = this.baseOffset - (this.currentIndex * fullItemWidth);
        this.track.style.transform = `translateX(${currentTransform + dx}px)`;
    }

    onDragEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;

        if (e && e.type !== 'touchend') {
            document.removeEventListener('mousemove', this.boundOnMouseMove);
            document.removeEventListener('mouseup', this.boundOnMouseUp);
        }

        const diff = this.dragDist;
        const absDiff = Math.abs(diff);
        const timeSpent = new Date().getTime() - this.dragStartTime;
        const fullItemWidth = this.cardWidth + this.gap;

        // 임계값
        const minSwipeDist = 50;
        const maxSwipeTime = 500;

        if (absDiff > minSwipeDist || (absDiff > 20 && timeSpent < maxSwipeTime)) {
            if (diff < 0) {
                this.moveNext();
            } else {
                this.movePrev();
            }
        } else {
            this.track.style.transition = `transform ${this.options.transitionTime}ms ease-in-out`;
            this.track.style.transform = `translateX(${this.baseOffset - (this.currentIndex * fullItemWidth)}px)`;
        }

        this.dragDist = 0;

        if (this.isPlaying) this.startAutoPlay();
    }
}

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

    // GNB/검색창 너비 동적 조정
    function adjustNavWidth() {
        const navList = document.querySelector('.gnb-list');
        const searchContainer = document.querySelector('.search-container');

        if (!navList || !searchContainer) return;

        const performAdjustment = () => {
            // 줌 수치 파악 및 보정
            const zoom = parseFloat(document.body.style.zoom) || 1;

            // 트랜지션 일시 제거
            const originalTransition = searchContainer.style.transition;
            searchContainer.style.transition = 'none';

            // GNB 너비 측정
            const listItems = navList.querySelectorAll('li');
            if (listItems.length === 0) {
                searchContainer.style.transition = originalTransition;
                return;
            }

            const firstRect = listItems[0].getBoundingClientRect();
            const lastRect = listItems[listItems.length - 1].getBoundingClientRect();
            // 줌 수치 보정 후 CSS 픽셀 너비 계산
            const navWidth = (lastRect.right - firstRect.left) / zoom;

            // 너비 우선 확정으로 레이아웃 흐름 제어
            searchContainer.style.width = `${navWidth}px`;
            searchContainer.style.flex = 'none';
            searchContainer.style.marginLeft = '0px'; // 임시 초기화

            // 리플로우 통한 형제 요소 위치 동기화
            void searchContainer.offsetWidth;

            requestAnimationFrame(() => {
                // 레이아웃 안정화 후 위치 재측정
                const updatedSearchRect = searchContainer.getBoundingClientRect();

                // 목표 위치와 현재 위치 차이 계산 및 줌 보정
                const offset = (firstRect.left - updatedSearchRect.left) / zoom;

                // 오프셋 최종 적용
                searchContainer.style.marginLeft = `${offset}px`;

                // 트랜지션 원복
                requestAnimationFrame(() => {
                    searchContainer.style.transition = originalTransition;
                });
            });
        };

        performAdjustment();
    }

    // 전역 함수 등록
    window.adjustNavWidth = adjustNavWidth;

    // 초기화 및 리사이즈 이벤트 바인딩
    if (document.fonts) {
        document.fonts.ready.then(adjustNavWidth);
    }

    // 헤더 크기 변화 감시
    const headerInner = document.querySelector('.header-main .header-inner');
    if (headerInner && window.ResizeObserver) {
        new ResizeObserver(adjustNavWidth).observe(headerInner);
    }

    adjustNavWidth();
    window.addEventListener('resize', adjustNavWidth);
    window.addEventListener('load', () => {
        setTimeout(adjustNavWidth, 50);
    });

    // 헤더 로드 완료 후 연계 동작
    document.addEventListener('headerLoaded', () => {
        adjustNavWidth();

        // 신규 헤더 요소 감시 재설정
        const newHeaderInner = document.querySelector('.header-main .header-inner');
        if (newHeaderInner && window.ResizeObserver) {
            new ResizeObserver(adjustNavWidth).observe(newHeaderInner);
        }

        // 바텀 시트 드래그 초기화
        initOffcanvasDrag();

        setTimeout(adjustNavWidth, 100);
    });

    // 주간 랭킹 아코디언 토글
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

                // 타 항목 닫기
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

                // 선택 항목 활성화
                item.classList.add('active');
                toggleBtn.classList.add('active');
                body.classList.add('show');

                // 해당 위치로 부드러운 스크롤
                const y = header.getBoundingClientRect().top + window.pageYOffset - 110;
                window.scrollTo({ top: y, behavior: 'smooth' });

                // 슬라이더 높이 동기화
                setTimeout(() => {
                    const pcSection = item.closest('.weekly-ranking');
                    const mbSection = item.closest('.ranking-carousel-container');
                    if (pcSection && typeof updatePcRankingHeight === 'function') updatePcRankingHeight();
                    if (mbSection && typeof updateMbRankingHeight === 'function') updateMbRankingHeight();
                }, 0);
            }
        });
    }

    // 공통 아코디언/더보기 헬퍼
    window.ExpandableHelper = {
        init(context, options) {
            const {
                btnSelector = '.btn-more',
                itemSelector = '.product-card',
                initialCount = () => (window.innerWidth >= 1024 ? 4 : 2),
                toggleStateTarget = 'container', // 'container' | 'button'
                displayStyle = '',
                scrollOffset = 110,
                textExpanded = '상품 닫기 ',
                textCollapsed = '상품 더보기 ',
                onToggle = null,
                findHeader = (el) => el.querySelector('.ranking-header') || el.querySelector('.section-header')
            } = options;

            // 타겟 요소 탐색
            const btn = options.btnElement || context.querySelector(btnSelector);

            // 그리드 컨테이너 탐색
            let grid = options.gridElement;
            if (!grid && options.gridSelector) {
                grid = context.querySelector(options.gridSelector);
            }
            if (!grid) {
                grid = context.querySelector('.ranking-body .ranking-grid') ||
                    context.querySelector('.ranking-body [class*="product-grid"]') ||
                    (btn ? btn.previousElementSibling : null) ||
                    context.querySelector('[class*="product-grid"]');
            }

            // 유효성 검사
            if (!btn || !grid) return;
            // 중복 초기화 방지
            if (context.dataset.expandInitialized) return;
            context.dataset.expandInitialized = 'true';

            // 리스트 상태 업데이트
            const updateState = () => {
                const items = Array.from(grid.querySelectorAll(itemSelector));
                const limit = initialCount();
                const stateEl = toggleStateTarget === 'container' ? context : btn;
                const isExpanded = stateEl.classList.contains('is-expanded');

                items.forEach((item, idx) => {
                    item.style.display = (isExpanded || idx < limit) ? displayStyle : 'none';
                });

                // 더보기 버튼 노출 제어
                if (items.length <= limit) {
                    btn.style.setProperty('display', 'none', 'important');
                } else {
                    btn.style.display = '';
                    // 버튼 텍스트 갱신
                    let textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                    if (!textNode) {
                        textNode = document.createTextNode('');
                        btn.prepend(textNode);
                    }
                    textNode.textContent = isExpanded ? textExpanded : textCollapsed;
                }

                if (onToggle) onToggle(isExpanded);
            };

            // 외부 인터페이스 등록
            context.refreshState = updateState;

            // 클릭 이벤트 바인딩
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const stateEl = toggleStateTarget === 'container' ? context : btn;
                stateEl.classList.toggle('is-expanded');

                updateState();

                // 상단 헤더 위치로 스크롤
                const header = findHeader(context);
                if (header) {
                    const y = header.getBoundingClientRect().top + window.pageYOffset - scrollOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });

            // 초기 상태 설정
            updateState();
        }
    };

    // 주간 랭킹 더보기 설정
    const initRankingItem = (item) => {
        // 중복 초기화 방지
        if (item.dataset.loadMoreInitialized) return;
        item.dataset.loadMoreInitialized = 'true';

        if (window.ExpandableHelper) {
            window.ExpandableHelper.init(item, {
                btnSelector: '.btn-more',
                itemSelector: '.product-card',
                toggleStateTarget: 'container',
                displayStyle: 'flex',
                scrollOffset: 110,
                textExpanded: '상품 닫기 ',
                textCollapsed: '상품 더보기 ',
                findHeader: (el) => el.querySelector('.ranking-header'),
                onToggle: () => {
                    if (typeof updatePcRankingHeight === 'function') updatePcRankingHeight();
                    if (typeof updateMbRankingHeight === 'function') updateMbRankingHeight();
                }
            });
        }
    };

    // 리사이즈 시 상태 갱신
    window.addEventListener('resize', () => {
        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach(item => {
            if (item.refreshState) item.refreshState();
        });
    });

    // 랭킹 아이템 초기화
    if (rankingWrapper) {
        const rankingItems = rankingWrapper.querySelectorAll('.ranking-item');
        rankingItems.forEach(item => initRankingItem(item));
    }

    // MD 추천 상품 탭
    const mdTabItems = document.querySelectorAll('.tab-menu .tab-item');
    const mdTabContents = document.querySelectorAll('.md-rec-content');

    if (mdTabItems && mdTabContents.length > 0) {
        // 상품 카드 랜덤 셔플
        const shuffleCards = (container) => {
            // 그리드 컨테이너 탐색
            const gridContainer = container.classList.contains('product-grid-4') || container.classList.contains('product-grid-2')
                ? container
                : container.querySelector('.product-grid-4, .product-grid-2');

            if (!gridContainer) return;

            const cards = Array.from(gridContainer.querySelectorAll('.product-card'));
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                gridContainer.appendChild(cards[j]); // DOM 요소 순서 변경
            }
        };

        // 초기 로드 시 1회 랜덤 정렬
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
                    // 애니메이션 초기화 제어
                    content.style.animation = 'none';
                    void content.offsetWidth;
                    content.style.animation = '';
                });

                // 선택 콘텐츠 노출
                const targetContent = document.getElementById(`md-grid-${index}`);
                if (targetContent) {
                    targetContent.style.display = 'grid';
                    targetContent.classList.add('active');
                }
            });
        });
    }




    // PC 메인 슬라이더 초기화
    const pcSliderEl = document.getElementById('eclubMainSlider');
    if (pcSliderEl) {
        new UnifiedMainSlider(pcSliderEl, {
            trackSelector: '.carousel-inner',
            contentWidth: 1360,
            gap: 24
        });
    }
    // 주간 랭킹 슬라이더 통합 초기화
    const initRankingSlider = (root, config) => {
        if (!root) return null;
        const track = root.querySelector('.ranking-carousel-track');
        const firstList = track ? track.querySelector('.ranking-list') : null;

        if (!track || !firstList) return null;

        // 내부 컴포넌트 초기화
        const initComponents = (segment, isClone = false) => {
            // 랭킹 아이템
            if (typeof initRankingItem === 'function') {
                segment.querySelectorAll('.ranking-item').forEach(item => {
                    if (isClone) {
                        delete item.dataset.expandInitialized; // 클론 시 플래그 리셋
                        delete item.dataset.loadMoreInitialized;
                    }
                    initRankingItem(item);
                });
            }
            // 수량 제어 초기화
            if (typeof initQuantityControl === 'function') {
                const qtyBoxes = segment.querySelectorAll('.qty-box');
                if (isClone) {
                    qtyBoxes.forEach(box => delete box.dataset.initialized);
                }
                initQuantityControl(segment);
            }
        };

        // 무한 루프용 데이터 클론 (4회 복제 -> 총 5 페이지 구성)
        for (let i = 0; i < 4; i++) {
            const clone = firstList.cloneNode(true);
            track.appendChild(clone);
            initComponents(clone, true);
        }

        // 슬라이더 생성
        const slider = new UnifiedMainSlider(root, {
            trackSelector: '.ranking-carousel-track',
            itemSelector: '.ranking-list',
            btnPrevSelector: config.btnPrev || '.btn-prev',
            btnNextSelector: config.btnNext || '.btn-next',
            pageCurrentSelector: '.page-count .current',
            pageTotalSelector: '.page-count .total',
            contentWidth: 0,
            gap: 0,
            adaptiveHeight: true,
            autoPlay: config.autoPlay,
            isMobile: config.isMobile,
            onClone: (clone) => {
                // 무한 스크롤 클론 처리
                initComponents(clone, true);
            }
        });

        // 원본 요소 초기 설정
        initComponents(firstList, false);

        return slider;
    };

    // PC 랭킹 초기화
    const pcRankingSection = document.querySelector('.weekly-ranking');
    if (pcRankingSection && window.matchMedia('(min-width: 1024px)').matches && !document.querySelector('.ranking-carousel-container')) {
        const slider = initRankingSlider(pcRankingSection, {
            autoPlay: true,
            isMobile: false
        });
        window.updatePcRankingHeight = () => slider?.updateHeight();
    }

    // 모바일 랭킹 초기화
    const mbContainer = document.querySelector('.ranking-carousel-container');
    const mbRoot = mbContainer?.closest('.weekly-ranking');
    if (mbContainer && mbRoot && typeof UnifiedMainSlider !== 'undefined') {
        const slider = initRankingSlider(mbRoot, {
            autoPlay: false,
            isMobile: true,
            btnPrev: '.nav-btn.prev',
            btnNext: '.nav-btn.next'
        });
        window.updateMbRankingHeight = () => slider?.updateHeight();
    }


    // 수량 제어 공통 초기화
    if (typeof initQuantityControl === 'function') {
        initQuantityControl(document);
    }


    // 장바구니 체크박스 및 탭
    const selectAll = document.getElementById('selectAll');
    const cartTabs = document.querySelectorAll('.category-tabs .tab-item');
    const sectionCheckboxes = document.querySelectorAll('.section-check');

    // 필수 요소 유효성 검사
    if (selectAll || document.querySelector('.section-check') || cartTabs.length > 0) {

        function getActiveSection() {
            return document.querySelector('.cart-content');
        }

        // 전체 선택 상태 동기화
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

        // 전체 선택 토글
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

        // 섹션별 선택 관리
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

        // 탭 스크롤 위치 동기화
        if (cartTabs.length > 0) {
            // 탭 클릭 부드러운 이동
            cartTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // 기존 활성 탭 제거
                    cartTabs.forEach(t => t.classList.remove('active'));
                    // 선택 탭 활성화
                    tab.classList.add('active');
                });
            });

            // 스크롤 위치 감시
            const observerOptions = {
                root: null,
                rootMargin: '-20% 0px -60% 0px',
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        // 활성 섹션 매칭 탭 탐색
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

    // 검색 결과 전체 선택
    const searchSelectAll = document.getElementById('searchSelectAll');
    if (searchSelectAll) {
        const searchItems = document.querySelectorAll('.product-grid-4 .item-check');

        // 전체 선택 토글
        searchSelectAll.addEventListener('change', (e) => {
            const isChecked = searchSelectAll.checked;
            searchItems.forEach(cb => {
                cb.checked = isChecked;
            });
        });

        // 개별 선택 기반 상태 동기화
        searchItems.forEach(cb => {
            cb.addEventListener('change', () => {
                const allChecked = Array.from(searchItems).every(c => c.checked);
                searchSelectAll.checked = allChecked;
            });
        });
    }






    // 로직 초기화
    // 팝콘 배너 슬라이더
    const popcornBannerEl = document.querySelector('.popcorn-banner-wrapper');
    if (popcornBannerEl) {
        new UnifiedMainSlider(popcornBannerEl, {
            trackSelector: '#popcornBannerTrack',
            itemSelector: '.slide-item',
            isMobile: true,
            contentWidth: 0,
            gap: 0,
            autoPlayInterval: 3000
        });
    }
    initOffcanvasDrag();

    // 동적 오프캔버스 감시 (MutationObserver)
    if (window.MutationObserver) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // 요소 자체가 오프캔버스일 때
                        if (node.classList.contains('offcanvas')) {
                            initOffcanvasDrag(node);
                        }
                        // 자식 요소 중 오프캔버스 탐색
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
// 바텀 시트 드래그 로직
function initOffcanvasDrag(target) {
    // 드래그 이벤트 바인딩
    const attach = (offcanvasEl) => {
        if (!offcanvasEl || offcanvasEl.dataset.dragInitialized) return;
        const handle = offcanvasEl.querySelector('.offcanvas-handle');
        if (!handle) return;

        offcanvasEl.dataset.dragInitialized = 'true';

        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let startTime = 0;

        // 오프캔버스 닫기 실행
        const closeOffcanvas = () => {
            let bsOffcanvas = null;
            if (window.bootstrap && window.bootstrap.Offcanvas) {
                // 인스턴스 안전 확보
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

            // 아래로 드래그 시 이동
            if (diff > 0) {
                offcanvasEl.style.transform = `translateY(${diff}px)`;
            }
        };

        // 드래그 종료
        const onEnd = () => {
            if (!isDragging) return;

            const diff = currentY - startY;
            const timeDiff = new Date().getTime() - startTime;

            // 특정 임계값 이상 드래그 시 닫기 처리
            if (diff > 100 || (diff > 50 && timeDiff < 300)) {
                closeOffcanvas();
            } else {
                // 원래 위치로 복귀
                offcanvasEl.style.transition = 'transform 0.3s ease-out';
                offcanvasEl.style.transform = 'translateY(0)';
            }

            setTimeout(() => { isDragging = false; }, 50);
        };

        // 핸들 클릭 시 닫기
        handle.addEventListener('click', (e) => {
            if (Math.abs(currentY - startY) < 5) {
                closeOffcanvas();
            }
        });

        // 터치 이벤트 대응
        handle.addEventListener('touchstart', (e) => {
            onStart(e.touches[0].clientY);
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            // 드래그 시 브라우저 스크롤 방지
            if (isDragging && e.cancelable) e.preventDefault();
            onMove(e.touches[0].clientY);
        }, { passive: false });

        handle.addEventListener('touchend', onEnd);

        // 마우스 드래그 대응 (PC용)
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

        // 비활성화 시 스타일 초기화
        offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
            offcanvasEl.style.transform = '';
            offcanvasEl.style.transition = '';
            currentY = 0;
            startY = 0;
        });
    };

    // 대상 요소별 초기화 분기
    if (target) {
        const el = typeof target === 'string' ? document.getElementById(target) : target;
        if (el) attach(el);
    } else {
        // 핸들 보유 오프캔버스 일괄 적용
        document.querySelectorAll('.offcanvas').forEach(el => {
            if (el.querySelector('.offcanvas-handle')) {
                attach(el);
            }
        });
    }
}

// 검색창 드롭다운 로직
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
            // 레이어 우선순위 및 본문 스크롤 제어
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
            // 클릭 이벤트 지연 처리
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

            // 포커스 아웃 시 드롭다운 닫기
            searchInput.addEventListener('blur', (e) => {
                const relatedTarget = e.relatedTarget;

                // 내부 요소 포커스 시 닫기 방지
                if (isClickInside || (relatedTarget && searchContainer.contains(relatedTarget))) {
                    return;
                }

                // 외부 클릭 시 지연 닫기
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
                searchInput.blur(); // 모바일 키보드 비활성화
                updateDropdownView();
            });
        }

        // 전체 삭제 기능
        if (btnDeleteAll) {
            btnDeleteAll.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // 인기검색어 탭
        const rankTabs = searchContainer.querySelectorAll('.rank-tabs .tab-item');
        const rankLists = searchContainer.querySelectorAll('.popular-list');

        if (rankTabs.length > 0) {
            rankTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.stopPropagation(); // 클릭 시 드롭다운 유지
                    const targetId = tab.dataset.target;

                    // 탭 활성화
                    rankTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    // 리스트 노출
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
                // 아이템 삭제
            });
        });

        // 외부 영역 클릭 시 닫기
        document.addEventListener('click', (event) => {
            if (searchContainer.classList.contains('active')) {
                // 외부 클릭 여부 판별 후 닫기
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
// 모바일 메인 슬라이더 초기화
const mobileTrack = document.getElementById('mobileMainTrack');
if (mobileTrack) {
    // 부모 요소를 루트로 초기화
    const mobileRoot = mobileTrack.closest('.mobile-main-slider');
    if (mobileRoot) {
        new UnifiedMainSlider(mobileRoot, {
            trackSelector: '#mobileMainTrack',
            itemSelector: '.slide-item',
            contentWidth: 0,
            isMobile: true,
            gap: 8
        });
    }
}
// 공통 더보기 설정
const initExpandableGrids = () => {
    const moreButtons = document.querySelectorAll('.btn-more');

    moreButtons.forEach(btn => {
        // 우선순위 기반 섹션 탐색
        let section = btn.closest('.md-rec-content') || btn.closest('.ranking-item') || btn.closest('section');
        if (!section || section.dataset.expandInitialized) return;

        // 브랜드관 전용 처리
        let itemSel = '.product-card';
        let initCount = () => (window.innerWidth >= 1024 ? 4 : 2);

        if (section.classList.contains('brand-pavilion')) {
            itemSel = '.brand-story-item';
            initCount = () => 1;
        }

        // 더보기 헬퍼 초기화
        if (window.ExpandableHelper) {
            window.ExpandableHelper.init(section, {
                btnElement: btn,
                itemSelector: itemSel,
                initialCount: initCount,
                toggleStateTarget: 'button',
                displayStyle: '',
                scrollOffset: 60,
                textExpanded: (itemSel === '.brand-story-item') ? '브랜드관 닫기 ' : '상품 닫기 ',
                textCollapsed: (itemSel === '.brand-story-item') ? '브랜드관 더보기 ' : '상품 더보기 ',
                findHeader: (el) => el.querySelector('.section-header') || el,
            });
        }
    });
};

// DOM 로딩 후 일괄 초기화
document.addEventListener('DOMContentLoaded', () => {
    initExpandableGrids();
});

// 리사이즈 대응
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // 상태 재계산 처리
    }, 200);
});

// 브랜드관 더보기 (PC)
// PC 버전 브랜드 존 토글
const brandClubZone = document.querySelector('.brand-club-zone');
if (brandClubZone && !brandClubZone.dataset.expandInitialized) {
    const btnMore = brandClubZone.querySelector('.btn-brand-more');
    if (btnMore) {
        // 단순 토글 처리
        btnMore.addEventListener('click', () => {
            const isExpanded = brandClubZone.classList.toggle('is-expanded');
            const span = btnMore.querySelector('span');
            if (span) {
                span.textContent = isExpanded ? '브랜드관 닫기' : '브랜드관 더보기';
            }
        });
        brandClubZone.dataset.expandInitialized = 'true';
    }
}


// 사용자 포인트 프로그레스 설정
window.setUserPointProgress = function (percentage) {
    const fillEl = document.getElementById("userPointFill");
    if (fillEl) {
        // 수치 범위 제한 (0-100)
        const safePercent = Math.max(0, Math.min(100, percentage));
        fillEl.style.width = safePercent + "%";
    }
};

// 초기 테스트 실행 (60%)
if (window.setUserPointProgress) window.setUserPointProgress(60);

// 카테고리 메뉴 오버레이
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

        // 외부 영역 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!categoryLink.contains(e.target) && !categoryOverlay.contains(e.target)) {
                categoryOverlay.classList.remove('active');
            }
        });

        // 상단 탭 전환
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
                // 탭 선택
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // 컨텐츠 노출
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

// 헤더 로드 완료 시 초기화
document.addEventListener('headerLoaded', initCategoryMenu);
if (document.querySelector('.category-link')) {
    initCategoryMenu();
}




// 수량 감소 시 경고 및 삭제 유도 모달
document.addEventListener('click', (e) => {
    const minusBtn = e.target.closest('.qty-box button:first-of-type');
    if (minusBtn) {
        const qtyBox = minusBtn.closest('.qty-box');
        const input = qtyBox?.querySelector('input');
        if (input) {
            const currentVal = parseInt(input.value, 10) || 0;
            const isInCart = qtyBox.dataset.inCart === 'true';

            // 1에서 감소 시 삭제 확인 모달
            if (currentVal === 1 && isInCart) {
                e.preventDefault();
                e.stopImmediatePropagation(); // 기본 동작 차단

                const modalEl = document.getElementById('cartWarningModal');
                if (modalEl) {
                    // 모달 위치 보정
                    if (modalEl.parentElement !== document.body) {
                        document.body.appendChild(modalEl);
                    }

                    // 모달 인스턴스 생성
                    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
                        backdrop: false,
                        keyboard: true
                    });

                    // 트리거 요소 기준 위치 설정
                    const cardControl = minusBtn.closest('.card-control') || minusBtn.closest('.product-card');
                    const cartBtn = cardControl?.querySelector('.icon-cart')?.closest('button') || cardControl?.querySelector('.btn-cart');

                    positionLayerPopup(cartBtn || minusBtn, modalEl, { align: 'right' });
                    modal.show(cartBtn || minusBtn); // 포커스 관리용 트리거 전달
                }
            } else if (currentVal === 0) {
                // 최소 수량 토스트 알림
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

// 장바구니 버튼 클릭 수량 제어
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-icon');
    const cartBtn = (btn && btn.querySelector('.icon-cart')) ? btn : e.target.closest('.btn-cart');

    if (cartBtn) {
        // 인접 수량 조절 노드 탐색
        const container = cartBtn.closest('.card-control') || cartBtn.closest('.product-card') || cartBtn.parentElement;
        const qtyBox = container.querySelector('.qty-box');

        if (qtyBox) {
            e.preventDefault();
            const input = qtyBox.querySelector('input');
            if (input) {
                const currentVal = parseInt(input.value, 10) || 0;
                if (currentVal === 0) {
                    input.value = 1; // 0일 때 1로 초기화
                }
                qtyBox.dataset.inCart = 'true'; // 장바구니 상태 저장

                // 토스트 노출
                if (window.Toast) {
                    const toastTarget = cartBtn.closest('.card-control') || cartBtn;
                    const finalQty = input.value;
                    window.Toast.show('success', `장바구니에 ${finalQty}개가 담겼습니다.`, toastTarget, { width: 'match', align: 'left' });
                }
            }
        }
    }
}, true);

// 공통 드롭다운 토글
const initDropdowns = () => {
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.dropdown-wrapper .select-wrap');
        const wrapper = trigger?.closest('.dropdown-wrapper');

        // 토글
        if (trigger && wrapper) {
            e.preventDefault();
            e.stopPropagation();

            // 타 드롭다운 닫기
            document.querySelectorAll('.dropdown-wrapper.active').forEach(w => {
                if (w !== wrapper) w.classList.remove('active');
            });

            wrapper.classList.toggle('active');
        } else {
            // 외부 클릭 닫기
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

            // 이벤트 발생
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



// 모달 단독 노출 제어
document.addEventListener('show.bs.modal', (event) => {
    const targetModal = event.target;
    // 타 모달 닫기
    document.querySelectorAll('.modal.show').forEach(modal => {
        if (modal !== targetModal) {
            // 모달 인스턴스 제어
            const instance = bootstrap.Modal.getOrCreateInstance(modal);
            instance.hide();
        }
    });
});

document.addEventListener('shown.bs.modal', (e) => {
    // 레이어 팝업 본문 스크롤 유지
    if (e.target.classList.contains('layer-popup')) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
});

// 닫기 시 포커스 해제
document.addEventListener('hide.bs.modal', (e) => {
    if (document.activeElement && e.target.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

// 사용자 줌 설정 로컬 저장
async function saveUserZoom(zoomValue) {
    localStorage.setItem('pageZoom', zoomValue);
}

// 사용자 줌 설정 로드
function loadUserZoom() {
    const savedZoom = localStorage.getItem('pageZoom');
    return savedZoom ? parseFloat(savedZoom) : 1;
}

// 화면 확대/축소 기능 초기화
async function initZoomControl() {
    // 설정 로드
    let currentZoom = loadUserZoom();

    const step = 0.05;
    const maxZoom = 1.2;
    const minZoom = 0.7;
    // 줌 적용 (PC 전용)
    const applyZoom = () => {
        // PC 화면 판별
        const isPCPage = !window.location.pathname.includes('/emart/mobile/');
        document.body.style.zoom = isPCPage ? currentZoom : 1;

        // GNB 너비 재계산
        if (isPCPage && window.adjustNavWidth) window.adjustNavWidth();
    };

    // 초기 적용 및 리사이즈 대응
    applyZoom();
    window.addEventListener('resize', applyZoom);

    const zoomInBtn = document.getElementById('btnZoomIn');
    const zoomOutBtn = document.getElementById('btnZoomOut');
    const zoomResetBtn = document.getElementById('btnZoomReset');
    const zoomDisplay = document.getElementById('zoomDisplay');

    // 유효성 검사
    if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn || !zoomDisplay) return;

    // 상태 업데이트
    const updateZoomDisplay = async () => {
        const percent = Math.round(currentZoom * 100);
        zoomDisplay.textContent = `${percent}%`;

        applyZoom();

        // 비동기 저장
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

    // 초기화
    zoomResetBtn.addEventListener('click', async () => {
        currentZoom = 1;
        await updateZoomDisplay();
    });

    // 수치 동기화
    const percent = Math.round(currentZoom * 100);
    zoomDisplay.textContent = `${percent}%`;
}

// 레이어 팝업 위치 동적 지정
function positionLayerPopup(trigger, modalEl, options = { align: 'center' }) {
    const dialog = modalEl.querySelector('.modal-dialog');
    if (dialog) {
        const zoom = parseFloat(document.body.style.zoom) || 1;
        const rect = trigger.getBoundingClientRect();
        const margin = 50;

        dialog.style.margin = '0';
        dialog.style.position = 'fixed';
        // 상단 위치 보정
        dialog.style.top = `${(rect.bottom / zoom) + 12}px`;
        dialog.style.zIndex = '2000';

        // 너비 실측용 임시 노출
        const originalDisplay = modalEl.style.display;
        const originalVisibility = modalEl.style.visibility;
        modalEl.style.display = 'block';
        modalEl.style.visibility = 'hidden';
        const dialogWidth = dialog.offsetWidth;
        modalEl.style.display = originalDisplay;
        modalEl.style.visibility = originalVisibility;

        let leftPos;

        if (options.align === 'right') {
            leftPos = (rect.right / zoom) - dialogWidth;
        } else {
            leftPos = (rect.left / zoom) + ((rect.width / zoom) / 2) - (dialogWidth / 2);
        }

        // 뷰포트 이탈 방지
        const viewportWidth = window.innerWidth / zoom;
        if (leftPos + dialogWidth > viewportWidth - margin) {
            leftPos = viewportWidth - margin - dialogWidth;
        }
        if (leftPos < margin) {
            leftPos = margin;
        }

        dialog.style.left = `${leftPos}px`;
        dialog.style.transform = 'none';
    }
}

function initLayerPopup(triggerSelector, modalId) {
    const setupModal = () => {
        // Bootstrap 로드 확인
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
                modal.show(trigger); // 포커스 복원 설정
            }
        });
    };
    setupModal();
}

// 팝업 일괄 초기화 
const initAllHeaderPopups = () => {
    initLayerPopup('minOrderTrigger', 'minOrderModal');
    initLayerPopup('monthPurchaseTrigger', 'monthPurchaseModal');
    initLayerPopup('logOutTrigger', 'logOutModal');
    initLayerPopup('productDeleteTrigger', 'productDeleteModal');

    initZoomControl();

    // 앱 다운로드 확인
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openAppDownload') === 'true') {
        const appDownloadModal = document.getElementById('appDownloadOffcanvas');
        if (appDownloadModal && window.bootstrap && window.bootstrap.Offcanvas) {
            const bsOffcanvas = new bootstrap.Offcanvas(appDownloadModal);
            bsOffcanvas.show();
        }
    }
};

document.addEventListener('headerLoaded', initAllHeaderPopups);

// 로드 완료 대응
if (document.getElementById('monthPurchaseTrigger') || document.getElementById('btnZoomIn')) {
    initAllHeaderPopups();
}