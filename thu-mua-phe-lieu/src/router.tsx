import Layout from "@/components/layout";
import CartPage from "@/pages/cart";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { getBasePath } from "@/utils/zma";
import OrdersPage from "./pages/orders";
import ShippingAddressPage from "./pages/cart/shipping-address";
import OrderDetailPage from "./pages/orders/detail";
import ProfileEditorPage from "./pages/profile/editor";
import DriverHomePage from "./pages/driver";
import NotificationsPage from "./pages/notifications";
import StatsPage from "./pages/stats";
import AdminPage from "./pages/admin";
import { userInfoState } from "@/state";
import toast from "react-hot-toast";

function SellerOnlyRoute(props: { children: JSX.Element }) {
  const user = useAtomValue(userInfoState) as any;

  useEffect(() => {
    if (user && user.role !== 1) {
      toast.error("Chỉ người bán mới được đăng đơn thu mua.");
    }
  }, [user?.role]);

  if (user && user.role !== 1) {
    return <Navigate to="/" replace />;
  }

  return props.children;
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          handle: {
            logo: true,
            search: true,
          },
        },
        {
          path: "/notifications",
          element: <NotificationsPage />,
          handle: {
            title: "Thông báo",
          },
        },
        {
          path: "/sell",
          element: (
            <SellerOnlyRoute>
              <CartPage />
            </SellerOnlyRoute>
          ),
          handle: {
            title: "Tôi bán",
            backRoute: "/",
          },
        },
        {
          path: "/orders/:status?",
          element: <OrdersPage />,
          handle: {
            title: "Đơn hàng",
          },
        },
        {
          path: "/order/:id",
          element: <OrderDetailPage />,
          handle: {
            title: "Thông tin đơn hàng",
          },
        },
        {
          path: "/driver-home",
          element: <DriverHomePage />,
          handle: {
            title: "Tìm đơn quanh đây",
          },
        },
        {
          path: "/cart",
          element: (
            <SellerOnlyRoute>
              <CartPage />
            </SellerOnlyRoute>
          ),
          handle: {
            title: "Tạo đơn thu mua",
            backRoute: "/",
            noFloatingCart: true,
          },
        },
        {
          path: "/shipping-address",
          element: <ShippingAddressPage />,
          handle: {
            title: "Địa chỉ nhận hàng",
            noFooter: true,
            noFloatingCart: true,
          },
        },
        {
          path: "/profile",
          element: <ProfilePage />,
          handle: {
            logo: true,
          },
        },
        {
          path: "/profile/edit",
          element: <ProfileEditorPage />,
          handle: {
            title: "Thông tin tài khoản",
            noFooter: true,
            noFloatingCart: true,
          },
        },
      {
        path: "/stats",
        element: <StatsPage />,
        handle: {
          title: "Thống kê",
        },
      },
      {
        path: "/admin",
        element: <AdminPage />,
        handle: {
          title: "Quản trị hệ thống",
          noFooter: true,
        },
      },
      ],
    },
  ],
  { basename: getBasePath() }
);

export default router;
