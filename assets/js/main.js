// 좌측 메뉴 데이터 정의
const menuData = {
    sales: ['판매등록', '판매TR조회', '저널조회', '무이자정보', '품번매출', '점검', '정산'],
    query: ['매출조회', '영수증조회', '포인트조회', '쿠폰조회'],
    system: ['사용자관리', '기기관리', '네트워크설정', '업데이트'],
    settings: ['화면설정', '소리설정', '언어설정', '기타설정']
};

// ==========================================
// Toast Notification System (Global)
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

            const rect = target.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            let top = rect.bottom + scrollTop + 10;
            let left = rect.left + scrollLeft + (rect.width / 2);
            let transform = 'translateX(-50%)';
            let width = 'auto';

            if (options.align === 'start' || options.align === 'left') {
                left = rect.left + scrollLeft;
                transform = 'none';
                container.style.justifyContent = 'flex-start';
            }

            if (options.width === 'match') {
                container.style.minWidth = `${rect.width}px`;
            }

            container.style.top = `${top}px`;
            container.style.left = `${left}px`;
            container.style.transform = transform;
            container.style.width = width;

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
            toastEl.style.width = '100%';
            toastEl.style.whiteSpace = 'nowrap';
            toastEl.style.justifyContent = 'flex-start';
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
            const navWidth = lastRect.right - firstRect.left;

            // 3. 먼저 너비를 확정 (너비가 변하면 주변 요소의 flex 배치가 변하므로 선행 필수)
            searchContainer.style.width = `${navWidth}px`;
            searchContainer.style.flex = 'none';
            searchContainer.style.marginLeft = '0px'; // 임시 초기화

            // 강제 리플로우 (변경된 너비에 맞춰 형제 요소들이 자리를 잡게 함)
            void searchContainer.offsetWidth;

            requestAnimationFrame(() => {
                // 4. 안정된 상태에서 위치 재측정
                const updatedSearchRect = searchContainer.getBoundingClientRect();

                // 목표 위치(GNB 시작점)와 현재 위치(Search 시작점)의 차이 계산
                const offset = firstRect.left - updatedSearchRect.left;

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

        // 바텀 시트 드래그 서브 기능 초기화 (Init drag-to-close for bottom sheet)
        initOffcanvasDrag('userInfoOffcanvas');

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

                // 높이 업데이트 (Height Update)
                setTimeout(() => {
                    const pcSection = item.closest('.weekly-ranking');
                    const mbSection = item.closest('.ranking-carousel-container');
                    if (pcSection && typeof updatePcRankingHeight === 'function') updatePcRankingHeight();
                    if (mbSection && typeof updateMbRankingHeight === 'function') updateMbRankingHeight();
                }, 0);
            }
        });
    }

    // 주간 랭킹 더보기 로직 (Ranking item more/less logic)
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

            // 카드 노출 상태 업데이트 (Update card visibility)
            cards.forEach((card, index) => {
                card.style.display = (isExpanded || index < threshold) ? 'flex' : 'none';
            });

            // 버튼 표시 여부 결정 (Determine button visibility)
            if (cards.length <= threshold) {
                btnMore.style.setProperty('display', 'none', 'important');
            } else {
                btnMore.style.display = 'flex';

                // 텍스트 업데이트 (Update button text)
                let textNode = Array.from(btnMore.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (!textNode) {
                    textNode = document.createTextNode('');
                    btnMore.prepend(textNode);
                }
                textNode.textContent = isExpanded ? '상품 닫기 ' : '상품 더보기 ';

                // 아이콘 경로 업데이트 (Update SVG icon path)
                const svgPath = btnMore.querySelector('svg path');
                if (svgPath) {
                    const upPath = 'M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z';
                    const downPath = 'M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z';
                    svgPath.setAttribute('d', isExpanded ? upPath : downPath);
                }
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

            // 접을 때 상단 이동 (Scroll to top when collapsing)
            if (wasExpanded) {
                const header = item.querySelector('.ranking-header');
                if (header) {
                    const y = header.getBoundingClientRect().top + window.pageYOffset - 110;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }

            // 높이 동기화 (Height sync for carousel)
            if (typeof updatePcRankingHeight === 'function') updatePcRankingHeight();
            if (typeof updateMbRankingHeight === 'function') updateMbRankingHeight();
        });

        // 초기 실행
        updateState();
    };

    // 리사이즈 대응 (Handle window resize for ranking items)
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

    if (pcRankingSection && window.matchMedia('(min-width: 1024px)').matches) {
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
                    const pauseIcon = btnPause.querySelector('svg');
                    if (isPlaying) {
                        startAutoPlay();
                        if (pauseIcon) {
                            pauseIcon.innerHTML = `<path d="M0 0h24v24H0V0z" fill="none" /><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor" />`;
                        }
                    } else {
                        stopAutoPlay();
                        if (pauseIcon) {
                            pauseIcon.innerHTML = `<path d="M0 0h24v24H0V0z" fill="none" /><path d="M8 5v14l11-7z" fill="currentColor" />`;
                        }
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

                // DOM에 추가 후 초기화 실행 (Fix: Init after append to ensure events work and offsetHeight is calcable)
                // 복제 아이템 더보기 로직 초기화
                const clonedItems = clone.querySelectorAll('.ranking-item');
                clonedItems.forEach(item => {
                    // 데이터 속성 초기화 및 로직 재실행
                    delete item.dataset.loadMoreInitialized;
                    initRankingItem(item);
                });

                // 수량 조절 버튼 기능 재연결 (Fix: Re-init quantity control for clones)
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

            // 초기 current 클래스 설정 (Set initial current class)
            Array.from(mobileRankingTrack.children).forEach((slide, index) => {
                if (index === currentIndex - 1) slide.classList.add('current');
                else slide.classList.remove('current');
            });

            const updateCarousel = () => {
                if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');

                // 활성 슬라이드 클래스 업데이트 (Update active slide class)
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
// 바텀 시트 드래그 종료 로직 (Drag to close bottom sheet)
function initOffcanvasDrag(offcanvasId) {
    const offcanvasEl = document.getElementById(offcanvasId);
    if (!offcanvasEl) return;

    const handle = offcanvasEl.querySelector('.offcanvas-handle');
    if (!handle) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;

    // 닫기 함수 (Close function)
    const closeOffcanvas = () => {
        let bsOffcanvas = null;
        if (window.bootstrap && window.bootstrap.Offcanvas) {
            // getOrCreateInstance로 안전하게 인스턴스 확보
            bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        }
        if (bsOffcanvas) bsOffcanvas.hide();
    };

    // 드래그 시작 (Start)
    const onStart = (y) => {
        startY = y;
        currentY = y;
        isDragging = true;
        startTime = new Date().getTime();
        offcanvasEl.style.transition = 'none';
    };

    // 드래그 이동 (Move)
    const onMove = (y) => {
        if (!isDragging) return;
        currentY = y;
        const diff = currentY - startY;

        // 아래로 드래그 시에만 이동 (Only move down)
        if (diff > 0) {
            offcanvasEl.style.transform = `translateY(${diff}px)`;
        }
    };

    // 드래그 종료 (End)
    const onEnd = () => {
        if (!isDragging) return;

        const diff = currentY - startY;
        const timeDiff = new Date().getTime() - startTime;

        // 100px 이상 내리거나, 짧은 시간(300ms)에 50px 이상 내리면 닫기
        if (diff > 100 || (diff > 50 && timeDiff < 300)) {
            closeOffcanvas();
        } else {
            // 원위치 복귀 (Revert position)
            offcanvasEl.style.transition = 'transform 0.3s ease-out';
            offcanvasEl.style.transform = 'translateY(0)';
        }

        setTimeout(() => { isDragging = false; }, 50);
    };

    // 클릭 핸들러: 드래그가 거의 없었을 때만 닫기 트리거 (Click handler)
    handle.addEventListener('click', (e) => {
        if (Math.abs(currentY - startY) < 5) {
            closeOffcanvas();
        }
    });

    // Touch Events
    handle.addEventListener('touchstart', (e) => onStart(e.touches[0].clientY), { passive: true });
    handle.addEventListener('touchmove', (e) => onMove(e.touches[0].clientY), { passive: true });
    handle.addEventListener('touchend', onEnd);

    // Mouse Events (PC Testing)
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
            // 클릭 이벤트가 완전히 처리될 때까지 플래그 유지 (Keep flag until other events process)
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

            // 포커스 아웃 시 드롭다운 닫기 (Close on blur)
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

        // 영역 외 클릭 시 닫기 (Close when clicking outside)
        // searchContainer 블록 안으로 이동하여 스코프 문제 해결
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
        initOffcanvasDrag('userInfoOffcanvas');
    }
};

document.addEventListener('headerLoaded', initSearchDropdown);
if (document.querySelector('.search-container')) {
    initSearchDropdown();
}
// 모바일 슬라이더 로직 (Mobile Slider Logic)
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('mobileMainTrack');

    // 모바일 전용 슬라이더 초기화 (Init mobile slider only if track exists)
    if (track) {
        let originalSlides = Array.from(track.querySelectorAll('.slide-item'));
        if (originalSlides.length >= 2) {

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
        } // if (track) end
    }
    // 공통 상품 더보기 기능 (오늘의 특가, MD 추천 등)
    const initLoadMoreStep = (btnId, step = 2) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        const grid = btn.previousElementSibling;
        if (!grid) return;

        const getThreshold = () => window.innerWidth >= 1024 ? 4 : 2;
        let visibleCount = getThreshold();

        const getItems = () => Array.from(grid.querySelectorAll('.product-card'));

        const updateDisplay = () => {
            const allItems = getItems();
            const threshold = getThreshold();

            // 현재 펼쳐진 상태가 아니라면 임계값에 맞춤
            if (!btn.classList.contains('is-expanded') && visibleCount < threshold) {
                visibleCount = threshold;
            }

            allItems.forEach((item, index) => {
                item.style.display = index < visibleCount ? 'flex' : 'none';
            });

            const isAllShown = visibleCount >= allItems.length;
            const needsButton = allItems.length > threshold;

            // 버튼 표시 여부
            if (!needsButton) {
                btn.style.setProperty('display', 'none', 'important');
            } else {
                btn.style.display = 'flex';
                btn.classList.toggle('is-all-shown', isAllShown);

                // 텍스트/아이콘 업데이트
                let textNode = Array.from(btn.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (!textNode) {
                    textNode = document.createTextNode('');
                    btn.prepend(textNode);
                }
                textNode.textContent = isAllShown ? '상품 닫기 ' : '상품 더보기 ';

                const svgPath = btn.querySelector('svg path');
                if (svgPath) {
                    const upPath = 'M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z';
                    const downPath = 'M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z';
                    svgPath.setAttribute('d', isAllShown ? upPath : downPath);
                }
            }
        };

        btn.refreshState = updateDisplay;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const allItems = getItems();

            if (visibleCount >= allItems.length) {
                // 닫기
                visibleCount = getThreshold();
                btn.classList.remove('is-expanded');
                const section = btn.closest('section');
                if (section) {
                    const header = section.querySelector('.section-header');
                    const y = (header || section).getBoundingClientRect().top + window.pageYOffset - 60;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            } else {
                // 더보기
                visibleCount = Math.min(visibleCount + step, allItems.length);
                if (visibleCount >= allItems.length) btn.classList.add('is-expanded');
            }
            updateDisplay();
        });

        updateDisplay();
    };

    // 공통 더보기 버튼 리사이즈 대응
    window.addEventListener('resize', () => {
        ['btnLoadMoreSpecial'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn && btn.refreshState) btn.refreshState();
        });
    });

    // 적용 (오늘의 특가)
    initLoadMoreStep('btnLoadMoreSpecial', 2, 2);

    // ==========================================
    // 브랜드관 더보기 (Brand Pavilion Load More)
    // ==========================================
    // PC 버전 토글 (.brand-club-zone)
    const brandClubZone = document.querySelector('.brand-club-zone');
    if (brandClubZone) {
        const btnMore = brandClubZone.querySelector('.btn-brand-more');
        const span = btnMore?.querySelector('span');

        if (btnMore) {
            btnMore.addEventListener('click', function () {
                // is-expanded 클래스 토글 (Toggle is-expanded class)
                const isExpanded = brandClubZone.classList.toggle('is-expanded');
                if (span) {
                    span.textContent = isExpanded ? '브랜드관 닫기' : '브랜드관 더보기';
                }
            });
        }
    }

    // 모바일 버전 토글 (.brand-pavilion)
    const brandPavilion = document.querySelector('.brand-story-list');
    const brandSection = document.querySelector('.brand-pavilion');
    if (brandPavilion && brandSection) {
        const btnMore = brandPavilion.querySelector('.btn-brand-more');
        const items = Array.from(brandPavilion.querySelectorAll('.brand-story-item'));
        const initialCount = 1;

        if (btnMore && items.length > 0) {
            const updateState = () => {
                const isExpanded = brandPavilion.classList.contains('is-expanded');

                // 아이템 노출 상태 (Update item visibility)
                items.forEach((item, index) => {
                    item.style.display = (isExpanded || index < initialCount) ? 'flex' : 'none';
                });

                // 버튼 텍스트 및 아이콘 업데이트 (Update button text and icon)
                let textNode = Array.from(btnMore.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
                if (!textNode) textNode = btnMore.appendChild(document.createTextNode(''));
                textNode.textContent = isExpanded ? '브랜드관 닫기 ' : '브랜드관 더보기 ';

                const svgPath = btnMore.querySelector('svg path');
                if (svgPath) {
                    const upPath = 'M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z';
                    const downPath = 'M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z';
                    svgPath.setAttribute('d', isExpanded ? upPath : downPath);
                }
            };

            btnMore.addEventListener('click', (e) => {
                e.preventDefault();
                const wasExpanded = brandPavilion.classList.contains('is-expanded');
                brandPavilion.classList.toggle('is-expanded');
                updateState();

                // 접을 때 상단 이동 (Scroll to section header when collapsing)
                if (wasExpanded) {
                    const header = brandSection.querySelector('.section-header');
                    if (header) {
                        const y = header.getBoundingClientRect().top + window.pageYOffset - 60;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            });

            // 초기화
            updateState();
        }
    }

    // ==========================================
    // 사용자 포인트 프로그레스 설정 (User Point Progress Setup)
    // ==========================================
    window.setUserPointProgress = function (percentage) {
        const fillEl = document.getElementById("userPointFill");
        if (fillEl) {
            // 0~100 사이 값 제한
            const safePercent = Math.max(0, Math.min(100, percentage));
            fillEl.style.width = safePercent + "%";
        }
    };

    // 초기 실행 (1000원 단위 등 실제 로직 적용 전 시각적 테스트용)
    // 10%
    if (window.setUserPointProgress) window.setUserPointProgress(60);

    // ==========================================
    // 카테고리 전체보기 오버레이 (Category Overlay)
    // ==========================================
    // 카테고리 전체보기 오버레이 (Category Overlay)
    // ==========================================
    const initCategoryMenu = () => {
        const categoryLink = document.querySelector('.category-link');
        const categoryOverlay = document.querySelector('.category-overlay');
        const categoryCloseBtn = document.querySelector('.btn-category-close');

        if (categoryLink && categoryOverlay) {
            // 토글 기능 (Toggle)
            categoryLink.addEventListener('click', (e) => {
                e.preventDefault();
                categoryOverlay.classList.toggle('active');
            });

            // 닫기 버튼 (Close)
            if (categoryCloseBtn) {
                categoryCloseBtn.addEventListener('click', () => {
                    categoryOverlay.classList.remove('active');
                });
            }

            // 영역 외 클릭 시 닫기 (Close on outside click)
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

            // 탭 기능 (Tab Switching)
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
                        // 부모 요소에 따른 위치 계산 오류 방지 (Body 직계로 이동)
                        if (modalEl.parentElement !== document.body) {
                            document.body.appendChild(modalEl);
                        }

                        // 모달 옵션 강제 및 인스턴스 생성
                        const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
                            backdrop: false,
                            keyboard: true
                        });

                        // 현재 카드의 장바구니 버튼 또는 클릭한 마이너스 버튼 기준
                        const cardControl = minusBtn.closest('.card-control') || minusBtn.closest('.product-card');
                        const cartBtn = cardControl?.querySelector('.icon-cart')?.closest('button') || cardControl?.querySelector('.btn-cart');

                        positionLayerPopup(cartBtn || minusBtn, modalEl, { align: 'right' });
                        modal.show();
                    }
                } else if (currentVal === 0) {
                    // 수량이 이미 0인 경우 최소수량 알림 토스트 (card-control 너비 맞춤)
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

    // 장바구니 아이콘 클릭 시 수량 1로 설정 및 '장바구니 상태' 저장
    document.addEventListener('click', (e) => {
        const cartBtn = e.target.closest('.icon-cart')?.closest('button') || e.target.closest('.btn-cart');
        if (cartBtn) {
            e.preventDefault();

            // 인접한 qty-box 탐색
            const container = cartBtn.closest('.card-control') || cartBtn.closest('.product-card') || cartBtn.parentElement;
            const qtyBox = container.querySelector('.qty-box');

            if (qtyBox) {
                const input = qtyBox.querySelector('input');
                if (input) {
                    input.value = 1; // 수량 1로 고정
                    qtyBox.dataset.inCart = 'true'; // 장바구니 상태 플래그 저장

                    // 장바구니 담김 토스트 표시 (card-control 너비 맞춤)
                    if (window.Toast) {
                        const toastTarget = cartBtn.closest('.card-control') || cartBtn;
                        window.Toast.show('success', '장바구니에 담겼습니다.', toastTarget, { width: 'match', align: 'left' });
                    }
                }
            }
        }
    }, true);

});

