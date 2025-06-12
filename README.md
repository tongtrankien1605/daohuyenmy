## 🚀  **Lướt video ngắm gái xinh cùng tongtrankien1605** ! 🚀


**Trang được code dựa theo cấu trúc nhỏ giống Tiktok, dùng để xem các video đã được upload lên server**

<br/>

## 👉 Xem ngay [Ở ĐÂY](https://tongtrankien1605.github.io/daohuyenmy) ạ !

</br>

## Ghi chú về Cấu hình và Sử dụng Dự án

### 1. Cấu hình BASE URL
Dự án sử dụng các hằng số BASE URL để quản lý đường dẫn tài nguyên:
- `GITHUB_PAGES_BASE`: Domain GitHub Pages (mặc định: `https://tongtrankien1605.github.io`).
- `REPOSITORY_ROOT`: Thư mục gốc của repository trên GitHub Pages (mặc định: `/daohuyenmy/`).
- `BASE_URL`: Ghép từ `GITHUB_PAGES_BASE` và `REPOSITORY_ROOT` (mặc định: `https://tongtrankien1605.github.io/daohuyenmy/`).
- `RAW_GITHUB_BASE`: Domain raw GitHub (mặc định: `https://raw.githubusercontent.com/tongtrankien1605`).
- `RAW_REPOSITORY_ROOT`: Thư mục và branch raw (mặc định: `/daohuyenmy/main/`).
- `RAW_BASE_URL`: Ghép từ `RAW_GITHUB_BASE` và `RAW_REPOSITORY_ROOT` (mặc định: `https://raw.githubusercontent.com/tongtrankien1605/daohuyenmy/main/`).

#### Cách thay đổi BASE URL
- **Thay đổi tài khoản GitHub**:
  - Cập nhật `GITHUB_PAGES_BASE` (ví dụ: `https://newuser.github.io`) và `RAW_GITHUB_BASE` (ví dụ: `https://raw.githubusercontent.com/newuser`).
  - Deploy lại dự án trên tài khoản mới và cập nhật `videos.json` với URL raw mới.
- **Thay đổi thư mục repository**:
  - Cập nhật `REPOSITORY_ROOT` (ví dụ: `/new-folder/`) và `RAW_REPOSITORY_ROOT` (ví dụ: `/new-folder/new-branch/`).
  - Di chuyển file trong repo, push lên branch mới, và cập nhật cấu hình GitHub Pages.
- **Ví dụ**:
  - Từ: `BASE_URL = "https://tongtrankien1605.github.io/daohuyenmy/"`, `RAW_BASE_URL = "https://raw.githubusercontent.com/tongtrankien1605/daohuyenmy/main/"`.
  - Sang: `BASE_URL = "https://newuser.github.io/new-folder/"`, `RAW_BASE_URL = "https://raw.githubusercontent.com/newuser/new-folder/new-branch/"`.

### 2. Cấu hình GitHub Pages
- Vào Settings > Pages, đặt:
  - **Source**: Branch `main` (hoặc branch bạn dùng).
  - **Folder**: `/ (root)` nếu file ở gốc `/daohuyenmy/`, hoặc thư mục tương ứng nếu thay đổi `REPOSITORY_ROOT`.
- Đảm bảo file `sw.js`, `index.html`, và `videos.json` được push lên đúng thư mục.

### 3. Lưu ý quan trọng
- **Kiểm tra Service Worker**: Truy cập `BASE_URL + "sw.js"` (ví dụ: `https://tongtrankien1605.github.io/daohuyenmy/sw.js`) để xác nhận file tồn tại. Nếu 404, kiểm tra vị trí file và push lại.
- **Debug**: Mở DevTools (F12) > Console để kiểm tra log đăng ký Service Worker (`"Service Worker đăng ký thành công"` hoặc lỗi).
- **Cache**: Nếu thêm giới hạn cache 500MB, tích hợp logic `IndexedDB` và xóa video cũ nhất (xem code trước).
- **Video URL**: Đảm bảo `videos.json` chứa URL video bắt đầu từ `RAW_BASE_URL` (ví dụ: `https://raw.githubusercontent.com/tongtrankien1605/daohuyenmy/main/videos/video1.mp4`).
- **Deploy**: Sau thay đổi, chạy `git add .`, `git commit -m "Cập nhật cấu hình"`, `git push`.

### 4. Liên hệ hỗ trợ
Nếu gặp vấn đề, liên hệ Tống Trần Kiên để được hỗ trợ (thông tin liên hệ: [thêm nếu cần]).

</br>

## 😗 Một số lưu ý
</br>
1. Xóa cache Service Worker

Đổi CACHE_NAME trong sw.js

Mục đích: Làm mới toàn bộ cache Service Worker bằng cách thay đổi tên cache, buộc tải lại tất cả tài nguyên.

const CACHE_NAME = "tiktok-clone-v2"; // Từ v1 thành v2

2. Thay đổi version mỗi khi cập nhật video ( video.json )
- Cập nhật cache khi thay đổi version
- Link video mới thêm vào cache
- Lướt tới video mới: Load và thêm vào Service Worker
- Link URL bị xóa: Xóa video khỏi Service Worker

tóm tắt: 
- Cập nhật version: Làm mới cache localStorage, tải videos.json mới.
- Video mới: URL lưu vào localStorage, nội dung tải khi phát và lưu vào Service Worker.
- Video bị xóa: URL không còn trong videos.json → Xóa video tương ứng khỏi cache Service Worker.
- Băng thông: Tốn ít cho videos.json và HEAD request; video mới chỉ tải khi xem, video cũ dùng cache nếu còn trong danh sách.

-> ( cập nhật version sẽ cập nhật cache, với link video mới sẽ thêm vào cache và khi lướt tới sẽ load và thêm vào service worker, còn link url nào bị xóa thì sẽ xóa video đó khỏi service worker )

3. Cache hết hạn sau 24 giờ

Điều kiện: Khi Date.now() >= parseInt(localStorage.getItem(CACHE_EXPIRY_KEY)), hàm isCacheValid() trả về false.

Quy trình:

- Bỏ qua cache localStorage vì hết hạn.
- Fetch videos.json mới từ server (/daohuyenmy/videos.json?v=<timestamp>).
- Kiểm tra các URL video bằng fetch với method HEAD.
- Lưu danh sách video mới và version vào localStorage, đặt lại thời hạn 24h.
- Kiểm tra và xóa video cũ khỏi cache Service Worker (nếu URL không còn trong videos.json).
- Khi lướt đến video, tải nội dung và lưu vào cache Service Worker nếu chưa có.

Tác động:
- Đảm bảo tải videos.json mới nếu cache hết hạn, nhưng không bắt buộc version phải thay đổi.
- Video cũ vẫn tồn tại trong cache Service Worker nếu vẫn có trong videos.json.
- Băng thông: Tốn cho videos.json và HEAD request; nội dung video tải khi xem (dùng cache nếu có).
