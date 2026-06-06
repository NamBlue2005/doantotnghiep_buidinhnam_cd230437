import { Product } from "@/types";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "zmp-ui";

export interface ProductItemProps {
  product: Product;
  replace?: boolean;
}

const ProductItem: FC<ProductItemProps> = ({ product, replace }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex flex-col items-center justify-center p-3 border border-gray-300 rounded-xl shadow-sm bg-white active:bg-gray-100 transition-colors h-full cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`, { replace })}
    >
      <Text size="small" className="font-semibold text-center text-primary line-clamp-2">
        {product.name}
      </Text>
      <Text size="xSmall" className="text-gray-500 mt-1 font-medium">
        {product.price.toLocaleString('vi-VN')}đ
      </Text>
    </div>
  );
};

export default ProductItem;
