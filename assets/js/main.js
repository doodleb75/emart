// ==========================================
// 토스트 알림 (전역)
// ==========================================
class ToastManager {
    static getIcon(type) {
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<g clip-path="url(#clip0_618_4802)">
<path d="M10.0003 1.66797C5.40032 1.66797 1.66699 5.4013 1.66699 10.0013C1.66699 14.6013 5.40032 18.3346 10.0003 18.3346C14.6003 18.3346 18.3337 14.6013 18.3337 10.0013C18.3337 5.4013 14.6003 1.66797 10.0003 1.66797ZM8.33366 14.168L4.16699 10.0013L5.34199 8.8263L8.33366 11.8096L14.6587 5.48463L15.8337 6.66797L8.33366 14.168Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_618_4802">
  <rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>`,
            danger: `<svg class="toast-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#ffffff"/></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<g clip-path="url(#clip0_618_7143)">
<path d="M0.833008 17.5013H19.1663L9.99968 1.66797L0.833008 17.5013ZM10.833 15.0013H9.16634V13.3346H10.833V15.0013ZM10.833 11.668H9.16634V8.33464H10.833V11.668Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_618_7143">
  <rect width="20" height="20" fill="white"/>
</clipPath>
</defs>
</svg>`,
            info: `<svg class="toast-icon" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z" fill="#ffffff"/></svg>`
        };
        return icons[type] || icons.success;
    }

    static show(type, message, target = null, options = {}) {
        let container;
        const isCustomPosition = !!target;

        if (isCustomPosition) {
            container = document.createElement('div');
            container.className = 'custom-toast-container position-absolute';
            document.body.appendChild(container);

            // 현재 적용된 줌 수치 파악
            const zoom = parseFloat(document.body.style.zoom) || 1;
            const rect = target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            // 줌 보정된 좌표 계산 (좌표값을 줌으로 나누어 CSS 절대 위치 환산)
            let top = (rect.bottom + scrollTop) / zoom + 10;
            let left = (rect.left + scrollLeft + (rect.width / 2)) / zoom;
            let transform = 'translateX(-50%)';

            // 화면 내 위치 계산 (줌 보정된 뷰포트 기준)
            const viewportWidth = window.innerWidth / zoom;
            const targetCenterX = (rect.left + rect.width / 2) / zoom;
            const isRightSide = targetCenterX > (viewportWidth / 2);
            const align = options.align === 'auto' ? (isRightSide ? 'right' : 'left') : (options.align || 'center');

            if (align === 'start' || align === 'left') {
                left = (rect.left + scrollLeft) / zoom;
                transform = 'none';
                container.style.justifyContent = 'flex-start';
            } else if (align === 'end' || align === 'right') {
                left = (rect.right + scrollLeft) / zoom;
                transform = 'translateX(-100%)';
                container.style.justifyContent = 'flex-end';
            }

            if (options.width === 'match') {
                container.style.minWidth = `${rect.width / zoom}px`;
                container.style.width = 'auto';
            }

            container.style.top = `${top}px`;
            container.style.left = `${left}px`;
            container.style.transform = transform;
            // width 설정 부분 제거하여 minWidth와 내용에 의해 결정되게 함

        } else {
            container = document.querySelector('.custom-toast-container.global');
            if (!container) {
                container = document.createElement('div');
                container.className = 'custom-toast-container global';
                document.body.appendChild(container);
            }
        }

        const toastEl = document.createElement('div');
        toastEl.className = `custom-toast toast-${type}`;
        toastEl.innerHTML = `
            ${this.getIcon(type)}
            <span>${message}</span>
        `;

        if (isCustomPosition && options.width === 'match') {
            toastEl.style.minWidth = '100%';
            toastEl.style.width = 'max-content';
            toastEl.style.justifyContent = 'center';
        }

        container.appendChild(toastEl);
        requestAnimationFrame(() => {
            toastEl.classList.add('show');
        });

        setTimeout(() => {
            toastEl.classList.remove('show');
            toastEl.addEventListener('transitionend', () => {
                toastEl.remove();
                if (isCustomPosition && container.children.length === 0) {
                    container.remove();
                }
            }, { once: true });
        }, 2000);
    }
}

