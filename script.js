// === CẤU HÌNH MÔ HÌNH TEACHABLE MACHINE ===
const URL = "https://teachablemachine.withgoogle.com/models/o4aM0l4Xo/";
let model, webcam, labelContainer, maxPredictions;

// === TẢI DỮ LIỆU TỪ DATA.JSON ===
let ecoData = {};

async function fetchEcoData() {
    try {
        const response = await fetch('data.json');
        ecoData = await response.json();
        console.log("Đã tải dữ liệu từ data.json thành công!");
    } catch (error) {
        console.error("Lỗi khi tải file data.json:", error);
    }
}

// Gọi hàm tải dữ liệu ngay khi load script
fetchEcoData();

// === HÀM ĐỌC THÔNG ĐIỆP XANH (LỜI THOẠI) ===
function docThongDiep(text) {
    // Hủy giọng đọc cũ nếu đang đọc dở
    window.speechSynthesis.cancel();
    
    // Tạo giọng đọc mới
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN'; // Cài đặt giọng đọc tiếng Việt
    utterance.rate = 1.0;     // Tốc độ đọc (1.0 là bình thường)
    utterance.pitch = 1.0;    // Độ cao của giọng
    
    // Lệnh phát âm thanh
    window.speechSynthesis.speak(utterance);
}

// === CÁC HÀM XỬ LÝ CAMERA VÀ NHẬN DIỆN ===
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    document.getElementById('loading-overlay').style.display = 'flex';

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true; 
        webcam = new tmImage.Webcam(300, 300, flip); 
        await webcam.setup(); 
        await webcam.play();

        document.getElementById('loading-overlay').style.display = 'none';

        window.requestAnimationFrame(loop);

        const canvas = document.getElementById("canvas");
        canvas.width = 300; canvas.height = 300;
        const ctx = canvas.getContext("2d");

        function update() {
            if (webcam.canvas) {
                ctx.drawImage(webcam.canvas, 0, 0, canvas.width, canvas.height);
            }
            window.requestAnimationFrame(update);
        }
        update();

    } catch (error) {
        document.getElementById('loading-overlay').style.display = 'none';
        alert("Lỗi khi tải Camera hoặc Model. Hãy kiểm tra quyền truy cập!");
        console.error(error);
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    let highestProb = 0;
    let bestMatch = prediction[0];

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProb) {
            highestProb = prediction[i].probability;
            bestMatch = prediction[i];
        }
    }

    const percent = Math.round(highestProb * 100);

    if (highestProb > 0.8) {
        const info = ecoData[bestMatch.className];
        if (info) {
            document.getElementById('res-name').textContent = info.ten;
            document.getElementById('res-badge').textContent = `Carbon: ${info.level}`;
            document.getElementById('res-badge').className = `res-badge ${info.cssClass}`;
            document.getElementById('res-indicator').style.left = info.percent;
            document.getElementById('res-tip').textContent = info.tip;
            
            // Gọi hàm đọc lời thoại
            docThongDiep(info.tip);
        } else {
            document.getElementById('res-name').textContent = bestMatch.className;
            document.getElementById('res-badge').textContent = `Độ chắc chắn: ${percent}%`;
            document.getElementById('res-badge').className = `res-badge badge-tb`;
            document.getElementById('res-indicator').style.left = "50%";
            
            const unknownTip = "Sản phẩm này hiện chưa có trong cơ sở dữ liệu. Chúng mình sẽ cập nhật sớm nhé!";
            document.getElementById('res-tip').textContent = unknownTip;
            
            // Đọc thông báo chưa có dữ liệu
            docThongDiep(unknownTip);
        }
        
        stopCamera();
        document.getElementById('scan-screen').classList.remove('active');
        document.getElementById('result-screen').classList.add('active');
    }
}

// === ĐIỀU HƯỚNG MÀN HÌNH ===
async function goToScan() {
    // Tắt âm thanh nếu đang đọc
    window.speechSynthesis.cancel();
    
    document.getElementById('home-screen').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('scan-screen').classList.add('active');
    await init();
}

function goHome() {
    // Tắt âm thanh nếu đang đọc
    window.speechSynthesis.cancel();
    
    stopCamera();
    document.getElementById('scan-screen').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('home-screen').classList.add('active');
}

function stopCamera() {
    if (webcam && webcam.stream) {
        const tracks = webcam.stream.getTracks();
        tracks.forEach(track => track.stop());
        webcam.stop();
    }
}

// --- BẮT TÍN HIỆU TỪ TRANG ĐĂNG NHẬP ---
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    if (action === 'scan') {
        setTimeout(() => {
            goToScan();
        }, 300);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});
