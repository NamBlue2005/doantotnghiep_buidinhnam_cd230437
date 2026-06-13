import HorizontalDivider from "@/components/horizontal-divider";
import Section from "@/components/section";
import { Order } from "@/types";
import { formatPrice } from "@/utils/format";
import CollapsibleOrderItems from "./collapsible-order-items";
import { useNavigate } from "react-router-dom";

function OrderSummary(props: { order: any; full?: boolean }) {
  const navigate = useNavigate();
  return (
    <Section
      title={
        <div className="w-full flex justify-between items-center space-x-2 font-normal">
          <span className="text-xs truncate">
            <span className="font-bold text-gray-800">{props.order.orderCode || `OD${String(props.order.id).padStart(8, '0')}`}</span> • {props.order.address || "Chưa có địa chỉ"}
          </span>
          <span
            className={`text-xs ${
              props.order.originalStatus === "CANCELLED" ? "text-red-500" : (props.order.status === "completed" ? "text-green-500" : "text-primary")
            }`}
          >
            {props.order.originalStatus === "CANCELLED" ? "Đã hủy" :
              (props.order.status === "pending" ? "Yêu cầu thu gom" :
              (props.order.status === "shipping" ? "Xác nhận thu gom" : "Hoàn thành thu gom"))
            }
          </span>
        </div>
      }
      className="flex-1 overflow-y-auto rounded-lg"
      onClick={() => {
        if (!props.full) {
          navigate(`/order/${props.order.id}`, {
            state: props.order,
            viewTransition: true,
          });
        }
      }}
    >
      <div className="w-full">
        <CollapsibleOrderItems
          items={props.order.items}
          defaultExpanded={props.full}
        />
      </div>
      <HorizontalDivider />
      <div className="flex justify-between items-center px-4 py-2 space-x-4">
        <div className="text-xs">Thời gian hẹn lấy</div>
        <div className="text-sm font-medium text-orange-600">
          {props.order.pickupTime 
            ? new Date(props.order.pickupTime).toLocaleString('vi-VN', { 
                hour: '2-digit', minute: '2-digit', 
                day: '2-digit', month: '2-digit', year: 'numeric' 
              }) 
            : "Chưa xác định"}
        </div>
      </div>
      <HorizontalDivider />
      <div className="flex justify-between items-center px-4 py-2 space-x-4">
        <div className="text-xs">Khối lượng ước tính</div>
        <div className="text-sm font-medium text-primary">
          {Number(props.order.estimatedWeight).toLocaleString('en-US')} kg
        </div>
      </div>
    </Section>
  );
}

export default OrderSummary;