window.Toast = ToastManager;

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
            const windowWidth = Math.max(window.innerWidth, contentWidth);
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
                    btnPause.innerHTML = `<i class="icon-slider-play"></i>`;
                } else {
                    startAutoPlay();
                    isPlaying = true;
                    btnPause.innerHTML = `<i class="icon-slider-pause"></i>`;
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





    // ==========================================
    // 모바일 스크롤 슬라이더
    // ==========================================
    const initMobileScrollSlider = (wrapperSelector, trackSelector, autoPlay = true) => {
        const wrapper = document.querySelector(wrapperSelector);
        if (!wrapper) return;

        const track = wrapper.querySelector(trackSelector);
        if (!track) return;

        const slides = track.querySelectorAll('.slide-item');
        if (slides.length === 0) return;

        // 컨트롤 요소
        const btnPrev = wrapper.querySelector('.btn-prev');
        const btnNext = wrapper.querySelector('.btn-next');
        const btnPause = wrapper.querySelector('.btn-pause');
        const currentEl = wrapper.querySelector('.current-page');
        const totalEl = wrapper.querySelector('.total-page');

        // 상태
        let currentIndex = 0;
        const totalSlides = slides.length;
        let isPaused = false;
        let autoPlayInterval;

        // 페이지네이션 초기화
        if (totalEl) totalEl.textContent = String(totalSlides).padStart(2, '0');

        // 활성 슬라이드 감지
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
            const hasMultipleSlides = totalSlides > 1;

            if (btnPrev) {
                btnPrev.classList.toggle('active', hasMultipleSlides);
                btnPrev.disabled = !hasMultipleSlides;
            }
            if (btnNext) {
                btnNext.classList.toggle('active', hasMultipleSlides);
                btnNext.disabled = !hasMultipleSlides;
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
            if (nextIndex < 0) nextIndex = totalSlides - 1; // 마지막으로 이동
            stopAutoPlayIfNeeded();
            scrollToSlide(nextIndex);
        });

        if (btnNext) btnNext.addEventListener('click', () => {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= totalSlides) nextIndex = 0; // 처음으로 이동
            stopAutoPlayIfNeeded();
            scrollToSlide(nextIndex);
        });

        // 자동 재생 로직
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
                if (isPaused) {
                    btnPause.innerHTML = `<i class="icon-slider-play"></i>`;
                } else {
                    btnPause.innerHTML = `<i class="icon-slider-pause"></i>`;
                }
            });
        }

        if (autoPlay) startAutoPlay();

        // 터치 시 자동 재생 일시 정지
        track.addEventListener('touchstart', () => stopAutoPlay());
        track.addEventListener('touchend', () => startAutoPlay());
    };

    // 로직 초기화
    // initMobileScrollSlider('.mobile-main-slider', '#mobileMainTrack'); // 메인 슬라이더는 하단 전용 로직 사용을 위해 중복 초기화 제거
    initMobileScrollSlider('.popcorn-banner-wrapper', '#popcornBannerTrack');
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
// 모바일 슬라이더
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('mobileMainTrack');

    // 모바일 슬라이더 초기화
    if (track) {
        let originalSlides = Array.from(track.querySelectorAll('.slide-item'));
        if (originalSlides.length >= 2) {

            const slideCount = originalSlides.length;
            const pagination = track.closest('.mobile-main-slider').querySelector('.pagination-container');
            const currentEl = pagination.querySelector('.current-page');
            const totalEl = pagination.querySelector('.total-page');
            const btnPrev = pagination.querySelector('.btn-prev');
            const btnNext = pagination.querySelector('.btn-next');
            const btnPause = pagination.querySelector('.btn-pause');

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

            // 치수 계산 (Calculate dimensions)
            const getMetrics = () => {
                if (allSlides.length < 2) return { slideWidth: 0, gap: 0, fullWidth: 0 };
                const fullWidth = allSlides[1].offsetLeft - allSlides[0].offsetLeft; // 정적인 요소 간격 측정 (Static distance)
                const slideWidth = allSlides[cloneCount].offsetWidth;
                const gap = fullWidth - slideWidth;
                return { slideWidth, gap, fullWidth };
            };

            // 스크롤 위치 초기화 (Initialize scroll position)
            const initPosition = () => {
                const { fullWidth } = getMetrics();
                if (fullWidth <= 0) return;
                // margin-left 방식에서는 padding이 없으므로 scrollLeft는 정확히 인덱스 배수 (With margin-left, no padding, so scrollLeft is index multiple)
                track.scrollLeft = Math.round(fullWidth * cloneCount);
            };

            // 레이아웃 대기
            setTimeout(initPosition, 100);

            let isJumping = false;

            // 페이지 번호만 갱신 (Update pagination index only)
            const updatePagination = () => {
                const { fullWidth } = getMetrics();
                if (fullWidth <= 0) return;
                const scrollLeft = track.scrollLeft;
                const rawIndex = Math.round(scrollLeft / fullWidth);

                let displayIndex = (rawIndex - cloneCount) % slideCount;
                if (displayIndex < 0) displayIndex += slideCount;
                displayIndex += 1;

                if (currentEl) currentEl.textContent = displayIndex.toString().padStart(2, '0');
            };

            // 루프 위치 보정 (Loop positioning correction)
            const checkLoop = () => {
                if (isJumping) return;
                const { fullWidth } = getMetrics();
                if (fullWidth <= 0) return;

                const scrollLeft = track.scrollLeft;
                const rawIndex = Math.round(scrollLeft / fullWidth);

                // 실제 슬라이드 범위를 벗어났을 때만 보정 (Jump only when out of original range)
                if (rawIndex < cloneCount) {
                    isJumping = true;
                    const newPos = Math.round((slideCount + rawIndex) * fullWidth);
                    track.style.scrollSnapType = 'none';
                    track.scrollTo({ left: newPos, behavior: 'instant' });
                    requestAnimationFrame(() => {
                        track.style.scrollSnapType = '';
                        isJumping = false;
                    });
                } else if (rawIndex >= slideCount + cloneCount) {
                    isJumping = true;
                    const newPos = Math.round((rawIndex - slideCount) * fullWidth);
                    track.style.scrollSnapType = 'none';
                    track.scrollTo({ left: newPos, behavior: 'instant' });
                    requestAnimationFrame(() => {
                        track.style.scrollSnapType = '';
                        isJumping = false;
                    });
                }
            };

            track.addEventListener('scroll', () => {
                updatePagination(); // 스크롤 중에는 번호만 변경
            }, { passive: true });

            track.addEventListener('scrollend', () => {
                checkLoop(); // 스크롤이 끝난 뒤에 위치 보정
            });

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
                        btnPause.innerHTML = `<i class="icon-slider-pause"></i>`;
                    } else {
                        stopAutoplay();
                        btnPause.innerHTML = `<i class="icon-slider-play"></i>`;
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

});

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
        const isPCPage = !window.location.pathname.includes('/mobile/');
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