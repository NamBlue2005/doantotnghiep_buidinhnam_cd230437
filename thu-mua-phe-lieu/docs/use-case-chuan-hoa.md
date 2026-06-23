# Use Case Chuẩn Hóa

Tài liệu này chuẩn hóa lại sơ đồ use case cho ứng dụng thu mua phế liệu dựa trên chức năng đang có trong codebase.

## Phạm vi hệ thống

- Ứng dụng mini app cho khách hàng bán phế liệu, tài xế/ người thu mua xử lý đơn, và admin quản trị.
- Zalo được dùng như kênh xác thực/đăng nhập, không nên mô tả như một use case nghiệp vụ độc lập.

## Tác nhân

- Khách hàng
- Tài xế / Người thu mua
- Admin
- Zalo OAuth / Zalo SDK ngoài hệ thống
- Cổng thanh toán

## Use case đã chuẩn hóa

### Khách hàng

- Đăng nhập / xác thực người dùng
- Xem danh mục phế liệu
- Xem chi tiết sản phẩm phế liệu
- Tìm kiếm phế liệu
- Tạo đơn đặt lịch thu mua
- Chọn / xác nhận địa chỉ thu gom
- Theo dõi trạng thái đơn hàng
- Hủy đơn hàng
- Xem thông báo hệ thống
- Quản lý hồ sơ cá nhân
- Cập nhật thông tin cá nhân
- Xem thống kê thu nhập hoặc lịch sử giao dịch
- Đánh giá dịch vụ

### Tài xế / Người thu mua

- Đăng nhập / xác thực người dùng
- Xem danh sách đơn chờ nhận
- Nhận đơn thu mua
- Cập nhật trạng thái đơn hàng
- Xác nhận hoàn thành thu gom
- Hủy đơn thu gom
- Xử lý thanh toán

### Admin

- Đăng nhập / xác thực người dùng
- Quản lý toàn bộ đơn hàng
- Quản lý tài khoản người dùng
- Quản lý danh mục phế liệu
- Thêm / sửa / xóa phế liệu và giá
- Xem thống kê hệ thống

## Quan hệ nên dùng

### `include`

- `Tạo đơn đặt lịch thu mua` include `Chọn / xác nhận địa chỉ thu gom`
- `Quản lý hồ sơ cá nhân` include `Cập nhật thông tin cá nhân`
- `Quản lý danh mục phế liệu` include `Thêm / sửa / xóa phế liệu và giá`
- `Xem thống kê thu nhập hoặc lịch sử giao dịch` include các số liệu tổng hợp như số đơn đã hoàn thành, doanh thu, lịch sử giao dịch
- `Xử lý thanh toán` include `Chọn phương thức thanh toán`

### `extend`

- `Hủy đơn hàng` extend `Theo dõi trạng thái đơn hàng`
- `Hủy đơn thu gom` extend `Cập nhật trạng thái đơn hàng`
- `Xác nhận hoàn thành thu gom` extend `Cập nhật trạng thái đơn hàng`
- `Lịch sử giao dịch` có thể là nhánh mở rộng của `Xem thống kê thu nhập` nếu muốn thể hiện phần xem chi tiết

## Nên đổi tên các use case hiện tại

- `Đăng nhập / Xác thực qua Zalo` -> `Đăng nhập / xác thực người dùng`
- `Thanh toán` -> `Xử lý thanh toán` hoặc `Thanh toán đơn hàng`
- `Zalo Pay` và `Tiền mặt` -> không nên là use case riêng, hãy đặt làm phương thức trong use case thanh toán
- `Số đơn đã hoàn thành` -> số liệu thống kê, không phải use case
- `Lịch sử giao dịch` -> dữ liệu/chi tiết hiển thị, không nên đứng ngang hàng với use case chính
- `Ứng tuyển / xác nhận đơn thu mua` -> `Nhận đơn thu mua`
- `Quản lý danh mục phế liệu` và `Thêm / sửa / xóa phế liệu và giá` -> nên thể hiện theo quan hệ include, không tách thành hai use case ngang hàng nếu vẽ sơ đồ gọn

## Gợi ý bố cục sơ đồ lại

### Cụm Khách hàng

- Trung tâm là `Khách hàng`
- Bao quanh là các use case: xác thực, xem danh mục, tìm kiếm, tạo đơn, theo dõi đơn, quản lý hồ sơ, xem thông báo, đánh giá dịch vụ

### Cụm Tài xế / Người thu mua

- Trung tâm là `Tài xế / Người thu mua`
- Bao quanh là: xem đơn chờ, nhận đơn, cập nhật trạng thái, hoàn thành thu gom, hủy đơn, xử lý thanh toán

### Cụm Admin

- Trung tâm là `Admin`
- Bao quanh là: quản lý người dùng, quản lý đơn hàng, quản lý danh mục, xem thống kê

## Mẫu mô tả ngắn để vẽ lại

```text
Khách hàng
  - Đăng nhập / xác thực người dùng
  - Xem danh mục phế liệu
  - Tìm kiếm phế liệu
  - Tạo đơn đặt lịch thu mua <<include>> Chọn / xác nhận địa chỉ thu gom
  - Theo dõi trạng thái đơn hàng <<extend>> Hủy đơn hàng
  - Quản lý hồ sơ cá nhân <<include>> Cập nhật thông tin cá nhân
  - Xem thông báo hệ thống
  - Xem thống kê thu nhập hoặc lịch sử giao dịch
  - Đánh giá dịch vụ

Tài xế / Người thu mua
  - Đăng nhập / xác thực người dùng
  - Xem danh sách đơn chờ nhận
  - Nhận đơn thu mua
  - Cập nhật trạng thái đơn hàng <<extend>> Xác nhận hoàn thành thu gom
  - Cập nhật trạng thái đơn hàng <<extend>> Hủy đơn thu gom
  - Xử lý thanh toán <<include>> Chọn phương thức thanh toán

Admin
  - Đăng nhập / xác thực người dùng
  - Quản lý toàn bộ đơn hàng
  - Quản lý tài khoản người dùng
  - Quản lý danh mục phế liệu <<include>> Thêm / sửa / xóa phế liệu và giá
  - Xem thống kê hệ thống
```
