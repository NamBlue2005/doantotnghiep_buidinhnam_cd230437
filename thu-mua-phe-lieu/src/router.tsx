import Layout from "@/components/layout";
import CartPage from "@/pages/cart";
import ProductDetailPage from "@/pages/catalog/product-detail";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import { createBrowserRouter } from "react-router-dom";
import { getBasePath } from "@/utils/zma";
import OrdersPage from "./pages/orders";
import ShippingAddressPage from "./pages/cart/shipping-address";
import OrderDetailPage from "./pages/orders/detail";
import ProfileEditorPage from "./pages/profile/editor";
import DriverHomePage from "./pages/driver";
import NotificationsPage from "./pages/notifications";
import StatsPage from "./pages/stats";

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
          element: <CartPage />, // Tạm trỏ nút Tôi bán vào trang Tạo đơn
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
          element: <CartPage />,
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
          path: "/product/:id",
          element: <ProductDetailPage />,
          handle: {
            scrollRestoration: 0, // when user selects another product in related products, scroll to the top of the page
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
      ],
    },
  ],
  { basename: getBasePath() }
);

export default router;
