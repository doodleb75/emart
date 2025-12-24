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

    // Nav Width Calculation (Runs after Header Load)
    function adjustNavWidth() {
        const navList = document.querySelector('.gnb-list');
        const searchContainer = document.querySelector('.search-container');

        if (navList && searchContainer) {
            const listItems = navList.querySelectorAll('li'); // Use universal li selector or specific if class exists
            if (listItems.length > 0) {
                const firstRect = listItems[0].getBoundingClientRect();
                const lastRect = listItems[listItems.length - 1].getBoundingClientRect();

                // Calculate width from the start of the first item to the end of the last item
                const finalWidth = lastRect.right - firstRect.left;

                searchContainer.style.maxWidth = `${finalWidth}px`;
                searchContainer.style.width = '100%';
                // searchContainer.style.margin = '0 auto'; // Centering usually handled by CSS, but ensure it if needed
            }
        }
    }

    document.addEventListener('headerLoaded', adjustNavWidth);
    window.addEventListener('resize', adjustNavWidth);

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

    // Main Visual Carousel Logic (Custom Infinite Loop with Centering)
    const mainCarouselEl = document.getElementById('eclubMainSlider');
    if (mainCarouselEl) {
        const track = mainCarouselEl.querySelector('.carousel-inner');
        const btnPrev = document.querySelector('.btn-prev');
        const btnNext = document.querySelector('.btn-next');
        const btnPause = document.querySelector('.btn-pause');
        const currentPageEl = document.querySelector('.current-page');
        const totalPageEl = document.querySelector('.total-page');

        // Initial setup
        const initialCards = Array.from(track.querySelectorAll('.slider-card'));
        const totalItems = initialCards.length;
        let currentIndex = 1;
        let isPlaying = true;
        let isAnimating = false;
        let autoPlayInterval;

        // Configuration
        const checkInterval = 3000;
        const transitionTime = 500;
        const contentWidth = 1360; // Desired content width
        const gap = 24; // Gap between slides

        // State for offsets
        let baseOffset = 0;
        let cardWidth = 0;
        let prependCount = 0;

        function initSlider() {
            if (!track || initialCards.length === 0) return;

            // 1. Measure Card Width (assumes standard desktop size initially if hidden)
            // Temporarily ensure display block to measure if needed, but flex should be fine
            const tempCard = initialCards[0];
            const computedStyle = window.getComputedStyle(tempCard);
            // Parsing fixed width from CSS or offsetWidth
            cardWidth = tempCard.offsetWidth || 440;
            if (cardWidth === 0) cardWidth = 437.33; // Fallback to calculation

            const fullItemWidth = cardWidth + gap;

            // 2. Calculate Offsets
            const windowWidth = window.innerWidth;
            // Center calculation: The start of the "active" slide should be at the start of the 1360px grid
            // Grid Start X = (Window Width - Content Width) / 2
            let gridStartX = (windowWidth - contentWidth) / 2;
            if (gridStartX < 0) gridStartX = 0;

            // 3. Determine needed clones
            // We need to fill the left side (0 to gridStartX) with prepended items
            // And fill the right side (gridStartX + contentWidth to windowWidth) with appended items
            // Plus some buffer
            const neededLeft = Math.ceil(gridStartX / fullItemWidth) + 2; // +2 Buffer
            const neededRight = Math.ceil((windowWidth - (gridStartX + contentWidth)) / fullItemWidth) + 2;

            // Reset Track
            track.innerHTML = '';

            // Helper to append clones
            const appendClone = (item) => {
                const clone = item.cloneNode(true);
                clone.classList.add('cloned');
                track.appendChild(clone);
            };

            // Prepend Clones (Reverse order for correct flow)
            // e.g. needed 2. We take last 2 items. [4, 5]. Prepend 4, then 5? No.
            // Sequence: ... 4, 5, [1, 2, 3, 4, 5], 1, 2 ...
            prependCount = neededLeft;

            // Create "Left" clones
            for (let i = 0; i < neededLeft; i++) {
                // Index from end: -1, -2 ...
                // modulo logic: (totalItems - 1 - (i % totalItems))
                let index = (totalItems - 1 - (i % totalItems));
                // We want to insert them at the BEGINNING. 
                // But loop 0 should be the one closest to real items?
                // Visual Order: [C_(-N) ... C_(-1), R_1 ... ]
                // It's easier to build the array then append.
            }

            // Let's build a fragment
            const fragment = document.createDocumentFragment();

            // 1. Add Prepended Clones
            // We need sequence ... [Last-1] [Last] [Real 1]
            // If neededLeft = 2. We want [4, 5].
            for (let i = neededLeft; i > 0; i--) {
                let index = (totalItems - (i % totalItems)) % totalItems;
                appendClone(initialCards[index]);
            }

            // 2. Add Real Items (Keep their event listeners if possible? No, cloning breaks refs usually unless strict move)
            // But we need to maintain "Original" identity for index tracking if strictly needed. 
            // Simplifying: Just clone everything or move originals. 
            // User code moved physical nodes. Let's re-use that strategy for the "Middle".
            // Actually, simply cloning all is safer for "Reset" logic.
            initialCards.forEach(card => {
                track.appendChild(card); // Move original nodes back
            });

            // 3. Add Appended Clones
            for (let i = 0; i < neededRight; i++) {
                let index = i % totalItems;
                appendClone(initialCards[index]);
            }

            // 4. Set Initial Position
            // The "Real Item 1" is at index `prependCount`.
            // We want it at `gridStartX`.
            // Position in track = prependCount * fullItemWidth.
            // Transform = gridStartX - (prependCount * fullItemWidth)
            baseOffset = gridStartX - (prependCount * fullItemWidth);

            track.style.transition = 'none';
            track.style.transform = `translateX(${baseOffset}px)`;

            if (totalPageEl) totalPageEl.textContent = String(totalItems).padStart(2, '0');
            updatePagination();
        }

        // Run Init
        initSlider();
        window.addEventListener('resize', () => { // Debounce could be good
            initSlider();
        });


        // Auto Play
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => {
                if (!isAnimating) moveNext();
            }, checkInterval);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        if (isPlaying) startAutoPlay();


        // Move Next
        function moveNext() {
            if (!track || isAnimating) return;
            isAnimating = true;

            const fullItemWidth = cardWidth + gap;

            track.style.transition = `transform ${transitionTime}ms ease-in-out`;
            track.style.transform = `translateX(${baseOffset - fullItemWidth}px)`;

            track.addEventListener('transitionend', function () {
                track.style.transition = 'none';

                // Move first item to end
                const first = track.firstElementChild;
                track.appendChild(first);

                // Reset to baseOffset
                track.style.transform = `translateX(${baseOffset}px)`;

                updateCurrentIndex(true);
                isAnimating = false;
            }, { once: true });
        }

        // Move Prev
        function movePrev() {
            if (!track || isAnimating) return;
            isAnimating = true;

            const fullItemWidth = cardWidth + gap;

            // 1. Move last to first immediately
            const last = track.lastElementChild;
            track.insertBefore(last, track.firstElementChild);

            // 2. Adjust transform to match previous visual state
            // We moved one item to front, so everything shifted right by width.
            // To keep visual static, shift transform left by width.
            track.style.transition = 'none';
            track.style.transform = `translateX(${baseOffset - fullItemWidth}px)`;

            // Force reflow
            void track.offsetWidth;

            // 3. Animate to baseOffset
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

        // Event Listeners
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
        const countInput = box.querySelector('input');

        if (minusBtn && plusBtn && countInput) {
            minusBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
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

    // Use event delegation for potential dynamically added elements (like future clones if any)
    // However, since we run this AFTER the initial carousel cloning, querySelectorAll captures those.
    // If further dynamic content is added later, consider moving to document-level delegation.

    // ==========================================
    // Cart Page Logic (Checkbox & Tabs)
    // ==========================================
    const selectAll = document.getElementById('selectAll');
    const cartTabs = document.querySelectorAll('.category-tabs .tab-item');
    const sectionCheckboxes = document.querySelectorAll('.section-check');

    // Only run if relevant elements exist
    if (selectAll || document.querySelector('.section-check') || cartTabs.length > 0) {

        // Helper: Get Active Section
        // Helper: Get Active Section (Refactored for Single Page View)
        // Now returns the main container so "Select All" applies to ALL visible sections
        function getActiveSection() {
            return document.querySelector('.cart-content');
        }

        // Helper: Update Global Select All State
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

        // 1. Global Select All Click
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

        // 2. Section & Item Checkbox Logic
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

        // 3. Tab Logic
        // 3. Tab Logic (Scroll Spy & Active State)
        if (cartTabs.length > 0) {
            // Click Handler
            cartTabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // Remove active from all
                    cartTabs.forEach(t => t.classList.remove('active'));
                    // Add active to clicked
                    tab.classList.add('active');
                    // Default anchor behavior handles scrolling
                });
            });

            // Scroll Spy using IntersectionObserver
            const observerOptions = {
                root: null,
                rootMargin: '-20% 0px -60% 0px', // Adjust active zone
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        // Find corresponding tab
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

        // Initial State Check on Load
        // Ensure correct initial visibility based on active tab
        // Initial State Check: Removed to allow all sections to be visible
        updateSelectAllState();
    }


});