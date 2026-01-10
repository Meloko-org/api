const handlePickup = async ({
  order,
  subOrder,
  notPickedUpProductIds = [],
  session,
  postCommitActions,
}) => {
  console.log("executing handlePickup");

  // États autorisés
  if (!["prepared", "partially_prepared"].includes(subOrder.status)) {
    throw new Error("Invalid subOrder status for pickup");
  }

  if (notPickedUpProductIds.length > 0) {
    throw new Error("Use handlePartialPickup instead");
  }

  subOrder.products.forEach((p) => {
    if (p.productStatus === "confirmed") {
      p.pickedUp = true;
    }
  });

  subOrder.status = "picked_up";
};

module.exports = {
  handlePickup,
};
