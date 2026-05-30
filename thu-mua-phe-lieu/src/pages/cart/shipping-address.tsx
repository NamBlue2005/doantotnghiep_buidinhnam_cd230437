import { shippingAddressState, savedAddressesState } from "@/state";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Input, List, Radio } from "zmp-ui";
import { getSetting, authorize } from "zmp-sdk/apis";

function ShippingAddressPage() {
  const [selectedAddress, setSelectedAddress] = useAtom(shippingAddressState);
  const [savedAddresses, setSavedAddresses] = useAtom(savedAddressesState);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(savedAddresses.length === 0);
  const [addressInput, setAddressInput] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleSaveNewAddress = (e: any) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const newAddress: any = { id: Date.now().toString() };
    data.forEach((value, key) => {
      newAddress[key] = value;
    });
    
    setSavedAddresses([...savedAddresses, newAddress]);
    setSelectedAddress(newAddress);
    toast.success("Đã thêm địa chỉ mới");
    setShowForm(false);
    navigate(-1);
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    toast.success("Đã chọn địa chỉ");
    navigate(-1);
  };

  const handleDeleteAddress = (e: any, id: string) => {
    e.stopPropagation();
    const newAddresses = savedAddresses.filter(a => (a as any).id !== id);
    setSavedAddresses(newAddresses);
    if ((selectedAddress as any)?.id === id) {
      setSelectedAddress(undefined);
    }
    toast.success("Đã xóa địa chỉ");
  };

  // Hàm tự động lấy vị trí hiện tại bằng GPS và dịch ra chữ
  const handleGetCurrentLocation = async () => {
    setLoadingLocation(true);
    
    try {
      // Gọi bảng thông báo xin quyền truy cập Vị trí chính thức của Zalo
      const { authSetting } = await getSetting({});
      if (!authSetting["scope.userLocation"]) {
        await authorize({ scopes: ["scope.userLocation"] });
      }
    } catch (e) {
      toast.error("Vui lòng cấp quyền Vị trí để sử dụng tính năng này!");
      setLoadingLocation(false);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Sử dụng API miễn phí của OpenStreetMap để dịch toạ độ thành địa chỉ
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=vi`);
            const data = await res.json();
            if (data && data.display_name) {
              setAddressInput(data.display_name.replace(", Việt Nam", "")); // Bỏ chữ Việt Nam cho ngắn gọn
              toast.success("Đã tìm thấy vị trí của bạn!");
            }
          } catch (error) {
            toast.error("Không thể lấy tên đường từ tọa độ.");
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          toast.error("Vui lòng cho phép Zalo truy cập Vị trí (GPS)!");
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error("Thiết bị của bạn không hỗ trợ định vị.");
      setLoadingLocation(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {!showForm && savedAddresses.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <List>
            {savedAddresses.map((addr: any) => (
              <List.Item
                key={addr.id}
                title={addr.alias || addr.name || "Địa chỉ"}
                subTitle={addr.address}
                suffix={
                  <div className="flex items-center space-x-2">
                    <Radio
                      checked={(selectedAddress as any)?.id === addr.id}
                      onChange={() => handleSelectAddress(addr)}
                    />
                    <div onClick={(e) => handleDeleteAddress(e, addr.id)} className="p-2 text-danger">
                      <Icon icon="zi-delete" size={20} />
                    </div>
                  </div>
                }
                onClick={() => handleSelectAddress(addr)}
              />
            ))}
          </List>
          <div className="p-4">
            <Button variant="secondary" fullWidth onClick={() => setShowForm(true)} prefixIcon={<Icon icon="zi-plus" />}>
              Thêm địa chỉ mới
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <form
          className="h-full flex flex-col justify-between"
          onSubmit={handleSaveNewAddress}
        >
          <div className="py-2 space-y-2 overflow-y-auto">
            <div className="bg-section p-4 grid gap-4">
              <Input
                name="alias"
                label="Số nhà, địa chỉ cụ thể"
                placeholder="Ví dụ: Số 12, ngõ 34..."
              />
              <Input
                name="address"
                label={<>Địa chỉ <span className="text-danger">*</span></>}
                placeholder="Nhập địa chỉ"
                required
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
              <div className="flex justify-end -mt-3">
                <div 
                  className="text-xs text-blue-600 font-medium flex items-center gap-1 cursor-pointer active:opacity-70 p-1"
                  onClick={handleGetCurrentLocation}
                >
                  <Icon icon={loadingLocation ? "zi-spinner" : "zi-location"} className={loadingLocation ? "animate-spin" : ""} size={16} />
                  {loadingLocation ? "Đang định vị..." : "Đề xuất vị trí hiện tại"}
                </div>
              </div>
            </div>
            <div className="bg-section p-4 grid gap-4">
              <Input
                name="name"
                label="Tên người nhận"
                placeholder="Nhập tên người nhận"
              />
              <Input
                name="phone"
                label="Số điện thoại"
                placeholder="0912345678"
              />
            </div>
            {savedAddresses.length > 0 && (
              <div className="px-4">
                <Button variant="secondary" fullWidth onClick={() => setShowForm(false)}>
                  Hủy
                </Button>
              </div>
            )}
          </div>
          <div className="p-6 pt-4 bg-section">
            <Button htmlType="submit" fullWidth>
              Lưu địa chỉ
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ShippingAddressPage;
