export const formatPrice = (value?: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-US")
    : "0";
