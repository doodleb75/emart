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
        // 이미 렌더링 되었다면 중복 실행 방지
        if (this.querySelector('.custom-checkbox-wrap')) return;

        const labelText = this.getAttribute('label') || '';
        const isChecked = this.hasAttribute('checked');
        const name = this.getAttribute('name') || '';

        // 유니크한 ID 생성 (충돌 방지용)
        const uniqueId = `checkbox_${Math.random().toString(36).substr(2, 9)}`;

        this.innerHTML = `
            <label class="custom-checkbox-wrap" style="display: inline-flex; align-items: center; cursor: pointer; user-select: none;">
                <input type="checkbox" class="hidden-checkbox" ${name ? `name="${name}"` : ''} ${isChecked ? 'checked' : ''} style="display: none;">
                
                <div class="custom-checkbox-ui" style="position: relative; width: 24px; height: 24px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <g class="unchecked-icon">
                            <path d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#CCCCCC"></path>
                        </g>
                        
                        <g class="checked-icon" style="display: none;">
                            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="#1f95ff"></path>
                            <path d="M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"></path>
                        </g>
                    </svg>
                </div>
                ${labelText ? `<span class="label-text" style="margin-left: 6px;">${labelText}</span>` : ''}
            </label>
        `;

        this.input = this.querySelector('input');

        // 아이콘 요소 참조 저장
        this.uncheckedIcon = this.querySelector('.unchecked-icon');
        this.checkedIcon = this.querySelector('.checked-icon');

        // 초기 상태에 맞춰 아이콘 설정
        this.updateIconState(this.input.checked);

        // 이벤트 리스너: 내부 input 변경 시
        this.input.addEventListener('change', (e) => {
            const checked = this.input.checked;

            // 1. 호스트 속성 업데이트 (스타일링/디버깅 용)
            if (checked) {
                this.setAttribute('checked', '');
            } else {
                this.removeAttribute('checked');
            }

            // 2. 아이콘 시각적 업데이트
            this.updateIconState(checked);

            // 3. 이벤트 버블링 (중요: 부모 요소나 외부 스크립트가 change 이벤트를 감지하도록)
            // input이 label 안에 있어서 자동 버블링 되지만, 확실하게 처리.
        });
    }

    // 아이콘 표시/숨김 처리 함수 (핵심 추가 부분)
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
        // 속성 변경 시 attributeChangedCallback이 호출되어 내부 로직이 돕니다.
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.input) return;

        if (name === 'checked') {
            const isChecked = this.hasAttribute('checked');
            if (this.input.checked !== isChecked) {
                this.input.checked = isChecked;
                this.updateIconState(isChecked); // 속성 변경 시에도 아이콘 업데이트
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

// 컴포넌트 등록
customElements.define('custom-checkbox', CustomCheckbox);
