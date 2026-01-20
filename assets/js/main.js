document.addEventListener('DOMContentLoaded', () => {

    // 1. 레이아웃 초기화 (헤더, 사이드바 등)
    if (window.initHeaderLayout) window.initHeaderLayout();
    if (window.initSidebar) window.initSidebar();
    if (window.initCategoryMenu) window.initCategoryMenu();

    // 헤더가 동적으로 로드되는 경우 대응
    document.addEventListener('headerLoaded', () => {
        if (window.initCategoryMenu) window.initCategoryMenu();
        if (window.initSearchDropdown) window.initSearchDropdown();
        // 바텀 시트 드래그 재초기화
        if (window.initOffcanvasDrag) window.initOffcanvasDrag();
    });

    // 2. 검색 드롭다운 초기화
    if (window.initSearchDropdown) window.initSearchDropdown();


    // 3. 주간 랭킹 아코디언 토글
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
                if (isActive) return;

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

                // 스크롤 이동
                const y = header.getBoundingClientRect().top + window.pageYOffset - 110;
                window.scrollTo({ top: y, behavior: 'smooth' });

                // 높이 갱신
                setTimeout(() => {
                    if (window.updatePcRankingHeight) window.updatePcRankingHeight();
                    if (window.updateMbRankingHeight) window.updateMbRankingHeight();
                }, 0);
            }
        });
    }

    // 4. 주간 랭킹 아이템 더보기 초기화
    const initRankingItem = (item) => {
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

    // 외부에 공개 (슬라이더 init 함수에서 사용)
    window.initRankingItem = initRankingItem;

    if (rankingWrapper) {
        rankingWrapper.querySelectorAll('.ranking-item').forEach(item => initRankingItem(item));
    }


    window.addEventListener('resize', () => {
        document.querySelectorAll('.ranking-item').forEach(item => {
            if (item.refreshState) item.refreshState();
        });
    });


    // 5. MD 추천 상품 탭 로직
    const mdTabItems = document.querySelectorAll('.tab-menu .tab-item');
    const mdTabContents = document.querySelectorAll('.md-rec-content');

    if (mdTabItems && mdTabContents.length > 0) {
        // 셔플 함수 로컬 정의
        const shuffleCards = (container) => {
            const gridContainer = container.querySelector('.product-grid-4, .product-grid-2') ||
                (container.classList.contains('product-grid-4') ? container : null);
            if (!gridContainer) return;
            const cards = Array.from(gridContainer.querySelectorAll('.product-card'));
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                gridContainer.appendChild(cards[j]);
            }
        };

        mdTabContents.forEach(content => shuffleCards(content));

        mdTabItems.forEach((item) => {
            item.addEventListener('click', () => {
                const index = item.dataset.tab;
                mdTabItems.forEach(tab => tab.classList.remove('active'));
                item.classList.add('active');

                mdTabContents.forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('active');
                });

                const targetContent = document.getElementById(`md-grid-${index}`);
                if (targetContent) {
                    targetContent.style.display = 'grid';
                    targetContent.classList.add('active');
                }
            });
        });
    }


    // 6. 슬라이더 초기화
    // PC 메인
    const pcSliderEl = document.getElementById('eclubMainSlider');
    if (pcSliderEl && window.UnifiedMainSlider) {
        new UnifiedMainSlider(pcSliderEl, {
            trackSelector: '.carousel-inner',
            contentWidth: 1360,
            gap: 24
        });
    }

    // 모바일 메인
    const mobileTrack = document.getElementById('mobileMainTrack');
    if (mobileTrack) {
        const mobileRoot = mobileTrack.closest('.mobile-main-slider');
        if (mobileRoot && window.UnifiedMainSlider) {
            new UnifiedMainSlider(mobileRoot, {
                trackSelector: '#mobileMainTrack',
                itemSelector: '.slide-item',
                contentWidth: 0,
                isMobile: true,
                gap: 8
            });
        }
    }

    // 팝콘 배너
    const popcornBannerEl = document.querySelector('.popcorn-banner-wrapper');
    if (popcornBannerEl && window.UnifiedMainSlider) {
        new UnifiedMainSlider(popcornBannerEl, {
            trackSelector: '#popcornBannerTrack',
            itemSelector: '.slide-item',
            isMobile: true,
            contentWidth: 0,
            gap: 0,
            autoPlayInterval: 3000
        });
    }


    // 주간 랭킹 슬라이더 (PC/Mobile)
    const initRankingSlider = (root, config) => {
        if (!root) return null;
        const track = root.querySelector('.ranking-carousel-track');
        if (!track) return null;

        // 클론 로직
        const firstList = track.querySelector('.ranking-list');
        if (firstList) {
            const initComponents = (segment, isClone = false) => {
                // 랭킹 아이템
                if (typeof initRankingItem === 'function') {
                    segment.querySelectorAll('.ranking-item').forEach(item => {
                        if (isClone) {
                            delete item.dataset.expandInitialized;
                            delete item.dataset.loadMoreInitialized;
                        }
                        initRankingItem(item);
                    });
                }
                // 수량 제어
                if (typeof initQuantityControl === 'function') {
                    const qtyBoxes = segment.querySelectorAll('.qty-box');
                    if (isClone) qtyBoxes.forEach(box => delete box.dataset.initialized);
                    initQuantityControl(segment);
                }
            };

            for (let i = 0; i < 4; i++) {
                const clone = firstList.cloneNode(true);
                track.appendChild(clone);
                initComponents(clone, true);
            }
            initComponents(firstList, false);

            if (window.UnifiedMainSlider) {
                return new UnifiedMainSlider(root, {
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
                    onClone: (clone) => initComponents(clone, true)
                });
            }
        }
        return null;
    };

    // 랭킹 슬라이더 인스턴스 생성
    const pcRankingSection = document.querySelector('.weekly-ranking');
    if (pcRankingSection && window.matchMedia('(min-width: 1024px)').matches && !document.querySelector('.ranking-carousel-container')) {
        const slider = initRankingSlider(pcRankingSection, { autoPlay: true, isMobile: false });
        window.updatePcRankingHeight = () => slider?.updateHeight();
    }

    const mbContainer = document.querySelector('.ranking-carousel-container');
    const mbRoot = mbContainer?.closest('.weekly-ranking');
    if (mbContainer && mbRoot) {
        const slider = initRankingSlider(mbRoot, { autoPlay: false, isMobile: true, btnPrev: '.nav-btn.prev', btnNext: '.nav-btn.next' });
        window.updateMbRankingHeight = () => slider?.updateHeight();
    }


    // 7. 기타 유틸 초기화
    // 수량 제어
    if (typeof initQuantityControl === 'function') initQuantityControl(document);
    // 확대/축소 제어
    if (window.initZoomControl) window.initZoomControl();
    // 레이어 팝업
    if (window.initLayerPopup) {
        window.initLayerPopup('.btn-layer-popup', 'layerPopup1');
        window.initLayerPopup('.delivery-info-toggle', 'deliveryInfoModal');
    }

    // 장바구니/검색결과 체크박스
    if (window.initCheckboxGroup) {
        const updateGrandMasterState = () => {
            const selectAll = document.getElementById('selectAll');
            if (selectAll) {
                const allItems = document.querySelectorAll('.cart-content .item-check');
                if (allItems.length > 0) {
                    selectAll.checked = Array.from(allItems).every(i => i.checked);
                } else {
                    selectAll.checked = false;
                }
            }
        };

        window.initCheckboxGroup({
            masterSelector: '.section-check',
            itemSelector: '.item-check',
            containerSelector: '.cart-section',
            onMasterChange: () => updateGrandMasterState(),
            onItemChange: () => updateGrandMasterState()
        });

        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                document.querySelectorAll('.cart-content .item-check, .cart-content .section-check').forEach(el => {
                    el.checked = isChecked;
                });
            });
        }

        window.initCheckboxGroup({ masterSelector: '#searchSelectAll', itemSelector: '.product-grid-4 .item-check' });
    }

    // 장바구니 탭 스크롤
    const cartTabs = document.querySelectorAll('.category-tabs .tab-item');
    if (cartTabs.length > 0) {
        cartTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                cartTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const activeTab = document.querySelector(`.category-tabs .tab-item[href="#${id}"]`) ||
                        document.querySelector(`.category-tabs .tab-item[data-target="${id}"]`);
                    if (activeTab) {
                        cartTabs.forEach(t => t.classList.remove('active'));
                        activeTab.classList.add('active');
                    }
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
        document.querySelectorAll('.cart-section').forEach(section => observer.observe(section));
    }

    // 더보기 Grid (랭킹 외 일반 그리드)
    const initExpandableGrids = () => {
        const moreButtons = document.querySelectorAll('.btn-more');
        moreButtons.forEach(btn => {
            let section = btn.closest('.md-rec-content') || btn.closest('.ranking-item') || btn.closest('section');
            if (!section || section.dataset.expandInitialized) return;

            // 브랜드관 판별
            let itemSel = '.product-card';
            let initCount = () => (window.innerWidth >= 1024 ? 4 : 2);
            let txtExp = '상품 닫기 ', txtCol = '상품 더보기 ';

            if (section.classList.contains('brand-pavilion')) {
                itemSel = '.brand-story-item';
                initCount = () => 1;
                txtExp = '브랜드관 닫기 '; txtCol = '브랜드관 더보기 ';
            }

            if (window.ExpandableHelper) {
                window.ExpandableHelper.init(section, {
                    btnElement: btn,
                    itemSelector: itemSel,
                    initialCount: initCount,
                    toggleStateTarget: 'button',
                    textExpanded: txtExp,
                    textCollapsed: txtCol
                });
            }
        });
    };
    initExpandableGrids();


    // 브랜드관 단순 토글 (PC)
    const brandClubZone = document.querySelector('.brand-club-zone');
    if (brandClubZone && !brandClubZone.dataset.expandInitialized) {
        const btnMore = brandClubZone.querySelector('.btn-brand-more');
        if (btnMore) {
            btnMore.addEventListener('click', () => {
                const isExpanded = brandClubZone.classList.toggle('is-expanded');
                const span = btnMore.querySelector('span');
                if (span) span.textContent = isExpanded ? '브랜드관 닫기' : '브랜드관 더보기';
            });
            brandClubZone.dataset.expandInitialized = 'true';
        }
    }

    // 오프캔버스 동적 감시
    if (window.MutationObserver && window.initOffcanvasDrag) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.classList.contains('offcanvas')) window.initOffcanvasDrag(node);
                        else if (node.querySelectorAll) node.querySelectorAll('.offcanvas').forEach(el => window.initOffcanvasDrag(el));
                    }
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
});




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

                    if (window.positionLayerPopup) window.positionLayerPopup(cartBtn || minusBtn, modalEl, { align: 'right' });
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
        if (wrapper) { // trigger only logic removed for broader support if needed, but wrapper is key
            // ... logic kept same
        }

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

// 팝업 일괄 초기화 
const initAllHeaderPopups = () => {
    if (window.initLayerPopup) {
        window.initLayerPopup('minOrderTrigger', 'minOrderModal');
        window.initLayerPopup('monthPurchaseTrigger', 'monthPurchaseModal');
        window.initLayerPopup('logOutTrigger', 'logOutModal');
        window.initLayerPopup('productDeleteTrigger', 'productDeleteModal');
    }

    if (window.initZoomControl) window.initZoomControl();

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