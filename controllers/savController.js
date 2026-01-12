const { Order } = require("../models");
const { isShop } = require("../modules/verification");

const updateOrderProductPickedUp = async (req, res) => {
  try {
    if (!req.params.id) {
      throw new Error("Order id missing.");
    }

    const shop = await isShop(req.auth.userId);
    if (!shop) {
      throw new Error("Shop not found.");
    }

    const orderId = req.params.id;

    const { subOrderId, productId, pickedUp } = req.body;

    const order = await Order.findById(orderId)
      .populate("user", "firstname lastname email address")
      .populate({
        path: "details",
        populate: [
          {
            path: "products.product",
            model: "stocks",
            select: "-createdAt -updatedAt",
            populate: [
              {
                path: "product",
                model: "products",
                select: "name vatRate image weight family",
                populate: [
                  {
                    path: "family",
                    model: "productFamily",
                    select: "name",
                  },
                  {
                    path: "weight",
                    select: "unit",
                  },
                ],
              },
              {
                path: "tags",
                model: "tags",
                select: "name",
              },
            ],
          },
          {
            path: "shop",
            select: "name siret address",
            populate: {
              path: "address",
              select: "address1 address2 postalCode city country",
            },
          },
          {
            path: "invoice",
            model: "invoices",
            select: "createdAt",
          },
          {
            path: "creditNotes",
            model: "creditnotes",
            select: "createdAt",
          },
        ],
      });

    if (!order) {
      throw new Error("Order not found.");
    }

    const subOrder = order.details.find(
      (detail) => detail._id.toString() === subOrderId,
    );
    if (!subOrder) {
      throw new Error("sub-Order not found.");
    }

    if (subOrder.shop._id.toString() !== shop._id.toString()) {
      throw new Error("Forbidden.");
    }

    const product = subOrder.products.find(
      (p) => p._id.toString() === productId,
    );

    // mise à jour de pickedUp
    product.pickedUp = pickedUp;

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur Interne serveur",
    });
  }
};

module.exports = {
  updateOrderProductPickedUp,
};
