import CONFIG from "@/config";
import { API_BASE_URL, userInfoKeyState, userInfoState } from "@/state";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "zmp-ui";

function ProfileEditorPage() {
  const navigate = useNavigate();
  const userInfo = useAtomValue(userInfoState);
  const setUserInfoKey = useSetAtom(userInfoKeyState);
  const refreshUserInfo = () => setUserInfoKey((key) => key + 1);

  return (
    <form
      className="h-full flex flex-col justify-between"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const newUserInfo = { ...userInfo };
        data.forEach((value, key) => {
          newUserInfo[key] = value;
        });
        
        // ĐỒNG BỘ THÔNG TIN MỚI LÊN BACKEND
        try {
          await fetch(`${API_BASE_URL}/users/${userInfo?.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({
              phone: newUserInfo.phone,
              fullName: newUserInfo.name,
              email: newUserInfo.email,
              address: newUserInfo.address
            })
          });
        } catch (error) {
          console.error("Lỗi đồng bộ thông tin lên Backend:", error);
        }

        localStorage.setItem(
          CONFIG.STORAGE_KEYS.USER_INFO,
          JSON.stringify(newUserInfo)
        );
        refreshUserInfo();
        toast.success("Đã cập nhật thông tin tài khoản");
        navigate(-1);
      }}
    >
      <div className="bg-section p-4 grid gap-4">
        <Input 
          name="name" 
          label="Họ tên (Đồng bộ từ Zalo)" 
          value={userInfo?.name} 
          disabled 
        />
        <Input
          name="phone"
          label="Số điện thoại"
          required
          defaultValue={userInfo?.phone}
        />
        <Input
          name="email"
          label="Email"
          placeholder="Email"
          defaultValue={userInfo?.email}
        />
        <Input
          name="address"
          label="Địa chỉ"
          placeholder="Nhập dịa chỉ"
          defaultValue={userInfo?.address}
        />
      </div>
      <div className="p-6 pt-4 bg-section">
        <Button htmlType="submit" fullWidth>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}

export default ProfileEditorPage;
