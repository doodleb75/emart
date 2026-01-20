// 레이아웃 및 공통 유틸리티 함수들을 관리

// GNB/검색창 너비 동적 조정
window.adjustNavWidth = function () {
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
};


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

// 바텀 시트 드래그 로직 초기화
window.initOffcanvasDrag = function (target) {
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
};

// 사용자 포인트 프로그레스 설정
window.setUserPointProgress = function (percentage) {
    const fillEl = document.getElementById("userPointFill");
    if (fillEl) {
        // 수치 범위 제한 (0-100)
        const safePercent = Math.max(0, Math.min(100, percentage));
        fillEl.style.width = safePercent + "%";
    }
};

// 사용자 줌 설정 로컬 저장
window.saveUserZoom = async function (zoomValue) {
    localStorage.setItem('pageZoom', zoomValue);
};

// 사용자 줌 설정 로드
window.loadUserZoom = function () {
    const savedZoom = localStorage.getItem('pageZoom');
    return savedZoom ? parseFloat(savedZoom) : 1;
};

// 화면 확대/축소 기능 초기화
window.initZoomControl = async function () {
    // 설정 로드
    let currentZoom = window.loadUserZoom();

    const step = 0.05;
    const maxZoom = 1.2;
    const minZoom = 0.7;
    // 줌 적용 (PC 전용)
    const applyZoom = () => {
        // PC 화면 판별
        const isPCPage = !window.location.pathname.includes('/mobile/');
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
        await window.saveUserZoom(currentZoom);
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
};

// 레이어 팝업 위치 동적 지정
window.positionLayerPopup = function (trigger, modalEl, options = { align: 'center' }) {
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
};

window.initLayerPopup = function (triggerSelector, modalId) {
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
                window.positionLayerPopup(trigger, modalEl);
                modal.show(trigger); // 포커스 복원 설정
            }
        });
    };
    setupModal();
};

// 체크박스/라디오 그룹 전체 선택 및 동기화 로직
window.initCheckboxGroup = function (options) {
    const {
        masterSelector,         // 전체 선택 체크박스 셀렉터 (ID or Class)
        itemSelector,           // 개별 아이템 체크박스 셀렉터
        containerSelector,      // (선택) 특정 컨테이너 내에서만 동작시킬 경우
        onMasterChange,         // (선택) 전체 선택 변경 시 콜백
        onItemChange            // (선택) 개별 아이템 변경 시 콜백
    } = options;

    const findElements = (wrapper = document) => {
        const master = wrapper.querySelector(masterSelector);
        const items = Array.from(wrapper.querySelectorAll(itemSelector));
        return { master, items };
    };

    const attachEvents = (wrapper) => {
        const { master, items } = findElements(wrapper);

        if (!master && items.length === 0) return;

        // 전체 선택 상태 업데이트
        const updateMasterState = () => {
            // 비활성화(disabled) 된 항목은 제외하고 체크 여부 판단할지 여부는 기획에 따름. 
            // 여기서는 단순하게 전체 개수 대비 체크된 개수로 판단.
            if (!master) return;
            if (items.length === 0) {
                master.checked = false;
                return;
            }
            const allChecked = items.every(item => item.checked);
            master.checked = allChecked;
        };

        // 1. Master 변경 이벤트
        if (master) {
            master.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                items.forEach(item => {
                    item.checked = isChecked;
                });
                if (onMasterChange) onMasterChange(isChecked, items);
            });
        }

        // 2. Items 변경 이벤트
        items.forEach(item => {
            item.addEventListener('change', (e) => {
                updateMasterState();
                if (onItemChange) onItemChange(e.target, items);
            });
        });

        // 초기 상태 동기화
        updateMasterState();
    };

    // 컨테이너가 지정된 경우
    if (containerSelector) {
        document.querySelectorAll(containerSelector).forEach(container => {
            attachEvents(container);
        });
    } else {
        attachEvents(document);
    }
};
