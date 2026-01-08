// 찜하기/위시리스트 토글 로직
document.addEventListener('DOMContentLoaded', () => {
    // 위시리스트 버튼 전체 선택
    const wishlistButtons = document.querySelectorAll('.btn-wishlist');

    wishlistButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault(); // 링크 이동 방지
            e.stopPropagation(); // 카드 클릭 이벤트 확산 방지

            // 활성 상태 토글
            this.classList.toggle('active');

            // 시각적 피드백은 CSS(.btn-icon.active)로 처리
            // active 클래스로 색상/채움 변경
        });
    });
});