// ==========================================
// 모달 독점 표시 로직 (Exclusive Modal Display)
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

document.addEventListener('shown.bs.modal', () => {
    // 모달이 완전히 떴을 때 Body 스타일 강제 초기화 (Prevent layout shift/gap)
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
});

/**
 * 화면 확대/축소 기능 (Screen Zoom Functionality)
 */
function initZoomControl() {
    let currentZoom = 1;
    const step = 0.1;
    const maxZoom = 1.4; // 140% 제한
    const minZoom = 0.8; // 80% 제한

    const zoomInBtn = document.getElementById('btnZoomIn');
    const zoomOutBtn = document.getElementById('btnZoomOut');
    const zoomResetBtn = document.getElementById('btnZoomReset');
    const zoomDisplay = document.getElementById('zoomDisplay');

    if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn || !zoomDisplay) return;

    // 수치 업데이트 함수 (Update display value)
    const updateZoomDisplay = () => {
        const percent = Math.round(currentZoom * 100);
        zoomDisplay.textContent = `${percent}%`;
        document.body.style.zoom = currentZoom;
    };

    // 확대 버튼 클릭 (Zoom In)
    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < maxZoom) {
            currentZoom = Math.min(maxZoom, parseFloat((currentZoom + step).toFixed(1)));
            updateZoomDisplay();
        }
    });

    // 축소 버튼 클릭 (Zoom Out)
    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > minZoom) {
            currentZoom = Math.max(minZoom, parseFloat((currentZoom - step).toFixed(1)));
            updateZoomDisplay();
        }
    });

    // 100% 리셋 버튼 클릭 (Reset to 100%)
    zoomResetBtn.addEventListener('click', () => {
        currentZoom = 1;
        updateZoomDisplay();
    });

    // 초기값 설정 (Set initial value)
    updateZoomDisplay();
}

