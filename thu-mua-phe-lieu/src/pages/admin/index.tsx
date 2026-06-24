import { API_BASE_URL, userInfoState } from "@/state";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { List, Tabs, Icon } from "zmp-ui";
import CategoryManager from "./categories";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userInfoState) as any;

  const fetchData = async () => {
    try {
      const [resUsers, resOrders] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers: { "ngrok-skip-browser-warning": "true" } }),
        fetch(`${API_BASE_URL}/orders/all`, { headers: { "ngrok-skip-browser-warning": "true" } }).catch(() => null)
      ]);

      if (resUsers.ok) setUsers(await resUsers.json());
      if (resOrders && resOrders.ok) setOrders(await resOrders.json());
    } catch (error) {
      toast.error("Lỗi lấy dữ liệu hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeRole = async (userId: number, newRole: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success("Cập nhật quyền thành công!");
        fetchData();
      } else {
        toast.error("Lỗi khi cập nhật quyền");
      }
    } catch (error) {
      toast.error("Không thể kết nối đến máy chủ");
    }
  };

  if (currentUser?.role !== 3) {
    return <div className="p-4 text-center text-red-500 mt-10">Bạn không có quyền truy cập trang này!</div>;
  }

  // Tính toán thống kê toàn hệ thống
  const totalSystemOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalSystemWeight = completedOrders.reduce((sum, o) => sum + Number(o.actualWeight || o.estimatedWeight || 0), 0);
  const totalSystemRevenue = completedOrders.reduce((sum, o) => sum + Number(o.amount || o.totalAmount || ((o.actualWeight || o.estimatedWeight || 0) * 5000)), 0);

  return (
    <div className="h-full flex flex-col bg-background pb-10">
      <div className="p-4 bg-white shadow-sm flex-none">
        <h2 className="font-bold text-lg text-primary">Quản trị hệ thống</h2>
        <p className="text-sm text-gray-500">Báo cáo & Phân quyền</p>
      </div>
      
      <div className="flex-1 bg-white mt-2 overflow-hidden">
        <Tabs id="admin-tabs" className="h-full flex flex-col">
          <Tabs.Tab key="stats" label="Báo cáo">
            <div className="p-4 space-y-4 bg-gray-50 h-full overflow-y-auto pb-20">
              <h3 className="font-bold text-gray-800">Thống kê toàn hệ thống</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <Icon icon="zi-poll" className="text-blue-500 mb-2" size={28} />
                  <div className="text-2xl font-bold text-blue-600">{totalSystemOrders}</div>
                  <div className="text-xs text-gray-500 mt-1">Tổng số đơn hàng</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <Icon icon="zi-check-circle-solid" className="text-green-500 mb-2" size={28} />
                  <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Đơn hoàn thành</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center col-span-2">
                  <Icon icon={"zi-star-solid" as any} className="text-orange-500 mb-2" size={28} />
                  <div className="text-2xl font-bold text-orange-600">{totalSystemWeight.toLocaleString('en-US')} kg</div>
                  <div className="text-xs text-gray-500 mt-1">Tổng khối lượng phế liệu thu gom</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center col-span-2">
                  <Icon icon={"zi-wallet" as any} className="text-red-500 mb-2" size={28} />
                  <div className="text-2xl font-bold text-red-600">{totalSystemRevenue.toLocaleString('en-US')} đ</div>
                  <div className="text-xs text-gray-500 mt-1">Tổng dòng tiền giao dịch</div>
                </div>
              </div>
            </div>
          </Tabs.Tab>

          <Tabs.Tab key="orders" label="Đơn hàng">
            <div className="h-full overflow-y-auto bg-gray-50 p-3 space-y-3 pb-20">
              {orders.length === 0 && !loading ? (
                <div className="text-center text-gray-500 mt-10">Chưa có dữ liệu đơn hàng</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                      <span className="font-bold text-primary">{order.orderCode || `OD${String(order.id).padStart(8, '0')}`}</span>
                      <span className={`text-2xs font-semibold px-2 py-1 rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        (order.status === 'MATCHED' || order.status === 'SHIPPING') ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status === 'PENDING' ? 'CHỜ NHẬN' : order.status}
                      </span>
                    </div>
                    <div className="text-sm space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Người bán:</span> 
                        <span className="font-medium text-gray-800 text-xs">{order.seller?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Tài xế:</span> 
                        <span className="font-medium text-gray-800 text-xs">{order.matchedDriver?.fullName || "Chưa có"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-xs">Khối lượng:</span> 
                        <span className="font-medium text-gray-800 text-xs">{Number(order.estimatedWeight).toLocaleString('en-US')} kg</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-50 text-right">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs.Tab>

          <Tabs.Tab key="categories" label="Danh mục">
            <CategoryManager />
          </Tabs.Tab>

          <Tabs.Tab key="users" label="Người dùng">
            <div className="h-full overflow-y-auto pb-20">
              <List className="bg-white">
                {users.map((u) => (
                  <List.Item
                    key={u.id}
                    title={u.fullName || "Người dùng ẩn danh"}
                    subTitle={
                      (<div className="space-y-0.5">
                        <div>{u.phone || "Chưa có số điện thoại"}</div>
                        <div className="text-gray-400 text-xs">ID: {String(u.id).padStart(10, '0')}</div>
                      </div>) as any
                    }
                    prefix={<img src={u.avatarUrl || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full border border-gray-200" />}
                  >
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-gray-600">Phân quyền:</span>
                      <select 
                        className="border border-gray-300 p-1.5 text-xs rounded bg-gray-50 text-primary font-medium focus:outline-none"
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, Number(e.target.value))}
                        disabled={u.id === currentUser.id} // Không cho admin tự giáng chức chính mình
                      >
                        <option value={1}>Người bán</option>
                        <option value={2}>Tài xế</option>
                        <option value={3}>Admin</option>
                      </select>
                    </div>
                  </List.Item>
                ))}
              </List>
            </div>
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  );
}
