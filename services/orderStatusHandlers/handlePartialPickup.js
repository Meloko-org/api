export const handlePartialPickup = async ({
  subOrder,
  missingProductIds = [],
}) => {
  if (!["prepared", "partially_prepared"].includes(subOrder.status)) {
    throw new Error("Invalid status for partial pickup");
  }

  if (!missingProductIds.length) {
    throw new Error("Missing products required");
  }

  // Rien à changer sur les produits
  // On garde productStatus = confirmed

  subOrder.status = "partially_picked_up";
};