// 레이어 팝업 위치 지정 코어 (Position logic extracted)
function positionLayerPopup(trigger, modalEl, options = { align: 'center' }) {
    const dialog = modalEl.querySelector('.modal-dialog');
    if (dialog) {
        const rect = trigger.getBoundingClientRect();
        const margin = 20;

        // 스타일 초기 설정
        dialog.style.margin = '0';
        dialog.style.position = 'fixed';
        dialog.style.top = `${rect.bottom + 12}px`;
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
            // 트리거 우측 끝 기준 (Align right)
            leftPos = rect.right - dialogWidth;
        } else {
            // 중앙 정렬 (Align center)
            leftPos = rect.left + (rect.width / 2) - (dialogWidth / 2);
        }

        // 화면 영역 이탈 방지
        const viewportWidth = window.innerWidth;
        if (leftPos + dialogWidth > viewportWidth - margin) {
            leftPos = viewportWidth - margin - dialogWidth;
        }
        if (leftPos < margin) {
            leftPos = margin;
        }

        dialog.style.left = `${leftPos}px`;
        dialog.style.transform = 'none'; // Bootstrap transform 과의 충돌 방지
    }
}

function initLayerPopup(triggerSelector, modalId) {
    const setupModal = () => {
        // Bootstrap 로드 확인 (Check if Bootstrap is loaded)
        if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
            setTimeout(setupModal, 50);
            return;
        }

        const selector = triggerSelector.startsWith('.') || triggerSelector.startsWith('#')
            ? triggerSelector
            : `#${triggerSelector}, .${triggerSelector}`;

        // 이벤트 위임 방식 적용 (Use event delegation for robustness)
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
                modal.show();
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

    // 확대/축소 기능 초기화 (Initialize Zoom)
    initZoomControl();

    // 앱 다운로드 바텀시트 자동 오픈 체크 (Check for App Download Trigger)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openAppDownload') === 'true') {
        const appDownloadModal = document.getElementById('appDownloadOffcanvas');
        if (appDownloadModal && window.bootstrap && window.bootstrap.Offcanvas) {
            const bsOffcanvas = new bootstrap.Offcanvas(appDownloadModal);
            bsOffcanvas.show();
            // 파라미터 제거 (Optional: Clean URL)
            // history.replaceState(null, '', window.location.pathname);
        }
    }
};

document.addEventListener('headerLoaded', initAllHeaderPopups);

// 이미 로드된 경우 대응 (Handle already loaded case)
if (document.getElementById('monthPurchaseTrigger') || document.getElementById('btnZoomIn')) {
    initAllHeaderPopups();
}

