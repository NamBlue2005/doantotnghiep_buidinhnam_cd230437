import { Button } from "zmp-ui";
import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { API_BASE_URL, cartState, shippingAddressState, userInfoState, orderRefreshKeyState, deliveryTimeState, notificationRefreshKeyState, orderNoteState } from "@/state";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getPickupTimeValidationError,
  isProductAvailable,
  isShippingAddressValid,
  isValidPhoneNumber,
} from "@/utils/order-validation";

export default function Pay() {
  const [paying, setPaying] = useState(false);
  const cart = useAtomValue(cartState);
  const [note, setNote] = useAtom(orderNoteState);
  const address = useAtomValue(shippingAddressState);
  const setCart = useSetAtom(cartState);
  const setOrderRefreshKey = useSetAtom(orderRefreshKeyState);
  const setNotificationRefreshKey = useSetAtom(notificationRefreshKeyState);
  const deliveryTime = useAtomValue(deliveryTimeState);
  const user = useAtomValue(userInfoState);
  const navigate = useNavigate();
  const pickupTimeError = getPickupTimeValidationError(deliveryTime);
  const hasUnavailableProduct = cart.some((item) => !isProductAvailable(item.product));
  const addressError = !isShippingAddressValid(address)
    ? "Vui lòng nhập đầy đủ tên, số điện thoại và địa chỉ hợp lệ."
    : "";
  const canCreateOrder =
    !paying &&
    cart.length > 0 &&
    !hasUnavailableProduct &&
    !pickupTimeError &&
    !addressError &&
    user &&
    user.id &&
    user.id !== "undefined" &&
    isValidPhoneNumber(address?.phone || "");

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 loại phế liệu!");
      return;
    }
    if (!address) {
      toast.error("Vui lòng thêm địa chỉ thu gom!");
      return;
    }
    if (!isShippingAddressValid(address)) {
      toast.error("Vui lòng nhập tên, số điện thoại và địa chỉ hợp lệ!");
      return;
    }
    if (!deliveryTime) {
      toast.error("Vui lòng chọn thời gian thu gom!");
      return;
    }

    if (pickupTimeError) {
      toast.error(pickupTimeError);
      return;
    }

    if (hasUnavailableProduct) {
      toast.error("Loại phế liệu này tạm ngưng thu mua, vui lòng chọn loại khác.");
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
        productId: item.product.id,
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
          note: note,
          pickupTime: deliveryTime.length === 16 ? `${deliveryTime}:00` : deliveryTime, // Thêm :00 để Spring Boot không bị lỗi parse thời gian
        }),
      });

      if (response.ok) {
        toast.success("Đăng đơn thu mua thành công!");
        setNote(""); // Xóa ghi chú sau khi đăng đơn
        setCart([]); // Xóa rỗng giỏ hàng
        setOrderRefreshKey((prev) => prev + 1); // Kích hoạt tải lại danh sách đơn hàng
        setNotificationRefreshKey((prev) => prev + 1); // Cập nhật lại thông báo ngay lập tức
        navigate("/orders", { replace: true }); // Chuyển sang tab Đơn hàng
      } else {
        // Lấy chi tiết lỗi từ Backend để dễ debug
        const errorText = await response.text();
        console.error("Lỗi từ Backend:", errorText);
        toast.error("Lỗi kết nối, vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Lỗi kết nối, vui lòng thử lại sau.");
    } finally {
      setPaying(false);
    }
  };

  const buttonHint = hasUnavailableProduct
    ? "Có loại phế liệu đang tạm ngưng thu mua."
    : addressError || pickupTimeError;

  return (
    <div className="flex-none flex flex-col gap-2 py-3 px-4 bg-section">
      {buttonHint && (
        <div className="text-xs text-red-600">
          {buttonHint}
        </div>
      )}
      <Button fullWidth onClick={handleCreateOrder} disabled={!canCreateOrder}>
        Xác nhận
      </Button>
    </div>
  );
}
