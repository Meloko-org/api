const mongoose = require("mongoose");
const { Order, Invoice } = require("../models");
const { isShop, isUser } = require("../modules/verification");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const { createInvoiceForSubOrder } = require("../services/invoiceService");
const {
  consumeStockForSubOrder,
  restoreStockFromCreditNote,
} = require("../services/stockService");
const {
  createCreditNoteFromSubOrder,
} = require("../services/creditNoteService");
const {
  computeGlobalOrderStatus,
  computeShopAmounts,
  recomputeOrderTotals,
} = require("../helpers/orderHelpers");

const getOrdersByUser = async (req, res) => {
  try {
    const user = await isUser(req.auth.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé.",
      });
    }

    /* paramètres de la query */
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    /* On récupère toutes les commandes */
    const orders = await Order.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .populate("user", "firstname lastname email")
      .populate({
        path: "details",
        populate: [
          {
            path: "products.product",
            model: "stocks",
            select: "-createdAt -updatedAt",
            populate: {
              path: "product",
              model: "products",
              select: "name image weight family",
              populate: {
                path: "family",
                model: "productFamily",
                select: "name",
              },
            },
          },
          {
            path: "shop",
            model: "shops",
            // select: "name notes address",
            populate: [
              {
                path: "notes",
                model: "notes",
              },
              {
                path: "markets.market",
                model: "markets",
                select: "name address",
              },
            ],
          },
        ],
      })
      .lean();

    /* on ajoute le status global à chaque order */
    const ordersWithStatus = orders.map((o) => ({
      ...o,
      globalStatus: computeGlobalOrderStatus(o),
    }));

    // console.log("ordersWithStatus :", ordersWithStatus)

    /* on filtre les orders selon le status demandé */
    const filteredOrders =
      status === "all"
        ? ordersWithStatus
        : ordersWithStatus.filter((o) => o.globalStatus.includes(status));

    /* pagination */
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageData = filteredOrders.slice(start, end);

    res.status(200).json({
      success: true,
      orders: pageData,
      total: filteredOrders.length,
      page,
      totalPages: Math.ceil(filteredOrders / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderDetailsById = async (req, res) => {
  try {
    if (!req.params.id) {
      throw new Error("Order id missing.");
    }

    // récupération du shopId
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      "details.shop": shop._id,
    })
      .populate("user", "firstname lastname email")
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
                select: "name image weight family",
                populate: {
                  path: "family",
                  model: "productFamily",
                  select: "name",
                },
              },
              {
                path: "tags",
                model: "tags",
                select: "name",
              },
            ],
          },
        ],
      });
    console.log(order.details);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ succes: false, message: error.message });
  }
};

const updateSubOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      if (!req.params.id) {
        throw new Error("Order id missing.");
      }

      const shop = await isShop(req.auth.userId);
      if (!shop) {
        throw new Error("Shop not found.");
      }

      const orderId = req.params.id;
      const { subOrderId, status, canceledProducts = [] } = req.body;

      const order = await Order.findById(orderId)
        .populate("user", "firstname lastname email address")
        .populate({
          path: "details.shop",
          select: "name siret address",
          populate: {
            path: "address",
            select: "address1 address2 postalCode city country",
          },
        })
        .populate({
          path: "details.products.product",
          select: "productCustomName",
          populate: {
            path: "product",
            select: "name vatRate family weight",
            populate: [
              {
                path: "family",
                select: "name",
              },
              {
                path: "weight",
                select: "unit",
              },
            ],
          },
        })
        .session(session);

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

      if (status === "prepared" || status === "partially_prepared") {
        if (canceledProducts.length > 0) {
          subOrder.products.forEach((p) => {
            p.productStatus = canceledProducts.includes(p._id.toString())
              ? "cancelled"
              : "confirmed";
          });
        } else {
          subOrder.products.forEach((p) => {
            p.productStatus === "confirmed";
          });
        }

        const confirmed = subOrder.products.filter(
          (p) => p.productStatus === "confirmed",
        );

        const { shopTotalHT, shopTotalVAT, shopTotalTTC } =
          computeShopAmounts(confirmed);

        subOrder.shopTotalHT = shopTotalHT;
        subOrder.shopTotalVAT = shopTotalVAT;
        subOrder.shopTotalTTC = shopTotalTTC;

        await consumeStockForSubOrder(subOrder);

        recomputeOrderTotals(order);

        const invoice = await createInvoiceForSubOrder(
          { order, subOrder },
          session,
        );

        subOrder.invoice = invoice._id;

        if (canceledProducts.length > 0) {
          const creditNote = await createCreditNoteFromSubOrder(
            {
              order,
              subOrder,
              invoice,
              reason: "Annulation partielle de commande",
            },
            session,
          );

          subOrder.creditNotes.push(creditNote._id);

          await refundFromCreditNote(creditNote._id);
          await restoreStockFromCreditNote(creditNote);
        }

        subOrder.status = status;
      }

      await order.save({ session });
    });

    session.endSession();

    res
      .status(200)
      .json({ success: true, message: getMessage(req.body.status) });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    res.status(500).json({
      result: false,
      message: error.message || "Erreur Interne serveur",
    });
  }
};

const getMessage = (expr) => {
  let message = "";
  switch (expr) {
    case "validated":
      message = "Commande Validée";
      break;
    case "canceled":
      message = "Commande Annulée";
      break;
    case "pending":
      message = "Commande en attente";
      break;
    case "withdrawn":
      message = "Commande retirée";
      break;

    default:
      break;
  }
  return message;
};

const getUserOrderById = async (req, res) => {
  // console.log("GetUserOrderById ->");
  try {
    if (!req.params.id) {
      throw new Error("Order id missing.");
    }

    // récupération du shopId
    const user = await isUser(req.auth.userId);
    if (!user) {
      return res
        .status(404)
        .json({ succes: false, message: "User not found." });
    }

    const order = await Order.findOne({
      _id: req.params.id,
    })
      .populate("user", "firstname lastname email")
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
                select: "name image weight family",
                populate: {
                  path: "family",
                  model: "productFamily",
                  select: "name productsTypes",
                },
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
            model: "shops",
            // select: "name notes address",
            populate: [
              {
                path: "notes",
                model: "notes",
              },
              {
                path: "markets.market",
                model: "markets",
                select: "name address",
              },
            ],
          },
        ],
      });
    // console.log("order récupérée :", order);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ succes: false, message: error.message });
  }
};

module.exports = {
  getOrderDetailsById,
  updateSubOrder,
  getOrdersByUser,
  getUserOrderById,
};
