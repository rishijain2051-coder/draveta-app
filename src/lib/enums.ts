export const BusinessType = {
  HOTEL: "HOTEL",
  CAFE: "CAFE",
  RESTAURANT: "RESTAURANT",
  RETAILER: "RETAILER",
  WHOLESALER: "WHOLESALER",
  DISTRIBUTOR: "DISTRIBUTOR",
  INTERIOR_DESIGNER: "INTERIOR_DESIGNER",
  ARCHITECT: "ARCHITECT",
  OTHER: "OTHER",
} as const;

export const OrderStatus = {
  SUBMITTED: "SUBMITTED",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  INVOICED: "INVOICED",
  FULFILLED: "FULFILLED",
  CANCELLED: "CANCELLED",
} as const;

export const UserStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

export const AccountTier = {
  RETAILER: "RETAILER",
  DISTRIBUTOR: "DISTRIBUTOR",
  HOTEL_CAFE: "HOTEL_CAFE",
  CUSTOM: "CUSTOM",
} as const;

export const Platform = {
  INSTAGRAM: "INSTAGRAM",
  YOUTUBE: "YOUTUBE",
  BLOG: "BLOG",
  PINTEREST: "PINTEREST",
  OTHER: "OTHER",
} as const;

export type BusinessType = keyof typeof BusinessType;
export type OrderStatus = keyof typeof OrderStatus;
export type UserStatus = keyof typeof UserStatus;
export type AccountTier = keyof typeof AccountTier;
export type Platform = keyof typeof Platform;
