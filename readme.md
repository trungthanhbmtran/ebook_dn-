# 📖 Dự án: Sách Đầu Tư (duandautu_image)

## 📥 Tải mã nguồn (Git Clone / Pull)
Để tải mã nguồn từ GitHub về thiết bị, sử dụng các lệnh sau:

```bash
# Nếu tải về lần đầu:
git clone https://github.com/trungthanhbmtran/duandautu_image.git

# Nếu đã tải trước đó và muốn cập nhật code mới nhất:
git pull origin main
```

---

## 🐳 Cập nhật image mới qua Docker

```bash
docker pull ghcr.io/trungthanhbmtran/ebook:latest
docker run -d --name ebook-app -p 3000:3000 --restart unless-stopped ghcr.io/trungthanhbmtran/ebook:latest

---

## 🔄 Cập nhật image mới trên VPS (Pull & Deploy)

Chạy lần lượt các lệnh sau mỗi khi có bản cập nhật mới:

```bash
# Bước 1: Kéo image mới nhất từ GitHub Container Registry
docker pull ghcr.io/trungthanhbmtran/ebook:latest

# Bước 2: Dừng và xóa container đang chạy
docker stop ebook-app
docker rm ebook-app

# Bước 3: Khởi động container mới từ image vừa pull
docker run -d --name ebook-app -p 3000:3000 --restart unless-stopped ghcr.io/trungthanhbmtran/ebook:latest

# Bước 4: Xóa các image cũ không còn dùng để giải phóng ổ đĩa
docker image prune -f
```

> **Gộp 1 lệnh duy nhất (tiện hơn, không bị lỗi nếu container chưa tồn tại):**
> ```bash
> docker pull ghcr.io/trungthanhbmtran/ebook:latest && (docker stop ebook-app || true) && (docker rm ebook-app || true) && docker run -d --name ebook-app -p 3000:3000 --restart unless-stopped ghcr.io/trungthanhbmtran/ebook:latest && docker image prune -f
> ```

---


Bước 1: Cài đặt Nginx
Dán lệnh này vào VPS để tải và cài đặt Nginx:

bash

sudo apt update
sudo apt install nginx -y
Bước 2: Tạo file cấu hình cho dự án
Gõ lệnh sau để mở trình soạn thảo văn bản tạo file cấu hình mới:

bash

sudo nano /etc/nginx/sites-available/ebook
Sau khi màn hình đen hiện ra, bạn Copy đoạn mã dưới đây và Dán vào:

nginx

server {
    listen 80;
    
    # THAY IP NÀY BẰNG IP VPS CỦA BẠN HOẶC TÊN MIỀN (VD: sachdautu.com)
    server_name _; 
    location / {
        # Chuyển hướng lưu lượng truy cập vào Container Docker đang chạy ở cổng 3000
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Chuyển tiếp IP thật của người dùng
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
Cách lưu lại: Nhấn tổ hợp phím Ctrl + O (chữ O) -> Nhấn Enter -> Nhấn Ctrl + X để thoát ra ngoài.

Bước 3: Kích hoạt cấu hình
Chạy lần lượt 3 lệnh sau để xóa cấu hình mặc định cũ của Nginx, kích hoạt cấu hình mới và khởi động lại Nginx:

bash

sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/ebook /etc/nginx/sites-enabled/
sudo systemctl restart nginx
TIP

Ngay lúc này, nếu bạn gõ địa chỉ IP của VPS lên trình duyệt (không cần thêm đuôi :3000 nữa), trang web của bạn đã hiện ra!

Bước 4: (Tùy chọn) Gắn Tên miền và bảo mật HTTPS (Ổ khóa xanh)
Nếu bạn đã mua tên miền (ví dụ sachdautu.com) và trỏ về IP của VPS, hãy làm thêm bước này để web được mã hóa bảo mật.

Cài đặt công cụ Certbot:

bash

sudo apt install python3-certbot-nginx -y
Chạy lệnh cấp phát SSL tự động:

bash

sudo certbot --nginx -d sachdautu.com -d www.sachdautu.com
(Thay sachdautu.com bằng tên miền thật của bạn). Nó sẽ hỏi bạn email, cứ nhập email vào và nhấn Y đồng ý các điều khoản.