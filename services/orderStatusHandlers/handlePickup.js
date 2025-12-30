export const handlePickup = async ({ subOrder }) => {
  // États autorisés
  if (!["prepared", "partially_prepared"].includes(subOrder.status)) {
    throw new Error("Invalid subOrder status for pickup");
  }

  subOrder.status = "picked_up";
};
