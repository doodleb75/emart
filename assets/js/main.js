// Menu Data
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
                // Remove active class from all items
                sidebarItems.forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');

                // Update content based on menu
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

    // Nav Width Calculation (네비게이션 너비 계산)
    const navList = document.querySelector('ul.nav.gap-5.justify-content-center');
    const searchContainer = document.querySelector('.search-container');

    if (navList && searchContainer) {
        const listItems = navList.querySelectorAll('li.nav-item');
        let totalLiWidth = 0;

        // Item 너비 합산 (Sum item widths)
        listItems.forEach(li => {
            totalLiWidth += li.getBoundingClientRect().width;
        });

        // Gap 스타일 계산 (Calculate gap style)
        const ulComputedStyle = window.getComputedStyle(navList);
        const gap = parseFloat(ulComputedStyle.gap) || 0;

        // 전체 Gap 너비 계산 (Calculate total gap width)
        const totalGapWidth = gap * (listItems.length > 0 ? listItems.length - 1 : 0);

        const finalWidth = totalLiWidth + totalGapWidth;

        searchContainer.style.maxWidth = `${finalWidth}px`;
        searchContainer.style.width = '100%'; // 최대 너비 설정 (Set max width)
    }

    // Ranking Toggle Logic
    const rankingItems = document.querySelectorAll('.ranking-item');

    rankingItems.forEach(item => {
        const toggleBtn = item.querySelector('.btn-toggle-rank');
        const body = item.querySelector('.ranking-body');
        const header = item.querySelector('.ranking-header');

        if (toggleBtn && body && header) {
            header.addEventListener('click', (e) => {

                const isActive = item.classList.contains('active');

                // If already active, do nothing (prevent toggle off)
                if (isActive) {
                    return;
                }

                // Close all others
                rankingItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherBtn = otherItem.querySelector('.btn-toggle-rank');
                        const otherBody = otherItem.querySelector('.ranking-body');
                        if (otherBtn) otherBtn.classList.remove('active');
                        if (otherBody) otherBody.classList.remove('show');
                    }
                });

                // Open current
                item.classList.add('active');
                toggleBtn.classList.add('active');
                body.classList.add('show');
            });
        }
    });

    // MD Recommendation Tab Logic
    const mdTabItems = document.querySelectorAll('.tab-menu .tab-item');
    const mdTabContents = document.querySelectorAll('.md-rec-content');

    if (mdTabItems && mdTabContents.length > 0) {
        mdTabItems.forEach((item) => {
            item.addEventListener('click', () => {
                const index = item.dataset.tab;

                // Remove active from all tabs
                mdTabItems.forEach(tab => tab.classList.remove('active'));
                // Add active to clicked tab
                item.classList.add('active');

                // Hide all contents
                mdTabContents.forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('active');
                });

                // Show corresponding content
                const targetContent = document.getElementById(`md-grid-${index}`);
                if (targetContent) {
                    targetContent.style.display = 'grid';
                    targetContent.classList.add('active');
                }
            });
        });
    }

    // Main Visual Carousel Logic (Custom Infinite Loop)
    const mainCarouselEl = document.getElementById('eclubMainSlider');
    if (mainCarouselEl) {
        const track = mainCarouselEl.querySelector('.carousel-inner');
        const cards = track.querySelectorAll('.slider-card');
        const btnPrev = document.querySelector('.btn-prev');
        const btnNext = document.querySelector('.btn-next');
        const btnPause = document.querySelector('.btn-pause');
        const currentPageEl = document.querySelector('.current-page');
        const totalPageEl = document.querySelector('.total-page');

        let currentIndex = 1;
        const totalItems = cards.length; // 5 items

        // Initial setup
        const initialCards = Array.from(cards); // Store original items

        function ensureEnoughSlides() {
            if (!track) return;

            // Re-measure
            const currentCards = track.querySelectorAll('.slider-card');
            const firstCard = currentCards[0];
            if (!firstCard) return;

            const cardWidth = firstCard.offsetWidth || 440; // Fallback to fixed size if 0
            const trackStyle = window.getComputedStyle(track);
            const gap = parseFloat(trackStyle.gap) || 20;
            const itemWidth = cardWidth + gap;

            const totalWidth = currentCards.length * itemWidth;
            const requiredWidth = window.innerWidth * 3; // Keep 3x buffer

            if (totalWidth < requiredWidth && itemWidth > 0) {
                let currentTotal = totalWidth;
                // Append clones of original set until requirement met
                while (currentTotal < requiredWidth) {
                    initialCards.forEach(card => {
                        const clone = card.cloneNode(true);
                        clone.classList.add('cloned');
                        track.appendChild(clone);
                    });
                    currentTotal += (initialCards.length * itemWidth);
                }
            }
        }

        // Run on load and resize
        ensureEnoughSlides();
        window.addEventListener('resize', () => {
            ensureEnoughSlides();
        });

        if (totalPageEl) {
            totalPageEl.textContent = String(totalItems).padStart(2, '0');
        }

        // Auto Play
        let isPlaying = true;
        let isAnimating = false; // Prevent rapid clicks breaking the loop
        let autoPlayInterval;

        function startAutoPlay() {
            stopAutoPlay(); // Clear existing
            autoPlayInterval = setInterval(() => {
                if (!isAnimating) moveNext();
            }, 3000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        if (isPlaying) startAutoPlay();

        // Move Next
        function moveNext() {
            if (!track || isAnimating) return;
            isAnimating = true;

            // Get current first item width + gap
            const firstCard = track.firstElementChild;
            if (!firstCard) {
                isAnimating = false;
                return;
            }

            const cardWidth = firstCard.offsetWidth;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 24; // Default to 24 if not found
            const moveAmount = cardWidth + gap;

            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = `translateX(-${moveAmount}px)`;

            track.addEventListener('transitionend', function () {
                track.style.transition = 'none';
                track.style.transform = 'translateX(0)';
                track.appendChild(firstCard); // Move first to end
                updatePagination(true);
                isAnimating = false;
            }, { once: true });
        }

        // Move Prev
        function movePrev() {
            if (!track || isAnimating) return;
            isAnimating = true;

            const lastCard = track.lastElementChild;
            if (!lastCard) {
                isAnimating = false;
                return;
            }

            const cardWidth = lastCard.offsetWidth;
            const style = window.getComputedStyle(track);
            const gap = parseFloat(style.gap) || 24;
            const moveAmount = cardWidth + gap;

            // Prep: Move last to first, set transform to -moveAmount
            track.style.transition = 'none';
            track.insertBefore(lastCard, track.firstElementChild);
            track.style.transform = `translateX(-${moveAmount}px)`;

            // Force reflow
            void track.offsetWidth;

            // Animate to 0
            track.style.transition = 'transform 0.5s ease-in-out';
            track.style.transform = 'translateX(0)';

            track.addEventListener('transitionend', function () {
                updatePagination(false);
                isAnimating = false;
            }, { once: true });
        }

        function updatePagination(isNext) {
            if (isNext) {
                currentIndex = currentIndex >= totalItems ? 1 : currentIndex + 1;
            } else {
                currentIndex = currentIndex <= 1 ? totalItems : currentIndex - 1;
            }
            // However, since we are physically moving DOM elements, the "first" element changes identity.
            // The "currentIndex" logic above is a simple cycle counter, unrelated to the specific card at position 0.
            // If we want exact mapping (Coffee is 1), we need to track it differently or just loop 1-5.
            if (currentPageEl) currentPageEl.textContent = String(currentIndex).padStart(2, '0');
        }

        // Event Listeners
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                stopAutoPlay();
                moveNext();
                if (isPlaying) startAutoPlay();
            });
        }

        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                stopAutoPlay();
                movePrev();
                if (isPlaying) startAutoPlay();
            });
        }

        if (btnPause) {
            btnPause.addEventListener('click', () => {
                if (isPlaying) {
                    stopAutoPlay();
                    isPlaying = false;
                    btnPause.innerHTML = `
                        <svg class="icon-slider-play" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                            <path d="M0 0h24v24H0V0z" fill="none"/>
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    `;
                } else {
                    startAutoPlay();
                    isPlaying = true;
                    btnPause.innerHTML = `
                        <svg class="icon-slider-pause" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                           <path d="M0 0h24v24H0V0z" fill="none"/>
                           <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    `;
                }
            });
        }
    }
    // ==========================================
    // E-Club Weekly Ranking Carousel Logic
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
            // Setup
            let rCurrentIndex = 1;
            const rTotalItems = 5; // Fixed at 5 as per design
            let rIsAnimating = false;
            let rIsPlaying = true;
            let rAutoPlayInterval;

            // Clone the list to create 5 items
            // We already have 1. We need 4 more.
            for (let i = 0; i < 4; i++) {
                const clone = rankingList.cloneNode(true);
                rankingTrack.appendChild(clone);
            }

            // Update Total Count
            if (rTotalPageEl) rTotalPageEl.textContent = String(rTotalItems).padStart(2, '0');

            function rStartAutoPlay() {
                rAutoPlayInterval = setInterval(rMoveNext, 3000);
            }

            function rStopAutoPlay() {
                clearInterval(rAutoPlayInterval);
            }

            if (rIsPlaying) rStartAutoPlay();

            // Move Next
            function rMoveNext() {
                if (rIsAnimating) return;
                rIsAnimating = true;

                const firstItem = rankingTrack.firstElementChild;
                const itemWidth = firstItem.offsetWidth; // Should be 100% of container

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

            // Move Prev
            function rMovePrev() {
                if (rIsAnimating) return;
                rIsAnimating = true;

                const lastItem = rankingTrack.lastElementChild;
                const itemWidth = lastItem.offsetWidth;

                rankingTrack.style.transition = 'none';
                rankingTrack.insertBefore(lastItem, rankingTrack.firstElementChild);
                rankingTrack.style.transform = `translateX(-${itemWidth}px)`;

                // Force reflow
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

            // Listeners
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
    // Quantity Counter Logic
    // ==========================================
    const qtyBoxes = document.querySelectorAll('.qty-box');
    qtyBoxes.forEach(box => {
        const buttons = box.querySelectorAll('button');
        // Assuming first button is minus and second is plus based on DOM order
        const minusBtn = buttons[0];
        const plusBtn = buttons[1];
        const countSpan = box.querySelector('span');

        if (minusBtn && plusBtn && countSpan) {
            minusBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                let currentCount = parseInt(countSpan.textContent, 10) || 0;
                if (currentCount > 0) {
                    countSpan.textContent = currentCount - 1;
                }
            });

            plusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let currentCount = parseInt(countSpan.textContent, 10) || 0;
                countSpan.textContent = currentCount + 1;
            });
        }
    });

    // Use event delegation for potential dynamically added elements (like future clones if any)
    // However, since we run this AFTER the initial carousel cloning, querySelectorAll captures those.
    // If further dynamic content is added later, consider moving to document-level delegation.
});