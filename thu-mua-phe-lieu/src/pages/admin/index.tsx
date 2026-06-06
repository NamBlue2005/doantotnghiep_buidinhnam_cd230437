import { API_BASE_URL, userInfoState } from "@/state";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { List } from "zmp-ui";

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAtomValue(userInfoState) as any;

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      toast.error("Lỗi lấy danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
        fetchUsers();
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

  return (
    <div className="h-full overflow-y-auto bg-background pb-10">
      <div className="p-4 bg-white mb-2 shadow-sm">
        <h2 className="font-bold text-lg text-primary">Quản lý người dùng</h2>
        <p className="text-sm text-gray-500">Chỉnh sửa phân quyền hệ thống</p>
      </div>
      <List className="bg-white">
        {users.map((u) => (
          <List.Item
            key={u.id}
            title={u.fullName || "Người dùng ẩn danh"}
            subTitle={u.phone || "Chưa có số điện thoại"}
            prefix={<img src={u.avatarUrl || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full border" />}
          >
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-medium text-gray-600">Phân quyền:</span>
              <select 
                className="border border-gray-300 p-1 text-sm rounded bg-gray-50 text-primary font-medium focus:outline-none"
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
  );
}