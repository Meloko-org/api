const handlePartialPickup = async ({
  order,
  subOrder,
  notPickedUpProductIds = [],
  session,
}) => {
  console.log("executing handlePartialPickup");
  if (!["prepared", "partially_prepared"].includes(subOrder.status)) {
    throw new Error("Invalid status for partial pickup");
  }

  if (notPickedUpProductIds.length === 0) {
    throw new Error("Missing products required");
  }

  subOrder.products.forEach((p) => {
    if (p.productStatus !== "confirmed") return;

    p.pickedUp = !notPickedUpProductIds.includes(p._id.toString());

    // if (notPickedUpProductIds.includes(p._id.toString())) {
    // 	p.pickedUp = false;
    // } else {
    // 	p.pickedUp = true;
    // }
  });

  subOrder.status = "partially_picked_up";
};

module.exports = {
  handlePartialPickup,
};
