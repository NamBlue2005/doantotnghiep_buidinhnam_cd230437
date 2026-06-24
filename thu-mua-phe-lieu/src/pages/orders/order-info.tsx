import { LocationMarkerLineIcon } from "@/components/vectors";
import { Icon, List, Button } from "zmp-ui";
import DeliverySummary from "../cart/delivery-summary";
import { openWebview } from "zmp-sdk/apis";
import { useAtomValue } from "jotai";
import { userInfoState } from "@/state";
import CollapsibleOrderItems from "./collapsible-order-items";

function OrderInfo(props: { order: any }) {
  const user = useAtomValue(userInfoState) as any;

  
  const mapQuery = props.order.address
    ? encodeURIComponent(props.order.address)
    : `${props.order.latitude},${props.order.longitude}`;

  // Backend có thể trả về dưới nhiều tên field khác nhau (note / notes / sellerNote / description).
  // Lấy field nào có giá trị trước, đồng thời trim để loại bỏ chuỗi chỉ chứa khoảng trắng.
  const noteText: string = (
    props.order.note ??
    props.order.notes ??
    props.order.sellerNote ??
    props.order.description ??
    ""
  ).toString().trim();

  return (
    <div className="bg-section rounded-lg overflow-hidden">
      <List noSpacing>
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
        <List.Item>
          {/* Bọc map trong List.Item để đảm bảo cấu trúc DOM hợp lệ */}
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
        </List.Item>
      )}

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

      {noteText.length > 0 && (
        <List.Item prefix={<Icon icon="zi-note" />} title="Ghi chú người bán">
          <span className="text-sm text-right break-words">{noteText}</span>
        </List.Item>
      )}
      </List>

      {/* Chi tiết phế liệu */}
      <div className="px-4 pt-3 pb-1 font-semibold text-sm text-gray-800">Chi tiết phế liệu</div>
      <CollapsibleOrderItems
        items={props.order.items}
        defaultExpanded={true}
        originalStatus={props.order.originalStatus}
      />
      <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
        <div className="text-sm font-bold">Tổng khối lượng</div>
        <div className={`text-sm font-bold ${props.order.originalStatus === 'COMPLETED' ? 'text-green-600' : 'text-primary'}`}>
          {Number(props.order.actualWeight || props.order.estimatedWeight).toLocaleString('en-US')} kg
        </div>
      </div>
      {props.order.originalStatus === 'COMPLETED' && props.order.total > 0 && (
        <div className="flex justify-between items-center px-4 pt-2 pb-3 border-t border-gray-100">
          <div className="text-sm font-bold">Tổng tiền</div>
          <div className="text-sm font-bold text-orange-600">{Number(props.order.total).toLocaleString('vi-VN')}đ</div>
        </div>
      )}
    </div>
  );
}

export default OrderInfo;