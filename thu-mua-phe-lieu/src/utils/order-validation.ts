import stations from "@/mock/stations.json";
import type { Product, ShippingAddress } from "@/types";
import { calculateDistance } from "./location";

const MIN_PICKUP_DELAY_MINUTES = 30;
const SERVICE_RADIUS_KM = 25;
const SUPPORTED_ADDRESS_KEYWORDS = [
  "hồ chí minh",
  "ho chi minh",
  "tp.hcm",
  "tp hcm",
  "quận 7",
  "quan 7",
  "q7",
];

export function normalizePhoneNumber(phone: string) {
  return phone.replace(/\s|-/g, "").trim();
}

export function isValidPhoneNumber(phone: string) {
  const normalized = normalizePhoneNumber(phone);
  return /^(0\d{9}|\+84\d{9})$/.test(normalized);
}

export function isValidAddressText(address: string) {
  return address.trim().length >= 8;
}

export function isSupportedAddressText(address: string) {
  const normalized = address.toLowerCase();
  return SUPPORTED_ADDRESS_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function isWithinSupportedArea(location?: { lat: number; lng: number } | null) {
  if (!location) {
    return false;
  }

  return stations.some((station) => {
    if (!station.location) {
      return false;
    }

    return (
      calculateDistance(
        location.lat,
        location.lng,
        station.location.lat,
        station.location.lng
      ) <= SERVICE_RADIUS_KM
    );
  });
}

export function isShippingAddressValid(address?: Partial<ShippingAddress> | null) {
  if (!address) {
    return false;
  }

  return Boolean(
    address.address?.trim() &&
      address.name?.trim() &&
      isValidPhoneNumber(address.phone || "")
  );
}

export function getPickupTimeValidationError(pickupTime: string) {
  if (!pickupTime) {
    return "Vui lòng chọn thời gian thu gom.";
  }

  const selectedTime = new Date(pickupTime);
  if (Number.isNaN(selectedTime.getTime())) {
    return "Thời gian thu gom không hợp lệ.";
  }

  const minAllowedTime = Date.now() + MIN_PICKUP_DELAY_MINUTES * 60 * 1000;
  if (selectedTime.getTime() < minAllowedTime) {
    return "Chỉ được đặt lịch sau thời điểm hiện tại ít nhất 30 phút.";
  }

  return "";
}

export function getPickupTimeInputMin() {
  const minAllowed = new Date(Date.now() + MIN_PICKUP_DELAY_MINUTES * 60 * 1000);
  const year = minAllowed.getFullYear();
  const month = String(minAllowed.getMonth() + 1).padStart(2, "0");
  const day = String(minAllowed.getDate()).padStart(2, "0");
  const hours = String(minAllowed.getHours()).padStart(2, "0");
  const minutes = String(minAllowed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function isProductAvailable(product?: Product | null) {
  if (!product) {
    return false;
  }

  const anyProduct = product as Product & {
    isAvailable?: boolean;
    available?: boolean;
    active?: boolean;
    status?: string;
  };

  if (anyProduct.isAvailable === false) {
    return false;
  }

  if (anyProduct.available === false) {
    return false;
  }

  if (anyProduct.active === false) {
    return false;
  }

  if (typeof anyProduct.status === "string") {
    const normalizedStatus = anyProduct.status.toLowerCase();
    if (["inactive", "disabled", "suspended", "paused", "unavailable"].includes(normalizedStatus)) {
      return false;
    }
  }

  return true;
}