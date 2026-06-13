import { LocationMarkerLineIcon } from "@/components/vectors";
import { Icon, List, Button } from "zmp-ui";
import DeliverySummary from "../cart/delivery-summary";
import { openWebview } from "zmp-sdk/apis";
import { useAtomValue } from "jotai";
import { userInfoState } from "@/state";

function OrderInfo(props: { order: any }) {
  const user = useAtomValue(userInfoState) as any;

  // Ưu tiên dùng text địa chỉ (có số nhà cụ thể) để Google Maps cắm mốc chính xác 100%
  const mapQuery = props.order.address 
    ? encodeURIComponent(props.order.address)
    : `${props.order.latitude},${props.order.longitude}`;

  return (
    <List noSpacing className="bg-section rounded-lg">
      <List.Item prefix={<Icon icon="zi-note" />} title="Mã đơn hàng">
        <span className="text-sm font-bold text-primary">{props.order.orderCode || `OD${String(props.order.id).padStart(8, '0')}`}</span>
      </List.Item>

      <DeliverySummary
        icon={<LocationMarkerLineIcon />}
        title="Địa chỉ thu gom"
        subtitle="Thông tin vị trí"
        description={props.order.address}
      />
      
      {/* Bản đồ Google Maps thu nhỏ (Mini Map) */}
      {user?.role === 2 && (
        <div className="px-4 pb-3">
          <div className="w-full h-40 rounded-lg overflow-hidden border border-black/10 relative bg-gray-100 shadow-inner">
            <iframe 
              width="100%" 
              height="100%" 
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
            ></iframe>
            
            {/* Nút Chỉ đường - Mở Google Maps và tự động lấy GPS của Tài xế */}
            <div className="absolute bottom-2 right-2">
              <Button 
                size="small" 
                variant="secondary"
                onClick={() => {
                  openWebview({ url: `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}` });
                }}
              >
                <div className="flex items-center gap-1 text-blue-600">
                  <Icon icon="zi-location" size={18} />
                  <span className="font-bold text-xs">Chỉ đường</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <List.Item prefix={<Icon icon="zi-info-circle" />} title="Loại phế liệu">
        <span className="text-sm font-medium text-right line-clamp-2">
          {props.order.items?.length > 0 
            ? props.order.items.map((i: any) => i.product?.name?.replace("Thu mua ", "")).join(", ") 
            : (props.order.category?.name || "Chưa xác định")}
        </span>
      </List.Item>

      <List.Item prefix={<Icon icon="zi-clock-1" />} title="Thời gian hẹn lấy">
        <span className="text-sm font-medium text-orange-600">
          {props.order.pickupTime 
            ? new Date(props.order.pickupTime).toLocaleString('vi-VN', { 
                hour: '2-digit', minute: '2-digit', 
                day: '2-digit', month: '2-digit', year: 'numeric' 
              }) 
            : "Chưa xác định"
          }
        </span>
      </List.Item>

      <List.Item prefix={<Icon icon="zi-list-1" />} title="Khối lượng ước tính">
        <span className="text-sm text-primary font-medium">{Number(props.order.estimatedWeight).toLocaleString('en-US')} kg</span>
      </List.Item>
    </List>
  );
}

export default OrderInfo;
