import { shippingAddressState, savedAddressesState, userInfoState } from "@/state";
import { useAtom, useAtomValue } from "jotai";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button, Icon, Input, Radio } from "zmp-ui";
import { getSetting, authorize } from "zmp-sdk/apis";
import {
  isValidAddressText,
  isValidPhoneNumber,
} from "@/utils/order-validation";

function ShippingAddressPage() {
  const [selectedAddress, setSelectedAddress] = useAtom(shippingAddressState);
  const [savedAddresses, setSavedAddresses] = useAtom(savedAddressesState);
  const userInfo = useAtomValue(userInfoState);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(savedAddresses.length === 0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number} | null>(null);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);

  // Controlled inputs for the form
  const [aliasInput, setAliasInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // --- START: HANOI VALIDATION ---
  const isWithinHanoi = (location: { lat: number; lng: number }): boolean => {
    const hanoiBounds = {
      minLat: 20.8, // Bán kính bao quanh Hà Nội
      maxLat: 21.2,
      minLng: 105.7,
      maxLng: 106.0,
    };
    return (
      location.lat >= hanoiBounds.minLat &&
      location.lat <= hanoiBounds.maxLat &&
      location.lng >= hanoiBounds.minLng &&
      location.lng <= hanoiBounds.maxLng
    );
  };

  const isHanoiAddressText = (address: string): boolean => {
    return /Hà Nội/i.test(address);
  };
  // --- END: HANOI VALIDATION ---

  const handleSaveAddress = (e: any) => {
    e.preventDefault();
    const addressValue = addressInput.trim();
    const nameValue = nameInput.trim();
    const normalizedPhone = phoneInput.trim().replace(/\s/g, ''); // Bỏ hết khoảng trắng

    if (!isValidAddressText(addressValue)) {
      toast.error("Vui lòng nhập địa chỉ khả dụng.");
      return;
    }

    if (!nameValue) {
      toast.error("Vui lòng nhập tên người nhận.");
      return;
    }

    if (!isValidPhoneNumber(normalizedPhone)) {
      toast.error("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    if (tempLocation && !isWithinHanoi(tempLocation)) {
      toast.error("Địa chỉ nằm ngoài khu vực Hà Nội. Vui lòng chọn địa chỉ khác.");
      return;
    }

    if (!tempLocation && !isHanoiAddressText(addressValue)) {
      toast.error("Vui lòng nhập địa chỉ trong khu vực Hà Nội.");
      return;
    }

    const addressPayload = {
      alias: aliasInput.trim(),
      address: addressValue,
      name: nameValue,
      phone: normalizedPhone, // Lưu SĐT đã chuẩn hóa
      lat: tempLocation?.lat || 0.0,
      lng: tempLocation?.lng || 0.0,
    };

    if (editingAddress) {
      // UPDATE
      const updatedAddress = { ...editingAddress, ...addressPayload };
      const newAddresses = savedAddresses.map(a => (a as any).id === editingAddress.id ? updatedAddress : a);
      setSavedAddresses(newAddresses);
      if ((selectedAddress as any)?.id === editingAddress.id) {
        setSelectedAddress(updatedAddress);
      }
      toast.success("Đã cập nhật địa chỉ");
    } else {
      // CREATE
      const newAddress = { ...addressPayload, id: Date.now().toString() };
      setSavedAddresses([...savedAddresses, newAddress]);
      setSelectedAddress(newAddress);
      toast.success("Đã thêm địa chỉ mới");
      navigate(-1);
    }

    // Reset form and state
    setShowForm(false);
    setEditingAddress(null);
    setAliasInput(''); setAddressInput(''); setNameInput(''); setPhoneInput('');
    setTempLocation(null);
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

  const handleEditAddress = (e: React.MouseEvent, address: any) => {
    e.stopPropagation();
    setEditingAddress(address);
    // Pre-fill form state
    setAliasInput(address.alias || '');
    setAddressInput(address.address || '');
    setNameInput(address.name || '');
    setPhoneInput(address.phone || '');
    setTempLocation(address.lat && address.lng ? { lat: address.lat, lng: address.lng } : null);
    setShowForm(true);
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
            // Lưu tọa độ lại để lát gửi lên lúc Đăng đơn
            setTempLocation({ lat: latitude, lng: longitude });
            // Sử dụng API miễn phí của OpenStreetMap để dịch toạ độ thành địa chỉ
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=vi`);
            const data = await res.json();
            if (data && data.display_name) {
              if (!isHanoiAddressText(data.display_name) && !isWithinHanoi({ lat: latitude, lng: longitude })) {
                toast.error("Vị trí của bạn nằm ngoài khu vực Hà Nội. Vui lòng chọn địa chỉ khác.");
                setTempLocation(null);
                setAddressInput("");
                setLoadingLocation(false);
                return;
              }
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
    <div className="h-full flex flex-col bg-background overflow-x-hidden">
      {!showForm && savedAddresses.length > 0 && (
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="px-3 pt-3 space-y-2">
            {savedAddresses.map((addr: any) => {
              const isSelected = (selectedAddress as any)?.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`w-full rounded-xl border p-3 cursor-pointer ${
                    isSelected ? "border-primary bg-primary/5" : "border-gray-200 bg-white"
                  }`}
                >
                  {/* Top row: name/alias + radio */}
                  <div className="flex items-start gap-2">
                    <Radio checked={isSelected} className="shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold break-words">
                        {addr.alias || addr.name || "Địa chỉ"}
                      </div>
                      <div className="text-sm text-gray-500 break-words mt-0.5">
                        {addr.address}
                      </div>
                      {addr.name && (
                        <div className="text-xs text-gray-400 mt-1 break-words">
                          {addr.name} {addr.phone ? `· ${addr.phone}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Bottom row: action buttons, always full width and visible */}
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={(e) => handleEditAddress(e, addr)}
                      className="flex items-center gap-1 text-sm text-primary px-2 py-1 rounded-lg active:bg-primary/10"
                    >
                      <Icon icon="zi-edit" size={16} />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAddress(e, addr.id)}
                      className="flex items-center gap-1 text-sm text-danger px-2 py-1 rounded-lg active:bg-danger/10"
                    >
                      <Icon icon="zi-delete" size={16} />
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4">
            <Button variant="secondary" fullWidth onClick={() => {
              setEditingAddress(null);
              // Reset form state for new entry
              setAliasInput('');
              setAddressInput('');
              setNameInput(userInfo?.name || '');
              setPhoneInput(userInfo?.phone || '');
              setShowForm(true);
            }} prefixIcon={<Icon icon="zi-plus" />}>
              Thêm địa chỉ mới
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <form
          className="h-full flex flex-col justify-between"
          onSubmit={handleSaveAddress}
        >
          <div className="py-2 space-y-2 overflow-y-auto">
            <div className="bg-section p-4 grid gap-4">
              <Input
                name="alias"
                label="Số nhà, địa chỉ cụ thể"
                placeholder="Ví dụ: Số 12, ngõ 34..."
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
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
                  <Icon icon={(loadingLocation ? "zi-spinner" : "zi-location") as any} className={loadingLocation ? "animate-spin" : ""} size={16} />
                  {loadingLocation ? "Đang định vị..." : "Đề xuất vị trí hiện tại"}
                </div>
              </div>
            </div>
            <div className="bg-section p-4 grid gap-4">
              <Input
                name="name"
                label="Tên người nhận"
                placeholder="Nhập tên người nhận"
                value={nameInput}
                required
                onChange={(e) => setNameInput(e.target.value)}
              />
              <Input
                name="phone"
                label="Số điện thoại"
                placeholder="0912345678"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
                inputMode="tel"
              />
            </div>
            {(savedAddresses.length > 0 || editingAddress) && (
              <div className="px-4">
                <Button variant="secondary" fullWidth onClick={() => {
                  setShowForm(false);
                  setEditingAddress(null);
                  setAliasInput(''); setAddressInput(''); setNameInput(''); setPhoneInput('');
                  setTempLocation(null);
                }}>
                  Hủy
                </Button>
              </div>
            )}
          </div>
          <div className="p-6 pt-4 bg-section">
            <Button htmlType="submit" fullWidth>{editingAddress ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}</Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ShippingAddressPage;