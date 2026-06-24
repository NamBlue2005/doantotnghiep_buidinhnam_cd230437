import { atom } from "jotai";
import {
  atomFamily,
  atomWithRefresh,
  atomWithStorage,
  loadable,
  unwrap,
} from "jotai/utils";
import {
  Cart,
  Category,
  Delivery,
  Location,
  Order,
  OrderStatus,
  Product,
  ShippingAddress,
  Station,
  UserInfo,
} from "@/types";
import { requestWithFallback } from "@/utils/request";
import {
  getLocation,
  getPhoneNumber,
  getSetting,
  getUserInfo,
  authorize,
} from "zmp-sdk/apis";
import toast from "react-hot-toast";
import { calculateDistance } from "./utils/location";
import { formatDistant } from "./utils/format";
import CONFIG from "./config";

// Nhúng trực tiếp file ảnh local (Đảm bảo thư mục img nằm trong thư mục src)
import bannerImg from "@/img/banner 1.jpg";

// CHÚ Ý: Dán URL ngrok của bạn vào đây khi DEPLOY
// Ví dụ: "https://abcdef.ngrok-free.app/api"
// Thay thế bằng link Ngrok của bạn (Nhớ giữ lại chữ /api ở cuối nhé)
 
// export const API_BASE_URL = "http://localhost:8081/api";
// export const API_BASE_URL = "http://192.168.0.101:8081/api"; 

// Link NGROK mới để test trên điện thoại không bị lỗi Mixed Content
export const API_BASE_URL = "https://marbles-pancreas-sandpaper.ngrok-free.dev/api";

export const userInfoKeyState = atom(0);

export const userInfoState = atom<Promise<UserInfo>>(async (get) => {
  get(userInfoKeyState);

  const {
    authSetting: {
      "scope.userInfo": grantedUserInfo,
      "scope.userPhonenumber": grantedPhoneNumber,
      "scope.userLocation": grantedUserLocation,
    },
  } = await getSetting({});
  const isDev = !window.ZJSBridge;

  // Lấy các thông tin bổ sung (địa chỉ, email...) từ localStorage nếu có
  const savedUserInfoStr = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  const savedUserInfo = savedUserInfoStr ? JSON.parse(savedUserInfoStr) : {};

  // ÉP ĐIỆN THOẠI HIỂN THỊ BẢNG XIN QUYỀN NẾU CHƯA CÓ
  if (!isDev && (!grantedUserInfo || !grantedUserLocation)) {
    try {
      await authorize({ scopes: ["scope.userInfo", "scope.userPhonenumber", "scope.userLocation"] });
    } catch (error) {}
  }

  try {
    // Người dùng cho phép truy cập tên và ảnh đại diện
    const { userInfo } = await getUserInfo({});
    const phone =
      grantedPhoneNumber || isDev // Người dùng cho phép truy cập số điện thoại
        ? await get(phoneState)
        : "";

    // Gọi API lưu/đăng nhập User vào Database thật của bạn
    let dbUserId = userInfo.id; // Mặc định dùng id của Zalo nếu lỗi
    let dbUserRole = 1;

    // FIX LỖI TRÙNG TÀI KHOẢN: Dịch ID Zalo (chứa chữ cái) thành chuỗi số độc nhất
    // Để Backend tách riêng máy tính (Tài xế) và điện thoại thật (Người bán)
    const numberId = userInfo.id.split('').map(c => c.charCodeAt(0)).join('');
    const uniquePhone = isDev ? "0912345678" : "09" + numberId.substring(0, 8);

    // FIX LOGIC: Dùng số điện thoại đã lưu trong Trang cá nhân để đăng nhập
    // Nếu người dùng mới vào lần đầu (chưa có số ở trang cá nhân), dùng số tạo từ Zalo ID
    const loginPhone = savedUserInfo.phone || phone || uniquePhone;

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({
          phone: loginPhone,
          fullName: userInfo.name,
          avatarUrl: userInfo.avatar,
          zaloId: userInfo.id // Truyền thêm ID thật của Zalo xuống Backend
        })
      });
      const dbUser = await response.json();
      dbUserId = dbUser.id; // Ghi đè bằng ID thật (số) từ MySQL
      dbUserRole = dbUser.role; // Lấy role từ Backend
    } catch (error) {
      console.error("Lỗi đăng nhập Backend:", error);
    }

    // Luôn ưu tiên Tên và Ảnh đại diện thật từ Zalo
    return {
      id: dbUserId as any, // Dùng ID của MySQL thay vì ID chuỗi của Zalo
      role: dbUserRole, // Luôn lấy quyền từ Database của Backend
      name: userInfo.name,
      avatar: userInfo.avatar,
      phone: loginPhone,
      email: savedUserInfo.email || "",
      address: savedUserInfo.address || "",
    };
  } catch (error) {
    console.error("Lỗi lấy thông tin Zalo:", error);
    return savedUserInfo;
  }
});

