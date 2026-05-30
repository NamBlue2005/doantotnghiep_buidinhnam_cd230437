import { Product } from "@/types";
import { formatPrice } from "@/utils/format";
import TransitionLink from "./transition-link";
import { useState } from "react";

export interface ProductItemProps {
  product: Product;
  /**
   * Whether to replace the current page when user clicks on this product item. Default behavior is to push a new page to the history stack.
   * This prop should be used when navigating to a new product detail from a current product detail page (related products, etc.)
   */
  replace?: boolean;
}

export default function ProductItem(props: ProductItemProps) {
  const [selected, setSelected] = useState(false);

  return (
    <div
      className="flex flex-col cursor-pointer group bg-section rounded-xl shadow-[0_10px_24px_#0D0D0D17]"
      onClick={() => setSelected(true)}
    >
      <TransitionLink
        to={`/product/${props.product.id}`}
        replace={props.replace}
        className="p-2 pb-0"
      >
        {({ isTransitioning }) => (
          <>
            <img
              src={props.product.image}
              className="w-full aspect-square object-cover rounded-lg"
              style={{
                viewTransitionName:
                  isTransitioning && selected // only animate the "clicked" product item in related products list
                    ? `product-image-${props.product.id}`
                    : undefined,
              }}
              alt={props.product.name}
            />
            <div className="pt-2 pb-1.5">
              <div className="pt-1 pb-0.5">
                <div className="text-xs h-9 line-clamp-2">
                  {props.product.name}
                </div>
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Thu mua tận nơi
              </div>
            </div>
          </>
        )}
      </TransitionLink>
      <div className="p-2.5 bg-blue-50/50 border-t border-blue-100 rounded-b-xl flex justify-between items-center mt-auto">
        <span className="text-xs text-gray-600">Giá tham khảo</span>
        <span className="text-sm font-bold text-primary">{formatPrice(props.product.price)}/kg</span>
      </div>
    </div>
  );
}
