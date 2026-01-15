document.addEventListener('DOMContentLoaded', () => {
    // 날짜 선택 버튼 그룹
    const periodBtns = document.querySelectorAll('input[name="period"]');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if (periodBtns.length > 0 && startDateInput && endDateInput) {
        periodBtns.forEach(btn => {
            btn.addEventListener('change', (e) => {
                if (e.target.checked) {
                    updateDateRange(e.target.id);
                }
            });
        });
    }

    // 날짜 범위 업데이트
    function updateDateRange(type) {
        const today = new Date();
        let startDate = new Date();
        const endDate = new Date();

        switch (type) {
            case 'today':
                startDate = new Date();
                break;
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
        }

        if (startDateInput) startDateInput.value = formatDate(startDate);
        if (endDateInput) endDateInput.value = formatDate(endDate);
    }

    // 날짜 포맷
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 초기 날짜 설정
    if (startDateInput && endDateInput && !startDateInput.value) {
        updateDateRange('today');
    }

    // --- 커스텀 캘린더 로직 ---

    class CustomCalendar {
        constructor(inputId, popupId) {
            this.input = document.getElementById(inputId);
            this.popup = document.getElementById(popupId);
            this.trigger = this.input.nextElementSibling; // .btn-calendar
            this.currentDate = new Date();
            this.selectedDate = this.input.value ? new Date(this.input.value) : new Date();
            this.viewMode = 'days'; // 'days' or 'selector'

            this.init();
        }

        init() {
            // 트리거 버튼 클릭 시에만 달력 표시
            if (this.trigger && this.trigger.classList.contains('btn-calendar')) {
                this.trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.calendar-popup').forEach(p => {
                        if (p !== this.popup) p.classList.remove('show');
                    });
                    this.popup.classList.toggle('show');
                    if (this.input.value) {
                        this.selectedDate = new Date(this.input.value);
                        this.currentDate = new Date(this.input.value);
                    }
                    this.viewMode = 'days';
                    this.render();
                });
            }

            document.addEventListener('click', (e) => {
                if (!this.popup.contains(e.target) && e.target !== this.trigger) {
                    this.popup.classList.remove('show');
                }
            });
        }

        render() {
            if (this.viewMode === 'selector') {
                this.renderSelector();
                return;
            }

            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();

            const firstDay = new Date(year, month, 1).getDay();
            const lastDate = new Date(year, month + 1, 0).getDate();
            const prevLastDate = new Date(year, month, 0).getDate();

            let html = `
                <div class="cal-header">
                    <div class="month-year">${year}년 ${String(month + 1).padStart(2, '0')}월</div>
                    <div class="nav-btns">
                        <button class="btn-prev-mon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg></button>
                        <button class="btn-next-mon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
                    </div>
                </div>
                <div class="cal-grid">
                    <div class="day-name">일</div><div class="day-name">월</div><div class="day-name">화</div>
                    <div class="day-name">수</div><div class="day-name">목</div><div class="day-name">금</div>
                    <div class="day-name">토</div>
            `;

            for (let i = firstDay; i > 0; i--) {
                html += `<div class="day prev-month">${prevLastDate - i + 1}</div>`;
            }

            const today = new Date();
            for (let i = 1; i <= lastDate; i++) {
                const isSelected = this.selectedDate && this.selectedDate.getFullYear() === year && this.selectedDate.getMonth() === month && this.selectedDate.getDate() === i;
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
                const cls = `${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`;
                html += `<div class="day ${cls}" data-date="${i}">${i}</div>`;
            }

            const remaining = 42 - (firstDay + lastDate);
            for (let i = 1; i <= remaining; i++) {
                html += `<div class="day next-month">${i}</div>`;
            }

            html += `
                </div>
                <div class="cal-footer">
                    <div></div>
                    <button class="btn-close-cal text-info">닫기</button>
                </div>
            `;

            this.popup.innerHTML = html;

            this.popup.querySelector('.month-year').onclick = (e) => {
                e.stopPropagation();
                this.viewMode = 'selector';
                this.render();
            };

            this.popup.querySelector('.btn-prev-mon').onclick = (e) => { e.stopPropagation(); this.currentDate.setMonth(month - 1); this.render(); };
            this.popup.querySelector('.btn-next-mon').onclick = (e) => { e.stopPropagation(); this.currentDate.setMonth(month + 1); this.render(); };

            this.popup.querySelectorAll('.day[data-date]').forEach(el => {
                el.onclick = (e) => {
                    e.stopPropagation();
                    const day = el.dataset.date;
                    this.selectedDate = new Date(year, month, day);
                    this.input.value = formatDate(this.selectedDate);
                    this.popup.classList.remove('show');
                    periodBtns.forEach(rb => rb.checked = false);
                };
            });

            this.popup.querySelector('.btn-close-cal').onclick = (e) => {
                e.stopPropagation();
                this.popup.classList.remove('show');
            };
        }

        renderSelector() {
            const year = this.currentDate.getFullYear();

            let html = `
                <div class="cal-header">
                    <div class="month-year selector-title">${year}년</div>
                    <div class="nav-btns">
                        <button class="btn-prev-year"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg></button>
                        <button class="btn-next-year"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></button>
                    </div>
                </div>
                <div class="cal-grid selector-grid">
            `;

            for (let i = 0; i < 12; i++) {
                const isSelected = this.currentDate.getMonth() === i;
                html += `<div class="month-item ${isSelected ? 'selected' : ''}" data-month="${i}">${i + 1}월</div>`;
            }

            html += `
                </div>
                <div class="cal-footer">
                    <button class="btn-back">뒤로</button>
                    <button class="btn-close-cal text-info">닫기</button>
                </div>
            `;

            this.popup.innerHTML = html;

            this.popup.querySelector('.btn-prev-year').onclick = (e) => { e.stopPropagation(); this.currentDate.setFullYear(year - 1); this.renderSelector(); };
            this.popup.querySelector('.btn-next-year').onclick = (e) => { e.stopPropagation(); this.currentDate.setFullYear(year + 1); this.renderSelector(); };

            this.popup.querySelectorAll('.month-item').forEach(el => {
                el.onclick = (e) => {
                    e.stopPropagation();
                    this.currentDate.setMonth(parseInt(el.dataset.month));
                    this.viewMode = 'days';
                    this.render();
                };
            });

            this.popup.querySelector('.btn-back').onclick = (e) => {
                e.stopPropagation();
                this.viewMode = 'days';
                this.render();
            };

            this.popup.querySelector('.btn-close-cal').onclick = (e) => {
                e.stopPropagation();
                this.popup.classList.remove('show');
            };
        }
    }

    if (startDateInput && endDateInput) {
        new CustomCalendar('startDate', 'calendar-start');
        new CustomCalendar('endDate', 'calendar-end');
    }

    // --- pageFlag 제어 로직 ---
    const urlParams = new URLSearchParams(window.location.search);
    const pageFlag = urlParams.get('pageFlag') || '1';

    // 모든 섹션 숨김 및 카드 비활성화
    document.querySelectorAll('.mypage-section').forEach(sec => sec.style.display = 'none');
    document.querySelectorAll('.stat-card').forEach(card => card.classList.remove('active'));

    // 현재 flag에 해당하는 요소 활성화
    const activeSection = document.getElementById(`section-${pageFlag}`);
    const activeCard = document.getElementById(`card-${pageFlag}`);

    if (activeSection) activeSection.style.display = 'flex';
    if (activeCard) activeCard.classList.add('active');

    // 클릭 이벤트 바인딩 (부드러운 전환을 위한 pushState 처리)
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const href = card.getAttribute('href');
            if (!href) return;

            const newUrl = new URL(href, window.location.origin);
            const newFlag = newUrl.searchParams.get('pageFlag') || '1';

            // URL 업데이트
            window.history.pushState({ pageFlag: newFlag }, '', href);

            // 섹션/카드 전환
            document.querySelectorAll('.mypage-section').forEach(sec => sec.style.display = 'none');
            document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));

            const targetSection = document.getElementById(`section-${newFlag}`);
            if (targetSection) targetSection.style.display = 'flex';
            card.classList.add('active');
        });
    });

    // 뒤로가기 대응
    window.addEventListener('popstate', (e) => {
        const flag = (e.state && e.state.pageFlag) || new URLSearchParams(window.location.search).get('pageFlag') || '1';
        document.querySelectorAll('.mypage-section').forEach(sec => sec.style.display = 'none');
        document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active'));

        const targetSection = document.getElementById(`section-${flag}`);
        const targetCard = document.getElementById(`card-${flag}`);
        if (targetSection) targetSection.style.display = 'flex';
        if (targetCard) targetCard.classList.add('active');
    });


    // --- 테이블 보기 옵션 로직 ---
    const itemsPerPageTrigger = document.getElementById('itemsPerPageTrigger');
    const firstListContainer = document.querySelector('.list-container'); // 첫 번째 리스트 컨테이너
    const targetTableBody = firstListContainer ? firstListContainer.querySelector('.custom-table tbody') : null;

    if (itemsPerPageTrigger && targetTableBody) {
        const dropdownOptions = itemsPerPageTrigger.closest('.dropdown-wrapper').querySelectorAll('.dropdown-options li');
        let currentLimit = 5; // 기본값

        // 가시성 업데이트 함수
        const updateTableVisibility = () => {
            const rows = Array.from(targetTableBody.querySelectorAll('tr:not(.empty-cell-row)'));
            rows.forEach((row, index) => {
                if (index < currentLimit) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        };

        // 아이템 늘리기 
        const increaseTableItems = () => {
            const originalRows = Array.from(targetTableBody.querySelectorAll('tr'));
            if (originalRows.length === 0) return;

            const targetCount = 100; // 테스트를 위해 60개까지 복제
            let currentCount = originalRows.length;

            while (currentCount < targetCount) {
                originalRows.forEach(row => {
                    if (currentCount >= targetCount) return;
                    const clone = row.cloneNode(true);
                    targetTableBody.appendChild(clone);
                    currentCount++;
                });
            }
        };

        // 드롭다운 옵션 클릭 이벤트
        dropdownOptions.forEach(option => {
            option.addEventListener('click', () => {
                const value = option.dataset.value;
                if (value) {
                    currentLimit = parseInt(value, 10);
                    updateTableVisibility();
                }
            });
        });

        // 초기화
        increaseTableItems();
        updateTableVisibility();
    }
});