export const loadableUserInfoState = loadable(userInfoState);

export const phoneState = atom(async () => {
  let phone = "";
  try {
    const { token } = await getPhoneNumber({});
    // Phía tích hợp làm theo hướng dẫn tại https://mini.zalo.me/documents/api/getPhoneNumber/ để chuyển đổi token thành số điện thoại người dùng ở server.
    // phone = await decodeToken(token);

    // Các bước bên dưới để demo chức năng, phía tích hợp có thể bỏ đi sau.
    // toast(
    //   "Đã lấy được token chứa số điện thoại người dùng. Phía tích hợp cần decode token này ở server. Giả lập số điện thoại 0912345678...",
    //   {
    //     icon: "ℹ",
    //     duration: 10000,
    //   }
    // );
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    phone = "0912345678";
    // End demo
  } catch (error) {
    console.warn(error);
  }
  return phone;
});

export const bannersState = atom(() => [
  bannerImg,
]);

export const tabsState = atom(["Tất cả", "Nam", "Nữ", "Trẻ em"]);

export const selectedTabIndexState = atom(0);

export const categoriesState = atom(async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store"
    });
    if (!response.ok) {
      console.error("Lỗi tải danh mục từ Backend");
      return [];
    }
    const categories = await response.json();
    if (!Array.isArray(categories)) {
      return [];
    }
    // Map `imageUrl` từ backend sang `icon` để tương thích với giao diện
    return categories.map((cat: any) => ({
      ...cat,
      icon: cat.imageUrl
    }));
  } catch (error) {
    console.error("Lỗi kết nối khi tải danh mục:", error);
    return [];
  }
});

export const categoriesStateUpwrapped = unwrap(
  categoriesState,
  (prev) => prev ?? []
);

