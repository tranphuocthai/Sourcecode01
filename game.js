
class DoiTuong {
    constructor(x, y, kichThuoc, mauSac) {
        this.x = x;
        this.y = y;
        this.kichThuoc = kichThuoc;
        this.mauSac = mauSac;
    }

    // Phương thức vẽ cho Người chơi và Mục tiêu
    ve(ctx) {
        ctx.fillStyle = this.mauSac;
        ctx.fillRect(this.x, this.y, this.kichThuoc, this.kichThuoc);
    }
}

// LỚP NGƯỜI CHƠI (PLAYER)
class NguoiChoi extends DoiTuong {
    constructor(canvas) {
        super(canvas.width/2 - 15, canvas.height/2 - 15, 30, '#e74c3c');
        this.canvas = canvas;
        this.tocDo = 5;
        this.vanTocX = 0; 
        this.vanTocY = 0;
    }
    
    // Cập nhật vị trí mỗi khung hình
    capNhat() {
        this.x += this.vanTocX;
        this.y += this.vanTocY;

        // Logic Game Over: Kiểm tra va chạm biên màn hình
        if (this.x < 0 || this.x + this.kichThuoc > this.canvas.width ||
            this.y < 0 || this.y + this.kichThuoc > this.canvas.height) {
            return true; // Trả về true = Chết
        }
        return false; // Còn sống
    }

    // Xử lý Input bàn phím
    xuLyPhim(phim, dangNhan) {
        const giaTri = dangNhan ? this.tocDo : 0;
        if (phim === 'ArrowUp') this.vanTocY = -giaTri;
        if (phim === 'ArrowDown') this.vanTocY = giaTri;
        if (phim === 'ArrowLeft') this.vanTocX = -giaTri;
        if (phim === 'ArrowRight') this.vanTocX = giaTri;
        
        if (!dangNhan) {
            if (phim === 'ArrowUp' || phim === 'ArrowDown') this.vanTocY = 0;
            if (phim === 'ArrowLeft' || phim === 'ArrowRight') this.vanTocX = 0;
        }
    }
}

//LỚP TRÒ CHƠI 
class TroChoi {
    constructor() {
        // Tham chiếu DOM
        this.canvas = document.getElementById('manHinhGame');
        this.ctx = this.canvas.getContext('2d'); // Lấy Context 2D [cite: 79]
        this.domDiem = document.getElementById('diemSo');
        this.domDiemCao = document.getElementById('diemCao');
        this.nutChoiLai = document.getElementById('nutChoiLai');
        
        // Khởi tạo đối tượng
        this.nguoiChoi = new NguoiChoi(this.canvas);
        this.mucTieu = new DoiTuong(0, 0, 20, '#27ae60');
        this.diem = 0;
        this.dangChay = false;

        // LOCAL STORAGE: Tải điểm cao đã lưu 
        this.diemCao = localStorage.getItem('gameDiemCao') || 0;
        this.domDiemCao.innerText = this.diemCao;

        this.taoMucTieu();
        this.langNgheSuKien();
    }

    // Sinh vị trí ngẫu nhiên cho mục tiêu
    taoMucTieu() {
        this.mucTieu.x = Math.random() * (this.canvas.width - 20);
        this.mucTieu.y = Math.random() * (this.canvas.height - 20);
    }

    // Lắng nghe sự kiện bàn phím 
    langNgheSuKien() {
        document.addEventListener('keydown', e => {
            if(this.dangChay) this.nguoiChoi.xuLyPhim(e.key, true);
        });
        document.addEventListener('keyup', e => {
            if(this.dangChay) this.nguoiChoi.xuLyPhim(e.key, false);
        });
    }

    // Thuật toán va chạm AABB 
    kiemTraVaCham() {
        return (
            this.nguoiChoi.x < this.mucTieu.x + this.mucTieu.kichThuoc &&
            this.nguoiChoi.x + this.nguoiChoi.kichThuoc > this.mucTieu.x &&
            this.nguoiChoi.y < this.mucTieu.y + this.mucTieu.kichThuoc &&
            this.nguoiChoi.y + this.nguoiChoi.kichThuoc > this.mucTieu.y
        );
    }

    ketThucGame() {
        this.dangChay = false;
        document.getElementById('loiNhan').innerText = "GAME OVER! Bạn đã đâm vào tường.";
        this.nutChoiLai.style.display = 'inline-block';
        
        // Lưu điểm cao vào LocalStorage nếu phá kỷ lục 
        if (this.diem > this.diemCao) {
            this.diemCao = this.diem;
            localStorage.setItem('gameDiemCao', this.diemCao);
            this.domDiemCao.innerText = this.diemCao;
        }
    }

    batDau() {
        // Reset trạng thái
        this.nguoiChoi = new NguoiChoi(this.canvas);
        this.diem = 0;
        this.domDiem.innerText = 0;
        this.dangChay = true;
        this.nutChoiLai.style.display = 'none';
        document.getElementById('loiNhan').innerText = "Đang chơi...";
        
        // Bắt đầu vòng lặp
        this.vongLap();
    }

    // VÒNG LẶP CHÍNH (GAME LOOP)
    vongLap() {
        if (!this.dangChay) return;

        // 1. Xóa màn hình 
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Cập nhật logic (Update) 
        const daChet = this.nguoiChoi.capNhat();
        if (daChet) {
            this.ketThucGame();
            return;
        }

        if (this.kiemTraVaCham()) {
            this.diem++;
            this.domDiem.innerText = this.diem;
            this.taoMucTieu();
        }

        // 3. Vẽ lại (Draw) 
        this.nguoiChoi.ve(this.ctx);
        this.mucTieu.ve(this.ctx);

        // 4. Gọi đệ quy cho khung hình tiếp theo (60FPS)
        requestAnimationFrame(() => this.vongLap());
    }
}

// Khởi chạy game ngay khi tải trang
const troChoi = new TroChoi();
troChoi.batDau();