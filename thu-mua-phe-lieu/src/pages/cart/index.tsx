import { FC } from "react";
import CartList from "./cart-list";
import Delivery from "./delivery";
import Pay from "./pay";

const CartPage: FC = () => {
  return (
    <div className="flex flex-col bg-background h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <Delivery />
        <CartList />
      </div>
      <Pay />
    </div>
  );
};

export default CartPage;
