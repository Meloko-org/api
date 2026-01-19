const mongoose = require("mongoose");
const { Order, Invoice } = require("../models");
const { isShop, isUser } = require("../modules/verification");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const { refundFromCreditNote } = require("../services/stripeService");
const {
  assertIntentAllowed,
  assertStatusTransitionAllowed,
} = require("../helpers/SubOrderStateMachine");
const {
  handleCancellation,
} = require("../services/orderStatusHandlers/handleCancellation");
const {
  handlePreparation,
} = require("../services/orderStatusHandlers/handlePreparation");
const {
  handlePickup,
} = require("../services/orderStatusHandlers/handlePickup");
const {
  handlePartialPickup,
} = require("../services/orderStatusHandlers/handlePartialPickup");
const {
  handleStockConflictResolution,
} = require("../services/orderStatusHandlers/handleStockConflictResolution");
const {
  computeGlobalOrderStatus,
  getOrderStatus,
} = require("../helpers/orderHelpers");
const {
  notifyClientOrderPrepared,
} = require("../services/pushNotificationService");

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
      globalStatus: getOrderStatus(o),
      // globalStatus: computeGlobalOrderStatus(o),
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
    console.log(order.details);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ succes: false, message: error.message });
  }
};

const updateSubOrder = async (req, res) => {
  const session = await mongoose.startSession();

  let order;
  let subOrder;
  const orderId = req.params.id;
  const {
    subOrderId,
    intent,
    cancelledProductIds = [],
    notPickedUpProductIds = [],
  } = req.body;

  console.log(
    "---------------- données passées à updtaeSubOrder ------------------------",
  );
  console.log("subOrderId :", subOrderId);
  console.log("intent :", intent);
  console.log("cancelledProductIds :", cancelledProductIds);
  console.log("notPickedUpProductIds :", notPickedUpProductIds);

  // nécessaire pour déclencher des actions stripe après la clôture d'une transaction
  const postCommitActions = {
    refunds: [],
  };

  try {
    await session.withTransaction(async () => {
      /* 1 - récupération et validation des données */
      if (!req.params.id) {
        throw new Error("Order id missing.");
      }

      const shop = await isShop(req.auth.userId);
      if (!shop) {
        throw new Error("Shop not found.");
      }

      order = await Order.findById(orderId)
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
        })
        .session(session);

      if (!order) {
        throw new Error("Order not found.");
      }

      subOrder = order.details.find(
        (detail) => detail._id.toString() === subOrderId,
      );
      if (!subOrder) {
        throw new Error("sub-Order not found.");
      }

      if (subOrder.shop._id.toString() !== shop._id.toString()) {
        throw new Error("Forbidden.");
      }

      /* 2 - Validation de l'intent et choix de l'action à mener */

      assertIntentAllowed(subOrder.status, intent);

      const previousStatus = subOrder.status;

      switch (intent) {
        case "cancel":
          console.log("case cancel");
          await handleCancellation({
            order,
            subOrder,
            session,
            postCommitActions,
          });
          break;

        case "prepare":
          // if (subOrder.stockIssue) {
          //   console.log("case stockConflictResolution");
          //   await handleStockConflictResolution({
          //     order,
          //     subOrder,
          //     cancelledProductIds,
          //     session,
          //     postCommitActions,
          //   });
          // } else {
          console.log("case prepare");
          await handlePreparation({
            order,
            subOrder,
            cancelledProductIds,
            session,
            postCommitActions,
          });
          // }

          break;

        case "pick_up":
          if (notPickedUpProductIds.length > 0) {
            console.log("case partially_pick_up");
            await handlePartialPickup({
              order,
              subOrder,
              notPickedUpProductIds,
              session,
              postCommitActions,
            });
          } else {
            console.log("case pick_up");
            await handlePickup({
              order,
              subOrder,
              notPickedUpProductIds,
              session,
              postCommitActions,
            });
          }
          break;

        default:
          throw new Error("Unknown intent");
      }

      assertStatusTransitionAllowed(previousStatus, subOrder.status);

      await order.save({ session });
    });

    const populatedOrder = await Order.findById(order._id)
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

    if (
      ["prepared", "partially_prepared", "cancelled"].includes(
        populatedOrder.details[0].status,
      )
    ) {
      await notifyClientOrderPrepared(populatedOrder, subOrderId);
    }

    res.status(200).json({
      success: true,
      order: populatedOrder,
      refundsPending: postCommitActions.refunds.map((r) => r.creditNoteId),
      message: getMessage(req.body.intent),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur Interne serveur",
    });
  } finally {
    session.endSession();
  }

  for (const refund of postCommitActions.refunds) {
    try {
      await refundFromCreditNote(refund.creditNoteId);
    } catch (stripeError) {
      console.error(
        "Stripe refund failed for creditNote",
        refund.creditNoteId,
        stripeError,
      );

      // Option recommandé :
      // - log
      // - alerte
      // - retry async
    }
  }
};

const getMessage = (intent) => {
  let message = "";
  switch (intent) {
    case "prepare":
      message = "Commande en préparation";
      break;
    case "cancel":
      message = "Commande Annulée";
      break;
    case "pick_up":
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
  // updateOrderProductPickedUp,
  getOrdersByUser,
  getUserOrderById,
};
