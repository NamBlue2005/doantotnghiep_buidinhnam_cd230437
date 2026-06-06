import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { flashSaleProductsState } from "@/state";

export default function FlashSales() {
  const products = useAtomValue(flashSaleProductsState);

  return (
    <Section title={
      <div className="text-center text-xl font-bold text-green-600 uppercase">
        Bảng giá phế liệu
      </div>
    }>
      <ProductGrid products={products} />
    </Section>
  );
}
