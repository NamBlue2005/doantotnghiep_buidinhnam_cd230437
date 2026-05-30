import {
  OrderHistoryIcon,
  PackageIcon,
  VoucherIcon,
} from "@/components/vectors";
import { useToBeImplemented } from "@/hooks";
import { useNavigate } from "react-router-dom";

export default function ProfileActions() {
  const navigate = useNavigate();
  const toBeImplemented = useToBeImplemented();

  return (
    <div className="bg-white rounded-lg p-4 grid grid-cols-3 gap-4 border-[0.5px] border-black/15">
      {[
        {
          label: "Đổi quà",
          icon: VoucherIcon,
          onClick: toBeImplemented,
        },
        {
          label: "Lịch sử đổi quà",
          icon: OrderHistoryIcon,
          onClick: toBeImplemented,
        },
        {
          label: "Đơn bán của tôi",
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
