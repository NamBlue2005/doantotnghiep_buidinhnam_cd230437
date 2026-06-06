import HorizontalDivider from "@/components/horizontal-divider";
import { useAtomValue } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
import { productState } from "@/state";
import { formatPrice } from "@/utils/format";
import ShareButton from "./share-buttont";
import RelatedProducts from "./related-products";
import { Button } from "zmp-ui";
import Section from "@/components/section";

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = useAtomValue(productState(Number(id)))!;

  const navigate = useNavigate();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 pb-2 space-y-4 bg-section">
          <div>
            <div className="text-xl font-bold text-primary">
              {formatPrice(product.price)} / kg
            </div>
            <div className="text-sm mt-1">{product.name}</div>
          </div>
          <ShareButton product={product} />
        </div>
        {product.detail && (
          <>
            <div className="bg-background h-2 w-full"></div>
            <Section title="Mô tả sản phẩm">
              <div className="text-sm whitespace-pre-wrap text-subtitle p-4 pt-2">
                {product.detail}
              </div>
            </Section>
          </>
        )}
        <div className="bg-background h-2 w-full"></div>
        <Section title="Sản phẩm khác">
          <RelatedProducts currentProductId={product.id} />
        </Section>
      </div>

      <HorizontalDivider />
      <div className="flex-none p-4 bg-section">
        <Button
          fullWidth
          onClick={() => {
            navigate("/cart", {
              viewTransition: true,
            });
          }}
        >
          Đăng đơn bán ngay
        </Button>
      </div>
    </div>
  );
}
