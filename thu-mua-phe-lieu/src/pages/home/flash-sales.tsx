import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { flashSaleProductsState } from "@/state";
import { useMemo } from "react";
import { loadable } from "jotai/utils";
import { Icon } from "zmp-ui";

export default function FlashSales() {
  const productsLoadable = useAtomValue(
    useMemo(() => loadable(flashSaleProductsState), [])
  );

  return (
    <Section
      title={
        <div className="text-center text-xl font-bold text-green-600 uppercase">
          Bảng giá phế liệu
        </div>
      }
    >
      {productsLoadable.state === 'loading' && (
        <div className="flex justify-center p-8">
          <Icon icon={"zi-spinner" as any} className="animate-spin text-primary" size={32} />
        </div>
      )}

      {productsLoadable.state === 'hasData' && (
        <div className="grid grid-cols-2 gap-3 px-4">
          {productsLoadable.data.map((product: any) => (
            <div
              key={product.id}
              className="rounded-2xl border border-green-500 bg-white px-3 py-3 flex flex-col items-center justify-center text-center"
            >
              <div className="font-semibold text-sm text-green-600 line-clamp-2 leading-snug min-h-[2.5rem] flex items-center">
                {product.name}
              </div>
              <div className="text-gray-900 text-sm mt-1">
                {Number(product.price || 0).toLocaleString('vi-VN')}đ
                <span className="text-gray-500">/kg</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}