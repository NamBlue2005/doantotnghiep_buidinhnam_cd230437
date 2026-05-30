import { useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { FC, useMemo, useState, useRef, useEffect } from "react";
import { Icon, List } from "zmp-ui";
import { notificationsState, notificationRefreshKeyState, userInfoState, API_BASE_URL } from "@/state";
import { useNavigate } from "react-router-dom";

const NotificationsPage: FC = () => {
  const notificationsList = useAtomValue(
    useMemo(() => loadable(notificationsState), [])
  );
  const setRefreshKey = useSetAtom(notificationRefreshKeyState);
  const user = useAtomValue(userInfoState) as any;
  const navigate = useNavigate();

  const [startY, setStartY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Tự động đánh dấu tất cả đã đọc khi người dùng mở trang này
  useEffect(() => {
    if (user && user.id) {
      fetch(`${API_BASE_URL}/notifications/${user.id}/read-all`, {
        method: "PUT",
        headers: { "ngrok-skip-browser-warning": "true" }
      }).then(() => {
        setRefreshKey(prev => prev + 1); // Kích hoạt tắt dấu chấm đỏ
      }).catch(console.error);
    }
  }, [user, setRefreshKey]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (listRef.current && listRef.current.scrollTop <= 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0) {
      const distance = e.touches[0].clientY - startY;
      if (distance > 0 && distance < 120) setPullDistance(distance);
      else if (distance < 0) setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setRefreshing(true);
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setRefreshing(false), 1000);
    }
    setStartY(0);
    setPullDistance(0);
  };

  const handleNotificationClick = async (notif: any) => {
    if (notif.orderId) {
      try {
        // Gọi xuống Backend để lấy toàn bộ thông tin mới nhất của Đơn hàng đó
        const res = await fetch(`${API_BASE_URL}/orders/${notif.orderId}`, {
          headers: { "ngrok-skip-browser-warning": "true" }
        });
        if (res.ok) {
          const order = await res.json();
          order.originalStatus = order.status;
          order.status = (order.status === 'PENDING' || order.status === 'HAS_OFFERS') ? 'pending' : (order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 'completed' : 'shipping');
          order.items = order.items && order.items.length > 0 ? order.items.map((oi: any) => ({
            product: {
              name: `Thu mua ${oi.category?.name || 'Phế liệu'}`,
              price: 0,
              image: order.imageUrl || "https://img.freepik.com/free-vector/recycle-symbol_1284-43093.jpg"
            },
            quantity: oi.weight
          })) : [{ product: { name: `Thu mua ${order.category?.name || 'Phế liệu'}`, price: 0, image: order.imageUrl || "https://img.freepik.com/free-vector/recycle-symbol_1284-43093.jpg" }, quantity: order.estimatedWeight }];
          
          navigate(`/order/${order.id}`, { state: order }); // Chuyển hướng
        }
      } catch (e) {
        console.error("Lỗi khi tải chi tiết đơn hàng", e);
      }
    }
  };

  return (
    <div 
      ref={listRef}
      className="w-full h-full flex flex-col bg-background overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="w-full flex justify-center items-center transition-all duration-300 overflow-hidden text-primary"
        style={{ height: pullDistance > 0 || refreshing ? '40px' : '0px', opacity: refreshing ? 1 : pullDistance / 60 }}
      >
        {refreshing ? (
          <div className="flex items-center space-x-2"><Icon icon="zi-spinner" className="animate-spin" /><span className="text-xs font-medium">Đang tải lại...</span></div>
        ) : (
          <div className="flex items-center space-x-2"><Icon icon="zi-arrow-down" /><span className="text-xs font-medium">Kéo xuống để tải lại</span></div>
        )}
      </div>

      <div className="flex-1">
        <List>
          {notificationsList.state === "hasData" && notificationsList.data.length === 0 && (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Icon icon="zi-notif" size={48} className="text-gray-300 mb-2" />
              <div>Bạn chưa có thông báo nào</div>
            </div>
          )}
          
          {notificationsList.state === "hasData" && notificationsList.data.map((notif: any) => (
            <List.Item
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`transition-colors ${!notif.isRead ? "bg-blue-50/50" : ""}`}
              title={<span className={!notif.isRead ? "font-bold text-primary" : "font-semibold text-gray-700"}>{notif.title}</span>}
              subTitle={<span className={`text-sm line-clamp-2 ${!notif.isRead ? "text-gray-800" : "text-gray-500"}`}>{notif.message}</span>}
              prefix={
                <div className={`${!notif.isRead ? "bg-primary text-white" : "bg-gray-200 text-gray-500"} p-2 rounded-full`}>
                  <Icon icon="zi-notif" />
                </div>
              }
              suffix={
                notif.createdAt && (
                  <div className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                    {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                )
              }
            />
          ))}
        </List>
      </div>
    </div>
  );
};

export default NotificationsPage;
