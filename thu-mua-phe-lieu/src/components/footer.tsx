import { HomeIcon, PackageIcon } from "./vectors";
import HorizontalDivider from "./horizontal-divider";
import TransitionLink from "./transition-link";
import { useRouteHandle } from "@/hooks";
import { Icon } from "zmp-ui";
import { useAtomValue, useSetAtom } from "jotai";
import { notificationsState, notificationRefreshKeyState, userInfoState } from "@/state";
import { useMemo, useEffect, useState } from "react";
import { loadable } from "jotai/utils";

const NotificationIcon = (props: { active: boolean }) => {
  const notificationsList = useAtomValue(
    useMemo(() => loadable(notificationsState), [])
  );
  const setRefresh = useSetAtom(notificationRefreshKeyState);
  const [lastCount, setLastCount] = useState(0);

  // Tự động làm mới thông báo dưới ngầm (10s/lần) để lấy dữ liệu real-time qua lại giữa 2 máy
  useEffect(() => {
    const interval = setInterval(() => setRefresh((prev) => prev + 1), 10000);
    return () => clearInterval(interval);
  }, [setRefresh]);

  // Mẹo giữ lại số lượng cũ khi đang tải để số không bị nhấp nháy biến mất
  useEffect(() => {
    if (notificationsList.state === "hasData") setLastCount(notificationsList.data.filter((n: any) => !n.isRead).length);
  }, [notificationsList]);

  const count = notificationsList.state === "hasData" ? notificationsList.data.filter((n: any) => !n.isRead).length : lastCount;

  return (
    <div className="relative inline-flex items-center justify-center">
      <Icon icon="zi-notif" className={props.active ? "text-primary" : "text-gray-500"} />
      {count > 0 && (
        <div className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full border-[1.5px] border-background">
          {count > 99 ? "99+" : count}
        </div>
      )}
    </div>
  );
};

const SELLER_NAV_ITEMS = [
  {
    name: "Trang chủ",
    path: "/",
    icon: HomeIcon,
  },
  {
    name: "Thông báo",
    path: "/notifications",
    icon: NotificationIcon,
  },
  {
    name: "Tôi bán",
    path: "/sell",
    icon: (props: any) => (
      <div className={`flex items-center justify-center rounded-full p-2 mb-1 shadow-sm ${props.active ? "bg-primary text-white" : "bg-blue-100 text-primary"}`}>
        <Icon icon="zi-plus" size={20} />
      </div>
    ),
  },
  {
    name: "Đơn hàng",
    path: "/orders",
    icon: PackageIcon,
  },
  {
    name: "Tài khoản",
    path: "/profile",
    icon: (props: any) => <Icon icon="zi-user" className={props.active ? "text-primary" : "text-gray-500"} />,
  },
];

const DRIVER_NAV_ITEMS = [
  {
    name: "Trang chủ",
    path: "/",
    icon: HomeIcon,
  },
  {
    name: "Thông báo",
    path: "/notifications",
    icon: NotificationIcon,
  },
  {
    name: "Tìm đơn",
    path: "/driver-home",
    icon: (props: any) => (
      <div className={`flex items-center justify-center rounded-full p-2 mb-1 shadow-sm ${props.active ? "bg-primary text-white" : "bg-blue-100 text-primary"}`}>
        <Icon icon="zi-search" size={20} />
      </div>
    ),
  },
  {
    name: "Đơn nhận",
    path: "/orders",
    icon: PackageIcon,
  },
  {
    name: "Tài khoản",
    path: "/profile",
    icon: (props: any) => <Icon icon="zi-user" className={props.active ? "text-primary" : "text-gray-500"} />,
  },
];

export default function Footer() {
  const [handle] = useRouteHandle();
  const user = useAtomValue(userInfoState) as any;
  const navItems = user?.role === 2 ? DRIVER_NAV_ITEMS : SELLER_NAV_ITEMS;

  if (!handle?.noFooter) {
    return (
      <>
        <HorizontalDivider />
        <div
          className="w-full px-4 pt-2 grid pb-sb"
          style={{
            gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
          }}
        >
          {navItems.map((item) => {
            return (
              <TransitionLink
                to={item.path}
                key={item.path}
                className="flex flex-col items-center space-y-0.5 p-1 pb-0.5 cursor-pointer active:scale-105"
              >
                {({ isActive }) => (
                  <>
                    <div className="w-6 h-6 flex justify-center items-center">
                      <item.icon active={isActive} />
                    </div>
                    <div
                      className={`text-2xs ${isActive ? "text-primary" : ""}`}
                    >
                      {item.name}
                    </div>
                  </>
                )}
              </TransitionLink>
            );
          })}
        </div>
      </>
    );
  }
}
