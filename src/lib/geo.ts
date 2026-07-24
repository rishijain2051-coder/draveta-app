export type MarketplacePreference = {
  primary: "amazon" | "etsy";
  showBoth: boolean;
};

export function getMarketplacePreference(
  country?: string | null
): MarketplacePreference {
  const isIndia =
    country?.toUpperCase() === "IN" || country?.toUpperCase() === "IND";

  return {
    primary: isIndia ? "amazon" : "etsy",
    showBoth: true,
  };
}
