import { Tabs } from "zmp-ui";
import OrderList from "./order-list";
import { ordersState } from "@/state";
import { useNavigate, useParams } from "react-router-dom";

function OrdersPage() {
  const { status } = useParams();
  const navigate = useNavigate();

  return (
    <Tabs
      className="h-full flex flex-col"
      activeKey={status}
      onChange={(status) => navigate(`/orders/${status}`)}
    >
      <Tabs.Tab key="pending" label="Yêu cầu thu gom">
        <OrderList ordersState={ordersState("pending")} />
      </Tabs.Tab>
      <Tabs.Tab key="shipping" label="Xác nhận thu gom">
        <OrderList ordersState={ordersState("shipping")} />
      </Tabs.Tab>
      <Tabs.Tab key="completed" label="Hoàn thành thu gom">
        <OrderList ordersState={ordersState("completed")} />
      </Tabs.Tab>
    </Tabs>
  );
}

export default OrdersPage;
