import { useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import { useMemo } from "react";
import { Icon } from "zmp-ui";
import { userStatsState, userInfoState } from "@/state";

export default function StatsWidget() {
  const statsLoadable = useAtomValue(useMemo(() => loadable(userStatsState), []));
  const user = useAtomValue(userInfoState) as any;

  if (statsLoadable.state !== "hasData" || !statsLoadable.data) {
    return null; // Không hiển thị nếu chưa có dữ liệu
  }

  const stats = statsLoadable.data;
  const isDriver = user?.role === 2;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border-[0.5px] border-black/10 m-4">
      <h3 className="font-bold text-primary mb-3">
        {isDriver ? "Thống kê thu nhập" : "Thống kê bán phế liệu"}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 p-3 rounded-lg flex flex-col items-center justify-center">
          <Icon icon="zi-check-circle-solid" className="text-green-500 mb-1" />
          <div className="text-xl font-bold text-green-600">{stats.totalOrders}</div>
          <div className="text-xs text-gray-600 text-center">Đơn hoàn thành</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg flex flex-col items-center justify-center">
          <Icon icon="zi-poll" className="text-blue-500 mb-1" />
          <div className="text-xl font-bold text-blue-600">{stats.totalWeight} kg</div>
          <div className="text-xs text-gray-600 text-center">Đã {isDriver ? "thu gom" : "tái chế"}</div>
        </div>
      </div>
      <div className="mt-3 bg-orange-50 p-3 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-200 p-1.5 rounded-full text-orange-600">
            <Icon icon="zi-wallet" size={20} />
          </div>
          <span className="text-sm font-medium text-orange-800">Tổng {isDriver ? "thu nhập" : "doanh thu"}</span>
        </div>
        <div className="text-lg font-bold text-orange-600">{stats.totalRevenue.toLocaleString('vi-VN')} đ</div>
      </div>
      {!isDriver && stats.totalWeight > 0 && (
        <div className="mt-4 text-xs text-center text-green-700 bg-green-100/50 p-2.5 rounded-lg border border-green-200">
          🌱 Tuyệt vời! Bạn đã giúp giảm thiểu {(stats.totalWeight * 2.5).toFixed(1)} kg CO2 ra môi trường!
        </div>
      )}
    </div>
  );
}