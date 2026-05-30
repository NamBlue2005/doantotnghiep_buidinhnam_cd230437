import StatsWidget from "@/components/stats-widget";
import { useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { useMemo } from "react";
import { ordersState } from "@/state";
import { List, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";

export default function StatsPage() {
  const completedOrdersLoadable = useAtomValue(
    useMemo(() => loadable(ordersState("completed")), [])
  );
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-background flex flex-col overflow-y-auto pb-4">
      <StatsWidget />
      
      <div className="px-4">
        <h3 className="font-bold text-gray-800 mb-3 text-sm">
          Lịch sử giao dịch ({completedOrdersLoadable.state === "hasData" ? completedOrdersLoadable.data.length : 0})
        </h3>
        
        {completedOrdersLoadable.state === "loading" && (
          <div className="flex justify-center p-4"><Icon icon="zi-spinner" className="animate-spin text-primary" /></div>
        )}
        
        {completedOrdersLoadable.state === "hasData" && completedOrdersLoadable.data.length === 0 && (
          <div className="text-center text-gray-500 py-4 text-sm bg-white rounded-lg border-[0.5px] border-black/10">
            Chưa có giao dịch nào hoàn thành
          </div>
        )}
        
        {completedOrdersLoadable.state === "hasData" && completedOrdersLoadable.data.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border-[0.5px] border-black/10 overflow-hidden">
            <List noSpacing>
              {completedOrdersLoadable.data.map((order: any) => (
                <List.Item
                  key={order.id}
                  onClick={() => navigate(`/order/${order.id}`, { state: order })}
                  className="border-b border-gray-100 last:border-b-0"
                  title={<span className="font-semibold text-gray-800">Mã đơn: {order.orderCode || `OD${String(order.id).padStart(8, '0')}`}</span>}
                  subTitle={
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      <div>{new Date(order.completedAt || order.createdAt).toLocaleDateString('vi-VN')} - {order.estimatedWeight} kg</div>
                      <div className="line-clamp-1">Loại: {order.items.map((i: any) => i.product.name.replace("Thu mua ", "")).join(", ")}</div>
                    </div>
                  }
                  suffix={
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-orange-600">+{(order.estimatedWeight * 5000).toLocaleString('vi-VN')}đ</span>
                      <Icon icon="zi-chevron-right" className="text-gray-400 mt-1" size={16} />
                    </div>
                  }
                />
              ))}
            </List>
          </div>
        )}
      </div>
    </div>
  );
}
