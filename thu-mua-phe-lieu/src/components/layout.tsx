import { Navigate, Outlet, useLocation } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import { Suspense } from "react";
import { PageSkeleton } from "./skeleton";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./scroll-restoration";
import { useAtomValue } from "jotai";
import { loadableUserInfoState } from "@/state";

export default function Layout() {
  const location = useLocation();
  const userInfo = useAtomValue(loadableUserInfoState);

  // Nếu là Admin và đang ở Trang chủ hoặc Trang cá nhân, tự động chuyển hướng sang trang Quản lý người dùng
  if (userInfo.state === "hasData" && userInfo.data?.role === 3 && (location.pathname === "/" || location.pathname === "/profile")) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-section text-foreground">
      <Header />
      <div className="flex-1 overflow-y-auto bg-background">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
      <Toaster
        containerClassName="toast-container"
        containerStyle={{
          top: "calc(50% - 24px)",
        }}
      />
      <ScrollRestoration />
    </div>
  );
}
