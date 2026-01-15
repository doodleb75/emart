// Custom Radio Web Component

class CustomRadio extends HTMLElement {
    static get observedAttributes() {
        return ['checked', 'disabled', 'label', 'id', 'name', 'value'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // 중복 렌더링 방지 (Prevent double rendering)
        if (this.querySelector('.custom-radio-wrap')) return;

        const labelText = this.getAttribute('label') || '';
        const isChecked = this.hasAttribute('checked');
        const name = this.getAttribute('name') || '';
        const value = this.getAttribute('value') || '';

        this.innerHTML = `
            <label class="custom-radio-wrap">
                <input type="radio" class="hidden-radio" ${name ? `name="${name}"` : ''} ${value ? `value="${value}"` : ''} ${isChecked ? 'checked' : ''}>
                
                <div class="custom-radio-ui">
                    <svg class="unchecked-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <g clip-path="url(#clip0_333_3002)">
                        <path d="M10.0003 1.6665C5.40032 1.6665 1.66699 5.39984 1.66699 9.99984C1.66699 14.5998 5.40032 18.3332 10.0003 18.3332C14.6003 18.3332 18.3337 14.5998 18.3337 9.99984C18.3337 5.39984 14.6003 1.6665 10.0003 1.6665ZM10.0003 16.6665C6.31699 16.6665 3.33366 13.6832 3.33366 9.99984C3.33366 6.3165 6.31699 3.33317 10.0003 3.33317C13.6837 3.33317 16.667 6.3165 16.667 9.99984C16.667 13.6832 13.6837 16.6665 10.0003 16.6665Z" fill="#CCCCCC"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_333_3002">
                          <rect width="20" height="20" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <svg class="checked-icon" style="display: none;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <g clip-path="url(#clip0_333_3007)">
                        <path d="M10.0003 5.83317C7.70032 5.83317 5.83366 7.69984 5.83366 9.99984C5.83366 12.2998 7.70032 14.1665 10.0003 14.1665C12.3003 14.1665 14.167 12.2998 14.167 9.99984C14.167 7.69984 12.3003 5.83317 10.0003 5.83317ZM10.0003 1.6665C5.40032 1.6665 1.66699 5.39984 1.66699 9.99984C1.66699 14.5998 5.40032 18.3332 10.0003 18.3332C14.6003 18.3332 18.3337 14.5998 18.3337 9.99984C18.3337 5.39984 14.6003 1.6665 10.0003 1.6665ZM10.0003 16.6665C6.31699 16.6665 3.33366 13.6832 3.33366 9.99984C3.33366 6.3165 6.31699 3.33317 10.0003 3.33317C13.6837 3.33317 16.667 6.3165 16.667 9.99984C16.667 13.6832 13.6837 16.6665 10.0003 16.6665Z" fill="#1F95FF"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_333_3007">
                          <rect width="20" height="20" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                </div>

                <span class="label-text">${labelText}</span>
            </label>
        `;

        this.input = this.querySelector('.hidden-radio');
        this.uncheckedIcon = this.querySelector('.unchecked-icon');
        this.checkedIcon = this.querySelector('.checked-icon');

        // 초기 상태 반영 (Apply initial state)
        this.updateIconState(this.input.checked);

        this.input.addEventListener('change', (e) => {
            const checked = e.target.checked;

            // 라디오 버튼은 같은 name을 가진 다른 버튼들의 상태도 갱신해야 함 (Radio should update others with same name)
            if (checked && name) {
                const radios = document.querySelectorAll(`custom-radio[name="${name}"]`);
                radios.forEach(radio => {
                    if (radio !== this) {
                        radio.removeAttribute('checked');
                        radio.updateIconState(false);
                    }
                });
                this.setAttribute('checked', '');
                this.updateIconState(true);
            }
        });
    }

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
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (!this.input) return;

        if (name === 'checked') {
            const isChecked = this.hasAttribute('checked');
            if (this.input.checked !== isChecked) {
                this.input.checked = isChecked;
                this.updateIconState(isChecked);
            }
        }
        if (name === 'label') {
            const labelSpan = this.querySelector('.label-text');
            if (labelSpan) labelSpan.textContent = newValue;
        }
        if (name === 'disabled') {
            this.input.disabled = this.hasAttribute('disabled');
            const wrap = this.querySelector('.custom-radio-wrap');
            if (wrap) wrap.style.opacity = this.hasAttribute('disabled') ? '0.5' : '1';
        }
    }
}

customElements.define('custom-radio', CustomRadio);
