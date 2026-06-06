import {
  OrderHistoryIcon,
  PackageIcon,
  VoucherIcon,
} from "@/components/vectors";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userInfoState } from "@/state";

export default function ProfileActions() {
  const navigate = useNavigate();
  const user = useAtomValue(userInfoState) as any;

  return (
    <div className="bg-white rounded-lg p-4 flex justify-around gap-4 border-[0.5px] border-black/15">
      {[
        {
          label: user?.role === 1 ? "Đơn bán của tôi" : "Đơn thu gom của tôi",
          icon: PackageIcon,
          onClick: () => navigate("/orders"),
        },
      ].map((action) => (
        <div
          key={action.label}
          className="flex flex-col gap-2 items-center cursor-pointer"
          onClick={action.onClick}
        >
          <div className="w-10 h-10 rounded-full bg-[#EBEFF7] flex items-center justify-center">
            <action.icon active />
          </div>
          <div className="text-2xs text-center">{action.label}</div>
        </div>
      ))}
    </div>
  );
}
