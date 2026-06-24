import ProfileActions from "./actions";
import UserInfo from "./user-info";
import { List, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userInfoState } from "@/state";
import { openPhone, openWebview } from "zmp-sdk/apis";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAtomValue(userInfoState) as any;
  const isDriver = user?.role === 2;
  const isAdmin = user?.role === 3;

  return (
    <div className="min-h-full bg-background p-4 space-y-2.5">
      <UserInfo />
      
      <div className="bg-white rounded-xl shadow-sm border-[0.5px] border-black/10 overflow-hidden">
        <List noSpacing>
          <List.Item
            title={isDriver ? "Thống kê thu nhập" : "Thống kê bán phế liệu"}
            prefix={<Icon icon="zi-poll" className="text-orange-500" />}
            suffix={<Icon icon="zi-chevron-right" />}
            onClick={() => navigate("/stats")}
          />
          {isAdmin && (
            <List.Item
              title="Quản lý hệ thống (Admin)"
              prefix={<Icon icon="zi-setting" className="text-blue-500" />}
              suffix={<Icon icon="zi-chevron-right" />}
              onClick={() => navigate("/admin")}
            />
          )}
        </List>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-[0.5px] border-black/10 overflow-hidden">
        <div className="p-4 font-bold text-sm text-gray-800">Liên hệ với chúng tôi</div>
        <List noSpacing>
          <List.Item
            title="Số điện thoại"
            prefix={<Icon icon="zi-call" className="text-green-500" />}
            suffix={<span className="text-sm font-medium text-gray-600">0982556820</span>}
            onClick={() => openPhone({ phoneNumber: "0982556820" })}
          />
          <List.Item
            title="Email"
            prefix={<Icon icon={"zi-mail-solid" as any} className="text-blue-500" />}
            suffix={<span className="text-sm font-medium text-gray-600 break-all">buidinhnam31102005@gmail.com</span>}
            onClick={() => openWebview({ url: "mailto:buidinhnam31102005@gmail.com" })}
          />
        </List>
      </div>

      <ProfileActions />
    </div>
  );
}
