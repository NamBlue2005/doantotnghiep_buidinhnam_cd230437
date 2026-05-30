import { CartItem } from "@/types";
import { formatPrice } from "@/utils/format";
import { List } from "zmp-ui";

function OrderItem(props: any) {
  return (
    <List.Item
      prefix={
        <img src={props.product.image} className="w-14 h-14 rounded-lg object-cover" />
      }
      suffix={
        <div className="text-sm font-medium flex flex-col justify-center items-end h-full text-primary">
          <div className="text-xs text-gray-500 font-normal">Ước tính</div>
          Khoảng {props.quantity} kg
        </div>
      }
    >
      <div className="text-sm font-medium">{props.product.name}</div>
      <div className="text-xs text-gray-500 mt-1">Thu mua tận nơi</div>
    </List.Item>
  );
}

export default OrderItem;
