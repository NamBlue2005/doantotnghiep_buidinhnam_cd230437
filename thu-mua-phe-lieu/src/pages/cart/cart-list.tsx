import { useAtom, useAtomValue } from "jotai";
import { cartState, productsState, deliveryTimeState } from "@/state";
import Section from "@/components/section";
import { Icon } from "zmp-ui";
import HorizontalDivider from "@/components/horizontal-divider";
import Select from "@/components/select";
import QuantityInput from "@/components/quantity-input";
import { useEffect } from "react";
import { Button } from "zmp-ui";

export default function CartList() {
  const [cart, setCart] = useAtom(cartState);
  const products = useAtomValue(productsState);
  const [deliveryTime, setDeliveryTime] = useAtom(deliveryTimeState);

  // Nếu chưa chọn phế liệu, tự động chọn mặt hàng đầu tiên làm mặc định
  useEffect(() => {
    if (cart.length === 0 && products.length > 0) {
      setCart([{ product: products[0], quantity: 1 }]);
    }
  }, [cart, products, setCart]);

  const handleAddItem = () => {
    if (products.length > 0) {
      setCart([...cart, { product: products[0], quantity: 1 }]);
    }
  };

  const handleUpdateProduct = (index: number, product: any) => {
    const newCart = [...cart];
    newCart[index].product = product;
    setCart(newCart);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    setCart(newCart);
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  return (
    <Section title="Thông tin phế liệu" className="rounded-lg pb-4">
      {cart.map((item, index) => (
        <div key={index} className="relative mb-3 bg-background rounded-lg border-[0.5px] border-black/10 overflow-hidden">
          {cart.length > 1 && (
            <div 
              className="absolute top-0 right-0 bg-red-50 text-red-500 w-8 h-8 flex items-center justify-center cursor-pointer rounded-bl-lg z-10"
              onClick={() => handleRemoveItem(index)}
            >
              <Icon icon="zi-close" size={16} />
            </div>
          )}
          <div className="flex items-center px-4 pt-3 pb-3 space-x-4">
            <Icon icon="zi-list-1" className="text-primary" />
            <div className="text-sm font-medium whitespace-nowrap">Loại:</div>
            <div className="flex-1 flex justify-end">
              <Select
                items={products}
                value={item.product}
                onChange={(product) => {
                  if (product) handleUpdateProduct(index, product);
                }}
                renderItemKey={(product) => String(product.id)}
                renderItemLabel={(product) => product.name}
                renderTitle={(product) => product?.name || "Chọn phế liệu"}
              />
            </div>
          </div>
          <HorizontalDivider />
          <div className="flex items-center px-4 pt-3 pb-3 space-x-4">
            <Icon icon="zi-check-circle" className="text-primary" />
            <div className="text-sm font-medium whitespace-nowrap">Khối lượng:</div>
            <div className="flex-1 flex justify-end">
              <QuantityInput
                value={item.quantity}
                onChange={(quantity) => handleUpdateQuantity(index, quantity)}
                minValue={1}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div className="px-4 mt-4">
        <Button variant="secondary" fullWidth prefixIcon={<Icon icon="zi-plus" />} onClick={handleAddItem}>
          Thêm loại phế liệu khác
        </Button>
      </div>

      <div className="mt-4">
        <HorizontalDivider />
      </div>
      <div className="flex items-center px-4 pt-3 pb-3 space-x-4">
        <Icon icon="zi-clock-1" className="text-primary" />
        <div className="text-sm font-medium whitespace-nowrap">Thời gian:</div>
        <input
          type="datetime-local"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          className="text-sm text-right flex-1 focus:outline-none bg-transparent"
        />
      </div>
      <HorizontalDivider />
      <div className="flex items-center px-4 pt-3 pb-3 space-x-4">
        <Icon icon="zi-note" className="text-primary" />
        <div className="text-sm font-medium whitespace-nowrap">Ghi chú:</div>
        <input
          type="text"
          placeholder="Lưu ý cho tài xế..."
          className="text-sm text-right flex-1 focus:outline-none bg-transparent"
        />
      </div>
    </Section>
  );
}
