// PC/모바일 메인 슬라이더 로직 통합 관리
window.UnifiedMainSlider = class UnifiedMainSlider {
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

        // 덮어쓰기: HTML 마크업의 data 속성을 통해 개별 제어 가능 (data-interval, data-autoplay 등)
        if (this.root.dataset.interval) {
            this.options.autoPlayInterval = parseInt(this.root.dataset.interval, 10);
        }
        if (this.root.dataset.autoplay) {
            this.options.autoPlay = this.root.dataset.autoplay !== 'false';
        }
        if (this.root.dataset.transition) {
            this.options.transitionTime = parseInt(this.root.dataset.transition, 10);
        }
        if (this.root.dataset.gap) {
            this.options.gap = parseInt(this.root.dataset.gap, 10);
        }

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
};
