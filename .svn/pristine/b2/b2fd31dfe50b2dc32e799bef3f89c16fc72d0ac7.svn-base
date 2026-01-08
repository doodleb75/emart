class CustomCheckbox extends HTMLElement {
    static get observedAttributes() {
        return ['checked', 'disabled', 'label', 'id', 'name'];
    }

    constructor() {
        super();
        this._internals = null;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // 중복 렌더링 방지
        if (this.querySelector('.custom-checkbox-wrap')) return;

        const labelText = this.getAttribute('label') || '';
        const isChecked = this.hasAttribute('checked');
        const name = this.getAttribute('name') || '';

        // 고유 ID 생성
        const uniqueId = `checkbox_${Math.random().toString(36).substr(2, 9)}`;

        this.innerHTML = `
            <label class="custom-checkbox-wrap">
                <input type="checkbox" class="hidden-checkbox" ${name ? `name="${name}"` : ''} ${isChecked ? 'checked' : ''}>
                
                <div class="custom-checkbox-ui">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <defs>
                            <clipPath id="clip0_257_6083">
                                <rect width="20" height="20" fill="white"/>
                            </clipPath>
                        </defs>
                        <g class="unchecked-icon" clip-path="url(#clip0_257_6083)">
                            <path d="M3 3H17V17H3V3Z" fill="white"/>
                            <path d="M15.8333 4.16667V15.8333H4.16667V4.16667H15.8333ZM15.8333 2.5H4.16667C3.25 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.25 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V4.16667C17.5 3.25 16.75 2.5 15.8333 2.5Z" fill="#CCCCCC"/>
                        </g>
                        <g class="checked-icon" style="display: none;" clip-path="url(#clip0_257_6083)">
                            <path d="M3 3H17V17H3V3Z" fill="#1f95ff"/>
                            <path d="M15.8333 4.16667V15.8333H4.16667V4.16667H15.8333ZM15.8333 2.5H4.16667C3.25 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.25 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V4.16667C17.5 3.25 16.75 2.5 15.8333 2.5Z" fill="#1f95ff"/>
                            <path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white" transform="scale(0.8333)"/>
                        </g>
                    </svg>
                </div>
                ${labelText ? `<span class="label-text">${labelText}</span>` : ''}
            </label>
        `;

        this.input = this.querySelector('input');

        // 아이콘 요소 참조
        this.uncheckedIcon = this.querySelector('.unchecked-icon');
        this.checkedIcon = this.querySelector('.checked-icon');

        // 초기 아이콘 상태 설정
        this.updateIconState(this.input.checked);

        // 입력 변경 이벤트 감지
        this.input.addEventListener('change', (e) => {
            const checked = this.input.checked;

            // 속성 업데이트
            if (checked) {
                this.setAttribute('checked', '');
            } else {
                this.removeAttribute('checked');
            }

            // 아이콘 상태 갱신
            this.updateIconState(checked);

            // 이벤트 버블링 처리
            // 명시적 버블링
        });
    }

    // 아이콘 토글 함수
    updateIconState(isChecked) {
        if (!this.uncheckedIcon || !this.checkedIcon) return;

        if (isChecked) {
            this.checkedIcon.style.display = 'block';
            this.uncheckedIcon.style.display = 'none';
        } else {
            this.checkedIcon.style.display = 'none';
            this.uncheckedIcon.style.display = 'block';
        }
    }

    get checked() {
        return this.input ? this.input.checked : this.hasAttribute('checked');
    }

    set checked(value) {
        if (value) {
            this.setAttribute('checked', '');
        } else {
            this.removeAttribute('checked');
        }
        // 속성 변경 감지 트리거
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.input) return;

        if (name === 'checked') {
            const isChecked = this.hasAttribute('checked');
            if (this.input.checked !== isChecked) {
                this.input.checked = isChecked;
                this.updateIconState(isChecked); // 변경된 속성 반영
            }
        }
        if (name === 'label') {
            const labelSpan = this.querySelector('.label-text');
            if (labelSpan) labelSpan.textContent = newValue;
        }
        if (name === 'disabled') {
            this.input.disabled = this.hasAttribute('disabled');
            const wrap = this.querySelector('.custom-checkbox-wrap');
            if (wrap) wrap.style.opacity = this.hasAttribute('disabled') ? '0.5' : '1';
        }
    }
}

// Custom Element 등록
customElements.define('custom-checkbox', CustomCheckbox);
