import { Button } from "zmp-ui";
import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { API_BASE_URL, cartState, shippingAddressState, userInfoState, orderRefreshKeyState, deliveryTimeState, notificationRefreshKeyState } from "@/state";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Pay() {
  const [paying, setPaying] = useState(false);
  const cart = useAtomValue(cartState);
  const address = useAtomValue(shippingAddressState);
  const setCart = useSetAtom(cartState);
  const setOrderRefreshKey = useSetAtom(orderRefreshKeyState);
  const setNotificationRefreshKey = useSetAtom(notificationRefreshKeyState);
  const deliveryTime = useAtomValue(deliveryTimeState);
  const user = useAtomValue(userInfoState);
  const navigate = useNavigate();

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 loại phế liệu!");
      return;
    }
    if (!address) {
      toast.error("Vui lòng thêm địa chỉ thu gom!");
      return;
    }
    if (!deliveryTime) {
      toast.error("Vui lòng chọn thời gian thu gom!");
      return;
    }

    // BỌC LÓT 2: Kiểm tra dữ liệu người dùng trước khi gửi (Trị lỗi 500)
    if (!user || !user.id || user.id === "undefined") {
      toast.error("Lỗi: Không nhận diện được tài khoản của bạn!");
      return;
    }

    setPaying(true);
    try {
      // Chuyển đổi mảng giỏ hàng thành định dạng Backend cần
      const itemsPayload = cart.map(item => ({
        categoryId: item.product.categoryId,
        weight: item.quantity
      }));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          sellerId: user.id, // Dùng ID thật của người dùng hiện tại
          items: itemsPayload,
          address: address.alias ? `${address.alias}, ${address.address}` : address.address, // Ghép số nhà và tên đường
          latitude: address.lat || 0.0, // Truyền tọa độ thật đã lưu vào Backend
          longitude: address.lng || 0.0,
          imageUrl: "",
          pickupTime: deliveryTime.length === 16 ? `${deliveryTime}:00` : deliveryTime, // Thêm :00 để Spring Boot không bị lỗi parse thời gian
        }),
      });

      if (response.ok) {
        toast.success("Đăng đơn thu mua thành công!");
        setCart([]); // Xóa rỗng giỏ hàng
        setOrderRefreshKey((prev) => prev + 1); // Kích hoạt tải lại danh sách đơn hàng
        setNotificationRefreshKey((prev) => prev + 1); // Cập nhật lại thông báo ngay lập tức
        navigate("/orders", { replace: true }); // Chuyển sang tab Đơn hàng
      } else {
        // Lấy chi tiết lỗi từ Backend để dễ debug
        const errorText = await response.text();
        console.error("Lỗi từ Backend:", errorText);
        
        if (errorText.includes("Internal Server Error")) {
          toast.error("Lỗi Backend: Hãy xem Log chữ ĐỎ trên phần mềm Eclipse/IntelliJ!", { duration: 6000 });
        } else {
          toast.error(`Lỗi: ${errorText.substring(0, 50)}`);
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Không thể kết nối đến Backend");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex-none flex items-center py-3 px-4 bg-section">
      <Button
        fullWidth
        onClick={handleCreateOrder}
        disabled={paying}
      >
        Xác nhận
      </Button>
    </div>
  );
}
