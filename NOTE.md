## daohuyenmy : lần đầu, tải dữ liệu từng video xem, tải từ server, lưu dữ liệu vào cache. Lần sau truy cập sẽ sử dụng cache mà k tải từ server nữa. Không tăng MB resources quá nhiều

## tiktok-test : lần đầu sẽ tải 1 loạt all dữ liệu và thêm vào cache. Lần sau sử dụng cache để xem video ( có thể tải mảnh phân rã status 206 nên tiêu tốn 1 chút MB transferred ), và có tăng MB resources nhiều khi dùng lâu

## Trong folder này chứa folder tiktok-test : là phiên bản logic khác. Lần đầu truy cập sẽ tải 1 loạt all dữ liệu video, từ lần sau sẽ dùng cache mà k tải từ server nữa. Tuy nhiên khi lướt xem sẽ ngày càng tăng bộ nhớ MB resources