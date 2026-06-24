import { CartItem } from "@/types";
import { formatPrice } from "@/utils/format";
import { List } from "zmp-ui";

function OrderItem(props: any) {
  const isCompleted = props.originalStatus === 'COMPLETED';

  return (
    <List.Item
      prefix={
        <img src={props.product.image} className="w-14 h-14 rounded-lg object-cover" />
      }
      suffix={
        <div className={`text-sm font-medium flex flex-col justify-center items-end h-full ${isCompleted ? 'text-green-600' : 'text-primary'}`}>
          <div className="text-xs text-gray-500 font-normal">{isCompleted ? 'Thực tế' : 'Ước tính'}</div>
          {isCompleted ? '' : 'Khoảng '}{Number(props.quantity).toLocaleString('en-US')} kg
        </div>
      }
    >
      <div className="text-sm font-medium">{props.product.name.replace("Thu mua ", "")}</div>
    </List.Item>
  );
}

export default OrderItem;
