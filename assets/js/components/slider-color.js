/**
 * 슬라이더 카드 배경색 자동 적용 (Color Thief 활용)
 * 썸네일 이미지의 주 색상을 추출하여 하단 텍스트 영역의 배경색으로 적용
 * 기존 디자인의 명도(Lightness) 수준을 유지하도록 색상 조정
 */

document.addEventListener('DOMContentLoaded', () => {
    // ColorThief 로드 확인
    if (typeof ColorThief === 'undefined') {
        console.warn('ColorThief is not loaded.');
        return;
    }

    const colorThief = new ColorThief();
    // Mobile (.slide-item) & PC (.slider-card)
    const slides = document.querySelectorAll('.mobile-main-slider .slide-item, .main-slider-wrapper .slider-card');

    // 목표 명도 (기존 색상들의 평균 명도 근사값 - dark theme)
    // #65403a (Snack), #5a493f (Beverage), #8d252c (Juice), #0076be (Pasta)
    // 대략 L = 30% ~ 45% 사이. 
    // 너무 어두우면 칙칙하고, 너무 밝으면 흰 글씨가 안보임.
    const TARGET_LIGHTNESS = 55;

    // RGB to HSL 변환 func
    const rgbToHsl = (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s * 100, l * 100];
    };

    // HSL to RGB 변환 func (CSS 적용을 위해 HSL string 사용하므로 굳이 RGB로 되돌릴 필요는 없으나 참고)

    // 색상 적용 함수
    const applyAdaptiveColor = (img, targetElement) => {
        try {
            const color = colorThief.getColor(img); // [r, g, b]
            const [h, s, l] = rgbToHsl(color[0], color[1], color[2]);

            // 기존 채도(Saturation)는 유지하거나 살짝 보정, 명도(Lightness)는 타겟 값으로 고정
            // 단, 원본이 너무 무채색(S < 10)이면 약간의 컬러감을 줄지, 그냥 둘지? -> 그냥 둠
            // 명도는 TARGET_LIGHTNESS 로 강제 조정하여 통일감 부여

            const newColor = `hsl(${h.toFixed(1)}, ${s.toFixed(1)}%, ${TARGET_LIGHTNESS}%)`;

            targetElement.style.backgroundColor = newColor;

            // 적용 여부 로깅 (선택)
            // console.log(`Applied color for ${img.alt}: ${newColor} (Original: rgb(${color}))`);

        } catch (e) {
            console.error('Color extraction failed:', e);
            // 실패 시 기본 색상 혹은 기존 CSS 클래스 유지
        }
    };

    slides.forEach(slide => {
        const img = slide.querySelector('.slider-card-img-wrap img');
        const cardBody = slide.querySelector('.slider-card-body');

        if (img && cardBody) {
            // 이미지가 이미 로드되었으면 바로 실행
            if (img.complete) {
                applyAdaptiveColor(img, cardBody);
            } else {
                // 로드 대기
                img.addEventListener('load', () => {
                    applyAdaptiveColor(img, cardBody);
                });
            }

            // crossOrigin 설정이 필요할 수 있음 (로컬 이미지는 보통 괜찮으나 외부 이미지일 경우)
            // img.crossOrigin = "Anonymous"; 
        }
    });
});
