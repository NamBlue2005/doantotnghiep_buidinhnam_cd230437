import { useLocation, useNavigate } from "react-router-dom";
import OrderSummary from "./order-summary";
import OrderInfo from "./order-info";
import { Button, Input, Icon } from "zmp-ui";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useSetAtom, useAtomValue } from "jotai";
import { API_BASE_URL, orderRefreshKeyState, notificationRefreshKeyState, userInfoState } from "@/state";
import { openWebview, openPhone, getSetting, authorize } from "zmp-sdk/apis";

function OrderDetailPage() {
  // Phía tích hợp có thể lấy id từ query params, từ đó gọi API đến server để lấy thông tin chi tiết đơn hàng.
  // Tham khảo logic tương tự ở ProductDetailPage (src/pages/catalog/product-detail.tsx)
  // const { id } = useParams();
  // const order = useAtomValue(orderState(Number(id)));

  // Hoặc đơn giản hơn, lấy thông tin đơn hàng từ router state.
  // Điểm khác biệt lớn nhất là phương án này bắt buộc phải truy cập trang chi tiết đơn hàng từ trang danh sách đơn hàng,
  // chứ không thể truy cập trực tiếp từ deeplink như phương án trên.
  const { state } = useLocation();
  const order = state as any;
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState(false);
  const [applying, setApplying] = useState(false);
  const [matching, setMatching] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [actualWeight, setActualWeight] = useState(order?.estimatedWeight || 0);
  const [amount, setAmount] = useState((order?.estimatedWeight || 0) * 5000);
  const setOrderRefreshKey = useSetAtom(orderRefreshKeyState);
  const setNotificationRefreshKey = useSetAtom(notificationRefreshKeyState);
  const user = useAtomValue(userInfoState) as any;

  // State cho phần Đánh giá (Review)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Gọi API lấy danh sách tài xế ứng tuyển nếu là Người bán
  useEffect(() => {
    if (user?.role === 1 && (order.originalStatus === "PENDING" || order.originalStatus === "HAS_OFFERS")) {
      fetch(`${API_BASE_URL}/applications/order/${order.id}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
        cache: "no-store" // Ép trình duyệt không dùng dữ liệu cũ
      })
        .then((res) => res.json())
        .then((data) => setApplications(data))
        .catch(console.error);
    }
  }, [order.id, user?.role, order.originalStatus]);

  const handleCancelOrder = async () => {
    if (!user || !user.id) {
      toast.error("Lỗi: Không nhận diện được tài khoản của bạn!");
      return;
    }


    const confirmMsg = user.role === 2 
      ? "TÀI XẾ LƯU Ý: Bạn có chắc chắn muốn hủy đơn hàng này không? Việc hủy đơn thường xuyên có thể ảnh hưởng đến tài khoản của bạn!" 
      : "Bạn có chắc chắn muốn hủy yêu cầu thu gom này không?";

    if (window.confirm(confirmMsg)) {
      setCancelling(true);
      try {
        // Gọi API Hủy đơn
        const response = await fetch(`${API_BASE_URL}/orders/${order.id}/cancel?sellerId=${user.id}`, {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        
        if (response.ok) {
          toast.success("Đã hủy đơn hàng thành công!");
          setOrderRefreshKey((prev) => prev + 1); // Kích hoạt tải lại danh sách đơn hàng
          setNotificationRefreshKey((prev) => prev + 1); // Cập nhật thông báo ngay lập tức
          navigate(-1); // Quay lại trang danh sách đơn hàng
        } else {
          toast.error("Không thể hủy đơn. Vui lòng thử lại sau!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi kết nối đến máy chủ.");
      } finally {
        setCancelling(false);
      }
    }
  };

  const handleApplyOrder = async () => {
    if (!user || !user.id) {
      toast.error("Lỗi: Không nhận diện được tài khoản của bạn!");
      return;
    }

    setApplying(true);
    
    // --- BẮT ĐẦU TÍNH KHOẢNG CÁCH THỰC TẾ BẰNG GPS ---
    let distanceKm = 2.5; // Khoảng cách mặc định nếu người dùng từ chối cấp quyền GPS
    try {
      // Kiểm tra và hiển thị bảng xin quyền Vị trí chuẩn của Zalo (Nếu chưa cấp)
      const { authSetting } = await getSetting({});
      if (!authSetting["scope.userLocation"]) {
        await authorize({ scopes: ["scope.userLocation"] });
      }

      // Lấy GPS của Tài xế
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
      });
      const driverLat = position.coords.latitude;
      const driverLng = position.coords.longitude;

      // Kiểm tra xem đơn hàng có lưu tọa độ thật không (Khác 0.0)
      if (order.latitude && order.longitude && order.latitude !== 0) {
        // Công thức Haversine tính khoảng cách Km (đường chim bay)
        const R = 6371; // Bán kính trái đất (km)
        const dLat = (order.latitude - driverLat) * (Math.PI / 180);
        const dLon = (order.longitude - driverLng) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(driverLat * (Math.PI / 180)) * Math.cos(order.latitude * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        distanceKm = Number((R * c).toFixed(1)); // Làm tròn 1 chữ số thập phân
      } else {
        // Nếu đơn hàng chưa được lưu tọa độ (do lúc đăng đơn gán tạm = 0.0), sinh số ngẫu nhiên từ 1 - 5km để test
        distanceKm = Number((Math.random() * 4 + 1).toFixed(1));
        toast("Chưa có GPS Người bán. Đang dùng khoảng cách ước tính: " + distanceKm + " km", { icon: 'ℹ️', duration: 3000 });
      }
    } catch (e) {
      console.warn("Tài xế từ chối cấp quyền GPS hoặc bị lỗi", e);
    }
    // --- KẾT THÚC TÍNH KHOẢNG CÁCH ---

    try {
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          orderId: order.id,
          driverId: user.id, // ID thật của tài xế đang đăng nhập
          distanceKm: distanceKm, // Sử dụng khoảng cách thực tế vừa tính bằng GPS
        }),
      });
      
      if (response.ok) {
        toast.success("Đã nhận đơn! Đang chờ người bán phản hồi.");
        setOrderRefreshKey((prev) => prev + 1); // Kích hoạt tải lại danh sách đơn
        setNotificationRefreshKey((prev) => prev + 1); // Cập nhật thông báo ngay lập tức
        navigate(-1); // Quay lại trang danh sách
      } else {
        try {
          const errorData = await response.json();
          toast.error(errorData.error || "Không thể nhận đơn!");
        } catch {
          toast.error("Không thể nhận đơn do lỗi máy chủ!");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối đến máy chủ.");
    } finally {
      setApplying(false);
    }
  };

  const handleMatchDriver = async (driverId: number) => {
    if (window.confirm("Bạn có chắc chắn muốn chọn tài xế này không?")) {
      setMatching(true);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${order.id}/match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            sellerId: user.id,
            driverId: driverId,
          }),
        });
        
        if (response.ok) {
          toast.success("Chốt tài xế thành công!");
          setOrderRefreshKey((prev) => prev + 1); // Kích hoạt tải lại danh sách đơn
          setNotificationRefreshKey((prev) => prev + 1); // Cập nhật thông báo ngay lập tức
          navigate(-1); // Quay lại trang danh sách
        } else {
          toast.error("Không thể chốt tài xế. Vui lòng thử lại!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi kết nối đến máy chủ.");
      } finally {
        setMatching(false);
      }
    }
  };

  // Hàm tự động tính tiền khi nhập số kg (Tạm tính 5.000đ / 1 kg)
  const handleWeightChange = (e: any) => {
    const weight = Number(e.target.value);
    setActualWeight(weight);
    setAmount(weight * 5000); 
  };

  const handleCompleteOrder = async () => {
    if (window.confirm("Xác nhận bạn đã thu gom xong đơn hàng này?")) {
      setCompleting(true);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${order.id}/complete`, {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        });
        
        if (response.ok) {
          toast.success("Đã hoàn thành đơn hàng!");
          setOrderRefreshKey((prev) => prev + 1); // Kích hoạt tải lại danh sách
          setNotificationRefreshKey((prev) => prev + 1); // Cập nhật thông báo ngay lập tức
          navigate(-1); // Quay lại trang danh sách
        } else {
          toast.error("Không thể hoàn thành đơn hàng. Vui lòng thử lại!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi kết nối đến máy chủ.");
      } finally {
        setCompleting(false);
      }
    }
  };

  const handleZaloPay = async () => {
    setCompleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ orderId: order.id, amount: amount }),
      });
      
      if (response.ok) {
        const url = await response.text();
        // Sử dụng API chuẩn của Zalo Mini App để mở link thanh toán trên điện thoại
        openWebview({
          url: url
        });
      } else {
        toast.error("Không thể tạo giao dịch ZaloPay!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối đến máy chủ.");
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }
    setSubmittingReview(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          orderId: order.id,
          reviewerId: user.id,
          rating: rating,
          comment: comment,
        }),
      });
      
      if (response.ok) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        setOrderRefreshKey((prev) => prev + 1); // Kích hoạt tải lại danh sách
        navigate(-1); // Quay lại trang danh sách
      } else {
        toast.error("Không thể gửi đánh giá. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối đến máy chủ.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <OrderInfo order={order} />
        <OrderSummary full order={order} />
        
        {/* Thông tin liên hệ (Chỉ hiển thị khi đơn đang giao hoặc đã hoàn thành) */}
        {(order.status === "shipping" || order.status === "completed") && (
          <div className="bg-white rounded-lg p-4 border-[0.5px] border-black/10 mt-4 space-y-3 shadow-sm">
            <h3 className="font-bold text-primary">Liên hệ {user?.role === 1 ? "Tài xế" : "Người bán"}</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={(user?.role === 1 ? order.matchedDriver?.avatarUrl : order.seller?.avatarUrl) || "https://ui-avatars.com/api/?name=User"} 
                  alt="avatar" 
                  className="w-12 h-12 rounded-full border border-gray-300 object-cover" 
                />
                <div>
                  <div className="font-semibold text-sm">{user?.role === 1 ? order.matchedDriver?.fullName : order.seller?.fullName}</div>
                  <div className="text-xs text-gray-500">{(user?.role === 1 ? order.matchedDriver?.phone : order.seller?.phone) || 'Đang cập nhật...'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="small" 
                  variant="secondary" 
                  onClick={() => {
                    const phone = user?.role === 1 ? order.matchedDriver?.phone : order.seller?.phone;
                    if (phone) openPhone({ phoneNumber: phone });
                    else toast.error("Số điện thoại không hợp lệ");
                  }}
                >
                  <Icon icon="zi-call" size={20} className="text-primary" />
                </Button>
                <Button 
                  size="small" 
                  onClick={() => openWebview({ url: `https://zalo.me/${user?.role === 1 ? order.matchedDriver?.phone : order.seller?.phone}` })}
                >
                  <Icon icon="zi-chat" size={20} />
                </Button>
                {/* TÀI XẾ SẼ THẤY THÊM NÚT CHỈ ĐƯỜNG ĐẾN CHỖ NGƯỜI BÁN */}
                {user?.role === 2 && order.latitude && order.longitude && order.latitude !== 0 && (
                  <Button 
                    size="small"
                    variant="secondary"
                    onClick={() => openWebview({ url: `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}` })}
                  >
                    <Icon icon="zi-location" size={20} className="text-green-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Danh sách tài xế ứng tuyển hiển thị cho Người bán */}
        {user?.role === 1 && applications.length > 0 && (
          <div className="bg-white rounded-lg p-4 border-[0.5px] border-black/10 mt-4">
            <h3 className="font-bold text-primary mb-3">Tài xế ứng tuyển ({applications.length})</h3>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={app.driver?.avatarUrl || "https://ui-avatars.com/api/?name=Driver"} alt="avatar" className="w-10 h-10 rounded-full border border-gray-300" />
                    <div>
                      <div className="font-semibold text-sm">{app.driver?.fullName || 'Tài xế'}</div>
                      <div className="text-xs text-gray-500">Cách bạn: {app.distanceKm} km</div>
                    </div>
                  </div>
                  <Button
                    size="small"
                    disabled={matching || app.status !== 'WAITING'}
                    onClick={() => handleMatchDriver(app.driver.id)}
                  >
                    {app.status === 'ACCEPTED' ? 'Đã chọn' : 'Chốt'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phần đánh giá khi đơn hàng đã hoàn thành */}
        {/* ĐÃ TẠM ẨN ĐỂ TẬP TRUNG BÁO CÁO LUỒNG CHÍNH */}
        {false && order.status === "completed" && (
          <div className="bg-white rounded-lg p-4 border-[0.5px] border-black/10 mt-4 space-y-3">
            <h3 className="font-bold text-primary">Đánh giá giao dịch</h3>
            <div className="text-sm text-gray-600">Bạn cảm thấy đối tác thế nào?</div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`text-3xl cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </div>
              ))}
            </div>
            <Input
              type="text"
              placeholder="Nhập nhận xét của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button fullWidth size="medium" disabled={submittingReview} onClick={handleSubmitReview}>
              Gửi đánh giá
            </Button>
          </div>
        )}
      </div>
      
      {/* Nút bấm thay đổi theo Chế độ (Role) */}
      {order.status === "pending" && user?.role === 1 && (
        <div className="flex-none p-4 bg-section border-t border-black/10">
          <Button fullWidth variant="secondary" type="danger" disabled={cancelling} onClick={handleCancelOrder}>
            Hủy đơn hàng
          </Button>
        </div>
      )}
      
      {order.status === "pending" && user?.role === 2 && (
        <div className="flex-none p-4 bg-section border-t border-black/10 space-y-3">
          {order.latitude && order.longitude && order.latitude !== 0 && (
            <Button fullWidth variant="secondary" onClick={() => openWebview({ url: `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}` })}>
              Xem vị trí trên bản đồ
            </Button>
          )}
          <Button fullWidth disabled={applying} onClick={handleApplyOrder}>
            Nhận đơn thu gom
          </Button>
        </div>
      )}

      {/* Nút Hoàn thành dành cho Tài xế khi đơn đang giao */}
      {order.status === "shipping" && user?.role === 2 && (
        <div className="flex-none p-4 bg-section border-t border-black/10 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              label="Khối lượng (Kg)"
              type="number"
              value={actualWeight}
              onChange={handleWeightChange}
            />
            <Input
              label="Thành tiền (VNĐ)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2 pb-2 border-b border-black/10">
            <Button variant="secondary" fullWidth disabled={completing || cancelling} onClick={handleCompleteOrder}>
              Tiền mặt
            </Button>
            <Button fullWidth disabled={completing || cancelling} onClick={handleZaloPay}>
              ZaloPay
            </Button>
          </div>
          <Button variant="secondary" type="danger" fullWidth disabled={completing || cancelling} onClick={handleCancelOrder}>
            Tài xế hủy đơn
          </Button>
        </div>
      )}
    </div>
  );
}

export default OrderDetailPage;
