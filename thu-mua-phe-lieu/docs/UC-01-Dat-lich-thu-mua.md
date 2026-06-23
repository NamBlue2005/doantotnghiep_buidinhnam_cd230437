# Use Case UC-01: Đặt lịch thu mua phế liệu (Khách hàng)

- **Mã Use Case**: UC-01
- **Tên Use Case**: Đặt lịch thu mua phế liệu
- **Tác nhân chính**: Khách hàng

## Mô tả
Khách hàng tạo yêu cầu thu mua phế liệu bằng cách chọn loại/ sản phẩm, xác định số lượng, địa chỉ và thời gian thu gom mong muốn. Hệ thống tạo đơn thu mua, ghi nhận thông tin địa chỉ và lịch, gửi thông báo tới hệ thống để tài xế/nhân viên xử lý, và cập nhật trạng thái đơn.

## Điều kiện tiên quyết
- Khách hàng đã đăng nhập vào hệ thống (có phiên hợp lệ) hoặc thực hiện đăng nhập trong luồng.
- Danh mục/phế liệu cần được hiển thị (sản phẩm tồn tại trong hệ thống).

## Điều kiện hậu (Postconditions)
- Đơn thu mua mới được tạo trong hệ thống với trạng thái `PENDING` (chờ tiếp nhận).
- Thông tin địa chỉ và lịch hẹn được lưu.
- Tồn kho/ nguồn hàng được ghi nhận (nếu áp dụng) và thông báo gửi tới quy trình ghép tài xế/nhân viên.

## Luồng chính (Basic Flow)
1. Khách hàng mở ứng dụng/ giao diện "Tạo đơn".
2. Hệ thống yêu cầu đăng nhập nếu khách hàng chưa đăng nhập; khách hàng xác thực (hoặc bỏ qua nếu đã đăng nhập).
3. Khách hàng chọn danh mục/ loại phế liệu hoặc tìm kiếm sản phẩm.
4. Khách hàng chọn sản phẩm (hoặc nhiều sản phẩm), nhập số lượng và thêm vào giỏ/đơn.
5. Khách hàng chọn/nhập địa chỉ thu gom hoặc chọn địa chỉ đã lưu.
6. Khách hàng chọn ngày/khung giờ thu gom mong muốn.
7. Khách hàng kiểm tra lại thông tin đơn và xác nhận đặt lịch.
8. Hệ thống tạo đơn mới, gán mã đơn, lưu chi tiết sản phẩm, địa chỉ và lịch hẹn, và đặt trạng thái ban đầu `PENDING`.
9. Hệ thống cập nhật tồn kho (nếu cần) và gửi thông báo/ nhiệm vụ tới module ghép tài xế.
10. Hệ thống hiển thị màn hình xác nhận với thông tin đơn và thời gian dự kiến/tình trạng tiếp theo.

## Luồng thay thế (Alternate Flows / Exceptions)
- A1: Nếu khách hàng chọn sản phẩm không còn sẵn có tại bước 4: hệ thống hiển thị cảnh báo "Sản phẩm không có sẵn" và gợi ý các sản phẩm thay thế; khách hàng có thể sửa giỏ hoặc hủy thao tác.
- A2: Nếu địa chỉ không hợp lệ hoặc không nằm trong khu vực phục vụ tại bước 5: hệ thống hiển thị thông báo lỗi và yêu cầu khách hàng nhập lại hoặc chọn địa chỉ khác.
- A3: Nếu thời gian thu gom bị trùng/lỗi lịch tại bước 6: hệ thống yêu cầu chọn khung giờ khác.
- A4: Nếu khách hàng huỷ trong khi xác nhận (bước 7): luồng dừng, không tạo đơn; nếu có sản phẩm đã reserve, hệ thống huỷ reserve.
- A5: Nếu hệ thống không thể tạo đơn do lỗi server/DB (khi tạo đơn tại bước 8): hiển thị lỗi, khuyến nghị thử lại; nếu khách hàng chọn thử lại, hệ thống tái thực hiện.

## Luồng thanh toán (nếu áp dụng)
- B1: Nếu luồng đặt lịch yêu cầu thanh toán ngay (ví dụ ứng dụng thu hộ hoặc đặt cọc): sau bước 7, khách hàng chọn phương thức thanh toán (Tiền mặt/QR/cổng thanh toán), hệ thống định nghĩa `UC_Payment` để xử lý thanh toán. Thanh toán thành công => đơn được duy trì; nếu thất bại => khách hàng được thông báo và chọn phương án khác hoặc huỷ.

## Yêu cầu phi chức năng (Non-functional Requirements)
- Độ trễ tạo đơn cần < 3s trong điều kiện hệ thống bình thường.
- Bảo mật: thông tin địa chỉ và liên hệ phải lưu trữ an toàn, tuân thủ chính sách bảo mật.
- Tính sẵn sàng: hệ thống phải xử lý đồng thời nhiều yêu cầu đặt lịch mà không mất dữ liệu.

## Ghi chú / Lưu ý triển khai
- Nên có cơ chế xác thực địa chỉ (geocoding hoặc xác nhận qua SMS) nếu phạm vi giao nhận phức tạp.
- Cần ràng buộc hợp lý về khoảng thời gian đặt lịch (ví dụ không thể đặt trong vòng 30 phút nếu không có tài xế)
- Nếu áp dụng tính toán phí theo khoảng cách/khối lượng, luồng đặt lịch cần gọi service tính phí trước khi xác nhận.