export const productsState = atom(async (get) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scrap-products`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store"
    });
    if (!response.ok) {
      console.error("Lỗi tải danh sách sản phẩm từ Backend");
      return [];
    }
    const products = await response.json();
    if (!Array.isArray(products)) return [];
    // Map lại dữ liệu để tương thích với các component khác
    return products.map((p: any) => ({
      ...p,
      categoryId: p.category?.id // Thêm categoryId để bộ lọc hoạt động
    }));
  } catch (error) {
    console.error("Lỗi kết nối khi tải sản phẩm:", error);
    return [];
  }
});

export const flashSaleProductsState = atom((get) => get(productsState));

export const recommendedProductsState = atom((get) => get(productsState));

export const productState = atomFamily((id: number) =>
  atom(async (get) => {
    const products = await get(productsState);
    return products.find((product) => product.id === id);
  })
);

export const cartState = atom<Cart>([]);

export const selectedCartItemIdsState = atom<number[]>([]);

export const cartTotalState = atom((get) => {
  const items = get(cartState);
  return {
    totalItems: items.length,
    totalAmount: items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ),
  };
});

export const keywordState = atom("");

export const searchResultState = atom(async (get) => {
  const keyword = get(keywordState);
  const products = await get(productsState);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase())
  );
});

export const productsByCategoryState = atomFamily((id: String) =>
  atom(async (get) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const products = await get(productsState);
    return products.filter((product) => String(product.categoryId) === id);
  })
);

export const stationsState = atom(async () => {
  let location: Location | undefined;
  try {
    const { token } = await getLocation({});
    // Phía tích hợp làm theo hướng dẫn tại https://mini.zalo.me/documents/api/getLocation/ để chuyển đổi token thành thông tin vị trí người dùng ở server.
    // location = await decodeToken(token);

    // Các bước bên dưới để demo chức năng, phía tích hợp có thể bỏ đi sau.
    toast(
      "Đã lấy được token chứa thông tin vị trí người dùng. Phía tích hợp cần decode token này ở server. Giả lập vị trí tại VNG Campus...",
      {
        icon: "ℹ",
        duration: 10000,
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    location = {
      lat: 10.773756,
      lng: 106.689247,
    };
    // End demo
  } catch (error) {
    console.warn(error);
  }

  const stations = await requestWithFallback<Station[]>("/stations", []);
  const stationsWithDistance = stations.map((station) => ({
    ...station,
    distance: location
      ? formatDistant(
          calculateDistance(
            location.lat,
            location.lng,
            station.location.lat,
            station.location.lng
          )
        )
      : undefined,
  }));

  return stationsWithDistance;
});

export const selectedStationIndexState = atom(0);

export const selectedStationState = atom(async (get) => {
  const index = get(selectedStationIndexState);
  const stations = await get(stationsState);
  return stations[index];
});

export const shippingAddressState = atomWithStorage<
  ShippingAddress | undefined
>(CONFIG.STORAGE_KEYS.SHIPPING_ADDRESS, undefined);

export const savedAddressesState = atomWithStorage<ShippingAddress[]>(
  CONFIG.STORAGE_KEYS.SHIPPING_ADDRESS + "_list",
  []
);

export const deliveryTimeState = atom<string>("");

export const orderNoteState = atom<string>("");

export const orderRefreshKeyState = atom(0);

export const notificationRefreshKeyState = atom(0);

export const notificationsState = atom(async (get) => {
  get(notificationRefreshKeyState);
  const user = await get(userInfoState);
  
  if (!user || !user.id || user.id === "undefined") {
    return [];
  }
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${user.id}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store"
    });
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    return [];
  }
});

export const userStatsState = atom(async (get) => {
  get(orderRefreshKeyState); // Lắng nghe sự thay đổi của đơn hàng để tự làm mới
  const user = await get(userInfoState);
  
  if (!user || !user.id || user.id === "undefined") {
    return null;
  }
  try {
    // Gọi API lấy danh sách đơn hàng thay vì gọi API stats cũ để lọc được trạng thái
    let url = `${API_BASE_URL}/orders/seller/${user.id}`;
    if (user.role === 2) {
      url = `${API_BASE_URL}/orders/driver/${user.id}`;
    }
    const response = await fetch(url, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store"
    });
    if (response.ok) {
      const allOrders = await response.json();
      if (!Array.isArray(allOrders)) return { totalOrders: 0, totalWeight: 0, totalRevenue: 0 };
      
      // CHỈ LỌC NHỮNG ĐƠN HÀNG CÓ TRẠNG THÁI "COMPLETED" (Đã hoàn thành)
      const completedOrders = allOrders.filter((o: any) => String(o.status || "").toUpperCase() === 'COMPLETED');
      
      let totalWeight = 0;
      let totalRevenue = 0;
      completedOrders.forEach((order: any) => {
        // Ưu tiên dùng khối lượng thực tế để thống kê
        totalWeight += order.actualWeight || order.estimatedWeight || 0;
        
        // Sửa lỗi: Dùng `!= null` để xử lý đúng trường hợp `amount` là 0, tránh tính lại theo giá tạm tính
        totalRevenue += order.amount != null ? order.amount : (order.totalAmount || 0);
      });
      return { totalOrders: completedOrders.length, totalWeight, totalRevenue };
    }
    return { totalOrders: 0, totalWeight: 0, totalRevenue: 0 };
  } catch (error) {
    console.error("Lỗi lấy thống kê:", error);
    return { totalOrders: 0, totalWeight: 0, totalRevenue: 0 };
  }
});

export const ordersState = atomFamily((status: OrderStatus) =>
  atom(async (get) => {
    get(orderRefreshKeyState); // Lắng nghe sự thay đổi để tự động gọi lại API
    const user = await get(userInfoState); // Lấy thông tin user hiện tại

    // BỌC LÓT 1: Nếu chưa có thông tin người dùng thì thoát luôn, không gọi API
    if (!user || !user.id || user.id === "undefined") {
      console.log("Chưa có User ID, tạm dừng gọi API lấy danh sách đơn hàng");
      return [];
    }

    try {
      // 1. GỌI API THỰC TẾ ĐẾN BACKEND SPRING BOOT
      let url = `${API_BASE_URL}/orders/seller/${user.id}`;
      if (user.role === 2) {
        url = `${API_BASE_URL}/orders/driver/${user.id}`; // Lấy đơn của Tài xế
      }
      const response = await fetch(url, {
        headers: { "ngrok-skip-browser-warning": "true" },
        cache: "no-store" // Ép trình duyệt không dùng dữ liệu cũ
      });
      const realOrders = await response.json();
      
      // In ra Console để bạn nhìn thấy "Thành quả" Backend trả về
      console.log("🔥 Dữ liệu thật từ Backend:", realOrders);

      // BỌC LÓT 2: Nếu Backend trả về lỗi 500 (Object báo lỗi) thay vì mảng danh sách, dừng lại ngay!
      if (!Array.isArray(realOrders)) {
        return [];
      }

      // 2. Format lại dữ liệu Backend để giao diện cũ không bị sập (Crash)
      const mappedOrders = realOrders.map((order: any) => {
        const finalAmount = order.amount || order.totalAmount || 0;

        // Lọc ra các item hợp lệ (có product không bị null)
        const validItems = order.items ? order.items.filter((item: any) => item.product) : [];

        const mappedItems = validItems.length > 0
          ? validItems.map((orderItem: any) => ({
              product: {
                id: orderItem.product.id, // Lấy ID sản phẩm
                name: `Thu mua ${orderItem.product.name || 'Phế liệu'}`, // Lấy tên sản phẩm
                price: orderItem.product.price || 0, // Lấy giá sản phẩm
                image: orderItem.product.imageUrl || order.imageUrl || "https://img.freepik.com/free-vector/recycle-symbol_1284-43093.jpg",
                categoryId: orderItem.product.category?.id // Lấy categoryId từ product
              },
              quantity: orderItem.weight // Đây là khối lượng của từng loại
            }))
          : [{ // Fallback cho các đơn hàng cũ (không có item nào hợp lệ)
              product: { id: 0, name: `Thu mua Phế liệu`, price: 0, image: order.imageUrl || "https://img.freepik.com/free-vector/recycle-symbol_1284-43093.jpg", categoryId: 0 },
              quantity: order.actualWeight || order.estimatedWeight
            }];

        return {
          ...order,
          originalStatus: order.status, // Giữ lại trạng thái gốc (CANCELLED)
          // Map trạng thái Backend -> Frontend để các Tab hiển thị đúng
          status: (order.status === 'PENDING' || order.status === 'HAS_OFFERS') ? 'pending' : (order.status === 'COMPLETED' || order.status === 'CANCELLED' ? 'completed' : 'shipping'),
          items: mappedItems,
          note: order.note, // Đảm bảo trường ghi chú được truyền qua
          total: finalAmount
        };
      });

      // Sắp xếp các đơn hàng, đơn mới nhất sẽ lên trên cùng
      const sortedOrders = mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return sortedOrders.filter((order: any) => order.status === status);
    } catch (error) {
      console.error("❌ Lỗi khi kết nối Backend:", error);
      return [];
    }
  })
);

export const availableOrdersState = atom(async (get) => {
  get(orderRefreshKeyState); // Lắng nghe sự thay đổi để tự động gọi lại API
  try {
    const response = await fetch(`${API_BASE_URL}/orders/available`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      cache: "no-store" // Ép trình duyệt không dùng dữ liệu cũ
    });
    const realOrders = await response.json();
    
    // BỌC LÓT: Chống sập App nếu API bị lỗi
    if (!Array.isArray(realOrders)) {
      return [];
    }

    // Tái sử dụng logic map của ordersState để đảm bảo tính nhất quán
    const mappedOrders = realOrders.map((order: any) => {
      const validItems = order.items ? order.items.filter((item: any) => item.product) : [];

      const mappedItems = validItems.length > 0
        ? validItems.map((orderItem: any) => ({
            product: {
              id: orderItem.product.id,
              name: `Thu mua ${orderItem.product.name || 'Phế liệu'}`,
              price: orderItem.product.price || 0,
              image: orderItem.product.imageUrl || order.imageUrl || "https://img.freepik.com/free-vector/recycle-symbol_1284-43093.jpg",
              categoryId: orderItem.product.category?.id
            },
            quantity: orderItem.weight
          }))
        : [{ product: { id: 0, name: `Thu mua Phế liệu`, price: 0, image: order.imageUrl || "https://img.freepik.com/free-vector/recycle-symbol_1284-43093.jpg", categoryId: 0 }, quantity: order.estimatedWeight }];

      return {
        ...order,
        originalStatus: order.status,
        status: 'pending', // Các đơn available đều đang ở trạng thái chờ
        note: order.note, // Đảm bảo trường ghi chú được truyền qua
        items: mappedItems,
        total: 0
      };
    });
    // Sắp xếp các đơn hàng, đơn mới nhất sẽ lên trên cùng
    const sortedOrders = mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sortedOrders;
  } catch (error) {
    console.error("❌ Lỗi khi lấy đơn hàng cho tài xế:", error);
    return [];
  }
});

export const deliveryModeState = atomWithStorage<Delivery["type"]>(
  CONFIG.STORAGE_KEYS.DELIVERY,
  "shipping"
);
