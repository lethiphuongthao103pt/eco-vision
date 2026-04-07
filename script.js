// Thêm sự kiện click cho các nút menu dưới
document.getElementById('btn-guide').addEventListener('click', function() {
    openScreen('screen-guide');
});

document.getElementById('btn-history').addEventListener('click', function() {
    openScreen('screen-history');
});

document.getElementById('btn-settings').addEventListener('click', function() {
    openScreen('screen-settings');
});

// Bạn có thể thêm sự kiện cho nút 'Bắt đầu quét' tại đây
document.getElementById('btn-scan').addEventListener('click', function() {
    alert("Hiệu ứng: Màn hình quét camera sẽ hiển thị...");
    // Hoặc openScreen('screen-scan') nếu bạn tạo overlay cho nó
});

// Thêm sự kiện cho các thể loại (tùy chọn)
document.getElementById('btn-nhua').addEventListener('click', function() { alert("Hiệu ứng: Hiển thị thông tin về nhựa..."); });
document.getElementById('btn-lon').addEventListener('click', function() { alert("Hiệu ứng: Hiển thị thông tin về lon..."); });
document.getElementById('btn-giay').addEventListener('click', function() { alert("Hiệu ứng: Hiển thị thông tin về giấy..."); });


// Hàm mở màn hình overlay
function openScreen(screenId) {
    // Ẩn tất cả các overlay đang mở (nếu có)
    closeAllScreens();
    // Thêm class 'open' để hiển thị overlay tương ứng với hiệu ứng
    document.getElementById(screenId).classList.add('open');
}

// Hàm đóng một màn hình overlay
function closeScreen(screenId) {
    // Xóa class 'open' để ẩn overlay
    document.getElementById(screenId).classList.remove('open');
}

// Hàm đóng tất cả các màn hình overlay
function closeAllScreens() {
    const overlays = document.querySelectorAll('.screen-overlay');
    overlays.forEach(overlay => {
        overlay.classList.remove('open');
    });
}