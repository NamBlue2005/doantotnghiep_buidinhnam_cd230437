import { Order } from "@/types";
import { Atom, useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { useMemo, useState, useRef } from "react";
import { EmptyOrder } from "@/components/empty";
import OrderSummary from "./order-summary";
import { OrderSummarySkeleton } from "@/components/skeleton";
import { orderRefreshKeyState } from "@/state";
import { Icon } from "zmp-ui";

function OrderList(props: { ordersState: Atom<Promise<any[]>> }) {
  const orderList = useAtomValue(
    useMemo(() => loadable(props.ordersState), [props.ordersState])
  );

  const setOrderRefreshKey = useSetAtom(orderRefreshKeyState);
  const [startY, setStartY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Chỉ cho phép bắt đầu kéo khi cuộn đang ở trên cùng danh sách
    if (listRef.current && listRef.current.scrollTop <= 0) {
      setStartY(e.touches[0].clientY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      // Nếu kéo xuống dưới (Pull Down)
      if (distance > 0 && distance < 120) {
        setPullDistance(distance);
      } else if (distance < 0) {
        setPullDistance(0);
      }
    }
  };

  const handleTouchEnd = () => {
    // Nếu kéo đủ sâu (> 60px) thì sẽ kích hoạt làm mới
    if (pullDistance > 60) {
      setRefreshing(true);
      setOrderRefreshKey(prev => prev + 1); // Kích hoạt gọi lại API Backend
      setTimeout(() => {
        setRefreshing(false);
      }, 1000); // Ẩn loading sau 1s để UI có độ trễ mượt mà
    }
    setStartY(0);
    setPullDistance(0);
  };

  return (
    <div 
      ref={listRef}
      className="h-full overflow-y-auto p-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hiệu ứng Kéo để làm mới (Pull to refresh) */}
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

      <div className="space-y-2">
        {orderList.state === "hasData" && orderList.data.length === 0 ? (
          <EmptyOrder />
        ) : orderList.state !== "hasData" ? (
        <>
          <OrderSummarySkeleton />
          <OrderSummarySkeleton />
          <OrderSummarySkeleton />
        </>
      ) : (
        orderList.data.map((order) => (
          <OrderSummary key={order.id} order={order} />
        ))
      )}
      </div>
    </div>
  );
}

export default OrderList;
