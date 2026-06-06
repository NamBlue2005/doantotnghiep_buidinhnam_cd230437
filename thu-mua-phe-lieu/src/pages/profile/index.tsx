import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import Points from "./points";
import UserInfo from "./user-info";
import { List, Icon } from "zmp-ui";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userInfoState } from "@/state";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAtomValue(userInfoState) as any;
  const isDriver = user?.role === 2;
  const isAdmin = user?.role === 3;

  return (
    <div className="min-h-full bg-background p-4 space-y-2.5">
      <UserInfo>
        <Points />
      </UserInfo>
      
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

      <ProfileActions />
      <FollowOA />
    </div>
  );
}
